const express = require("express");
const path = require("path");
const sqlite = require("better-sqlite3");
const db = new sqlite(path.resolve("music.db"), { fileMustExist: true });
const app = express();
const PORT = 8080;
const util = require("util");
const exec = util.promisify(require("child_process").exec);

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");
app.use(express.static(path.join(__dirname, "public")));

app.get("/create-melody", async (req, res) => {
  const note = req.query.note;
  const key = req.query.key;
  const genre = req.query.genre;
  const timestamp = new Date().getTime();
  const url = `/${note}_${key}_${genre}_${timestamp}.mp3`;
  try {
    const { stdout, stderr } = await exec(
      `python __init__.py ${note} ${key} ${genre} ${timestamp}`
    );
    console.log("stdout:", stdout);
    console.log("stderr:", stderr);
    try {
      const sql = `INSERT INTO music (url) values (?)`;
      const insert = db.prepare(sql);
      const addMusic = db.transaction(() => {
        insert.run(url);
      });
      addMusic();
    } catch {
      if (!db.inTransaction) throw err;
    }
    res.redirect("/?url=" + url);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Something went wrong!" });
  }
});

function formatDate(date) {
  const day = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();
  const hour = date.getHours();
  const minute = date.getMinutes();
  return `${hour}:${minute} ${day}.${month}.${year}`;
}

app.get("/", (req, res) => {
  let audios = [];
  try {
    const sql = `SELECT url FROM music limit 5`;
    const insert = db.prepare(sql).all();
    for (let i = 0; i < insert.length; i++) {
      const name = insert[i].url.split("_");
      insert[i].name = `${name[0].replace("/", "")}${name[1]}`;
      insert[i].genre = name[2];
      const bad_date = name[3].replace(".mp3", "");
      const date = new Date(parseInt(bad_date));
      insert[i].date = formatDate(date);
      audios = insert;
    }
  } catch (e) {
    console.log(e);
  }

  if (req.query.url) {
    const name = req.query.url.split("_");
    const bad_date = name[3].replace(".mp3", "");
    res.render("index.hbs", {
      audio_url: req.query.url,
      name: `${name[0].replace("/", "")}${name[1]}`,
      genre: name[2],
      date: formatDate(new Date(parseInt(bad_date))),
      audios: audios,
    });
  } else
    res.render("index.hbs", {
      audios: audios,
    });
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на порте ${PORT}: http://localhost:${PORT}/`);
});
