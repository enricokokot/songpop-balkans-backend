import express from "express";
import connect from "../db";

export const router = express.Router();

router.get("/", async (req, res) => {
  let db = await connect();
  let cursor = await db.collection("rivalries").find();
  let results = await cursor.toArray();
  res.json(results);
});
