# syntax=docker/dockerfile:1

# ---- Build stage: install all deps and compile TS -> dist/ ----
FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ---- Runtime stage: slim image with production deps + compiled output ----
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Compiled server + the SQL migrations applied at startup.
COPY --from=builder /app/dist ./dist
COPY drizzle ./drizzle
COPY docker-entrypoint.sh ./docker-entrypoint.sh

EXPOSE 3000
ENTRYPOINT ["./docker-entrypoint.sh"]
