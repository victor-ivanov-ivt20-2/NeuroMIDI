const express = require('express')
const app = express()
const PORT = 5000
const cors = require('cors')
const { exec } = require('child_process')
app.use(cors({
    origin: ["http://localhost:3000"]
}))
app.use(express.static('public'))

app.get('/', (req, res) => {
    exec('python __init__.py')
    res.status(200).json({path: "http://localhost:5000/new_mp3.mp3"})
})

app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}. . .`)
})