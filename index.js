const express = require('express');
require('dotenv').config()
global.__basedir = __dirname;

const createSheet = require('./src/controllers/createSheet')
const publishWork = require('./src/controllers/publishWork');
const validators = require('./src/validator/validators');
const validate = require('./src/validator/validate')

const app = express();
const port = 3000;

app.use(express.json())

app.get('/', (req, res) => {
  res.send('Welcome to Excel AI')
});

app.post('/createSheet', validate(validators.createValidator) ,createSheet);

app.post('/publishWork', publishWork);

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`)
});
