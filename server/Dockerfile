FROM node:20-alpine

WORKDIR /app

# Copia package.json e instala dependências de produção
COPY package*.json ./
RUN npm install --omit=dev

# Copia o código do servidor
COPY . .

EXPOSE 3001

# Health check para o docker-compose aguardar o backend estar pronto
HEALTHCHECK --interval=10s --timeout=5s --start-period=30s --retries=5 \
  CMD wget -qO- http://localhost:3001/api/produtos || exit 1

CMD ["node", "server.js"]
