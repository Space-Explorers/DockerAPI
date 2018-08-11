'use strict';

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const exec = require('child_process').exec;
const fs = require('fs');
const Home = require('./home');

const PORT = process.env.PORT || 8080;

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

function runUserCode(testFile) {
  return new Promise((resolve, reject) => {
    exec(`mocha ${testFile}`, { timeout: 10000 }, (err, stdout, stderr) => {
      // delete new test file after running?
      // where do we add Docker build and run commands?
      if (err !== null && stdout === '') {
        const output = stderr !== '' ? stderr : 'Your code timed out.';
        reject(output);
      }
      resolve(stdout);
    });
  });
}

function buildTestFile(code, specs) {

  code = `${code}\n`;
  // console.log(specs)
  // remove try catch blocks?
  const fileName = 'testMe.js';
  fs.writeFileSync('testMe.js', code, 'utf8', err => {
    if (err) throw err;
    console.log('new file success!');
  });
  // eventually comment out below ?
  // specs = fs.readFileSync('askPolitely.spec.js', (err, data) => {
  //   if (err) throw err;
  //   console.log('read file success!');
  //   return data;
  // });
  // console.log(specs)
  fs.appendFileSync('testMe.js', specs, err => {
    if (err) throw err;
    console.log('append file success!');
  });
  return fileName;
}

app.get('/', (req, res) => {
  res.send(Home());
});

app.post('/', async (req, res, next) => {
  try {
    const testFile = await buildTestFile(req.body.code, req.body.specs);
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
