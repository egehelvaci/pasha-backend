FROM node:18-alpine AS base

# Base image setup
WORKDIR /app
COPY package*.json ./
RUN npm install --production

# Development dependencies için
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install

# Build için
FROM deps AS builder
WORKDIR /app
COPY . .
RUN npx prisma generate
RUN npm run api:build

# Production için
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV PORT 3001

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma

EXPOSE ${PORT}

CMD ["npm", "run", "api:start"] 