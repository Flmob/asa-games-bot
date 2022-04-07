import "dotenv/config";
import { Telegraf, Markup } from "telegraf";

const bot = new Telegraf(process.env.BOT_TOKEN);

const games = {
  asa2048: {
    game_short_name: "asa2048",
    url: "https://shielded-woodland-35441.herokuapp.com/2048/",
  },
  t_rex: {
    game_short_name: "t_rex",
    url: "https://shielded-woodland-35441.herokuapp.com/t-rex/",
  },
  snake: {
    game_short_name: "snake",
    url: "https://shielded-woodland-35441.herokuapp.com/snake/",
  },
};

const type = "game";
const reply_markup = Markup.inlineKeyboard([
  Markup.button.game("🎮 Play now!"),
]);
const gamesQueryArray = Object.values(games).map(({ game_short_name }, id) => ({
  type,
  id,
  game_short_name,
  reply_markup,
}));

bot.command("start", (ctx) => {
  console.log(ctx.from);
  bot.telegram.sendMessage(
    ctx.chat.id,
    "Hello there! Welcome to Asa Games Bot.",
    {}
  );
});

bot.on("inline_query", (ctx) => {
  console.log(ctx.inlineQuery);
  return ctx.answerInlineQuery(gamesQueryArray);
});

bot.command("2048", (ctx) => {
  console.log("GAME 2048");
  console.log(ctx.from);

  return ctx.replyWithGame(games.asa2048.game_short_name, reply_markup);
});

bot.command("t-rex", (ctx) => {
  console.log("GAME t-rex");
  console.log(ctx.from);

  return ctx.replyWithGame(games.tRex.game_short_name, reply_markup);
});

bot.command("snake", (ctx) => {
  console.log("GAME snake");
  console.log(ctx.from);

  return ctx.replyWithGame(games.snake.game_short_name, reply_markup);
});

bot.gameQuery((ctx) => {
  console.log("callbackQuery", ctx.callbackQuery);

  const {
    callbackQuery: { game_short_name },
  } = ctx;

  return ctx.answerGameQuery(games[game_short_name].url || "/");
});

bot.launch();
