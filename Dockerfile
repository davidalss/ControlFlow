# Multi-stage build para otimização
FROM node:20-alpine AS base

# Instalar dependências do sistema
RUN apk add --no-cache python3 make g++ git

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./
COPY tsconfig.json ./
COPY drizzle.config.ts ./

    # Instalar dependências
    RUN npm ci --legacy-peer-deps && npm cache clean --force

# Stage de desenvolvimento
FROM base AS development
# Copiar package.json novamente para garantir que temos a versão correta
COPY package*.json ./
RUN npm ci
COPY . .
RUN mkdir -p uploads
EXPOSE 5002
CMD ["npm", "run", "dev"]

# Stage de produção
FROM base AS production
COPY . .
RUN npm run build
RUN mkdir -p uploads
EXPOSE 5002
CMD ["npm", "start"]
