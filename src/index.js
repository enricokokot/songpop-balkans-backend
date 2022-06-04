import express from "express";
import cors from "cors";

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
  res.send("User Data");
});

app.get("/song", (req, res) => {
  res.status(200);
  res.send("Song Data");
});

app.listen(port, () => console.log(`Listening on port ${port}!`));
