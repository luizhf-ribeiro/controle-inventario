FROM node:20

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

# Comando para compilar o TypeScript para JavaScript
RUN npm run build

# O Render define a porta automaticamente, mas deixamos a 3000 como padrão
EXPOSE 3000

# Comando para rodar em PRODUÇÃO (apontando para a pasta dist)
CMD ["node", "dist/index.js"]