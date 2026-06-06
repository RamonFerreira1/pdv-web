# ================================
# Estágio 1: Build do React com Vite
# ================================
FROM node:20-alpine AS build

WORKDIR /app

# Copia dependências e instala
COPY package*.json ./
RUN npm install

# Copia todo o código e builda
COPY . .
RUN npm run build

# ================================
# Estágio 2: Servir com Nginx
# ================================
FROM nginx:alpine

# Remove config padrão do Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copia nossa config customizada
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia o build do React para o Nginx
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
