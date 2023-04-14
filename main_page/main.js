const currentYearSpan = document.querySelector(".current-year");
const gamesListSection = document.querySelector(".games-list");

const imagesUrl = "/assets/images";

const games = {
  asa2048: {
    name: "2048",
    url: "/2048",
  },
  asa2048x5: {
    name: "2048x5",
    url: "/2048",
    queries: { extended: true },
  },
  t_rex: {
    name: "T-Rex",
    url: "/t-rex",
  },
  snake: {
    name: "Snake",
    url: "/snake",
  },
  flappy_bird: {
    name: "Flappy Bird",
    url: "/flappy-bird",
  },
  tetris: {
    name: "Tetris",
    url: "/tetris",
  },
  t2048: {
    name: "T2048",
    url: "/t2048",
  }
};

Object.keys(games).forEach((gameKey) => {
  const { name, url, queries } = games[gameKey];
  const imageUrl = `${imagesUrl}${url}.png`;
  const query =
    queries &&
    Object.keys(queries)
      .map((key) => `${key}=${queries[key]}`)
      .join("&");

  const gameElement = document.createElement("a");
  gameElement.classList.add("game");
  gameElement.href = `${url}${query ? "?" + query : ""}`;

  const imageElement = document.createElement("img");
  imageElement.src = imageUrl;
  imageElement.alt = name;

  const nameElement = document.createElement("span");
  nameElement.innerHTML = name;

  gameElement.appendChild(imageElement);
  gameElement.appendChild(nameElement);

  gamesListSection.appendChild(gameElement);
});

currentYearSpan.innerHTML = new Date().getFullYear();
