---
layout: post
title: "Connection Storm — DB 커넥션이 한꺼번에 끊기는 문제"
description: "HikariCP 환경에서 커넥션이 동시에 만료되며 발생하는 Connection Storm 원인과 해결"
date: 2026-06-27
tags: [Spring, Backend, Java]
---

## Connection Storm이란?

DB 커넥션 풀에 있는 커넥션들이 **동시에 만료·재연결**되면서 DB에 순간적으로 폭발적인 부하가 몰리는 현상이다.

보통 이런 상황에서 발생한다.

- 서버를 재시작했을 때 풀의 모든 커넥션이 동시에 생성되고, 일정 시간 후 동시에 만료됨
- `maxLifetime` 설정이 DB의 `wait_timeout`보다 길어 DB가 먼저 연결을 끊었는데 풀은 그 커넥션을 유효하다고 착각하고 있다가 한꺼번에 오류 처리
- 트래픽이 없는 시간대에 커넥션이 idle 상태로 쌓여 있다가 요청이 몰리는 순간 전부 재연결 시도

---

## 문제 재현

Spring Boot + HikariCP 기본 설정으로 서버를 띄우면:

```yaml
# application.yml (설정 안 한 경우 기본값)
spring:
  datasource:
    hikari:
      maximum-pool-size: 10
      max-lifetime: 1800000   # 30분
      connection-timeout: 30000
```

MySQL/PostgreSQL의 기본 `wait_timeout`은 보통 **8시간(28800초)** 이지만, AWS RDS나 일부 환경에서는 더 짧게 설정되어 있다.

DB 쪽에서 먼저 연결을 끊었는데 HikariCP는 모른 채 그 커넥션을 풀에 들고 있다가 요청이 들어오면 그제서야 오류가 터진다.

```
HikariPool-1 - Failed to validate connection com.mysql.cj.jdbc.ConnectionImpl
(No operations allowed after connection closed.)
```

모든 커넥션이 같은 시점에 생성됐다면 `maxLifetime`(30분)이 지나는 순간 **10개가 동시에 재연결**을 시도한다. 이게 Connection Storm이다.

---

## 해결 방법

### 1. maxLifetime을 DB timeout보다 짧게

DB의 `wait_timeout`보다 **수 분 짧게** 설정하는 게 핵심이다.

```yaml
spring:
  datasource:
    hikari:
      max-lifetime: 1800000      # 30분 (DB wait_timeout이 8시간이면 충분)
      keepalive-time: 60000      # 1분마다 idle 커넥션 유지 패킷 전송
      connection-timeout: 5000   # 커넥션 못 얻으면 5초 안에 예외
```

AWS RDS를 쓰고 있다면 `wait_timeout`을 파라미터 그룹에서 직접 확인하고, 그보다 2~3분 짧게 맞춰야 한다.

---

### 2. keepalive-time으로 idle 커넥션 유지

트래픽이 없는 시간대에 커넥션이 끊기지 않도록 **주기적으로 DB에 신호를 보내는** 설정이다.

```yaml
spring:
  datasource:
    hikari:
      keepalive-time: 60000   # 60초마다 idle 커넥션에 ping
```

HikariCP 5.x부터 지원한다. `SELECT 1` 같은 쿼리를 주기적으로 날려 커넥션을 살려둔다.

---

### 3. connectionInitSql로 연결 직후 검증

커넥션 생성 시 쿼리를 실행해 연결 상태를 확인한다.

```yaml
spring:
  datasource:
    hikari:
      connection-test-query: SELECT 1
```

> HikariCP는 기본적으로 JDBC4의 `isValid()`를 사용하기 때문에, 드라이버가 JDBC4 이상이면 `connection-test-query`는 생략해도 된다.

---

### 4. maxLifetime에 jitter(무작위 편차) 적용 확인

HikariCP는 `maxLifetime`에 **최대 2.5%의 jitter**를 자동으로 적용해 커넥션들이 동시에 만료되지 않도록 한다. 직접 건드릴 필요는 없지만, 이 때문에 모니터링에서 커넥션 재연결 시점이 조금씩 퍼져 보이는 게 정상이다.

---

## 최종 설정 예시

```yaml
spring:
  datasource:
    hikari:
      maximum-pool-size: 10
      minimum-idle: 5
      max-lifetime: 1740000      # 29분 (DB wait_timeout 30분 기준)
      keepalive-time: 60000      # 1분마다 ping
      connection-timeout: 5000
      idle-timeout: 600000       # 10분 idle이면 풀에서 제거 (minimum-idle 이상 유지)
```

---

## 정리

| 원인 | 해결책 |
|------|--------|
| DB가 먼저 커넥션을 끊음 | `max-lifetime`을 DB `wait_timeout`보다 짧게 |
| idle 상태에서 연결 끊김 | `keepalive-time` 설정 |
| 모든 커넥션이 동시에 만료 | HikariCP jitter 자동 적용 (별도 설정 불필요) |
| 재연결 실패 탐지 지연 | `connection-timeout` 짧게 설정 |

Connection Storm은 **개발 환경에서는 잘 안 보이다가 운영에서 터진다.** 트래픽이 없는 새벽 시간대에 커넥션이 전부 끊겼다가 출근 시간에 요청이 몰리면서 오류가 터지는 패턴이 많다. 미리 `keepalive-time`과 `max-lifetime`을 잡아두는 게 최선이다.
