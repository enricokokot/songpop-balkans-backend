import express from "express";
import cors from "cors";
import fs from "fs";
import assert from "assert";
import connect from "./db.js";
import { songs } from "./songs.js";
import { GridFSBucket } from "mongodb";
import { resolve } from "path";

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200);
  res.send("Home");
});

app.get("/user", async (req, res) => {
  let db = await connect();
  let cursor = await db.collection("users").find();
  let results = await cursor.toArray();
  res.json(results);
});

app.get("/user/:id", async (req, res) => {
  const id = Number(req.params.id);
  let db = await connect();
  let specificUser = await db.collection("users").findOne({ id: id });
  res.json(specificUser);
});

app.get("/user/:id/coin", async (req, res) => {
  const id = Number(req.params.id);
  let db = await connect();
  let specificUser = await db.collection("users").findOne({ id: id });
  const specificUserCoin = specificUser.coins;
  res.status(200);
  res.send({ availableCoins: specificUserCoin });
});

app.get("/user/:id/playlist", async (req, res) => {
  const id = Number(req.params.id);
  let db = await connect();
  let specificUser = await db.collection("users").findOne({ id: id });
  const specificUserPlaylists = specificUser.playlists;
  res.status(200);
  res.send(specificUserPlaylists);
});

app.get("/user/:id/achievement", async (req, res) => {
  const id = Number(req.params.id);
  let db = await connect();
  let specificUser = await db.collection("users").findOne({ id: id });
  const specificUserAchievements = specificUser.achievements;
  res.status(200);
  res.send(specificUserAchievements);
});

