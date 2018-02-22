import * as puppeteer from 'puppeteer';
import * as process from 'process';
import { analyzePerformance, performanceEvents, contrib } from '..';

let nrAPIKey = process.env.nrAPIKey || '';
let nrCollectorURI = process.env.nrCollectorURI || '';

describe('Performance Test', async () => {
    let page: puppeteer.Page;
    let browser: puppeteer.Browser;
    let reporter: contrib.NewRelic;

    beforeAll(async () => {
        reporter = new contrib.NewRelic(performanceEvents, nrAPIKey, nrCollectorURI);

        browser = await puppeteer.launch({headless: false});
        page = await browser.newPage();
        await page.goto('http://localhost:8080');
    });

    afterAll(async () => {
        await browser.close();
        await reporter.send();
    });

    it('Should be performant', async () => {
        await analyzePerformance(page);
    });
});
