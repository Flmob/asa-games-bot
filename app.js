import "dotenv/config";

import express from "express";
import path from 'path';

const app = express()
const port = process.env.PORT || 3000;
const __dirname = path.resolve();

app.use(express.static(path.join(__dirname, 'games')));

app.get('/2048', function(req, res) {
    res.sendFile('games/2048/index.html', {root: __dirname })
});

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})