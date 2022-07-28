import express from "express";
import connect from "../db";
import fs from "fs";
import assert from "assert";
// import { songs } from "../songs.js";
import { GridFSBucket } from "mongodb";
import { resolve } from "path";
import mongo, { ObjectId } from "mongodb";

export const router = express.Router();

// upload pjesama sa lokalnog storage-a na mongo
router.post("/", async (req, res) => {
  let db = await connect();
  const filesLocation = "C:/Users/ekoko/Documents/Audacity/";
  const filenames = fs.readdirSync(filesLocation);
  const songs = filenames.map((filename) => {
    const splitFilename = filename
      .replaceAll("_", " ")
      .split("-")
      .map((part) => part.trim());
    const title = splitFilename[1];
    const artist = splitFilename[0];
    const playlist = "rock";
    const file = filename;
    return {
      title,
      artist,
      playlist,
      file,
    };
  });
  for (const song of songs) {
    const songFound = await db.collection("songs").findOne({ file: song.file });
    if (!songFound) {
      const result = await db.collection("songs").insertOne({
        title: song.title,
        artist: song.artist,
        playlist: song.playlist,
        file: song.file,
      });
      const currentFileLocation = filesLocation + song.file;
      let bucket = new GridFSBucket(db);
      fs.createReadStream(currentFileLocation)
        .pipe(bucket.openUploadStream(song.file))
        .on("error", function (error) {
          assert.ifError(error);
        })
        .on("finish", function () {
          console.log("File uploaded:", currentFileLocation);
          db.collection("playlists").findOneAndUpdate({ title: "Rock" }, {
            $push: { songs: result.insertedId },
          } as unknown as mongo.PushOperator<Document>);
        });
    }
  }
  res.status(200);
  res.send("Songs uploaded successfully!");
});

router.get("/", async (req, res) => {
  let db = await connect();
  let cursor = await db.collection("songs").find();
  let results = await cursor.toArray();
  res.json(results);
});

// upload specifične pjesme sa lokalnog storage-a na mongo
// router.post("/:id", async (req, res) => {
//   const id = Number(req.params.id);
//   let db = await connect();
//   const songToBeUploaded = songs.find((song) => song.id === id);
//   let songUploadResult = await db.collection("songs").insertOne({
//     id: songToBeUploaded.id,
//     title: songToBeUploaded.title,
//     artist: songToBeUploaded.artist,
//     playlist: songToBeUploaded.playlist,
//     file: songToBeUploaded.file.slice(73),
//   });
//   res.status(200);
//   res.send("Songs uploaded successfully!");
// });

router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  let db = await connect();
  let cursor = await db.collection("songs").findOne({ _id: new ObjectId(id) });

  if (cursor === null) {
    throw new Error("cursor is null!");
  }

  let results = await cursor.toArray();
  res.json(results);
});

router.get("/:id/audio", async (req, res) => {
  const id = req.params.id;
  let db = await connect();
  let bucket = new GridFSBucket(db);
  let specificSong = await db
    .collection("songs")
    .findOne({ _id: new ObjectId(id) });

  if (specificSong === null) {
    throw new Error("specificSong is null!");
  }

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
    setTimeout(() => res.download(resolve("./output.mp3")), 2000);
  } else {
    res.status(200);
    res.send("Song audio missing");
  }
});

// upload audio file-a sa lokalne mašine na mongo
// router.post("/:id/audio", async (req, res) => {
//   const id = Number(req.params.id);
//   if (songs.find((song) => song.id === id)) {
//     const song = songs.find((song) => song.id === id);
//     const songAudioLocation = song.file;
//     const songAudioName = songAudioLocation.slice(73);
//     let db = await connect();
//     let bucket = new GridFSBucket(db);
//     fs.createReadStream(songAudioLocation)
//       .pipe(bucket.openUploadStream(songAudioName))
//       .on("error", function (error) {
//         assert.ifError(error);
//       })
//       .on("finish", function () {
//         console.log("File uploaded!");
//       });
//     res.status(200);
//     res.send(songAudioName);
//   } else {
//     res.status(200);
//     res.send("No song with that id");
//   }
// });

// brisanje zastarjelih id-eva
router.put("/", async (req, res) => {
  let db = await connect();
  let cursor = await db
    .collection("songs")
    .updateMany({ id: { $exists: true } }, { $unset: { id: "" } });
  res.status(200).send({ operationCompleted: "true" });
});
