import * as puppeteer from 'puppeteer';

describe('Performance Test', () => {
    let page: puppeteer.Page;

    beforeAll(async () => {
        page = await global.__BROWSER__.newPage();
        await page.goto('http://www.google.com');
    });

    it('Should be performant', async () => {
        expect(await page.metrics()).toPerform();
    });
});
