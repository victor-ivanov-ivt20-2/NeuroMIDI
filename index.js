const express = require("express");
const path = require("path");
const app = express();
const PORT = 8080;

const MusicRouter = require("./controllers/music.controller");
const MusicModel = require("./model/music.model");

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");
app.use(express.static(path.join(__dirname, "public")));

app.use("/music", MusicRouter);

app.get("/", async (req, res) => {
  const audios = await MusicModel.getMelodies({ limit: 5, offset: 0 })
    .then((response) => {
      return response;
    })
    .catch((err) => {
      res.status(err.status).json(err.json);
      return [];
    });
  const property = await MusicModel.getMelody({ url: req.query.url })
    .then((response) => {
      return response;
    })
    .catch((err) => {
      return err;
    });
  property.audios = audios;

  res.render("index.hbs", property);
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на порте ${PORT}: http://localhost:${PORT}/`);
});
