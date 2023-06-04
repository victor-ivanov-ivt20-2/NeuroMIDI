const path = require("path");
const util = require("util");
const exec = util.promisify(require("child_process").exec);
const sqlite = require("better-sqlite3");
const db = new sqlite(path.resolve("neuromidi.db"), { fileMustExist: true });

function formatDate(date) {
  const day = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();
  const hour = date.getHours();
  const minute = date.getMinutes();
  return `${hour}:${minute} ${day}.${month}.${year}`;
}

module.exports = {
  createMelody: (props) => {
    return new Promise(async (resolve, reject) => {
      try {
        const { stdout, stderr } = await exec(
          `python3 __init__.py ${props.note} ${props.key} ${props.genre} ${props.timestamp}`
        );
        console.log("stdout:", stdout);
        console.log("stderr:", stderr);
        try {
          const sql = `INSERT INTO music (url, genre, key, created_at) values (?, ?, ?, ?)`;
          const insert = db.prepare(sql);
          const addMusic = db.transaction(() => {
            insert.run(
              props.url,
              props.genre,
              props.note + props.key,
              props.timestamp
            );
          });
          addMusic();
          resolve({
            redirect: "/?url=" + props.url,
          });
        } catch (e) {
          console.log(e);
          if (!db.inTransaction)
            reject({
              status: 500,
              json: {
                message: "Что-то пошло не так",
              },
            });
        }
      } catch (e) {
        console.error(e);
        reject({
          status: 500,
          json: {
            message: "Что-то пошло не так",
          },
        });
      }
    });
  },
  getMelodies: (props) => {
    return new Promise((resolve, reject) => {
      try {
        const arr = [];
        const sql = `SELECT url FROM music limit ? offset ?`;
        const insert = db.prepare(sql).all(props.limit, props.offset);
        for (let i = 0; i < insert.length; i++) {
          const name = insert[i].url.split("_");
          insert[i].name = `${name[0].replace("/", "")}${name[1]}`;
          insert[i].genre = name[2];
          const bad_date = name[3].replace(".mp3", "");
          const date = new Date(parseInt(bad_date));
          insert[i].date = formatDate(date);
          arr.push(insert[i]);
        }
        resolve(arr);
      } catch (e) {
        console.log(e);
        reject({
          status: 500,
          json: {
            message: "Что-то пошло не так",
          },
        });
      }
    });
  },
  getMelody: (props) => {
    return new Promise((resolve, reject) => {
      if (!props.url) reject({});
      const name = props.url.split("_");
      const bad_date = name[3].replace(".mp3", "");
      resolve({
        audio_url: props.url,
        name: `${name[0].replace("/", "")}${name[1]}`,
        genre: name[2],
        date: formatDate(new Date(parseInt(bad_date))),
      });
    });
  },
};
