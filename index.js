const express = require('express');
require('dotenv').config()
global.__basedir = __dirname;

const createSheet = require('./src/controllers/createSheet')
const publishWork = require('./src/controllers/publishWork')

const app = express();
const port = 3000;

app.use(express.json())

app.get('/', (req, res) => {
  res.send('Welcome to Excel AI')
});

app.post('/createSheet', createSheet);

app.post('/publishWork', publishWork);

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`)
});
