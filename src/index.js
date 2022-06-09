import express from "express";
import cors from "cors";
import { users } from "./users";
import { songsDetails } from "./songsDetails";
import { songsAudio } from "./songsAudio";
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
    const { playerOneId, playerTwoId, playlist, playerOneScore } = body;
    if (
      !duels.find(
        (duel) =>
          duel.id == String(playerOneId) + String(playerTwoId) ||
          duel.id == String(playerTwoId) + String(playerOneId)
      ) &&
      playerOneId != playerTwoId &&
      users.find((user) => user.id == playerOneId) &&
      users.find((user) => user.id == playerTwoId)
    ) {
      duels.push({
        id: String(playerOneId) + String(playerTwoId),
        challengerId: playerOneId,
        challengeTakerId: playerTwoId,
        playlist: playlists.find(
          (givenPlaylist) => givenPlaylist.title == playlist
        ).id,
        challengerScore: Number(playerOneScore),
        challengeTakerScore: 0,
      });

      res.status(200);
      res.send({ requestCompleted: true });
    } else {
      res.status(200);
      res.send({ requestCompleted: false });
    }
    // const playerOneIndex = users.findIndex((user) => user.id == playerOneId);
    // const playerTwoIndex = users.findIndex((user) => user.id == playerTwoId);

    // if (
    //   users[playerOneIndex].duels.find((duel) => duel.against == playerTwoId) &&
    //   users[playerTwoIndex].duels.find((duel) => duel.against == playerOneId)
    // ) {
    //   res.status(200);
    //   res.send({ requestCompleted: false, reason: "Duel already active" });
    // } else {
    //   users[playerOneIndex].duels.push({
    //     against: playerTwoId,
    //     playlist: playlist,
    //     played: 1,
    //     score: playerOneScore,
    //   });

    //   users[playerTwoIndex].duels.push({
    //     against: playerOneId,
    //     playlist: playlist,
    //     played: 0,
    //     score: 0,
    //   });
  }
  /*}*/
);

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

// odbijanje izazova drugog playera ili odbacivanje izazova koji smo sami postavili
app.delete("/duel/quit", (req, res) => {
  const { body } = req;
  const { playerOneId, playerTwoId } = body;

  duels = duels
    .filter((duel) => duel.id == String(playerOneId) + String(playerTwoId))
    .filter((duel) => duel.id == String(playerTwoId) + String(playerOneId));

  res.status(200);
  res.send("OK");
  // const playerOneIndex = users.findIndex((user) => user.id == playerOneId);
  // const playerTwoIndex = users.findIndex((user) => user.id == playerTwoId);

  // users[playerOneIndex].duels = users[playerOneIndex].duels.filter(
  //   (duel) => duel.against != playerTwoId
  // );
  // users[playerTwoIndex].duels = users[playerTwoIndex].duels.filter(
  //   (duel) => duel.against != playerOneId
  // );

  // res.status(200);
  // res.send("OK");
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
