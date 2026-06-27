# 블로그 글 작성 메뉴얼

---

## 1. 서버 실행

```bash
cd ~/Desktop/blog
bundle exec jekyll serve
```

→ `http://localhost:4000` 에서 실시간 확인 가능  
→ 파일 저장하면 자동으로 새로고침됨  
→ 종료: `Ctrl + C`

---

## 2. 새 글 만들기

`_posts/` 폴더에 파일을 만든다.

### 파일명 규칙 (필수)

```
YYYY-MM-DD-제목.md
```

예시:
```
_posts/2026-06-26-spring-security.md
_posts/2026-07-01-boj-1234.md
_posts/2026-07-10-프로젝트-회고.md
```

> ⚠️ 날짜 형식이 틀리거나 파일명에 공백이 있으면 글이 안 올라온다.

---

## 3. 글 상단 설정 (Front Matter)

모든 글의 맨 위에 아래 형식으로 설정을 적는다.

```yaml
---
layout: post
title: "글 제목"
description: "카드와 SEO에 보이는 한 줄 설명"
date: 2026-06-26
tags: [Spring, JPA, Backend]
image: /assets/images/thumbnail.jpg   # 썸네일 (없으면 자동 플레이스홀더)
---
```

### 필수 항목

| 항목 | 설명 |
|------|------|
| `layout: post` | 항상 이대로 |
| `title` | 글 제목 |
| `date` | `YYYY-MM-DD` 형식 |

### 선택 항목

| 항목 | 설명 |
|------|------|
| `description` | 카드 미리보기 설명 |
| `tags` | 태그 목록 (배열) |
| `image` | 썸네일 이미지 경로 |

---

## 4. 태그 색상 규칙

태그는 이름에 따라 색이 자동으로 지정된다.

| 색상 | 태그 |
|------|------|
| 🟢 초록 | `Spring` `JPA` `Backend` `Java` |
| 🟠 주황 | `알고리즘` `BFS` `DFS` `Algorithm` |
| 🟣 보라 | `일상` `회고` `AI` `ML` |
| 🔵 파랑 | 그 외 모든 태그 |

---

## 5. 썸네일 이미지 추가

1. 이미지 파일을 `assets/images/` 폴더에 넣는다
2. Front Matter에 경로를 적는다

```yaml
image: /assets/images/spring-security.png
```

이미지가 없으면 태그에 따라 색이 다른 플레이스홀더가 자동으로 나온다.

---

## 6. 마크다운 문법

### 제목

```markdown
## 대제목
### 중제목
#### 소제목
```

### 강조

```markdown
**굵게**
*기울임*
~~취소선~~
`인라인 코드`
```

### 코드 블록

언어를 지정하면 신택스 하이라이팅 + 언어 라벨이 자동으로 붙는다.

````markdown
```java
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello");
    }
}
```
````

지원 언어: `java` `python` `javascript` `sql` `bash` `yaml` `kotlin` 등

### 인용구

```markdown
> 인용하고 싶은 문장을 여기에 적는다.
```

### 목록

```markdown
- 항목 1
- 항목 2
  - 하위 항목

1. 순서 있는 항목
2. 두 번째
```

### 링크 & 이미지

```markdown
[링크 텍스트](https://example.com)
![이미지 설명](/assets/images/photo.png)
```

### 구분선

```markdown
---
```

### 표

```markdown
| 컬럼1 | 컬럼2 | 컬럼3 |
|-------|-------|-------|
| 데이터 | 데이터 | 데이터 |
```

---

## 7. 글 예시 템플릿

```markdown
---
layout: post
title: "Spring Security 기본 설정"
description: "Spring Boot 프로젝트에 Security를 처음 적용하면서 겪은 것들"
date: 2026-07-01
tags: [Spring, Backend]
---

## 개요

왜 이 글을 쓰게 됐는지, 어떤 문제를 다루는지 간략히.

---

## 본문 내용

설명을 여기에 작성한다.

```java
// 코드 예시
@Configuration
public class SecurityConfig {
}
```

---

## 정리

배운 점 또는 결론.
```

---

## 8. 폴더 구조 요약

```
blog/
├── _posts/          ← 글 파일 여기에 추가
├── assets/
│   └── images/      ← 썸네일 이미지 여기에 추가
├── _config.yml      ← 블로그 이름·저자 설정
└── WRITING.md       ← 이 파일
```
