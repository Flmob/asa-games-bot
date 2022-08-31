import "dotenv/config";

import axios from "axios";

const telegramUrl = "https://api.telegram.org/bot";
const apiToken = process.env.BOT_TOKEN;
const url = `${telegramUrl}${apiToken}`;

// to set/reset scores
// score, user_id, chat_id, message_id
// or
// score, user_id, inline_message_id
const setGameScore = (data) => {
  axios
    .post(`${url}/setGameScore`, { ...data, force: true })
    .then((answer) => {
      console.log(answer);
    })
    .catch((err) => {
      console.log(err);
    });
};

//placeholder
setGameScore({
  user_id: "",
  inline_message_id: "",
  score: 0,
});
