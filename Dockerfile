FROM node:18-alpine

# Çalışma dizini ayarla
WORKDIR /app

# Bağımlılık dosyalarını kopyala
COPY package.json package-lock.json ./

# Daha basit ve hızlı kurulum
RUN npm install --omit=dev

# Uygulama kodlarını kopyala
COPY tsconfig.json ./
COPY prisma ./prisma
COPY src ./src

# Prisma client oluştur 
RUN npx prisma generate

# TypeScript'i derle
RUN npm run api:build

# Çalışma ortamını ayarla
ENV NODE_ENV=production

# Portu aç
EXPOSE 3001

# Uygulamayı başlat
CMD ["node", "dist/server.js"] 