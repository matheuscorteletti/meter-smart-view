
# Dockerfile para o frontend
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Servidor de produção
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY deployment/nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
