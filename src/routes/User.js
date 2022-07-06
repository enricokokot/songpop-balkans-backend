import express from "express";
import connect from "../db.js";

export const router = express.Router();

router.get("/", async (req, res) => {
  let db = await connect();
  let cursor = await db.collection("users").find();
  let results = await cursor.toArray();
  res.json(results);
});

router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  let db = await connect();
  let specificUser = await db.collection("users").findOne({ id: id });
  res.json(specificUser);
});

router.get("/:id/coin", async (req, res) => {
  const id = Number(req.params.id);
  let db = await connect();
  let specificUser = await db.collection("users").findOne({ id: id });
  const specificUserCoin = specificUser.coins;
  res.status(200);
  res.send({ availableCoins: specificUserCoin });
});

router.get("/:id/playlist", async (req, res) => {
  const id = Number(req.params.id);
  let db = await connect();
  let specificUser = await db.collection("users").findOne({ id: id });
  const specificUserPlaylists = specificUser.playlists;
  res.status(200);
  res.send(specificUserPlaylists);
});

router.get("/:id/achievement", async (req, res) => {
  const id = Number(req.params.id);
  let db = await connect();
  let specificUser = await db.collection("users").findOne({ id: id });
  const specificUserAchievements = specificUser.achievements;
  res.status(200);
  res.send(specificUserAchievements);
});

router.patch("/:userId/achievement/:achievementId", async (req, res) => {
  const userId = Number(req.params.userId);
  const achievementId = Number(req.params.achievementId);
  let db = await connect();
  let specificUser = await db.collection("users").findOne({ id: userId });
  const specificUserAchievements = specificUser.achievements;
  const specificUserAchievement = specificUserAchievements.find(
    (achievement) => achievement.id === achievementId
  );
  if (specificUserAchievement.progress < specificUserAchievement.total) {
    let achievementAchieved = false;
    if (achievementId === 0) {
      let achievementAction = await db
        .collection("users")
        .updateOne({ id: userId }, { $inc: { "achievements.0.progress": 1 } });
      let achievementAction2 = await db
        .collection("users")
        .findOne({ id: userId });
      if (
        achievementAction2.achievements[0].progress ===
        achievementAction2.achievements[0].total
      )
        achievementAchieved = true;
    } else if (achievementId === 1) {
      let achievementAction = await db
        .collection("users")
        .updateOne({ id: userId }, { $inc: { "achievements.1.progress": 1 } });
      let achievementAction2 = await db
        .collection("users")
        .findOne({ id: userId });
      if (
        achievementAction2.achievements[1].progress ===
        achievementAction2.achievements[1].total
      )
        achievementAchieved = true;
    } else if (achievementId === 2) {
      let achievementAction = await db
        .collection("users")
        .updateOne({ id: userId }, { $inc: { "achievements.2.progress": 1 } });
      let achievementAction2 = await db
        .collection("users")
        .findOne({ id: userId });
      if (
        achievementAction2.achievements[2].progress ===
        achievementAction2.achievements[2].total
      )
        achievementAchieved = true;
    } else if (achievementId === 3) {
      let achievementAction = await db
        .collection("users")
        .updateOne({ id: userId }, { $inc: { "achievements.3.progress": 1 } });
      let achievementAction2 = await db
        .collection("users")
        .findOne({ id: userId });
      if (
        achievementAction2.achievements[3].progress ===
        achievementAction2.achievements[3].total
      )
        achievementAchieved = true;
    } else if (achievementId === 4) {
      let achievementAction = await db
        .collection("users")
        .updateOne({ id: userId }, { $inc: { "achievements.4.progress": 1 } });
      let achievementAction2 = await db
        .collection("users")
        .findOne({ id: userId });
      if (
        achievementAction2.achievements[4].progress ===
        achievementAction2.achievements[4].total
      )
        achievementAchieved = true;
    } else if (achievementId === 5) {
      let achievementAction = await db
        .collection("users")
        .updateOne({ id: userId }, { $inc: { "achievements.5.progress": 1 } });
      let achievementAction2 = await db
        .collection("users")
        .findOne({ id: userId });
      if (
        achievementAction2.achievements[5].progress ===
        achievementAction2.achievements[5].total
      )
        achievementAchieved = true;
    }

    if (achievementAchieved) {
      res.status(200);
      res.send({ goalReached: true });
    } else {
      res.status(200);
      res.send({ goalReached: false });
    }
  } else {
    res.status(200);
    res.send({ goalReached: false });
  }
});

router.get("/:id/rivalry", async (req, res) => {
  const id = Number(req.params.id);
  let db = await connect();
  let cursor = await db
    .collection("rivalries")
    .find({ $or: [{ playerOneId: id }, { playerTwoId: id }] });
  let specificPlayereRivalries = await cursor.toArray();
  if (specificPlayereRivalries) {
    res.status(200);
    res.send(specificPlayereRivalries);
  } else {
    res.status(200);
    res.send([]);
  }
});
