const FILE_NAME = 'test-times.json'; 
const THRESHOLD = 30000;
var testTimes;

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

            testTimes = JSON.parse(fs.readFileSync(FILE_NAME, 'utf8'));

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
                symbol = 'X';
            else 
                symbol = 'V';

            var title = `${symbol} ${name}`;

            this.setIndent(1)
                .useWordWrap(true);

            if (testRunInfo.unstable)
                title += ' (unstable)';

            if (testRunInfo.screenshotPath)
                title += ` (screenshots: ${testRunInfo.screenshotPath})`;

            this.write(title);

            if (hasErr)
                this._renderErrors(testRunInfo.errs);

            this.afterErrorList = hasErr;

            this.newline();

            if(!testRunInfo.skipped){
                var expectedTime = testTimes[name];
                var durationMs = testRunInfo.durationMs;
                if(durationMs > (expectedTime + THRESHOLD) || durationMs < (expectedTime - THRESHOLD)){
                    var msg;

                    if(durationMs > (expectedTime + THRESHOLD))
                        msg = 'Duration is more than expected';
                    else
                        msg = msg = 'Duration is less than expected';

                    this.outOfTimeTests.push({
                        name:       name,
                        expectedTime:    expectedTime,
                        durationMs: durationMs,
                        msg: msg
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
                    .write(test.name + ':')
                    .newline()
                    .setIndent(2)
                    .write('Duration: ' + test.durationMs + 'ms (' + test.maxTime + 'ms expected)')
                    .newline()
                    .write('Message: ' + test.msg);
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