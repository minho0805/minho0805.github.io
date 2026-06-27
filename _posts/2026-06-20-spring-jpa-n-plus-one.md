---
layout: post
title: "JPA N+1 문제와 해결 방법 정리"
description: "프로젝트에서 직접 겪은 N+1 문제를 어떻게 발견하고 해결했는지 기록"
date: 2026-06-20
tags: [Spring, JPA, Backend]
---

## N+1 문제란?

JPA를 쓰다 보면 반드시 한 번은 만나게 되는 문제다. 연관관계가 있는 엔티티를 조회할 때, 예상보다 훨씬 많은 쿼리가 나가는 현상이다.

간단한 예시로 `Board`와 `User`가 있다고 하자.

```java
@Entity
public class Board {
    @ManyToOne(fetch = FetchType.LAZY)
    private User author;
    // ...
}
```

---

## 문제 재현

게시글 목록을 조회하는 코드:

```java
List<Board> boards = boardRepository.findAll();

for (Board board : boards) {
    System.out.println(board.getAuthor().getName()); // 여기서 N번 추가 쿼리
}
```

`findAll()`로 게시글 100개를 가져오면:

- `SELECT * FROM board` — 1번
- `SELECT * FROM user WHERE id = ?` — 100번 (각 게시글마다)

**총 101번의 쿼리**가 나간다. 이게 N+1 문제다.

---

## 해결 방법 3가지

### 1. Fetch Join

JPQL에서 `JOIN FETCH`를 사용하면 한 번에 가져올 수 있다.

```java
@Query("SELECT b FROM Board b JOIN FETCH b.author")
List<Board> findAllWithAuthor();
```

실행되는 쿼리:

```sql
SELECT b.*, u.*
FROM board b
INNER JOIN user u ON b.author_id = u.id
```

쿼리 1번으로 해결된다. 하지만 **페이징과 함께 쓸 때 주의**해야 한다. `컬렉션 fetch join + 페이징`은 메모리에서 전체를 가져온 뒤 자르기 때문에 `HibernateJpaDialect` 경고가 뜬다.

---

### 2. @EntityGraph

어노테이션으로 간편하게 지정할 수 있다.

```java
@EntityGraph(attributePaths = {"author"})
List<Board> findAll();
```

내부적으로 fetch join과 동일하게 동작한다. 동적으로 그래프를 정의하기보다 정적인 경우에 더 적합하다.

---

### 3. BatchSize (컬렉션의 경우)

`@OneToMany` 같은 컬렉션 연관관계는 fetch join 시 카테시안 곱 문제가 생길 수 있다. 이 때는 `@BatchSize`가 유용하다.

```java
@BatchSize(size = 100)
@OneToMany(mappedBy = "board")
private List<Comment> comments;
```

또는 글로벌 설정:

```yml
# application.yml
spring:
  jpa:
    properties:
      hibernate:
        default_batch_fetch_size: 100
```

IN 절로 묶어서 쿼리 수를 줄여준다.

---

## 정리

| 방법 | 적합한 상황 |
|------|------------|
| Fetch Join | `@ManyToOne`, `@OneToOne` 조회 |
| @EntityGraph | 정적인 fetch 전략이 필요할 때 |
| BatchSize | `@OneToMany` 컬렉션, 페이징 함께 쓸 때 |

N+1은 `spring.jpa.show-sql=true`나 **p6spy** 같은 쿼리 로거를 붙여서 먼저 발견하는 게 중요하다. 눈에 보이지 않으면 모른 채로 운영으로 간다.
