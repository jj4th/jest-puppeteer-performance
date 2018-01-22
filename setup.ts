import * as puppeteer from 'puppeteer';
import * as fs from 'fs-extra';
import * as os from 'os';
import * as path from 'path';

const DIR = path.join(os.tmpdir(), 'jest_puppeteer_global_setup');

export = async function() {
  console.log('Setup Puppeteer');
  const browser = await puppeteer.launch({});
  global.__BROWSER__ = browser;
  fs.mkdirpSync(DIR);
  fs.writeFileSync(path.join(DIR, 'wsEndpoint'), browser.wsEndpoint());
}
