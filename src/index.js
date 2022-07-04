import express from "express";
import cors from "cors";
import { users } from "./users";
import { songs } from "./songs";
import { playlists } from "./playlists";
import { duels } from "./duels";
import { rivalries } from "./rivalries";

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
  res.send(users);
});

app.get("/user/:id", (req, res) => {
  const id = Number(req.params.id);
  const specificUser = users.find((user) => user.id === id);
  res.status(200);
  res.send(specificUser);
});

app.get("/user/:id/coin", (req, res) => {
  const id = Number(req.params.id);
  const specificUser = users.find((user) => user.id === id);
  const specificUserCoin = specificUser.coins;
  res.status(200);
  res.send({ availableCoins: specificUserCoin });
});

app.get("/user/:id/playlist", (req, res) => {
  const id = Number(req.params.id);
  const specificUser = users.find((user) => user.id === id);
  const specificUserPlaylists = specificUser.playlists;
  res.status(200);
  res.send(specificUserPlaylists);
});

app.get("/user/:id/achievement", (req, res) => {
  const id = Number(req.params.id);
  const specificUser = users.find((user) => user.id === id);
  const specificUserAchievements = specificUser.achievements;
  res.status(200);
  res.send(specificUserAchievements);
});

app.patch("/user/:userId/achievement/:achievementId", (req, res) => {
  const userId = Number(req.params.userId);
  const achievementId = Number(req.params.achievementId);
  const specificUser = users.find((user) => user.id === userId);
  const specificUserAchievements = specificUser.achievements;
  const specificUserAchievement = specificUserAchievements.find(
    (achievement) => achievement.id === achievementId
  );
  if (specificUserAchievement.progress < specificUserAchievement.total) {
    specificUserAchievement.progress = specificUserAchievement.progress + 1;
    if (specificUserAchievement.progress === specificUserAchievement.total) {
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

app.get("/song", (req, res) => {
  res.status(200);
  res.send(songs);
});

app.get("/song/:id", (req, res) => {
  const id = Number(req.params.id);
  const specificSong = songs.find((song) => song.id === id);
  res.status(200);
  res.send(specificSong);
});

app.get("/song/:id/audio", (req, res) => {
  const id = Number(req.params.id);
  const specificSongAudio = songs.find((song) => song.id === id).file;
  res.status(200);
  res.sendFile(specificSongAudio);
});

app.get("/playlist", (req, res) => {
  res.status(200);
  res.send(playlists);
});

app.get("/playlist/:id", (req, res) => {
  const id = Number(req.params.id);
  const specificPlaylist = playlists.find((playlist) => playlist.id === id);
  res.status(200);
  res.send(specificPlaylist);
});

app.get("/duel", (req, res) => {
  res.status(200);
  res.send(duels);
});

app.get("/duel/:id", (req, res) => {
  const id = Number(req.params.id);
  const specificPlayerDuelIds = users.find((user) => user.id === id).duels;
  const specificPlayerDuels = duels.filter((duel) =>
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
  (req, res) => {
    // const { body } = req;
    const {
      challengerId,
      challengeTakerId,
      playlist,
      challengerScore,
      roundsData,
    } = req.body;
    // if (
    //   !duels.find(
    //     (duel) =>
    //       duel.id == String(challengerId) + String(challengeTakerId) ||
    //       duel.id == String(challengeTakerId) + String(challengerId)
    //   ) &&
    //   challengerId != challengeTakerId &&
    //   users.find((user) => user.id == challengerId) &&
    //   users.find((user) => user.id == challengeTakerId)
    // ) {
    if (
      duels.find(
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

      duels.push({
        id: duelId,
        playerOneId: challengerId,
        playerTwoId: challengeTakerId,
        challengerId,
        challengeTakerId,
        playlist: playlists.find(
          (givenPlaylist) => givenPlaylist.title == playlist
        ).id,
        challengerScore: Number(challengerScore),
        challengeTakerScore: 0,
        playerOneTotalScore: 0,
        playerTwoTotalScore: 0,
        rounds: roundsData,
      });

      users.find((user) => user.id === challengerId).duels.push(duelId);
      users.find((user) => user.id === challengeTakerId).duels.push(duelId);

      res.status(200);
      res.send({ requestCompleted: true });
    }
  }
);

// odgovoranje na izazov kojeg je drugi player zapoceo i zavrsetak dvoboja
app.put("/duel/end", (req, res) => {
  const { duelId, chalengeeScore } = req.body;
  const duel = duels.find((duel) => duel.id == duelId);
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

  console.log("winnerId");
  console.log(winnerId);

  const idsSortedByOrder =
    challengerId < challengeTakerId
      ? [challengerId, challengeTakerId]
      : [challengeTakerId, challengerId];

  const smallerId = idsSortedByOrder[0];
  const biggerId = idsSortedByOrder[1];

  if (
    !rivalries.find(
      (rivalry) =>
        rivalry.playerOneId === smallerId && rivalry.playerTwoId === biggerId
    )
  ) {
    rivalries.push({
      id: rivalries.length,
      playerOneId: smallerId,
      playerTwoId: biggerId,
      playerOneScore: 0,
      playerTwoScore: 0,
    });
  }
  const particularRivalry = rivalries.find(
    (rivalry) =>
      rivalry.playerOneId === smallerId && rivalry.playerTwoId === biggerId
  );

  console.log("STAGE 1");
  console.log(particularRivalry);

  if (winnerId || winnerId === 0) {
    const loserId = winnerId == challengerId ? challengeTakerId : challengerId;
    const winnerUser = users.find((user) => user.id == winnerId);
    const loserUser = users.find((user) => user.id == loserId);

    winnerUser["games played"] += 1;
    winnerUser["games won"] += 1;
    winnerUser.coins += 3;

    loserUser["games played"] += 1;
    loserUser["games lost"] += 1;
    loserUser.coins += 1;

    winnerId > loserId
      ? (particularRivalry.playerTwoScore += 1)
      : (particularRivalry.playerOneScore += 1);

    console.log("STAGE 2");
    console.log(particularRivalry);
  } else {
    const user1 = users.find((user) => user.id == challengerId);
    const user2 = users.find((user) => user.id == challengeTakerId);

    user1["games played"] += 1;
    user1["games tied"] += 1;
    user1.coins += 2;

    user2["games played"] += 1;
    user2["games tied"] += 1;
    user2.coins += 2;

    particularRivalry.playerOneScore += 1;
    particularRivalry.playerTwoScore += 1;

    console.log("STAGE 3");
    console.log(particularRivalry);
  }

  const indexOfDuelToBeDeleted = duels.findIndex(
    (thisDuel) => thisDuel.id == duelId
  );
  duels.splice(indexOfDuelToBeDeleted, 1);

  const duelsOfChallenger = users.find((user) => user.id == challengerId).duels;
  const duelsOfChallengeTaker = users.find(
    (user) => user.id == challengeTakerId
  ).duels;

  const indexOfDuelToBeDeletedInChallenger = duelsOfChallenger.findIndex(
    (duel) => duel == duelId
  );
  const indexOfDuelToBeDeletedInChallengeTaker =
    duelsOfChallengeTaker.findIndex((duel) => duel == duelId);

  duelsOfChallenger.splice(indexOfDuelToBeDeletedInChallenger, 1);
  duelsOfChallengeTaker.splice(indexOfDuelToBeDeletedInChallengeTaker, 1);

  res.status(200);
  res.send({ winner: winnerId });
});

// odbijanje izazova drugog playera ili odbacivanje izazova koji smo sami postavili
app.delete("/duel/quit", (req, res) => {
  const { duelId } = req.body;
  const indexOfDuelToBeDeleted = duels.findIndex((duel) => duel.id == duelId);
  duels.splice(indexOfDuelToBeDeleted, 1);
  res.status(200);
  res.send({ requestCompleted: true });
});

app.get("/game/:id", (req, res) => {
  const playlistId = req.params.id;
  const playlistSongsMixed = playlists.find(
    (givenPlaylist) => givenPlaylist.title == playlistId
  ).songs;

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

    _firstRoundSongsString = _firstRoundSongs.map((songId) => {
      if (firstRoundType === "title")
        return songs.find((song) => song.id === songId).title;
      else return songs.find((song) => song.id === songId).artist;
    });
    _secondRoundSongsString = _secondRoundSongs.map((songId) => {
      if (secondRoundType === "title")
        return songs.find((song) => song.id === songId).title;
      else return songs.find((song) => song.id === songId).artist;
    });
    _thirdRoundSongsString = _thirdRoundSongs.map((songId) => {
      if (thirdRoundType === "title")
        return songs.find((song) => song.id === songId).title;
      else return songs.find((song) => song.id === songId).artist;
    });
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

  const firstRoundCorrectAnswerString =
    firstRoundType === "title"
      ? songs.find((song) => song.id === firstRoundCorrectAnswer).title
      : songs.find((song) => song.id === firstRoundCorrectAnswer).artist;
  const secondRoundCorrectAnswerString =
    secondRoundType === "title"
      ? songs.find((song) => song.id === secondRoundCorrectAnswer).title
      : songs.find((song) => song.id === secondRoundCorrectAnswer).artist;
  const thirdRoundCorrectAnswerString =
    thirdRoundType === "title"
      ? songs.find((song) => song.id === thirdRoundCorrectAnswer).title
      : songs.find((song) => song.id === thirdRoundCorrectAnswer).artist;

  // console.log(firstRoundSongs, secondRoundSongs, thirdRoundSongs);
  // console.log(firstRoundType, secondRoundType, thirdRoundType);
  // console.log(
  //   firstRoundCorrectAnswer,
  //   secondRoundCorrectAnswer,
  //   thirdRoundCorrectAnswer
  // );
  // console.log(
  //   firstRoundSongsString,
  //   secondRoundSongsString,
  //   thirdRoundSongsString
  // );
  // console.log(
  //   firstRoundCorrectAnswerString,
  //   secondRoundCorrectAnswerString,
  //   thirdRoundCorrectAnswerString
  // );

  const roundsData = {
    0: {
      songs: firstRoundSongsString,
      correctAnswer: firstRoundCorrectAnswerString,
      correctAnswerId: firstRoundCorrectAnswer,
      playerPointsEarned: 0,
      // audio: "",
    },
    1: {
      songs: secondRoundSongsString,
      correctAnswer: secondRoundCorrectAnswerString,
      correctAnswerId: secondRoundCorrectAnswer,
      playerPointsEarned: 0,
      // audio: "",
    },
    2: {
      songs: thirdRoundSongsString,
      correctAnswer: thirdRoundCorrectAnswerString,
      correctAnswerId: thirdRoundCorrectAnswer,
      playerPointsEarned: 0,
      // audio: "",
    },
  };

  res.status(200);
  res.send({ transactionCompleted: true, roundsData, playlistId });
});

app.put("/shop/playlist", (req, res) => {
  const { body } = req;
  const { playerId, playlistTitle } = body;

  const playerIndex = users.findIndex((user) => user.id == playerId);
  const playlistIndex = playlists.findIndex(
    (playlist) => playlist.title == playlistTitle
  );

  if (users[playerIndex].coins > playlists[playlistIndex].price) {
    users[playerIndex].coins -= playlists[playlistIndex].price;
    users[playerIndex].playlists.push(playlists[playlistIndex].title);
    res.status(200);
    res.send({ transactionCompleted: true });
  } else {
    res.status(200);
    res.send({ transactionCompleted: false, reason: "Not enough funds" });
  }
});

app.get("/rivalry", (req, res) => {
  res.status(200);
  res.send(rivalries);
});

app.get("/user/:id/rivalry", (req, res) => {
  const id = Number(req.params.id);
  const specificPlayereRivalries = rivalries.filter(
    (rivalry) => rivalry.playerOneId == id || rivalry.playerTwoId == id
  );
  if (specificPlayereRivalries) {
    res.status(200);
    res.send(specificPlayereRivalries);
  } else {
    res.status(200);
    res.send([]);
  }
});

app.listen(port, () => console.log(`Listening on port ${port}!`));
