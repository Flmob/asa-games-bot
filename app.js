import "dotenv/config";

import express from "express";
import path from "path";
import bodyParser from "body-parser";
import axios from "axios";

const app = express();
const port = process.env.PORT || 3000;
const telegramUrl = "https://api.telegram.org/bot";
const apiToken = process.env.BOT_TOKEN;
const url = `${telegramUrl}${apiToken}`;
const __dirname = path.resolve();

const setScoreErrorTypes = {
  BOT_SCORE_NOT_MODIFIED: "BOT_SCORE_NOT_MODIFIED",
  MESSAGE_ID_INVALID: "MESSAGE_ID_INVALID",
  PEER_ID_INVALID: "PEER_ID_INVALID",
  SCORE_INVALID: "SCORE_INVALID",
  USER_BOT_REQUIRED: "USER_BOT_REQUIRED",
};

app.use(express.static(path.join(__dirname, "main_page")));
app.use(express.static(path.join(__dirname, "games")));
app.use(bodyParser.json());

app.post("/setscore", (req, res) => {
  axios
    .post(`${url}/setGameScore`, req.body)
    .then((answer) => {
      res.sendStatus(200);
    })
    .catch((err) => {
      const {
        response: {
          data: { error_code, description },
        },
      } = err;
      const errType = description.split(": ")[1];

      if (errType === setScoreErrorTypes.BOT_SCORE_NOT_MODIFIED) {
        res.sendStatus(200);
      } else {
        res.sendStatus(error_code);
      }
    });
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
