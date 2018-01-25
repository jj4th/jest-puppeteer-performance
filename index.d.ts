import * as Puppeteer from 'puppeteer';
import { Performance } from 'perf_hooks';

declare global {
    namespace NodeJS {
        interface Global {
            __BROWSER__: Puppeteer.Browser;
            __METRICS__: MetricsData;
        }
    }
    namespace jest {
        interface Matchers<R> {
            toPerform: () => Promise<void>;
        }
    }

    interface MetricsData {
      [filePath: string]: {
          [testName: string]: Puppeteer.Metrics[]
      }
    }
}

export { };