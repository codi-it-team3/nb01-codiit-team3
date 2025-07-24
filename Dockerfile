# Build stage
FROM node:21-alpine AS build
# bcrypt를 위한 빌드 도구 설치
RUN apk add --no-cache python3 make g++
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build

# Development stage
FROM node:21-alpine AS development
WORKDIR /app
# 실행에 필요한 파일만 복사
COPY --from=build /app/{package*.json,node_modules,build,prisma} ./
ENV NODE_ENV=development
ENV PORT=3000
ENV BASE_URL=http://localhost:3000
ENV PUBLIC_PATH=/app/public
ENV STATIC_PATH=/public
VOLUME /app/public
EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate dev && npm start"]
