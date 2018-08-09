'use strict';

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const exec = require('child_process').exec;

const PORT = process.env.PORT || 8080;

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

function runUserCode() {
  return new Promise((resolve, reject) => {
    exec(
      `mocha askPolitely.spec.js`,
      { timeout: 10000 },
      (err, stdout, stderr) => {
        console.log('STDOUT', stdout);
        console.log('STDERR', stderr);
        if (err !== null && stdout === '') {
          const output = stderr !== '' ? stderr : 'Your code timed out.';
          reject(output);
        }
        resolve(stdout);
      }
    );
  });
}

app.get('/', (req, res) => {
  res.send('This is a placeholder for a really awesome GI-JIF');
});

app.post('/', async (req, res, next) => {
  try {
    // write a file with the user code??
    const result = await runUserCode();
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
