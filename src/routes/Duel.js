import express from "express";
import connect, { userDb } from "../db.js";
import { ObjectId } from "mongodb";

export const router = express.Router();

router.get("/", async (req, res) => {
  let db = await connect();
  let cursor = await db.collection("duels").find();
  let results = await cursor.toArray();
  res.json(results);
});

router.get("/:id", async (req, res) => {
  const id = req.params.id;
  let db = await connect();

  let result1 = await db
    .collection("duels")
    .find({ challengerId: ObjectId(id).toString() });

  let result2 = await db
    .collection("duels")
    .find({ challengeTakerId: ObjectId(id).toString() });

  const specificPlayerDuelsWhereHeIsTheChallenger = await result1.toArray();
  const specificPlayerDuelsWhereHeIsBeingChallenged = await result2.toArray();

  const specificPlayerDuelsDivided = {
    specificPlayerDuelsWhereHeIsTheChallenger,
    specificPlayerDuelsWhereHeIsBeingChallenged,
  };
  res.status(200);
  res.send(specificPlayerDuelsDivided);
});

// slanje izazova drugom playeru
router.post(
  // router.put(
  "/start",
  async (req, res) => {
    const {
      challengerId,
      challengeTakerId,
      playlist,
      challengerScore,
      roundsData,
    } = req.body;

    let db = await connect();
    let cursor = await db.collection("duels").find();
    const allDuels = await cursor.toArray();

    if (
      allDuels.find(
        (duel) =>
          (duel.challengerId === challengerId &&
            duel.challengeTakerId === challengeTakerId) ||
          (duel.challengerId === challengeTakerId &&
            duel.challengeTakerId === challengerId)
      )
    ) {
      res.status(200);
      res.send({ requestCompleted: false });
    } else {
      Object.keys(roundsData).forEach((key) => {
        delete Object.assign(roundsData[key], {
          ["playerTimeAnswered"]: roundsData[key]["timeAnswered"],
        })["timeAnswered"];
        delete Object.assign(roundsData[key], {
          ["playerPointsEarned"]: roundsData[key]["pointsEarned"],
        })["pointsEarned"];
        delete Object.assign(roundsData[key], {
          ["playerAnswer"]: roundsData[key]["answer"],
        })["answer"];
      });

      const thePlaylist = await db
        .collection("playlists")
        .findOne({ title: playlist });

      const result = await db.collection("duels").insertOne({
        time: Date.now(),
        playerOneId: challengerId,
        playerTwoId: challengeTakerId,
        challengerId,
        challengeTakerId,
        playlist: thePlaylist,
        challengerScore: Number(challengerScore),
        challengeTakerScore: 0,
        playerOneTotalScore: 0,
        playerTwoTotalScore: 0,
        rounds: roundsData,
      });

      let challengerUser = await db
        .collection(userDb)
        .findOne({ _id: ObjectId(challengerId) });
      let newChallengerUser = challengerUser.duels.push(result.insertedId);
      let newChallengerUserDuels = challengerUser.duels;
      let challengerUserResult = await db
        .collection(userDb)
        .updateOne(
          { _id: ObjectId(challengerId) },
          { $set: { duels: newChallengerUserDuels } }
        );
      let challengeTakerUser = await db
        .collection(userDb)
        .findOne({ _id: ObjectId(challengeTakerId) });
      let newChallengeTakerUser = challengeTakerUser.duels.push(
        result.insertedId
      );
      let newChallengeTakerUserDuels = challengeTakerUser.duels;
      let challengeTakerUserResult = await db
        .collection(userDb)
        .updateOne(
          { _id: ObjectId(challengeTakerId) },
          { $set: { duels: newChallengeTakerUserDuels } }
        );

      await db
        .collection(userDb)
        .updateOne(
          { _id: ObjectId(challengerId) },
          { $pull: { challenge: ObjectId(challengeTakerId) } }
        );
      await db
        .collection(userDb)
        .updateOne(
          { _id: ObjectId(challengerId) },
          { $push: { waiting: ObjectId(challengeTakerId) } }
        );
      await db
        .collection(userDb)
        .updateOne(
          { _id: ObjectId(challengeTakerId) },
          { $pull: { challenge: ObjectId(challengerId) } }
        );
      await db
        .collection(userDb)
        .updateOne(
          { _id: ObjectId(challengeTakerId) },
          { $push: { reply: ObjectId(challengerId) } }
        );

      res.status(200);
      res.send({ requestCompleted: true });
    }
  }
);

