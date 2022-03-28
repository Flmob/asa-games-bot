import "dotenv/config";
import { Telegraf, Markup } from "telegraf";

const bot = new Telegraf(process.env.BOT_TOKEN);

const games = {
  asa2048: {
    shortName: "asa2048",
    url: "https://shielded-woodland-35441.herokuapp.com/2048/",
  },
  t_rex: {
    shortName: "t_rex",
    url: "https://shielded-woodland-35441.herokuapp.com/t-rex/",
  },
};

const markup = Markup.inlineKeyboard([Markup.button.game("🎮 Play now!")]);

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
  return ctx.answerInlineQuery([
    {
      type: "game",
      id: 1,
      game_short_name: games.asa2048.shortName,
      reply_markup: markup,
    },
    {
      type: "game",
      id: 2,
      game_short_name: games.t_rex.shortName,
      reply_markup: markup,
    },
  ]);
});

bot.command("2048", (ctx) => {
  console.log("GAME 2048");
  console.log(ctx.from);

  return ctx.replyWithGame(games.asa2048.shortName, markup);
});

bot.command("t-rex", (ctx) => {
  console.log("GAME t-rex");
  console.log(ctx.from);

  return ctx.replyWithGame(games.tRex.shortName, markup);
});

bot.gameQuery((ctx) => {
  console.log("callbackQuery", ctx.callbackQuery);

  const {
    callbackQuery: { game_short_name },
  } = ctx;

  return ctx.answerGameQuery(games[game_short_name].url || "/");
});

bot.launch();
