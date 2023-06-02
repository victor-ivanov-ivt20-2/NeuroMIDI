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
  const { stdout, stderr } = await exec(
    `python __init__.py ${note} ${key} ${genre} ${timestamp}`
  )
    .then(() => {
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
    })
    .catch(() => {
      res.status(500).json({ message: "Something went wrong!" });
    });
  console.log(stdout, stderr);
});
app.get("/", (req, res) => {
  if (req.query.url)
    res.render("index.hbs", {
      audio_url: req.query.url,
    });
  else res.sendFile(path.join(__dirname + "/views/index.html"));
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на порте ${PORT}: http://localhost:${PORT}/`);
});
