import NodeEnvironment = require('jest-environment-node');
import * as puppeteer from 'puppeteer';
import * as fs from 'fs-extra';
import * as os from 'os';
import * as path from 'path';
import * as vm from 'vm';

const DIR = path.join(os.tmpdir(), 'jest_puppeteer_global_setup');

const METRICS_FILE = '.metrics.json';

const loadMetricsData = () => {
  if (fs.existsSync(METRICS_FILE)) {
    try {
      return fs.readJsonSync(METRICS_FILE) as MetricsData;
    } catch (e) {
      // ignore errors.
    }
  }
  return {};
};

const saveMetricsData = (data: MetricsData) => {
  try {
    fs.writeFileSync(METRICS_FILE, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('Failed to write performance file.');
  }
}

class PuppeteerEnvironment extends NodeEnvironment {
  async setup() {
    console.log('Setup Test Environment.');
    await super.setup();
    const wsEndpoint = fs.readFileSync(path.join(DIR, 'wsEndpoint'), 'utf8');
    if (!wsEndpoint) {
      throw new Error('wsEndpoint not found');
    }
    this.global.__METRICS__ = loadMetricsData();
    this.global.__BROWSER__ = await puppeteer.connect({
      browserWSEndpoint: wsEndpoint,
    })
  }

  async teardown() {
    saveMetricsData(this.global.__METRICS__);
    await super.teardown();
  }
}

export = PuppeteerEnvironment;
