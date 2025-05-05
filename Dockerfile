FROM node:16-alpine

WORKDIR /app

# package.json dosyalarını kopyala
COPY package*.json ./

# Yarn kullanarak bağımlılıkları yükle
RUN yarn install

# Kaynak kodları kopyala
COPY . .

# Prisma client oluştur ve API'yi derle
RUN yarn prisma generate && \
    yarn api:build

# Çalışma zamanı yapılandırması
ENV NODE_ENV=production
ENV PORT=3001

EXPOSE ${PORT}

# Uygulamayı başlat
CMD ["yarn", "api:start"] 