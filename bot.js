import "dotenv/config";
import { Telegraf, Markup } from "telegraf";

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