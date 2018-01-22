import * as Puppeteer from 'puppeteer';

declare global {
    namespace NodeJS {
        interface Global {
            __BROWSER__: Puppeteer.Browser;
        }
    }
}

export { };