FROM node:22-alpine

WORKDIR /byjc

COPY package*.json ./
RUN NODE_ENV=development npm ci --legacy-peer-deps

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