// odgovoranje na izazov kojeg je drugi player zapoceo i zavrsetak dvoboja
router.put("/end", async (req, res) => {
  const { duelId, challengeeScore } = req.body;
  let db = await connect();
  let duel = await db.collection("duels").findOne({ _id: ObjectId(duelId) });
  duel.challengeTakerScore = challengeeScore;
  const {
    challengerId,
    challengeTakerId,
    challengerScore,
    challengeTakerScore,
  } = duel;

  const winnerId =
    challengerScore == challengeTakerScore
      ? undefined
      : challengerScore > challengeTakerScore
      ? challengerId
      : challengeTakerId;

  const idsSortedByOrder =
    challengerId < challengeTakerId
      ? [challengerId, challengeTakerId]
      : [challengeTakerId, challengerId];

  const smallerId = idsSortedByOrder[0];
  const biggerId = idsSortedByOrder[1];

  if (
    !(await db
      .collection("rivalries")
      .findOne({ playerOneId: smallerId, playerTwoId: biggerId }))
  ) {
    db.collection("rivalries").insertOne({
      playerOneId: smallerId,
      playerTwoId: biggerId,
      playerOneScore: 0,
      playerTwoScore: 0,
    });
  }

  if (winnerId) {
    const loserId = winnerId == challengerId ? challengeTakerId : challengerId;
    let winnerUser = await db
      .collection(userDb)
      .findOne({ _id: ObjectId(winnerId) });
    let loserUser = await db
      .collection(userDb)
      .findOne({ _id: ObjectId(loserId) });

    let winnerUserResult1 = await db
      .collection(userDb)
      .updateOne({ _id: ObjectId(winnerId) }, { $inc: { "games played": 1 } });
    let winnerUserResult2 = await db
      .collection(userDb)
      .updateOne({ _id: ObjectId(winnerId) }, { $inc: { "games won": 1 } });
    let winnerUserResult3 = await db
      .collection(userDb)
      .updateOne({ _id: ObjectId(winnerId) }, { $inc: { coins: 3 } });

    let loserUserResult1 = await db
      .collection(userDb)
      .updateOne({ _id: ObjectId(loserId) }, { $inc: { "games played": 1 } });
    let loserUserResult2 = await db
      .collection(userDb)
      .updateOne({ _id: ObjectId(loserId) }, { $inc: { "games lost": 1 } });
    let loserUserResult3 = await db
      .collection(userDb)
      .updateOne({ _id: ObjectId(loserId) }, { $inc: { coins: 1 } });

    winnerId > loserId
      ? db
          .collection("rivalries")
          .updateOne(
            { playerOneId: smallerId, playerTwoId: biggerId },
            { $inc: { playerTwoScore: 1 } }
          )
      : db
          .collection("rivalries")
          .updateOne(
            { playerOneId: smallerId, playerTwoId: biggerId },
            { $inc: { playerOneScore: 1 } }
          );
  } else {
    let challengerResult = await db
      .collection(userDb)
      .updateOne(
        { _id: ObjectId(challengerId) },
        { $inc: { "games played": 1, "games tied": 1, coins: 2 } }
      );
    let challengeTakerResult = await db
      .collection(userDb)
      .updateOne(
        { _id: ObjectId(challengeTakerId) },
        { $inc: { "games played": 1, "games tied": 1, coins: 2 } }
      );

    db.collection("rivalries").updateOne(
      { playerOneId: smallerId, playerTwoId: biggerId },
      { $inc: { playerOneScore: 1, playerTwoScore: 1 } }
    );
  }

  let duelToRemove = await db
    .collection("duels")
    .findOneAndDelete({ _id: ObjectId(duelId) });

  let erase1 = await db
    .collection(userDb)
    .updateOne(
      { _id: ObjectId(challengerId) },
      { $pull: { duels: ObjectId(duelId) } }
    );
  let erase2 = await db
    .collection(userDb)
    .updateOne(
      { _id: ObjectId(challengeTakerId) },
      { $pull: { duels: ObjectId(duelId) } }
    );

  await db
    .collection(userDb)
    .updateOne(
      { _id: ObjectId(challengeTakerId) },
      { $pull: { reply: ObjectId(challengerId) } }
    );
  await db
    .collection(userDb)
    .updateOne(
      { _id: ObjectId(challengeTakerId) },
      { $push: { challenge: ObjectId(challengerId) } }
    );
  await db
    .collection(userDb)
    .updateOne(
      { _id: ObjectId(challengerId) },
      { $pull: { waiting: ObjectId(challengeTakerId) } }
    );
  await db
    .collection(userDb)
    .updateOne(
      { _id: ObjectId(challengerId) },
      { $push: { challenge: ObjectId(challengeTakerId) } }
    );

  res.status(200);
  res.send({ winner: winnerId });
});

// odbijanje izazova drugog playera ili odbacivanje izazova koji smo sami postavili
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  let db = await connect();
  let duelToRemove = await db
    .collection("duels")
    .findOne({ _id: ObjectId(id) });
  const { playerOneId, playerTwoId } = duelToRemove;
  const playerOneResult = await db
    .collection(userDb)
    .updateOne(
      { _id: ObjectId(playerOneId) },
      { $pull: { duels: ObjectId(id) } }
    );
  const playerTwoResult = await db
    .collection(userDb)
    .updateOne(
      { _id: ObjectId(playerTwoId) },
      { $pull: { duels: ObjectId(id) } }
    );
  const duelResult = await db
    .collection("duels")
    .findOneAndDelete({ _id: ObjectId(id) });
  res.status(200);
  res.send({ requestCompleted: true });
});

// brisanje duela koji sadrže zastarjele podatke koji ruše aplikaciju
router.delete("/", async (req, res) => {
  let db = await connect();
  let cursor = await db
    .collection("duels")
    .find({ "rounds.0.correctAnswerId": { $type: "number" } });
  let duelResults = await cursor.toArray();
  for (const duel of duelResults) {
    const duelId = duel._id;
    const { playerOneId, playerTwoId } = duel;
    const playerOne = await db
      .collection(userDb)
      .updateOne({ _id: ObjectId(playerOneId) }, { $pull: { duels: duelId } });
    const playerTwo = await db
      .collection(userDb)
      .updateOne({ _id: ObjectId(playerTwoId) }, { $pull: { duels: duelId } });
    let removalResult = await db.collection("duels").deleteOne({ _id: duelId });
  }
  res.status(200);
  res.send({ requestCompleted: true });
});
