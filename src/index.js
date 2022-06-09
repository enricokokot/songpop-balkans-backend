import express from "express";
import cors from "cors";
import { users } from "./users";
import { songs } from "./songs";
import { playlists } from "./playlists";
import { duels } from "./duels";
import { friendships } from "./friendships";

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200);
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

// kupnja playliste
app.patch("/playlist/:id/buy", (req, res) => {
  const id = Number(req.params.id);
  const { playerId } = req.body;
  res.status(200);
  res.send({ transactionCompleted: true });
});

app.get("/duel", (req, res) => {
  res.status(200);
  res.send(duels);
});

// započinjanje izazova tj. izazivanje protivnika
app.post("/duel/start", (req, res) => {
  const { playerOneId, playerTwoId, playlist, playerOneScore } = req.body;
  res.status(200);
  res.send({ requestCompleted: true });
});

// odgovoranje na izazov kojeg je drugi igrač započeo i završetak dvoboja
app.patch("/duel/end", (req, res) => {
  const { playerOneId, playerTwoId, playerOneScore, playerTwoScore } = req.body;
  res.status(200);
  res.send({ requestCompleted: true });
});

// odbijanje izazova drugog igrača ili undo-anje dvoboja kojeg smo sami započeli
app.delete("/duel/quit", (req, res) => {
  const { playerOneId, playerTwoId } = req.body;
  res.status(200);
  res.send({ requestCompleted: true });
});

app.get("/friendship", (req, res) => {
  res.status(200);
  res.send(friendships);
});

app.get("/friendship/:id", (req, res) => {
  const id = Number(req.params.id);
  const specificUsersFriends = friendships.find(
    (friendsList) => friendsList.userId === id
  );
  res.status(200);
  res.send(specificUsersFriends);
});

app.listen(port, () => console.log(`Listening on port ${port}!`));
