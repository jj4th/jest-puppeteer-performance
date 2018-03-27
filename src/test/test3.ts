import * as puppeteer from 'puppeteer';
import { analyzePerformance } from '..';

describe('Performance Test', async () => {
    let page: puppeteer.Page;
    let browser: puppeteer.Browser;

    beforeAll(async () => {
        browser = await puppeteer.launch({headless: false});
        page = await browser.newPage();
        page.tracing.start({path:'trace.json'});
        await page.goto('http://localhost:8080');
    });

    afterAll(async () => {
        await page.tracing.stop();
        await browser.close();
    });

    it('Should be performant', async () => {
        await analyzePerformance(page);
    });
});
