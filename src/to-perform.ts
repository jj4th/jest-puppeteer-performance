import * as fs from 'fs-extra';
import * as path from 'path';
import * as puppeteer from 'puppeteer';

const MIN_SAMPLES = 5;
const MAX_SAMPLES = 20;
const EXCLUDE_METRICS: METRICS[] = ['Timestamp'];

class Stats {
	static sum(...numbers: number[]) {
    return numbers.reduce((sum, number) => sum + number);
	}

	static mean(...numbers: number[]) {
		return this.sum(...numbers) / numbers.length;
	}

	static variance(...numbers: number[]) {
		const mean = this.mean(...numbers);
		return this.mean(...numbers.map((num) => Math.pow(num - mean, 2)));
	}

	static sigma(...numbers: number[]) {
		return Math.sqrt(this.variance(...numbers));
  }

  static error(...numbers: number[]) {
    const sigma = this.sigma(...numbers);
    return sigma / Math.sqrt(numbers.length);
  }
};

// Jest doesn't expose MatcherState
interface MatcherState {
  currentTestName: string;
  isNot: boolean;
  testPath: string;
};

// Convenience types
type METRICS = keyof puppeteer.Metrics;

interface ANALYSIS {
  error?: number,
  label?: METRICS,
  mean?: number,
  sample?: number,
  sigma?: number,
  limit?: number,
}

const getMetrics = (path: string, name: string) => {
  const globalMetrics = global.__METRICS__;

  if (!globalMetrics.hasOwnProperty(path)) {
    setMetrics(path, name, []);
  }
  if (!globalMetrics[path].hasOwnProperty(name)) {
    setMetrics(path, name, []);
  }
  return globalMetrics[path][name];
}

const setMetrics = (path: string, name: string, data: puppeteer.Metrics[]) => {
  const globalMetrics = global.__METRICS__;
  if (!globalMetrics.hasOwnProperty(path)) {
    globalMetrics[path] = {};
  }
  globalMetrics[path][name] = data;
}

const collectMetric = (label: keyof puppeteer.Metrics, metrics: puppeteer.Metrics[]) => {
  return metrics.map(metric => metric[label]);
}

const analyzeMetrics = (current: puppeteer.Metrics, metrics: puppeteer.Metrics[]): ANALYSIS => {
  // We really can't get any useful information until this.
  if (metrics.length < MIN_SAMPLES) {
    return {};
  }

  const keys = Object.keys(current) as METRICS[];

  for (let label of keys) {
    // Don't run on timestamp;
    if (EXCLUDE_METRICS.indexOf(label) !== -1) {
      continue;
    }
    const collectedMetrics = collectMetric(label, metrics);
    const sample = current[label];
    const sigma = Stats.sigma(sample, ...collectedMetrics);
    const mean = Stats.mean(...collectedMetrics);
    const error = Stats.error(...collectedMetrics);
    const limit = mean + 2*sigma;
    if (sample > limit) {
      return {
        label,
        sample,
        error,
        sigma,
        mean,
        limit,
      };
    }
  }

  return {};
}

expect.extend({
  toPerform(received: puppeteer.Metrics) {
    const {currentTestName, isNot, testPath}: MatcherState = this as any;

    if (isNot) {
      throw new Error('Performance: `.not` cannot be used with `.toPerform()`.');
    }

    const metrics = getMetrics(testPath, currentTestName);
    let analyzed = analyzeMetrics(received, metrics);
    let pass = !analyzed.label;

    const message = () => {
      return `${analyzed.label}: ${analyzed.sample} to be less than ${analyzed.limit}. Error: ${analyzed.error}.`;
    };

    if (pass) {
      metrics.unshift(received);

      while (metrics.length > MAX_SAMPLES) {
        metrics.pop();
      }
      setMetrics(testPath, currentTestName, metrics);
    }

    return {actual: received, message, pass};
  }
});