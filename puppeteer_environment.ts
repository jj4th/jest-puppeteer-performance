import NodeEnvironment = require('jest-environment-node');
import * as puppeteer from 'puppeteer';
import * as fs from 'fs-extra';
import * as os from 'os';
import * as path from 'path';

const DIR = path.join(os.tmpdir(), 'jest_puppeteer_global_setup');

class PuppeteerEnvironment extends NodeEnvironment {
  async setup() {
    console.log('Setup Test Environment.');
    await super.setup();
    const wsEndpoint = fs.readFileSync(path.join(DIR, 'wsEndpoint'), 'utf8');
    if (!wsEndpoint) {
      throw new Error('wsEndpoint not found');
    }
    this.global.__BROWSER__ = await puppeteer.connect({
      browserWSEndpoint: wsEndpoint,
    })
  }
}

export = PuppeteerEnvironment;