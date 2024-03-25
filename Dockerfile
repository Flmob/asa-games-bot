FROM node
COPY . .
WORKDIR .
RUN npm install
CMD ["node", "bot.js"]
EXPOSE 80