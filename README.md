# testcafe-reporter-time-performance
[![Build Status](https://travis-ci.org/llistorti/testcafe-reporter-time-performance.svg)](https://travis-ci.org/llistorti/testcafe-reporter-time-performance)

This is the **time-performance** reporter plugin for [TestCafe](http://devexpress.github.io/testcafe).

<p align="center">
    <img src="https://raw.github.com/llistorti/testcafe-reporter-time-performance/master/media/preview.png" alt="preview" />
</p>

## Install

```
npm install testcafe-reporter-time-performance
```

## Usage

When you run tests from the command line, specify the reporter name by using the `--reporter` option:

```
testcafe chrome 'path/to/test/file.js' --reporter time-performance
```


When you use API, pass the reporter name to the `reporter()` method:

```js
testCafe
    .createRunner()
    .src('path/to/test/file.js')
    .browsers('chrome')
    .reporter('time-performance') // <-
    .run();
```

## Author
Luciano Listorti 
# testcafe-reporter-time
