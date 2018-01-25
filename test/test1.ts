import * as puppeteer from 'puppeteer';

describe('Performance Test', () => {
    let page: puppeteer.Page;

    beforeAll(async () => {
        page = await global.__BROWSER__.newPage();
        await page.goto('http://localhost:8000');
    });

    it('Should be performant', async () => {
        expect(await page.metrics()).toPerform();
    });
});
