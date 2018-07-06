# testcafe-reporter-time
[![Build Status](https://travis-ci.org/llistorti/testcafe-reporter-time.svg)](https://travis-ci.org/llistorti/testcafe-reporter-time)

This is the **time** reporter plugin for [TestCafe](http://devexpress.github.io/testcafe).

<p align="center">
    <img src="https://raw.github.com/llistorti/testcafe-reporter-time/master/media/preview.png" alt="preview" />
</p>

## Install

```
npm install testcafe-reporter-time
```

## Usage

When you run tests from the command line, specify the reporter name by using the `--reporter` option:

```
testcafe chrome 'path/to/test/file.js' --reporter time
```


When you use API, pass the reporter name to the `reporter()` method:

```js
testCafe
    .createRunner()
    .src('path/to/test/file.js')
    .browsers('chrome')
    .reporter('time') // <-
    .run();
```

## Author
Luciano Listorti 
# testcafe-reporter-time
