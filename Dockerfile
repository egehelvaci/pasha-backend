FROM node:18-alpine

WORKDIR /app

# Önce package.json ve package-lock.json kopyala
COPY package*.json ./

# Bağımlılıkları yükle
RUN npm install

# Kaynak kodları kopyala
COPY . .

# Prisma client'ı oluştur ve API'yi derle
RUN npx prisma generate
RUN npm run api:build

# Çalışma zamanı yapılandırması
ENV NODE_ENV=production
ENV PORT=3001

EXPOSE ${PORT}

# Uygulamayı başlat
CMD ["npm", "run", "api:start"] 