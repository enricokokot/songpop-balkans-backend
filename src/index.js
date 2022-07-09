import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import auth from "./auth.js";
import { router as userRoute } from "./routes/User.js";
import { router as duelRoute } from "./routes/Duel.js";
import { router as songRoute } from "./routes/Song.js";
import { router as playlistRoute } from "./routes/Playlist.js";
import { router as rivalryRoute } from "./routes/Rivalry.js";

const app = express();
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.use(cors());
app.use(express.json());

app.use("/user", userRoute);
app.use("/duel", duelRoute);
app.use("/song", songRoute);
app.use("/playlist", playlistRoute);
app.use("/rivalry", rivalryRoute);

app.post("/auth", async (req, res) => {
  let user = req.body;

  try {
    let result = await auth.authenticateUser(user.username, user.password);
    res.json(result);
  } catch (e) {
    res.status(401).json({ error: e.message });
  }
});

app.get("/", (req, res) => {
  res.status(200);
  res.send("Home of Songpop-Balkans");
});

app.listen(port, () => console.log(`Listening on port ${port}!`));
