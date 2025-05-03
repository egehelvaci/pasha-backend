FROM node:18-alpine AS base

# Base image setup
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Development dependencies için
FROM base AS deps
WORKDIR /app
RUN npm ci

# Build için
FROM deps AS builder
WORKDIR /app
COPY . .
RUN npm run api:build

# Production için
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/generated ./generated
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma

EXPOSE 3001

CMD ["node", "dist/server.js"] 