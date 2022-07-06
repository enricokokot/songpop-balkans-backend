import express from "express";
import connect from "../db.js";

export const router = express.Router();

router.put("/playlist", async (req, res) => {
  const { body } = req;
  const { playerId, playlistTitle } = body;

  let db = await connect();
  let playerIndex = await db.collection("users").findOne({ id: playerId });
  const thePlaylist = await db
    .collection("playlists")
    .findOne({ title: playlistTitle });

  if (playerIndex.coins > thePlaylist.price) {
    let playlistPrice = thePlaylist.price;
    let playlistTitle = thePlaylist.title;
    let buy1 = await db
      .collection("users")
      .updateOne({ id: playerId }, { $inc: { coins: -playlistPrice } });
    let buy2 = await db
      .collection("users")
      .updateOne({ id: playerId }, { $push: { playlists: playlistTitle } });
    res.status(200);
    res.send({ transactionCompleted: true });
  } else {
    res.status(200);
    res.send({ transactionCompleted: false, reason: "Not enough funds" });
  }
});
