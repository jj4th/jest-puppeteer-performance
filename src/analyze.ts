import * as puppeteer from 'puppeteer';
import { Metrics, MetricsOptions, MetricsAnalysis } from './metrics';

export async function analyze(
    received: puppeteer.Page,
    options?: Partial<MetricsOptions>
) {
    const matcherObject: any = (global as any)[Symbol.for('$$jest-matchers-object')].state;
    const { currentTestName, isNot, testPath } = matcherObject as jest.MatcherState;

    if (isNot) {
        throw new Error('Performance: `.not` cannot be used with `.toPerform()`.');
    }

    const metrics = new Metrics(testPath, currentTestName, options);
    let analysis = metrics.analyze(await received.metrics());
    let pass = (analysis.length === 0);

    const message = () => {
        return analysis.map(result => `${result.key}: ${result.value} to be less than ${result.limit}.`).join('\n');
    };

    if (pass) {
        metrics.save();
    } else {
        throw message();
    }
}