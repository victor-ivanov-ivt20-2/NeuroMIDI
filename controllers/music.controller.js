const express = require("express");
const router = express.Router();
const MusicModel = require("../model/music.model");

router.get("/create-melody", async (req, res) => {
  const note = req.query.note;
  const key = req.query.key;
  const genre = req.query.genre;
  const timestamp = new Date().getTime();
  const url = `/${note}_${key}_${genre}_${timestamp}.mp3`;
  await MusicModel.createMelody({ note, key, genre, timestamp, url })
    .then((response) => {
      res.redirect(response.redirect);
    })
    .catch((err) => {
      res.status(err.status).json(err.json);
    });
});

module.exports = router;
