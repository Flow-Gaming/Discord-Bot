FROM node:latest

WORKDIR /var/flowgaming.org/discord-bot/src

COPY package.json ./

RUN npm install

COPY . .

CMD [ "npm", "start" ]
