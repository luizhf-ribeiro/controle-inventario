FROM node:20

WORKDIR /usr/src/app

# Copia arquivos de dependência
COPY package*.json ./

# Instala dependências
RUN npm install

# Copia o restante do código
COPY . .

# Expõe a porta
EXPOSE 3000

# Comando para rodar em desenvolvimento
CMD ["npm", "run", "dev"]