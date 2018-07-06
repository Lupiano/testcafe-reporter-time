const FILE_NAME = 'test-times.json'; 
var THRESHOLD = 30000;
var testTimes = null;

var fs = require('fs');

export default function () {
    return {
        noColors:       true,
        startTime:      null,
        afterErrorList: false,
        testCount:      0,
        skipped:        0,
        outOfTimeTests: [],
        

        reportTaskStart (startTime, userAgents, testCount) {

            try {
                testTimes = JSON.parse(fs.readFileSync(FILE_NAME, 'utf8'));
            }
            catch (err) {
                testTimes = null;
            }

            this.startTime = startTime;
            this.testCount = testCount;

            if (testTimes && typeof testTimes['threshold'] !== 'undefined')
                THRESHOLD = testTimes['threshold'];

            this.setIndent(1)
                .useWordWrap(true)
                .write('Running tests in:')
                .newline();
                
            userAgents.forEach(ua => {
                this
                    .write(`- ${ua}`)
                    .newline();
            });

            this.newline()
                .write('Threshold: ' + THRESHOLD + 'ms')
                .newline();
        },

        reportFixtureStart (name) {
            this.setIndent(1)
                .useWordWrap(true);

            if (this.afterErrorList)
                this.afterErrorList = false;
            else
                this.newline();

            this.write(name)
                .newline();
        },

        _renderErrors (errs) {
            this.setIndent(3)
                .useWordWrap(false);

            errs.forEach((err) => {
                this.newline();
                err = this.formatError(err);
                const errorMsg = err.split('Browser')[0];

                this.write(errorMsg.replace(/\s\s+/g, ' '));

            });
        },

        reportTestDone (name, testRunInfo) {
            var hasErr    = !!testRunInfo.errs.length;
            var symbol    = null;

            if (testRunInfo.skipped) {
                this.skipped++;

                symbol = '-';
            }
            else if (hasErr) 
                symbol = '\u2715';
            else 
                symbol = '\u221a';

            var title = `${symbol} ${name}`;

            this.setIndent(1)
                .useWordWrap(true);

            if (testRunInfo.unstable)
                title += ' (unstable)';

            if (testRunInfo.screenshotPath)
                title += ` (screenshots: ${testRunInfo.screenshotPath})`;

            title += ` (${testRunInfo.durationMs}ms)`;

            this.write(title);

            if (hasErr)
                this._renderErrors(testRunInfo.errs);

            this.afterErrorList = hasErr;

            this.newline();

            if (!testRunInfo.skipped && !hasErr && testTimes && typeof testTimes[name] !== 'undefined') {
                
                var expectedTime = testTimes[name];
                var durationMs = testRunInfo.durationMs;

                if (durationMs > expectedTime + THRESHOLD || durationMs < expectedTime - THRESHOLD) {
                    var msg;

                    if (durationMs > expectedTime + THRESHOLD)
                        msg = 'Duration was more than expected';
                    else
                        msg = 'Duration was less than expected';

                    this.outOfTimeTests.push({
                        name:         name,
                        expectedTime: expectedTime,
                        durationMs:   durationMs,
                        msg:          msg
                    });
                }

            }
        },

        _renderWarnings (warnings) {
            this.newline()
                .setIndent(1)
                .write(`Warnings (${warnings.length}):`)
                .newline();

            warnings.forEach(msg => {
                this.setIndent(1)
                    .write(`--`)
                    .newline()
                    .setIndent(2)
                    .write(msg)
                    .newline();
            });
        },

        _renderOutOfTime () {
            this.newline()
                .setIndent(1)
                .write(`Out of time tests (${this.outOfTimeTests.length}):`)
                .newline();

            this.outOfTimeTests.forEach(test => {
                this.setIndent(1)
                    .write(`- ${test.name}:`)
                    .newline()
                    .setIndent(4)
                    .write(`Duration: ${test.durationMs}ms (${test.expectedTime}ms expected)`)
                    .newline()
                    .write(`Message: ${test.msg}`)
                    .newline();
            });
        },

        reportTaskDone (endTime, passed, warnings) {
            var durationMs  = endTime - this.startTime;
            var durationStr = this.moment.duration(durationMs).format('h[h] mm[m] ss[s]');
            var footer      = passed === this.testCount ?
                              `${this.testCount} passed` :
                              `${this.testCount - passed}/${this.testCount} failed`;

            footer += ` (${durationStr})`;

            if (!this.afterErrorList)
                this.newline();

            this.setIndent(1)
                .useWordWrap(true);

            this.newline()
                .write(footer)
                .newline();

            if (this.skipped > 0) {
                this.write(`${this.skipped} skipped`)
                    .newline();
            }

            if (warnings.length)
                this._renderWarnings(warnings);

            if (this.outOfTimeTests.length)
                this._renderOutOfTime();
        }
    };
}
