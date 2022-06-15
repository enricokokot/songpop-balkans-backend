import express from "express";
import cors from "cors";
import { users } from "./users";
import { songs } from "./songs";
import { playlists } from "./playlists";
import { duels } from "./duels";

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

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
  res.send(songs);
});

app.get("/song/:id", (req, res) => {
  const id = Number(req.params.id);
  const specificSong = songs.find((song) => song.id === id);
  res.status(200);
  res.send(specificSong);
});

app.get("/song/:id/audio", (req, res) => {
  const id = Number(req.params.id);
  const specificSongAudio = songs.find((song) => song.id === id).file;
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

app.get("/duel", (req, res) => {
  res.status(200);
  res.send(duels);
});

// slanje izazova drugom playeru
app.post(
  // app.put(
  "/duel/start",
  (req, res) => {
    const { body } = req;
    const { challengerId, challengeTakerId, playlist, challengerScore } = body;
    if (
      !duels.find(
        (duel) =>
          duel.id == String(challengerId) + String(challengeTakerId) ||
          duel.id == String(challengeTakerId) + String(challengerId)
      ) &&
      challengerId != challengeTakerId &&
      users.find((user) => user.id == challengerId) &&
      users.find((user) => user.id == challengeTakerId)
    ) {
      duels.push({
        id: String(challengerId) + String(challengeTakerId),
        challengerId,
        challengeTakerId,
        playlist: playlists.find(
          (givenPlaylist) => givenPlaylist.title == playlist
        ).id,
        challengerScore: Number(challengerScore),
        challengeTakerScore: 0,
      });

      res.status(200);
      res.send({ requestCompleted: true });
    } else {
      res.status(200);
      res.send({ requestCompleted: false });
    }
  }
);

// odgovoranje na izazov kojeg je drugi player zapoceo i zavrsetak dvoboja
app.put("/duel/end", (req, res) => {
  const { duelId, chalengeeScore } = req.body;
  const duel = duels.find((duel) => duel.id == duelId);
  duel.challengeTakerScore = Number(chalengeeScore);
  const {
    challengerId,
    challengeTakerId,
    challengerScore,
    challengeTakerScore,
  } = duel;

  const winnerId =
    challengerScore == challengeTakerScore
      ? undefined
      : challengerScore > challengeTakerScore
      ? challengerId
      : challengeTakerId;

  if (winnerId) {
    const loserId = winnerId == challengerId ? challengeTakerId : challengerId;
    const winnerUser = users.find((user) => user.id == winnerId);
    const loserUser = users.find((user) => user.id == loserId);

    winnerUser["games played"] += 1;
    winnerUser["games won"] += 1;
    winnerUser.coins += 3;

    loserUser["games played"] += 1;
    loserUser["games lost"] += 1;
    loserUser.coins += 1;
  } else {
    const user1 = users.find((user) => user.id == challengerId);
    const user2 = users.find((user) => user.id == challengeTakerId);

    user1["games played"] += 1;
    user1["games tied"] += 1;
    user1.coins += 2;

    user2["games played"] += 1;
    user2["games tied"] += 1;
    user2.coins += 2;
  }

  const indexOfDuelToBeDeleted = duels.findIndex(
    (thisDuel) => thisDuel.id == duelId
  );
  duels.splice(indexOfDuelToBeDeleted, 1);

  res.status(200);
  res.send({ winner: winnerId });
});

// odbijanje izazova drugog playera ili odbacivanje izazova koji smo sami postavili
app.delete("/duel/quit", (req, res) => {
  const { duelId } = req.body;
  const indexOfDuelToBeDeleted = duels.findIndex((duel) => duel.id == duelId);
  duels.splice(indexOfDuelToBeDeleted, 1);
  res.status(200);
  res.send({ requestCompleted: true });
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
