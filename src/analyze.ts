import * as puppeteer from 'puppeteer';
import { Metrics, ConsolidatedMetrics, MetricsOptions, MetricsAnalysis } from './metrics';
import { getTimings } from './timings';
import { EventEmitter } from 'events';

export enum EVENTS {
    BASELINE = 'BASELINE',
    METRICS = 'METRICS',
    ANALYZED = 'ANALYZED',
}

export interface PerformanceEvent {
    currentTestName: string,
    testPath: string,
    baseline: ConsolidatedMetrics[],
    metrics?: ConsolidatedMetrics,
    failed?: MetricsAnalysis[]
}

export class PerformanceEventEmitter extends EventEmitter {
    emit (name: EVENTS, event: PerformanceEvent) {
        return super.emit(name, event);
    }
}

export const performanceEvents = new PerformanceEventEmitter();

export async function gatherMetrics(
    page: puppeteer.Page,
) {
    let consolidated: Partial<ConsolidatedMetrics> = await page.metrics();
    consolidated = {...consolidated, ... await page.evaluate(getTimings)}

    return consolidated as ConsolidatedMetrics;
}

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
    let event: PerformanceEvent = {
        currentTestName,
        testPath,
        baseline: metrics.metrics
    };

    performanceEvents.emit(EVENTS.BASELINE, event);

    const sample = await gatherMetrics(received);

    event = {...event, metrics: sample};
    performanceEvents.emit(EVENTS.METRICS, event)

    let failed = metrics.analyze(sample);

    event = {...event, failed};
    performanceEvents.emit(EVENTS.ANALYZED, event);

    const message = () => {
        return failed.map(result => `${result.key}: ${result.value} to be less than ${result.limit}.`).join('\n');
    };

    if (failed.length === 0) {
        metrics.save();
    } else {
        throw message();
    }
}
