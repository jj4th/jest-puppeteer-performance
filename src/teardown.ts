import * as puppeteer from 'puppeteer';
import * as fs from 'fs-extra';
import * as os from 'os';
import * as path from 'path';

const DIR = path.join(os.tmpdir(), 'jest_puppeteer_global_setup');

export = async function() {
  console.log('Teardown Puppeteer');
  await global.__BROWSER__.close();
  fs.removeSync(DIR);
}
