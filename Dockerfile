FROM node:18-alpine

# Puppeteer için gerekli sistem paketlerini yükle
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont

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
COPY scripts ./scripts

# Prisma client oluştur 
RUN npx prisma generate

# TypeScript'i derle ve asset'leri kopyala
RUN npm run api:build

# Production için sadece runtime bağımlılıklarını yeniden yükle
RUN npm ci --omit=dev && npm cache clean --force

# Çalışma ortamını ayarla
ENV NODE_ENV=production
# PORT değişkenini kullanma - Railway'in sağladığını kullan

# Portu aç - Railway'in sağladığı portu kullan
# EXPOSE 3001

# Uygulamayı başlat
CMD ["node", "dist/server.js"] 