'use strict';

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const exec = require('child_process').exec;
const fs = require('fs');

const PORT = process.env.PORT || 8080;

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

function runUserCode(testFile) {
  return new Promise((resolve, reject) => {
    exec(`mocha ${testFile}`, { timeout: 10000 }, (err, stdout, stderr) => {
      // delete new test file?
      if (err !== null && stdout === '') {
        const output = stderr !== '' ? stderr : 'Your code timed out.';
        reject(output);
      }
      resolve(stdout);
    });
  });
}

function buildTestFile(code) {
  code = `${code}\n`;
  try {
    const fileName = 'testMe.js';
    fs.writeFileSync('testMe.js', code, 'utf8', err => {
      if (err) throw err;
      console.log('new file success!');
    });
    const specs = fs.readFileSync('askPolitely.spec.js', (err, data) => {
      if (err) throw err;
      console.log('read file success!');
      return data;
    });
    fs.appendFileSync('testMe.js', specs, err => {
      if (err) throw err;
      console.log('append file success!');
    });
    return fileName;
  } catch (err) {
    console.error(err);
  }
}

app.get('/', (req, res) => {
  res.send('This is a placeholder for a really awesome GI-JIF');
});

app.post('/', async (req, res, next) => {
  try {
    console.log('REQ.BODY.CODE----', req.body.code);
    // write a file with the user code??
    const testFile = await buildTestFile(req.body.code);
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
