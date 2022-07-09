import express from "express";
import connect from "../db.js";
import fs from "fs";
import assert from "assert";
// import { songs } from "../songs.js";
import { GridFSBucket } from "mongodb";
import { resolve } from "path";

export const router = express.Router();

// upload pjesama sa lokalnog storage-a na mongo
// router.post("/", async (req, res) => {
//   let db = await connect();
//   songs.forEach((song) => {
//     let songUploadResult = db.collection("songs").insertOne({
//       id: song.id,
//       title: song.title,
//       artist: song.artist,
//       playlist: song.playlist,
//       file: song.file.slice(73),
//     });
//   });
//   res.status(200);
//   res.send("Songs uploaded successfully!");
// });

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
  let cursor = await db.collection("songs").findOne({ id: id });
  let results = await cursor.toArray();
  res.json(results);
});

router.get("/:id/audio", async (req, res) => {
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
