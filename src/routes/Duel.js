import express from "express";
import connect from "../db.js";

export const router = express.Router();

router.get("/", async (req, res) => {
  let db = await connect();
  let cursor = await db.collection("duels").find();
  let results = await cursor.toArray();
  res.json(results);
});

router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  let db = await connect();
  let cursor = await db.collection("duels").find();
  let specificUser = await db.collection("users").findOne({ id: id });
  const specificPlayerDuelIds = specificUser.duels;
  const allDuels = await cursor.toArray();

  const specificPlayerDuels = allDuels.filter((duel) =>
    specificPlayerDuelIds.includes(duel.id)
  );
  const specificPlayerDuelsWhereHeIsTheChallenger = specificPlayerDuels.filter(
    (duel) => duel.challengerId === id
  );
  const specificPlayerDuelsWhereHeIsBeingChallenged =
    specificPlayerDuels.filter((duel) => duel.challengerId !== id);
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
      const duelId = String(challengerId) + String(challengeTakerId);
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

      let result = await db.collection("duels").insertOne({
        id: duelId,
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
        .collection("users")
        .findOne({ id: challengerId });
      let newChallengerUser = challengerUser.duels.push(duelId);
      let newChallengerUserDuels = challengerUser.duels;
      let challengerUserResult = await db
        .collection("users")
        .updateOne(
          { id: challengerId },
          { $set: { duels: newChallengerUserDuels } }
        );
      let challengeTakerUser = await db
        .collection("users")
        .findOne({ id: challengeTakerId });
      let newChallengeTakerUser = challengeTakerUser.duels.push(duelId);
      let newChallengeTakerUserDuels = challengeTakerUser.duels;
      let challengeTakerUserResult = await db
        .collection("users")
        .updateOne(
          { id: challengeTakerId },
          { $set: { duels: newChallengeTakerUserDuels } }
        );

      res.status(200);
      res.send({ requestCompleted: true });
    }
  }
);

// odgovoranje na izazov kojeg je drugi player zapoceo i zavrsetak dvoboja
router.put("/end", async (req, res) => {
  const { duelId, chalengeeScore } = req.body;
  let db = await connect();
  let duel = await db.collection("duels").findOne({ id: duelId });
  duel.challengeTakerScore = Number(chalengeeScore);
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

  if (winnerId || winnerId === 0) {
    const loserId = winnerId == challengerId ? challengeTakerId : challengerId;
    let winnerUser = await db.collection("users").findOne({ id: winnerId });
    let loserUser = await db.collection("users").findOne({ id: loserId });

    let winnerUserResult1 = await db
      .collection("users")
      .updateOne({ id: winnerId }, { $inc: { "games played": 1 } });
    let winnerUserResult2 = await db
      .collection("users")
      .updateOne({ id: winnerId }, { $inc: { "games won": 1 } });
    let winnerUserResult3 = await db
      .collection("users")
      .updateOne({ id: winnerId }, { $inc: { coins: 3 } });

    let loserUserResult1 = await db
      .collection("users")
      .updateOne({ id: loserId }, { $inc: { "games played": 1 } });
    let loserUserResult2 = await db
      .collection("users")
      .updateOne({ id: loserId }, { $inc: { "games lost": 1 } });
    let loserUserResult3 = await db
      .collection("users")
      .updateOne({ id: loserId }, { $inc: { coins: 1 } });

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
      .collection("users")
      .updateOne(
        { id: challengerId },
        { $inc: { "games played": 1, "games tied": 1, coins: 2 } }
      );
    let challengeTakerResult = await db
      .collection("users")
      .updateOne(
        { id: challengeTakerId },
        { $inc: { "games played": 1, "games tied": 1, coins: 2 } }
      );

    db.collection("rivalries").updateOne(
      { playerOneId: smallerId, playerTwoId: biggerId },
      { $inc: { playerOneScore: 1, playerTwoScore: 1 } }
    );
  }

  let duelToRemove = await db
    .collection("duels")
    .findOneAndDelete({ id: duelId });

  let erase1 = await db
    .collection("users")
    .updateOne({ id: challengerId }, { $pull: { duels: duelId } });
  let erase2 = await db
    .collection("users")
    .updateOne({ id: challengeTakerId }, { $pull: { duels: duelId } });

  res.status(200);
  res.send({ winner: winnerId });
});

// odbijanje izazova drugog playera ili odbacivanje izazova koji smo sami postavili
router.delete("/quit", async (req, res) => {
  const { duelId } = req.body;
  let db = await connect();
  let duelToremove = await db
    .collection("duels")
    .findOneAndDelete({ id: duelId });

  res.status(200);
  res.send({ requestCompleted: true });
});
