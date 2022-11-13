import "dotenv/config";
import { Telegraf, Markup } from "telegraf";

const bot = new Telegraf(process.env.BOT_TOKEN);

const mainUrl = "https://shielded-woodland-35441.herokuapp.com";

const games = {
  asa2048: {
    game_short_name: "asa2048",
    url: `${mainUrl}/2048/`,
  },
  t_rex: {
    game_short_name: "t_rex",
    url: `${mainUrl}/t-rex/`,
  },
  snake: {
    game_short_name: "snake",
    url: `${mainUrl}/snake/`,
  },
  flappy_bird: {
    game_short_name: "flappy_bird",
    url: `${mainUrl}/flappy-bird/`,
  },
  tetris: {
    game_short_name: "tetris",
    url: `${mainUrl}/tetris/`,
  },
};

const type = "game";
const reply_markup = Markup.inlineKeyboard([
  Markup.button.game("🎮 Play now!"),
  Markup.button.url("📰 Bot news", "https://t.me/asa_games_bot_news"),
]);
const gamesQueryArray = Object.values(games).map(({ game_short_name }, id) => ({
  type,
  id,
  game_short_name,
  reply_markup,
}));

bot.command("start", (ctx) => {
  console.log({ ...ctx.from, date: new Date() });
  bot.telegram.sendMessage(
    ctx.chat.id,
    "Hello there! Welcome to Asa Games Bot.",
    {}
  );
});

bot.on("inline_query", (ctx) => {
  console.log({ ...ctx.inlineQuery, date: new Date() });
  return ctx.answerInlineQuery(gamesQueryArray);
});

bot.command("2048", (ctx) => {
  console.log("GAME 2048");
  console.log({ ...ctx.from, date: new Date() });

  return ctx.replyWithGame(games.asa2048.game_short_name, reply_markup);
});

bot.command("t-rex", (ctx) => {
  console.log("GAME t-rex");
  console.log({ ...ctx.from, date: new Date() });

  return ctx.replyWithGame(games.tRex.game_short_name, reply_markup);
});

bot.command("snake", (ctx) => {
  console.log("GAME snake");
  console.log({ ...ctx.from, date: new Date() });

  return ctx.replyWithGame(games.snake.game_short_name, reply_markup);
});

bot.command("flappy_bird", (ctx) => {
  console.log("GAME flappy_bird");
  console.log({ ...ctx.from, date: new Date() });

  return ctx.replyWithGame(games.flappy_bird.game_short_name, reply_markup);
});

bot.command("tetris", (ctx) => {
  console.log("GAME tetris");
  console.log({ ...ctx.from, date: new Date() });

  return ctx.replyWithGame(games.tetris.game_short_name, reply_markup);
});

bot.gameQuery((ctx) => {
  console.log("callbackQuery", { ...ctx.callbackQuery, date: new Date() });

  const {
    callbackQuery: { game_short_name, message, inline_message_id },
  } = ctx;

  const user_id = ctx.from.id;
  const gameUrl = games[game_short_name].url || "/";
  let url = "";

  if (message) {
    const msgId = message.message_id;
    const chatId = ctx.chat.id;
    url = `${gameUrl}?user_id=${user_id}&chat_id=${chatId}&message_id=${msgId}`;
  } else if (inline_message_id) {
    url = `${gameUrl}?user_id=${user_id}&inline_message_id=${inline_message_id}`;
  } else {
    console.log("No detail for update from callback query.", new Date());
    url = gameUrl;
  }

  return ctx.answerGameQuery(url);
});

bot.launch();
