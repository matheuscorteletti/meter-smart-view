# ===========================================
# TechRAM - Dockerfile Multi-stage
# Imagem segura com Node Alpine + Nginx Alpine
# ===========================================

# Stage 1: Build
FROM node:20-alpine AS builder

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm ci --only=production=false

# Copiar código fonte
COPY . .

# Build da aplicação
RUN npm run build

# ===========================================
# Stage 2: Produção com Nginx
# ===========================================
FROM nginx:alpine AS production

# Remover configuração padrão do Nginx
RUN rm -rf /usr/share/nginx/html/*

# Copiar arquivos buildados
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuração customizada do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expor porta 80
EXPOSE 80

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# Comando para iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]
