FROM node:18-alpine

# Sistem paketlerini güncelle ve gerekli paketleri yükle
RUN apk update && apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    && rm -rf /var/cache/apk/*

# Puppeteer'ın sistem Chromium'unu kullanmasını sağla
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Çalışma dizini ayarla
WORKDIR /app

# Bağımlılık dosyalarını kopyala
COPY package.json package-lock.json ./

# Tüm bağımlılıkları yükle (build için devDependencies gerekli)
RUN npm ci

# Uygulama kodlarını kopyala
COPY tsconfig.json ./
COPY prisma ./prisma
COPY src ./src
COPY public ./public

# Prisma client oluştur 
RUN npx prisma generate

# TypeScript'i derle
RUN npm run api:build

# Production için sadece runtime bağımlılıklarını yeniden yükle
RUN npm ci --omit=dev && npm cache clean --force

# Çalışma ortamını ayarla
ENV NODE_ENV=production

# Uygulamayı başlat
CMD ["node", "dist/server.js"] 