# Stage 1: ConstruÃ§Ã£o da aplicaÃ§Ã£o Angular
FROM node:18-alpine AS builder
WORKDIR /app

# Copia os arquivos de dependÃªncias que estÃ£o na raiz (package.json e package-lock.json)
COPY package*.json ./
RUN npm install

# Copia o restante do cÃ³digo-fonte e constrÃ³i a aplicaÃ§Ã£o em modo de produÃ§Ã£o
COPY . .
RUN npm run build -- --configuration production

# Stage 2: Servir a aplicaÃ§Ã£o com Nginx
FROM nginx:alpine
RUN rm -rf /usr/share/nginx/html/*
# Se o outputPath no angular.json for "dist", ou "dist/snakegame-frontend", ajuste abaixo:
COPY --from=builder /app/dist/snakegame-frontend /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

