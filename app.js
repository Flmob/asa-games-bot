import "dotenv/config";
import { Telegraf, Markup } from "telegraf";

import express from "express";
import path from 'path';

const bot = new Telegraf(process.env.BOT_TOKEN);

const gameShortName = "asa2048";
const gameUrl = "https://shielded-woodland-35441.herokuapp.com/2048/";

const markup = Markup.inlineKeyboard([Markup.button.game("🎮 Play now!")]);

bot.command("start", (ctx) => {
  console.log(ctx.from);
  bot.telegram.sendMessage(
    ctx.chat.id,
    "hello there! Welcome to my new telegram bot.",
    {}
  );
});

bot.on("inline_query", (ctx) => {
  console.log(ctx.inlineQuery);
  return ctx.answerInlineQuery([
    {
      type: "game",
      id: 1,
      game_short_name: gameShortName,
      reply_markup: markup,
    },
  ]);
});

bot.command("game", (ctx) => {
    console.log('GAME');
    console.log(ctx.from);

    return ctx.replyWithGame(gameShortName, markup)
});

bot.gameQuery((ctx) => ctx.answerGameQuery(gameUrl));

bot.launch();

/////////////

const app = express()
const port = 3000
const __dirname = path.resolve();

app.use(express.static('games/2048'));

app.get('/2048', function(req, res) {
    res.sendFile('games/2048/index.html', {root: __dirname })
});

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})