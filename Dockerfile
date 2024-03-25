FROM node:20.11.0
COPY . .
WORKDIR .
RUN npm install
CMD ["node", "bot.js"]
EXPOSE 80