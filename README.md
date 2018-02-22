# jest-puppeteer-performance
Automated UI Performance Testing with Jest and Puppeteer

## Installation
This project has a peer dependency on `puppeteer` and is intended to be used with `jest` test runner.

Jest: https://github.com/facebook/jest

Puppeteer: https://github.com/GoogleChrome/puppeteer

```shell
npm install jest-puppeteer-performance puppeteer jest
```

NOTE: We do not install `puppeteer` or `jest` because you will need to install them under your own project in order to use them in your source files and with your own tests.  `jest-puppeteer-performance` is not intended to take on the responsibility of providing a test runner, or headless browser.  This allows us to keep our package smaller and avoid installing multiple versions of these dependencies.

## Usage
This module exports one function `analyzePerformance()`.  Here is an example of how to use it with the default options in a test.

```javascript
import * as puppeteer from 'puppeteer';
import { analyzePerformance } from 'jest-puppeteer-performance';

describe('Performance Test', async () => {
    let page;
    let browser;

    beforeAll(async () => {
        browser = await puppeteer.launch({headless: false});
        page = await browser.newPage();
        await page.goto('http://example.net/example.html');
    });

    afterAll(async () => {
        await browser.close();
    });

    it('Should be performant', async () => {
        await analyzePerformance(page);
    });
});
```

## analyzePerformance(Puppeteer.Page, MetricsOptions)
`MetricsOptions` is an object with the following options:

* `exclude`: Array of metrics to exclude from measurements.
* `minSamples`: Minimum number of samples required before asserting.
* `maxSamples`: Maximum number of samples to keep.
* `thresholds`: An object desribing how to analyze each metric, indexed by metric keyname.  The `*` special key applies to all metrics not specified separately.
* `thresholds[key].limit`: The limit to apply to the threshold method (number of standard deviations, percent increase, or absolute value).
* `thresholds[key].type`: The type of threshold method to use when evaluating the specified metric.


```javascript
{
    exclude: [Metrics.KEYS.Timestamp],
    minSamples: 5,
    maxSamples: 20,
    thresholds: {
        '*': {
            limit: 2,
            type: Metrics.THRESHOLD.StDev
        }
    }
}
```

### Thresholds:
* `Absolute`: Absolute Value
* `Percentage`: Percentage
* `StDev`: Standard Deviation

### Metrics gathered:

    Timestamp
    Documents
    Frames
    JSEventListeners
    Nodes
    LayoutCount
    RecalcStyleCount
    LayoutDuration
    RecalcStyleDuration
    ScriptDuration
    TaskDuration
    JSHeapUsedSize
    JSHeapTotalSize
    appcacheTime
    connectTime
    domReadyTime
    firstPaint
    firstPaintTime
    initDomTreeTime
    loadEventTime
    loadTime
    lookupDomainTime
    readyStart
    redirectTime
    requestTime
    unloadEventTime

## Contrib

### New Relic
We have provided a script for submitting results to [New Relic](https://newrelic.com/).  You will find the reporter under the `contrib` namespace.

```javascript
import * as puppeteer from 'puppeteer';
import { analyzePerformance, performanceEvents, contrib } from 'jest-puppeteer-performance';

let nrAPIKey = 'abcdefABCDEF012345-wXyZ';
let nrCollectorURI = 'https://insights-collector.newrelic.com/v1/accounts/123456/events';

describe('Performance Test', async () => {
    let page;
    let browser;
    let newrelic;

    beforeAll(async () => {
        newrelic = new contrib.NewRelic(performanceEvents, nrAPIKey, nrCollectorURI);
        browser = await puppeteer.launch({headless: false});
        page = await browser.newPage();
        await page.goto('http://example.net/example.html');
    });

    afterAll(async () => {
        await browser.close();
        await newrelic.send();
    });

    it('Should be performant', async () => {
        await analyzePerformance(page);
    });
});
```