app.patch("/user/:userId/achievement/:achievementId", async (req, res) => {
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

// upload pjesama sa lokalnog storage-a na mongo
app.post("/song", async (req, res) => {
  let db = await connect();
  songs.forEach((song) => {
    let songUploadResult = db.collection("songs").insertOne({
      id: song.id,
      title: song.title,
      artist: song.artist,
      playlist: song.playlist,
      file: song.file.slice(73),
    });
  });
  res.status(200);
  res.send("Songs uploaded successfully!");
});

app.get("/song", async (req, res) => {
  let db = await connect();
  let cursor = await db.collection("songs").find();
  let results = await cursor.toArray();
  res.json(results);
});

// upload specifične pjesme sa lokalnog storage-a na mongo
app.post("/song/:id", async (req, res) => {
  const id = Number(req.params.id);
  let db = await connect();
  const songToBeUploaded = songs.find((song) => song.id === id);
  let songUploadResult = await db.collection("songs").insertOne({
    id: songToBeUploaded.id,
    title: songToBeUploaded.title,
    artist: songToBeUploaded.artist,
    playlist: songToBeUploaded.playlist,
    file: songToBeUploaded.file.slice(73),
  });
  res.status(200);
  res.send("Songs uploaded successfully!");
});

app.get("/song/:id", async (req, res) => {
  const id = Number(req.params.id);
  let db = await connect();
  let cursor = await db.collection("songs").findOne({ id: id });
  let results = await cursor.toArray();
  res.json(results);
});

app.get("/song/:id/audio", async (req, res) => {
  const id = Number(req.params.id);
  let db = await connect();
  let bucket = new GridFSBucket(db);
  let specificSong = await db.collection("songs").findOne({ id: id });
  if (specificSong.file) {
    const songAudioName = specificSong.file;
    bucket
      .openDownloadStreamByName(songAudioName)
      .pipe(fs.createWriteStream("./output.mp3"))
      .on("error", function (error) {
        assert.ifError(error);
      })
      .on("finish", function () {
        console.log("File downloaded!");
      });
    res.status(200);
    setTimeout(() => res.download(resolve("./output.mp3")), 1000);
  } else {
    res.status(200);
    res.send("Song audio missing");
  }
});

// upload audio file-a sa lokalne mašine na mongo
app.post("/song/:id/audio", async (req, res) => {
  const id = Number(req.params.id);
  if (songs.find((song) => song.id === id)) {
    const song = songs.find((song) => song.id === id);
    const songAudioLocation = song.file;
    const songAudioName = songAudioLocation.slice(73);
    let db = await connect();
    let bucket = new GridFSBucket(db);
    fs.createReadStream(songAudioLocation)
      .pipe(bucket.openUploadStream(songAudioName))
      .on("error", function (error) {
        assert.ifError(error);
      })
      .on("finish", function () {
        console.log("File uploaded!");
      });
    res.status(200);
    res.send(songAudioName);
  } else {
    res.status(200);
    res.send("No song with that id");
  }
});

app.get("/playlist", async (req, res) => {
  let db = await connect();
  let cursor = await db.collection("playlists").find();
  let results = await cursor.toArray();
  res.json(results);
});

app.get("/playlist/:id", async (req, res) => {
  const id = Number(req.params.id);
  let db = await connect();
  const specificPlaylist = await db.collection("playlists").findOne({ id: id });
  res.status(200);
  res.send(specificPlaylist);
});

app.get("/duel", async (req, res) => {
  let db = await connect();
  let cursor = await db.collection("duels").find();
  let results = await cursor.toArray();
  res.json(results);
});

app.get("/duel/:id", async (req, res) => {
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
app.post(
  // app.put(
  "/duel/start",
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
app.put("/duel/end", async (req, res) => {
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
app.delete("/duel/quit", async (req, res) => {
  const { duelId } = req.body;
  let db = await connect();
  let duelToremove = await db
    .collection("duels")
    .findOneAndDelete({ id: duelId });

  res.status(200);
  res.send({ requestCompleted: true });
});

app.get("/game/:id", async (req, res) => {
  const playlistId = req.params.id;
  let db = await connect();
  let thePlaylist = await db
    .collection("playlists")
    .findOne({ title: playlistId });
  const playlistSongsMixed = thePlaylist.songs;

  const roundTypes = ["artist", "title"];
  const firstRoundType =
    roundTypes[Math.floor(Math.random() * roundTypes.length)];
  const secondRoundType =
    roundTypes[Math.floor(Math.random() * roundTypes.length)];
  const thirdRoundType =
    roundTypes[Math.floor(Math.random() * roundTypes.length)];

  /***********************DANGER ZONE BELOW, NEED HELP***********************/
  let shuffled;
  let shuffledFiltered;

  let _firstRoundSongs;
  let _secondRoundSongs;
  let _thirdRoundSongs;

  let _firstRoundSongsString;
  let _secondRoundSongsString;
  let _thirdRoundSongsString;

  do {
    shuffled = [...playlistSongsMixed].sort(() => 0.5 - Math.random());
    shuffledFiltered = shuffled.slice(0, 12);
    _firstRoundSongs = shuffledFiltered.slice(0, 4);
    _secondRoundSongs = shuffledFiltered.slice(4, 8);
    _thirdRoundSongs = shuffledFiltered.slice(8, 12);

    _firstRoundSongsString = await Promise.all(
      _firstRoundSongs.map(async (songId) => {
        if (firstRoundType === "title") {
          let theSong = await db.collection("songs").findOne({ id: songId });
          return theSong.title;
        } else {
          let theSong = await db.collection("songs").findOne({ id: songId });
          return theSong.artist;
        }
      })
    );

    _secondRoundSongsString = await Promise.all(
      _secondRoundSongs.map(async (songId) => {
        if (secondRoundType === "title") {
          let theSong = await db.collection("songs").findOne({ id: songId });
          return theSong.title;
        } else {
          let theSong = await db.collection("songs").findOne({ id: songId });
          return theSong.artist;
        }
      })
    );

    _thirdRoundSongsString = await Promise.all(
      _thirdRoundSongs.map(async (songId) => {
        if (thirdRoundType === "title") {
          let theSong = await db.collection("songs").findOne({ id: songId });
          return theSong.title;
        } else {
          let theSong = await db.collection("songs").findOne({ id: songId });
          return theSong.artist;
        }
      })
    );
  } while (
    new Set(_firstRoundSongsString).size !== _firstRoundSongsString.length ||
    new Set(_secondRoundSongsString).size !== _secondRoundSongsString.length ||
    new Set(_thirdRoundSongsString).size !== _thirdRoundSongsString.length
  );

  const firstRoundSongs = _firstRoundSongs;
  const secondRoundSongs = _secondRoundSongs;
  const thirdRoundSongs = _thirdRoundSongs;

  const firstRoundSongsString = _firstRoundSongsString;
  const secondRoundSongsString = _secondRoundSongsString;
  const thirdRoundSongsString = _thirdRoundSongsString;

  /**************************DANGER ZONE ABOVE, NEED HELP**************************/

  const firstRoundCorrectAnswer =
    firstRoundSongs[Math.floor(Math.random() * firstRoundSongs.length)];
  const secondRoundCorrectAnswer =
    secondRoundSongs[Math.floor(Math.random() * secondRoundSongs.length)];
  const thirdRoundCorrectAnswer =
    thirdRoundSongs[Math.floor(Math.random() * thirdRoundSongs.length)];

  const firstRoundCorrectAnswerObject = await db
    .collection("songs")
    .findOne({ id: firstRoundCorrectAnswer });
  const secondRoundCorrectAnswerObject = await db
    .collection("songs")
    .findOne({ id: secondRoundCorrectAnswer });
  const thirdRoundCorrectAnswerObject = await db
    .collection("songs")
    .findOne({ id: thirdRoundCorrectAnswer });

  const firstRoundCorrectAnswerString = await firstRoundCorrectAnswerObject[
    firstRoundType
  ];
  const secondRoundCorrectAnswerString = await secondRoundCorrectAnswerObject[
    secondRoundType
  ];
  const thirdRoundCorrectAnswerString = await thirdRoundCorrectAnswerObject[
    thirdRoundType
  ];

  const roundsData = {
    0: {
      songs: firstRoundSongsString,
      correctAnswer: firstRoundCorrectAnswerString,
      correctAnswerId: firstRoundCorrectAnswer,
      playerPointsEarned: 0,
    },
    1: {
      songs: secondRoundSongsString,
      correctAnswer: secondRoundCorrectAnswerString,
      correctAnswerId: secondRoundCorrectAnswer,
      playerPointsEarned: 0,
    },
    2: {
      songs: thirdRoundSongsString,
      correctAnswer: thirdRoundCorrectAnswerString,
      correctAnswerId: thirdRoundCorrectAnswer,
      playerPointsEarned: 0,
    },
  };

  res.status(200);
  res.send({ transactionCompleted: true, roundsData, playlistId });
});

app.put("/shop/playlist", async (req, res) => {
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

app.get("/rivalry", async (req, res) => {
  let db = await connect();
  let cursor = await db.collection("rivalries").find();
  let results = await cursor.toArray();
  res.json(results);
});

app.get("/user/:id/rivalry", async (req, res) => {
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

app.listen(port, () => console.log(`Listening on port ${port}!`));
