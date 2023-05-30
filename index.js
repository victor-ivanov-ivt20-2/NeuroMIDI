const express = require("express");
const path = require("path");

const app = express();
const PORT = 8080;
const { exec } = require("child_process");

app.set("views", path.join(__dirname, "views"));
// app.set("view engine", "pug");
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname + "/views/index.html"));
});

// app.get('/', (req, res) => {
//     exec('python __init__.py')
//     res.status(200).json({path: "http://localhost:5000/new_mp3.mp3"})
// })

app.listen(PORT, () => {
  console.log(`Сервер запущен на порте ${PORT}: http://localhost:${PORT}/`);
});
