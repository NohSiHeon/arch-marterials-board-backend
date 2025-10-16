# 🏠 Building Materials E-commerce API (건축 자재 판매 API)

## 🎯 프로젝트 개요

- 이 프로젝트는 건축 자재의 재고 관리 및 주문 처리를 위한 백엔드 API 서버
- Node.js 기반의 NestJS 프레임워크를 사용하여 개발되었으며, 고성능 자재 조회 캐싱 및 주문 시의 데이터 정합성을 위한 비관적 락(Pessimistic Locking)을 핵심적으로 적용

## 🛠️ 기술 스택 (Tech Stack)

| 구분                  | 기술           | 설명                                                                     |
| :-------------------- | :------------- | :----------------------------------------------------------------------- |
| **언어**              | **TypeScript** | 안정적인 대규모 애플리케이션 개발을 위한 정적 타입 언어 사용             |
| **프레임워크**        | **NestJS**     | 모듈화, 확장성이 뛰어난 엔터프라이즈급 Node.js 프레임워크 사용           |
| **ORM**               | **TypeORM**    | TypeScript 기반의 강력한 객체 관계 매핑 도구                             |
| **주 데이터베이스**   | **PostgreSQL** | 트랜잭션 및 비관적 락을 지원하는 안정적인 관계형 데이터베이스            |
| **캐싱 데이터베이스** | **Redis**      | 자재 목록과 같은 빈번한 조회 데이터의 캐싱을 위한 인메모리 데이터 스토어 |
| **패키지 매니저**     | **npm**        | Node.js 의존성 관리 도구                                                 |

## 🚀 시작하기 (Getting Started)

프로젝트를 로컬 환경에서 실행하기 위한 절차입니다.

### 1. 환경 변수 설정

프로젝트 루트에 **`.env`** 파일을 생성하고, **`.env.example`** 파일을 참조하여 필요한 환경 변수(DB 연결 정보, Redis 정보 등)를 설정합니다.

```ini
# .env 파일 예시
# ------------------------------------
# DATABASE
DB_TYPE=
DB_HOST=
DB_PORT=
DB_USERNAME=
DB_PASSWORD=
DB_NAME=

# REDIS CACHE
REDIS_TYPE=
REDIS_URL=
REDIS_HOST=
REDIS_PORT=
REDIS_PASSWORD=

# 해시 라운드, 액세스, 리프레시 토큰 비밀키
HASH_ROUNDS=
ACCESS_SECRET_KEY=
REFRESH_SECRET_KEY=
```

### 2. 의존성 설치

```
npm install
```

### 3. 서버 실행

```
npm run start
```

## 🔑 프로젝트 주요 기능 및 API

1. 자재 목록 조회(Redis 캐싱 적용)
   - 자주 변하지 않거나 높은 조회 빈도를 보이는 자재 목록 조회 API에 Redis 캐싱을 적용하여 데이터베이스 부하를 줄이고 응답 속도 극대화
2. 안전한 주문 처리(트랜잭션 및 비관적 락 적용)
   - 재고 감소 및 주문 상태 변경 과정에서 동시성 문제로 인한 데이터 불일치를 방지하기 위해 **PostgreSQl 비관적 락** 적용
