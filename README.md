# Codi-It

## 1기 NbSprint 3팀

[Notion 1기 NbSprint 고급 프로젝트] (https://www.notion.so/part3-201bd73148bc80fdbb6ce7cb086c5ac3)

[GitHub 1기 NbSprint 고급 프로젝트] (https://github.com/codi-it-team3/nb01-codiit-team3)

## 팀원 구성

김건 (https://github.com/funfungun)

김승희 (https://github.com/seung0321)

송유택 (https://github.com/songyoutaeck)

석기현 (https://github.com/SeokGyeon)

## 프로젝트 소개

- 패션 이커머스 플랫폼, 구매자와 판매자가 분리된 서비스
- 프로젝트 기간: 2025-06-16 ~ 2025-07-28

## 팀원별 구현 기능 상세

### 김건

- 문의 기능 구현
- 리뷰 기능 구현
- 인증 인가 리팩토링
- 대시보드 기능 구현
- 메타데이터 구현

### 김승희

- 장바구니 구현
- 주문 기능 구현
- 포인트 및 등급 구현

### 송유택

- 인증 인가 구현
- 유저 기능 구현

### 석기현

- 스토어 기능 구현
- 상품 기능 구현
- 상품 추천 구현

## 파일 구조

📦src
┣ 📂controllers
┣ 📂dto
┃ ┣ 📜cartDTO.ts
┃ ┣ 📜orderDTO.ts
┃ ┣ 📜reviewResponseDTO.ts
┃ ┗ 📜userResponseDTO.ts
┣ 📂lib
┃ ┣ 📂errors
┃ ┃ ┣ 📜BadRequestError.ts
┃ ┃ ┣ 📜ConflictError.ts
┃ ┃ ┣ 📜ForbiddenError.ts
┃ ┃ ┣ 📜NotFoundError.ts
┃ ┃ ┣ 📜ProductNotFoundError.ts
┃ ┃ ┗ 📜UnauthorizedError.ts
┃ ┣ 📂utils
┃ ┃ ┣ 📜cartTestUtil.ts
┃ ┃ ┣ 📜orderTestUtil.ts
┃ ┃ ┣ 📜productMapperUtil.ts
┃ ┃ ┣ 📜productQueryUtil.ts
┃ ┃ ┣ 📜productStatsUtil.ts
┃ ┃ ┣ 📜serializeCart.ts
┃ ┃ ┗ 📜serializeOrder.ts
┣ 📂middlewares
┣ 📂repositories
┣ 📂routers
┣ 📂services
┣ 📂structs
┣ 📂test
┣ 📂types
┃ ┣ 📜cart.ts
┃ ┣ 📜express.d.ts
┃ ┣ 📜Inquiry.ts
┃ ┣ 📜order.ts
┃ ┣ 📜pagination.ts
┃ ┣ 📜product.ts
┃ ┣ 📜Reply.ts
┃ ┣ 📜Review.ts
┃ ┣ 📜store.ts
┃ ┗ 📜User.ts
┗ 📜app.ts

## 구현 홈페이지

http://43.201.95.224/

## 프로젝트 회고록
