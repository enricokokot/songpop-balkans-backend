import express from "express";
import connect from "../db.js";

export const router = express.Router();

router.get("/", async (req, res) => {
  let db = await connect();
  let cursor = await db.collection("playlists").find();
  let results = await cursor.toArray();
  console.log("IN ROUTER!");
  res.json(results);
});

router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  let db = await connect();
  const specificPlaylist = await db.collection("playlists").findOne({ id: id });
  res.status(200);
  res.send(specificPlaylist);
});
