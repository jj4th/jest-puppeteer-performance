import * as Puppeteer from 'puppeteer';

declare global {
    namespace NodeJS {
        interface Global {
            __BROWSER__: Puppeteer.Browser;
        }
    }
    namespace jest {
        interface Matchers<R> {
            toPerform: () => Promise<void>;
        }
    }
}

export { };