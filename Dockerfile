FROM node:18-alpine

# Çalışma dizini ayarla
WORKDIR /app

# Bağımlılık dosyalarını kopyala
COPY package.json package-lock.json ./

# Sadece gerekli bağımlılıkları yükle
RUN npm install --production --frozen-lockfile

# Uygulama dosyalarını kopyala
COPY . .

# Prisma client oluştur ve TypeScript'i derle
RUN npx prisma generate
RUN npm run api:build

# Çalışma ortamını ayarla
ENV NODE_ENV=production
ENV PORT=3001

# Portu aç
EXPOSE 3001

# Uygulamayı başlat
CMD ["node", "dist/server.js"] 