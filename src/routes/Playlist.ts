import express from "express";
import connect, { userDb } from "../db";
import { ObjectId } from "mongodb";

export const router = express.Router();

router.get("/", async (req, res) => {
  let db = await connect();
  let cursor = await db.collection("playlists").find();
  let results = await cursor.toArray();
  res.json(results);
});

router.get("/:id", async (req, res) => {
  const id = req.params.id;
  let db = await connect();
  const specificPlaylist = await db
    .collection("playlists")
    .findOne({ _id: new ObjectId(id) });
  res.status(200);
  res.send(specificPlaylist);
});

router.put("/buy", async (req, res) => {
  const { playerId, playlistTitle } = req.body;

  let db = await connect();
  let playerIndex = await db
    .collection(userDb)
    .findOne({ _id: new ObjectId(playerId) });
  const thePlaylist = await db
    .collection("playlists")
    .findOne({ title: playlistTitle });

  if (playerIndex === null) {
    throw new Error("playerIndex is null!");
  }

  if (thePlaylist === null) {
    throw new Error("thePlaylist is null!");
  }

  if (playerIndex.coins >= thePlaylist.price) {
    let playlistPrice = thePlaylist.price;
    let playlistTitle = thePlaylist.title;
    let buy1 = await db
      .collection(userDb)
      .updateOne(
        { _id: new ObjectId(playerId) },
        { $inc: { coins: -playlistPrice } }
      );
    let buy2 = await db
      .collection(userDb)
      .updateOne(
        { _id: new ObjectId(playerId) },
        { $push: { playlists: playlistTitle } }
      );
    res.status(200);
    res.send({ transactionCompleted: true });
  } else {
    res.status(200);
    res.send({ transactionCompleted: false, reason: "Not enough funds" });
  }
});

router.get("/:id/game", async (req, res) => {
  const playlistId = req.params.id;
  let db = await connect();
  let thePlaylist = await db
    .collection("playlists")
    .findOne({ title: playlistId });

  if (thePlaylist === null) {
    throw new Error("thePlaylist is null!");
  }

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
          let theSong = await db
            .collection("songs")
            .findOne({ _id: new ObjectId(songId) });

          if (theSong === null) {
            throw new Error("theSong is null!");
          }

          return theSong.title;
        } else {
          let theSong = await db
            .collection("songs")
            .findOne({ _id: new ObjectId(songId) });

          if (theSong === null) {
            throw new Error("theSong is null!");
          }

          return theSong.artist;
        }
      })
    );

    _secondRoundSongsString = await Promise.all(
      _secondRoundSongs.map(async (songId) => {
        if (secondRoundType === "title") {
          let theSong = await db
            .collection("songs")
            .findOne({ _id: new ObjectId(songId) });

          if (theSong === null) {
            throw new Error("theSong is null!");
          }

          return theSong.title;
        } else {
          let theSong = await db
            .collection("songs")
            .findOne({ _id: new ObjectId(songId) });

          if (theSong === null) {
            throw new Error("theSong is null!");
          }

          return theSong.artist;
        }
      })
    );

    _thirdRoundSongsString = await Promise.all(
      _thirdRoundSongs.map(async (songId) => {
        if (thirdRoundType === "title") {
          let theSong = await db
            .collection("songs")
            .findOne({ _id: new ObjectId(songId) });

          if (theSong === null) {
            throw new Error("theSong is null!");
          }

          return theSong.title;
        } else {
          let theSong = await db
            .collection("songs")
            .findOne({ _id: new ObjectId(songId) });

          if (theSong === null) {
            throw new Error("theSong is null!");
          }

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
    .findOne({ _id: new ObjectId(firstRoundCorrectAnswer) });
  const secondRoundCorrectAnswerObject = await db
    .collection("songs")
    .findOne({ _id: new ObjectId(secondRoundCorrectAnswer) });
  const thirdRoundCorrectAnswerObject = await db
    .collection("songs")
    .findOne({ _id: new ObjectId(thirdRoundCorrectAnswer) });

  if (firstRoundCorrectAnswerObject === null) {
    throw new Error("firstRoundCorrectAnswerObject is null!");
  }
  if (secondRoundCorrectAnswerObject === null) {
    throw new Error("secondRoundCorrectAnswerObject is null!");
  }
  if (thirdRoundCorrectAnswerObject === null) {
    throw new Error("thirdRoundCorrectAnswerObject is null!");
  }

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
  res.send({ roundsData, playlistId });
});

// zamjena bazičnih id-eva u listi pjesama playliste sa
// njihovom mongodb inačicom
router.put("/", async (req, res) => {
  let db = await connect();
  let cursor = await db.collection("playlists").find();
  let results = await cursor.toArray();
  for (const playlist of results) {
    for (const song of playlist.songs) {
      const songDetails = await db.collection("songs").findOne({ id: song });
      if (songDetails !== null) {
        const songId = songDetails._id;
        const changedSong = await db
          .collection("playlists")
          .updateOne(
            { title: playlist.title },
            { $addToSet: { songs: songId } }
          );
      }
    }
  }
  res.send("good");
});
