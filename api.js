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

function runUserCode(testFile) {
  return new Promise((resolve, reject) => {
    exec(`mocha ${testFile}`, { timeout: 10000 }, (err, stdout, stderr) => {
      if (err !== null && stdout === '') {
        const output = stderr !== '' ? stderr : 'Your code timed out.';
        reject(output);
      }
      resolve(stdout);
    });
  });
}

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

app.get('/', (req, res) => {
  res.send(Home());
});

app.post('/', async (req, res, next) => {
  try {
    const testFile = await buildTestFile(req.body.code, req.body.specs.data);
    const result = await runUserCode(testFile);
    res.send(result);
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
