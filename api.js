'use strict';

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const exec = require('child_process').exec;
const fs = require('fs');
const Home = require('./home');

const PORT = process.env.PORT || 8081;

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

function buildTestFile(code, specData) {
  const specs = Buffer.from(specData)
  code = `${code}\n`;
  const fileName = 'testMe.js';
  fs.writeFileSync('testMe.js', code, 'utf8', err => {
    if (err) throw err;
  });
  fs.appendFileSync('testMe.js', specs, err => {
    if (err) throw err;
  });
  return fileName;
}

function runUserCode(testFile) {
  return new Promise((resolve, reject) => {
    exec(`mocha ${testFile} --reporter mochawesome`, { timeout: 10000 }, (err, stdout, stderr) => {
      if (err !== null && stdout === '') {
        const output = stderr !== '' ? stderr : 'Your code timed out.';
        reject(output);
      }
      resolve(stdout);
    });
  });
}

function readResultsFile() {
  try {
    const resultJSON = fs.readFileSync('mochawesome-report/mochawesome.json', (err, data) => {
      if (err) throw err
      return data
    })
    return resultJSON;
  } catch (err) {
    console.error(err)
  }
}

app.get('/', (req, res) => {
  res.send(Home());
});

app.post('/', async (req, res, next) => {
  try {
    const testFile = await buildTestFile(req.body.code, req.body.specs.data);
    await runUserCode(testFile);
    const resultJSON = await readResultsFile();
    res.json(resultJSON);
  } catch (err) {
    res.json(err);
  }
});

app.listen(PORT, err => {
  if (err) {
    console.error('Server Error: ', err);
  }
  console.log(`DOCKing on PORT ${PORT}!`);
});
