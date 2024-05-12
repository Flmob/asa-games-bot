import "dotenv/config";
import { Telegraf, Markup } from "telegraf";

const bot = new Telegraf(process.env.BOT_TOKEN);
const mainUrl = process.env.BACKEND_URL;

const games = {
  asa2048: {
    game_short_name: "asa2048",
    url: `${mainUrl}/2048/`,
  },
  asa2048x5: {
    game_short_name: "asa2048x5",
    url: `${mainUrl}/2048/`,
    queries: { extended: true },
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
  t2048: {
    game_short_name: "t2048",
    url: `${mainUrl}/t2048/`,
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
  ...reply_markup,
}));

bot.command("start", async (ctx) => {
  console.log({ ...ctx.from, date: new Date() });
  await ctx.sendMessage(
    ctx.chat.id,
    "Hello there! Welcome to Asa Games Bot.",
    {}
  );
});

bot.on("inline_query", async (ctx) => {
  console.log({ ...ctx.inlineQuery, date: new Date() });
  await ctx.answerInlineQuery(gamesQueryArray);
});

Object.values(games).forEach(({ game_short_name }) => {
  bot.command(game_short_name, async (ctx) => {
    console.log(`game ${game_short_name}`);
    console.log({ ...ctx.from, date: new Date() });

    await ctx.replyWithGame(game_short_name, reply_markup);
  });
});

bot.gameQuery(async (ctx) => {
  console.log("callbackQuery", { ...ctx.callbackQuery, date: new Date() });

  const {
    callbackQuery: { game_short_name, message, inline_message_id },
  } = ctx;
  const { url = "/", queries = {} } = games[game_short_name];
  const user_id = ctx.from.id;
  let query = {};

  if (message) {
    const message_id = message.message_id;
    const chat_id = ctx.chat.id;
    query = { user_id, chat_id, message_id };
  } else if (inline_message_id) {
    query = { user_id, inline_message_id };
  } else {
    console.log("No detail for update from callback query.", new Date());
  }

  const queryStr = Object.keys({ ...query, ...queries })
    .map((key) => `${key}=${query[key]}`)
    .join("&");
  const gameUrl = queryStr ? `${url}?${queryStr}` : url;

  await ctx.answerGameQuery(gameUrl);
});

bot.catch((error) => {
  console.log("Something went wrong!");
  console.error(error);
});

bot.launch();
