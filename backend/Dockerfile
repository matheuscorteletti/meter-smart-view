
FROM node:18-alpine

WORKDIR /app

# Copiar package.json e package-lock.json primeiro para cache
COPY package*.json ./

# Instalar dependências
RUN npm install --production

# Copiar o código fonte
COPY . .

# Expor a porta
EXPOSE 3001

# Comando para produção
CMD ["node", "src/server.js"]
