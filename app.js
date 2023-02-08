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
      res.sendStatus(500);
    });
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
