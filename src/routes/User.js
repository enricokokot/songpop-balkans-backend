import express from "express";
import { ObjectId } from "mongodb";
import connect, { userDb } from "../db.js";
import auth from "../auth.js";

export const router = express.Router();

router.post("/", async (req, res) => {
  let user = req.body;
  let id;
  try {
    id = await auth.registerUser(user);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
  res.json({ id: id });
});

router.get("/", async (req, res) => {
  let db = await connect();
  let cursor = await db.collection(userDb).find();
  let results = await cursor.toArray();
  res.json(results);
});

router.get("/:id/ordered", async (req, res) => {
  const id = req.params.id;
  const page = Number(req.query.page);
  const username = req.query.username;
  const limit = 6;
  const db = await connect();
  const user = await db.collection(userDb).findOne({ _id: ObjectId(id) });
  const { reply, challenge, waiting } = user;
  const idsSmallerThanUser = [];
  const idsLargerThanUser = [];
  challenge.forEach((userId) =>
    userId.toString() > id
      ? idsLargerThanUser.push(userId.toString())
      : idsSmallerThanUser.push(userId.toString())
  );
  const idsSmallerThanUserSum = [];
  for (const userId of idsSmallerThanUser) {
    const rivalry = await db
      .collection("rivalries")
      .findOne({ $and: [{ playerOneId: userId }, { playerTwoId: id }] });
    const { playerOneScore, playerTwoScore } = rivalry || {
      playerOneScore: 0,
      playerTwoScore: 0,
    };
    const rivalrySum = playerOneScore + playerTwoScore;
    idsSmallerThanUserSum.push(rivalrySum);
  }
  const idsLargerThanUserSum = [];
  for (const userId of idsLargerThanUser) {
    const rivalry = await db
      .collection("rivalries")
      .findOne({ $and: [{ playerOneId: id }, { playerTwoId: userId }] });
    const { playerOneScore, playerTwoScore } = rivalry || {
      playerOneScore: 0,
      playerTwoScore: 0,
    };
    const rivalrySum = playerOneScore + playerTwoScore;
    idsLargerThanUserSum.push(rivalrySum);
  }

  const ids = idsSmallerThanUser.concat(idsLargerThanUser);
  const sums = idsSmallerThanUserSum.concat(idsLargerThanUserSum);
  const idsAndSums = [];

  let counter = 0;
  for (const id of ids) {
    idsAndSums.push({ id, sum: sums[counter] });
    counter += 1;
  }

  idsAndSums.sort(function (a, b) {
    return a.sum < b.sum ? 1 : b.sum < a.sum ? -1 : 0;
  });

  const newChallenge = idsAndSums.map((idAndSum) => ObjectId(idAndSum.id));

  const users = reply.concat(newChallenge).concat(waiting);
  const pageNumber = Math.ceil(users.length / limit);
  const limitedUsers = users.slice(limit * page, limit * page + limit);
  const results = [];
  for (const limitedUser of limitedUsers) {
    const wholeUser = await db.collection(userDb).findOne({ _id: limitedUser });
    // TODO: fix this, works only on the first 10 users, enough ATM
    if (wholeUser.username.includes(username)) results.push(wholeUser);
  }
  res.json({ results, pageNumber });
});

router.get("/:id", async (req, res) => {
  const id = req.params.id;
  let db = await connect();
  let specificUser = await db.collection(userDb).findOne({ _id: ObjectId(id) });
  res.json(specificUser);
});

router.delete("/:id", async (req, res) => {
  const id = req.params.id;
  const db = await connect();
  const specificUser = await db
    .collection(userDb)
    .findOne({ _id: ObjectId(id) });
  const { _id, duels, reply, challenge, waiting } = specificUser;
  for (const userId of reply) {
    await db
      .collection("users")
      .findOneAndUpdate({ _id: userId }, { $pull: { waiting: _id } });
  }
  for (const userId of challenge) {
    await db
      .collection("users")
      .findOneAndUpdate({ _id: userId }, { $pull: { challenge: _id } });
  }
  for (const userId of waiting) {
    await db
      .collection("users")
      .findOneAndUpdate({ _id: userId }, { $pull: { reply: _id } });
  }
  for (const duelId of duels) {
    const specificDuel = await db.collection("duels").findOne({ _id: duelId });
    if (specificDuel) {
      const { playerOneId, playerTwoId } = specificDuel;
      const otherPlayerId =
        playerOneId === _id.toString()
          ? ObjectId(playerTwoId)
          : ObjectId(playerOneId);
      console.log("otherPlayerId", otherPlayerId);
      await db
        .collection("users")
        .findOneAndUpdate({ _id: otherPlayerId }, { $pull: { duels: duelId } });
      await db.collection("duels").findOneAndDelete({ _id: duelId });
    }
  }
  await db.collection("rivalries").deleteMany({
    $or: [{ playerOneId: _id.toString() }, { playerTwoId: _id.toString() }],
  });
  await db.collection("users").deleteOne({ _id: _id });
  res.json({ requestCompleted: true });
});

router.get("/:id/coin", async (req, res) => {
  const id = req.params.id;
  let db = await connect();
  let specificUser = await db.collection(userDb).findOne({ _id: ObjectId(id) });
  const specificUserCoin = specificUser.coins;
  res.status(200);
  res.send({ availableCoins: specificUserCoin });
});

router.get("/:id/playlist", async (req, res) => {
  const id = req.params.id;
  let db = await connect();
  let specificUser = await db.collection(userDb).findOne({ _id: ObjectId(id) });
  const specificUserPlaylists = specificUser.playlists;
  res.status(200);
  res.send(specificUserPlaylists);
});

router.get("/:id/achievement", async (req, res) => {
  const id = req.params.id;
  let db = await connect();
  let specificUser = await db.collection(userDb).findOne({ _id: ObjectId(id) });
  const specificUserAchievements = specificUser.achievements;
  res.status(200);
  res.send(specificUserAchievements);
});

router.put("/:userId/achievement/:achievementId", async (req, res) => {
  const { userId, achievementId } = req.params;
  const db = await connect();
  const specificUser = await db
    .collection(userDb)
    .findOne({ _id: ObjectId(userId) });
  const { appendedAchievement } = await specificUser;
  if (appendedAchievement === Number(achievementId)) {
    await db
      .collection(userDb)
      .findOneAndUpdate(
        { _id: ObjectId(userId) },
        { $set: { appendedAchievement: -1 } }
      );
  } else {
    await db
      .collection(userDb)
      .findOneAndUpdate(
        { _id: ObjectId(userId) },
        { $set: { appendedAchievement: Number(achievementId) } }
      );
  }
  res.status(200);
  res.send({ taskCompleted: true });
});

router.patch("/:userId/achievement/:achievementId", async (req, res) => {
  const userId = req.params.userId;
  const achievementId = Number(req.params.achievementId);
  let db = await connect();
  let specificUser = await db
    .collection(userDb)
    .findOne({ _id: ObjectId(userId) });
  const specificUserAchievements = specificUser.achievements;
  const specificUserAchievement = specificUserAchievements.find(
    (achievement) => achievement.id === achievementId
  );
  if (specificUserAchievement.progress < specificUserAchievement.total) {
    let achievementAchieved = false;
    if (achievementId === 0) {
      let achievementAction = await db
        .collection(userDb)
        .updateOne(
          { _id: ObjectId(userId) },
          { $inc: { "achievements.0.progress": 1 } }
        );
      let achievementAction2 = await db
        .collection(userDb)
        .findOne({ _id: ObjectId(userId) });
      if (
        achievementAction2.achievements[0].progress ===
        achievementAction2.achievements[0].total
      )
        achievementAchieved = true;
    } else if (achievementId === 1) {
      let achievementAction = await db
        .collection(userDb)
        .updateOne(
          { _id: ObjectId(userId) },
          { $inc: { "achievements.1.progress": 1 } }
        );
      let achievementAction2 = await db
        .collection(userDb)
        .findOne({ _id: ObjectId(userId) });
      if (
        achievementAction2.achievements[1].progress ===
        achievementAction2.achievements[1].total
      )
        achievementAchieved = true;
    } else if (achievementId === 2) {
      let achievementAction = await db
        .collection(userDb)
        .updateOne(
          { _id: ObjectId(userId) },
          { $inc: { "achievements.2.progress": 1 } }
        );
      let achievementAction2 = await db
        .collection(userDb)
        .findOne({ _id: ObjectId(userId) });
      if (
        achievementAction2.achievements[2].progress ===
        achievementAction2.achievements[2].total
      )
        achievementAchieved = true;
    } else if (achievementId === 3) {
      let achievementAction = await db
        .collection(userDb)
        .updateOne(
          { _id: ObjectId(userId) },
          { $inc: { "achievements.3.progress": 1 } }
        );
      let achievementAction2 = await db
        .collection(userDb)
        .findOne({ _id: ObjectId(userId) });
      if (
        achievementAction2.achievements[3].progress ===
        achievementAction2.achievements[3].total
      )
        achievementAchieved = true;
    } else if (achievementId === 4) {
      let achievementAction = await db
        .collection(userDb)
        .updateOne(
          { _id: ObjectId(userId) },
          { $inc: { "achievements.4.progress": 1 } }
        );
      let achievementAction2 = await db
        .collection(userDb)
        .findOne({ _id: ObjectId(userId) });
      if (
        achievementAction2.achievements[4].progress ===
        achievementAction2.achievements[4].total
      )
        achievementAchieved = true;
    } else if (achievementId === 5) {
      let achievementAction = await db
        .collection(userDb)
        .updateOne(
          { _id: ObjectId(userId) },
          { $inc: { "achievements.5.progress": 1 } }
        );
      let achievementAction2 = await db
        .collection(userDb)
        .findOne({ _id: ObjectId(userId) });
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
  const id = req.params.id;
  let db = await connect();
  let cursor = await db.collection("rivalries").find({
    $or: [{ playerOneId: id }, { playerTwoId: id }],
  });
  let specificPlayereRivalries = await cursor.toArray();
  if (specificPlayereRivalries) {
    res.status(200);
    res.send(specificPlayereRivalries);
  } else {
    res.status(200);
    res.send([]);
  }
});
