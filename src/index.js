const FILE_NAME = 'test-times'; 
var THRESHOLD = 30;
var testTimes = null;
var env = null;

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

            this.startTime = startTime;
            this.testCount = testCount;

            this.setIndent(1)
                .useWordWrap(true)
                .write('Running tests in:')
                .newline();
                
            userAgents.forEach(ua => {
                this
                    .write(`- ${ua}`)
                    .newline();
            });
        },

        reportFixtureStart (name) {
            
            if (!testTimes) {
                try {
                    var splitedName = name.split(' ');

                    env = splitedName[splitedName.length - 1];
                    env = env.toLowerCase().replace(/\"/g, '');
                    testTimes = JSON.parse(fs.readFileSync(`${FILE_NAME}-${env}.json`, 'utf8'));
                }
                catch (err) {
                    testTimes = null;
                }

                if (testTimes && typeof testTimes['threshold'] !== 'undefined')
                    THRESHOLD = this.moment(testTimes['threshold']);
            }

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

            var duration = testRunInfo.durationMs / 1000;
            
            title += ` (${duration}s)`;

            this.write(title);

            if (hasErr)
                this._renderErrors(testRunInfo.errs);

            this.afterErrorList = hasErr;

            this.newline();

            var numberPattern = /\d+/g;
            var testNumber;

            try {
                testNumber = name.match(numberPattern)[0];
            }
            catch (err) {
                testNumber = null;
            }

            if (!testRunInfo.skipped && !hasErr && testTimes && testNumber && typeof testTimes[testNumber] !== 'undefined') {
                
                var expectedTime = testTimes[testNumber];

                if (duration > expectedTime + THRESHOLD || duration < expectedTime - THRESHOLD) {
                    var msg;

                    if (duration > expectedTime + THRESHOLD)
                        msg = 'Duration was more than expected';
                    else
                        msg = 'Duration was less than expected';

                    this.outOfTimeTests.push({
                        name:         name,
                        expectedTime: expectedTime,
                        duration:     duration,
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
                    .write(`Duration: ${test.duration}s (${test.expectedTime}s expected)`)
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
            
            if (testTimes && env) {
                this.newline()
                    .write(`Taking expected times from file: ${FILE_NAME}-${env}.json`)
                    .newline()
                    .newline()
                    .write(`Threshold: ${THRESHOLD}s`)
                    .newline();
            }

            if (this.outOfTimeTests.length)
                this._renderOutOfTime();
            else {
                this.newline()
                    .write(`There are no out of time tests`)
                    .newline();
            }
        }
    };
}
