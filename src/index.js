import express from "express";
import cors from "cors";
import { router as userRoute } from "./routes/User.js";
import { router as duelRoute } from "./routes/Duel.js";
import { router as songRoute } from "./routes/Song.js";
import { router as playlistRoute } from "./routes/Playlist.js";
import { router as gameRoute } from "./routes/Game.js";
import { router as shopRoute } from "./routes/Shop.js";
import { router as rivalryRoute } from "./routes/Rivalry.js";

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.use("/user", userRoute);
app.use("/duel", duelRoute);
app.use("/song", songRoute);
app.use("/playlist", playlistRoute);
app.use("/game", gameRoute);
app.use("/shop", shopRoute);
app.use("/rivalry", rivalryRoute);

app.get("/", (req, res) => {
  res.status(200);
  res.send("Home of Songpop-Balkans");
});

app.listen(port, () => console.log(`Listening on port ${port}!`));
