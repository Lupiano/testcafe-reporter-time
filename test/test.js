var assert           = require('assert');
var normalizeNewline = require('normalize-newline');
var read             = require('read-file-relative').readSync;
var createReport     = require('./utils/create-report');

it('Should produce a test report', function () {
    var report   = createReport(false);
    var expected = read('./data/report');

    report   = normalizeNewline(report).trim();
    expected = normalizeNewline(expected).trim();

    assert.strictEqual(report, expected);
});
