import express from "express";
import cors from "cors";

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const users = [
  {
    id: 0,
    name: "Dino Merlić",
    playlists: ["rock", "rap"],
    duels: [],
    coins: 43,
    // medals: ["won 10 games"],
    "games played": 12,
    "games won": 7,
    "games lost": 3,
    "games tied": 2,
  },
  {
    id: 1,
    name: "Senka Miletić",
    playlists: ["rock", "trap"],
    duels: [{ against: 2, playlist: "rock", played: 1, score: 75 }],
    coins: 10,
    // medals: ["won with a perfect score"],
    "games played": 6,
    "games won": 2,
    "games lost": 4,
    "games tied": 0,
  },
  {
    id: 2,
    name: "Fedja Sakić",
    playlists: ["folk", "rap"],
    duels: [{ against: 1, playlist: "rock", played: 0, score: 0 }],
    coins: 3,
    // medals: [],
    "games played": 3,
    "games won": 0,
    "games lost": 3,
    "games tied": 0,
  },
];

const songsDetails = [
  {
    id: 0,
    title: "Kap po kap",
    artist: "Divlje Jagode",
    playlist: "rock",
  },
  {
    id: 1,
    title: "Marija",
    artist: "Divlje Jagode",
    playlist: "rock",
  },
  {
    id: 2,
    title: "Sve još miriše na nju",
    artist: "Parni valjak",
    playlist: "rock",
  },
  {
    id: 3,
    title: "Previše suza u mom pivu",
    artist: "Prljavo kazalište",
    playlist: "rock",
  },
];

// fileovi su trenutno na mom sustavu
const songsAudio = new Map([
  [0, "C:\\Users\\ekoko\\Downloads\\Divlje_jagode_-_Kap_po_kap.mp3"],
  [1, "C:\\Users\\ekoko\\Downloads\\Divlje_jagode_-_Marija.mp3"],
  [2, "C:\\Users\\ekoko\\Downloads\\Parni_valjak_-_Sve_još_miriše_na_nju.mp3"],
  [
    3,
    "C:\\Users\\ekoko\\Downloads\\Prljavo_kazaliste_-_Previše_suza_u_mom_pivu.mp3",
  ],
]);

const playlists = [
  {
    id: 0,
    title: "rock",
    details: "All the YU and post-YU rock your heart desires!",
    price: 25,
    songs: [0, 1, 2, 3],
  },
  {
    id: 1,
    title: "folk",
    details: "For the animal in you here is the best glass-shattering music!",
    price: 25,
    songs: [4, 5, 6, 7],
  },
  {
    id: 2,
    title: "rap",
    details: "Music from the streets for the streets!",
    price: 25,
    songs: [8, 9, 10, 11],
  },
];

app.get("/", (req, res) => {
  res.status(200);
  res.send("Home");
});

app.get("/user", (req, res) => {
  res.status(200);
  res.send(users);
});

app.get("/user/:id", (req, res) => {
  const id = Number(req.params.id);
  const specificUser = users.find((user) => user.id === id);
  res.status(200);
  res.send(specificUser);
});

app.get("/song", (req, res) => {
  res.status(200);
  res.send(songsDetails);
});

app.get("/song/:id", (req, res) => {
  const id = Number(req.params.id);
  const specificSong = songsDetails.find((song) => song.id === id);
  res.status(200);
  res.send(specificSong);
});

app.get("/song/:id/audio", (req, res) => {
  const id = Number(req.params.id);
  const specificSongAudio = songsAudio.get(id);
  res.status(200);
  res.sendFile(specificSongAudio);
});

app.get("/playlist", (req, res) => {
  res.status(200);
  res.send(playlists);
});

app.get("/playlist/:id", (req, res) => {
  const id = Number(req.params.id);
  const specificPlaylist = playlists.find((playlist) => playlist.id === id);
  res.status(200);
  res.send(specificPlaylist);
});

// slanje izazova drugom playeru
app.put("/duel/start", (req, res) => {
  const { body } = req;
  const { playerOneId, playerTwoId, playlist, playerOneScore } = body;
  const playerOneIndex = users.findIndex((user) => user.id == playerOneId);
  const playerTwoIndex = users.findIndex((user) => user.id == playerTwoId);

  if (
    users[playerOneIndex].duels.find((duel) => duel.against == playerTwoId) &&
    users[playerTwoIndex].duels.find((duel) => duel.against == playerOneId)
  ) {
    res.status(200);
    res.send({ requestCompleted: false, reason: "Duel already active" });
  } else {
    users[playerOneIndex].duels.push({
      against: playerTwoId,
      playlist: playlist,
      played: 1,
      score: playerOneScore,
    });

    users[playerTwoIndex].duels.push({
      against: playerOneId,
      playlist: playlist,
      played: 0,
      score: 0,
    });

    res.status(200);
    res.send({ requestCompleted: true });
  }
});

