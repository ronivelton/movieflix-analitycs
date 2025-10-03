# Etapa 1: Imagem base
FROM node:18-alpine

# Etapa 2: Definir o diretório de trabalho dentro do container
WORKDIR /app

# Etapa 3: Copiar arquivos de dependências
COPY package*.json ./

# Etapa 4: Instalar dependências de produção
RUN npm install --production

# Etapa 5: Copiar o código da aplicação e estrutura de dados
COPY src/ ./src/
COPY scripts/ ./scripts/
COPY database/ ./database/
COPY data-lake/ ./data-lake/

# Etapa 6: Expor a porta que a aplicação usa
EXPOSE 3000

# Etapa 7: Definir variável de ambiente (opcional)
ENV NODE_ENV=production

# Etapa 8: Comando para iniciar a aplicação
CMD ["node", "src/app.js"]

# Metadados da imagem (boas práticas)
LABEL maintainer="MovieFlix Team"
LABEL description="Aplicação de cadastro e avaliação de filmes"
LABEL version="1.0"