// odgovoranje na izazov kojeg je drugi player zapoceo i zavrsetak dvoboja
app.put("/duel/end", (req, res) => {
  const { body } = req;
  const { playerOneId, playerTwoId, playerOneScore, playerTwoScore } = body;
  const playerOneIndex = users.findIndex((user) => user.id == playerOneId);
  const playerTwoIndex = users.findIndex((user) => user.id == playerTwoId);

  if (playerOneScore > playerTwoScore) {
    users[playerOneIndex]["games played"] += 1;
    users[playerOneIndex]["games won"] += 1;
    users[playerOneIndex].coins += 3;
    users[playerOneIndex].duels = users[playerOneIndex].duels.filter(
      (duel) => duel.against == playerTwoId
    );
    users[playerTwoIndex]["games played"] += 1;
    users[playerTwoIndex]["games lost"] += 1;
    users[playerTwoIndex].coins += 1;
    users[playerTwoIndex].duels = users[playerTwoIndex].duels.filter(
      (duel) => duel.against == playerOneId
    );
    res.status(200);
    res.send({ winner: playerOneId });
  } else if (playerOneScore < playerTwoScore) {
    users[playerTwoIndex]["games played"] += 1;
    users[playerTwoIndex]["games won"] += 1;
    users[playerTwoIndex].coins += 3;
    users[playerTwoIndex].duels = users[playerTwoIndex].duels.filter(
      (duel) => duel.against == playerOneId
    );
    users[playerOneIndex]["games played"] += 1;
    users[playerOneIndex]["games lost"] += 1;
    users[playerOneIndex].coins += 1;
    users[playerOneIndex].duels = users[playerOneIndex].duels.filter(
      (duel) => duel.against == playerTwoId
    );
    res.status(200);
    res.send({ winner: playerTwoId });
  } else {
    users[playerOneIndex]["games played"] += 1;
    users[playerOneIndex]["games tied"] += 1;
    users[playerOneIndex].coins += 2;
    users[playerOneIndex].duels = users[playerOneIndex].duels.filter(
      (duel) => duel.against == playerTwoId
    );
    users[playerTwoIndex]["games played"] += 1;
    users[playerTwoIndex]["games tied"] += 1;
    users[playerTwoIndex].coins += 2;
    users[playerTwoIndex].duels = users[playerTwoIndex].duels.filter(
      (duel) => duel.against == playerOneId
    );
    res.status(200);
    res.send("It's a tie!");
  }
});

// odbijanje izazova drugog playera ili odbacivanje izazova kojeg smo sami postavili drugom playeru
app.delete("/duel/quit", (req, res) => {
  const { body } = req;
  const { playerOneId, playerTwoId } = body;

  const playerOneIndex = users.findIndex((user) => user.id == playerOneId);
  const playerTwoIndex = users.findIndex((user) => user.id == playerTwoId);

  users[playerOneIndex].duels = users[playerOneIndex].duels.filter(
    (duel) => duel.against != playerTwoId
  );
  users[playerTwoIndex].duels = users[playerTwoIndex].duels.filter(
    (duel) => duel.against != playerOneId
  );

  res.status(200);
  res.send("OK");
});

app.put("/shop/playlist", (req, res) => {
  const { body } = req;
  const { playerId, playlistTitle } = body;

  const playerIndex = users.findIndex((user) => user.id == playerId);
  const playlistIndex = playlists.findIndex(
    (playlist) => playlist.title == playlistTitle
  );

  if (users[playerIndex].coins > playlists[playlistIndex].price) {
    users[playerIndex].coins -= playlists[playlistIndex].price;
    users[playerIndex].playlists.push(playlists[playlistIndex].title);
    res.status(200);
    res.send({ transactionCompleted: true });
  } else {
    res.status(200);
    res.send({ transactionCompleted: false, reason: "Not enough funds" });
  }
});

app.listen(port, () => console.log(`Listening on port ${port}!`));
