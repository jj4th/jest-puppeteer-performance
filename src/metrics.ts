import * as fs from 'fs-extra';
import * as path from 'path';
import * as puppeteer from 'puppeteer';
import * as stats from 'stats-lite';

const METRICS_DIR = '__metrics__';
const METRICS_EXT = '.metrics.json';

export type ConsolidatedMetrics = Record<Metrics.KEYS, number>;

interface MetricsJson {
    [testName: string]: ConsolidatedMetrics[]
}

type CollectedMetrics = Record<Metrics.KEYS, number[]>;

export interface MetricsAnalysis {
    key: Metrics.KEYS,
    limit: number,
    value: number,
}

export type MetricsAnalyzer = (sample: number, metrics: number[]) => number;

export type ThresholdOptions = {
    [key in ('*' | Metrics.KEYS)]?: {
        type: Metrics.THRESHOLD,
        limit?: number,
        custom?: MetricsAnalyzer,
    };
}
export interface MetricsOptions {
    exclude: Metrics.KEYS[];
    minSamples: number;
    maxSamples: number;
    profile: boolean;
    thresholds: ThresholdOptions
}

export class Metrics {
    private metricsJson: MetricsJson;
    private metrics: ConsolidatedMetrics[];
    private metricsPath: string;

    options: MetricsOptions = {
        exclude: [Metrics.KEYS.Timestamp],
        minSamples: 5,
        maxSamples: 20,
        profile: false,
        thresholds: {
            '*': {
                limit: 2,
                type: Metrics.THRESHOLD.StDev,
            }
        }
    }

    constructor(readonly testPath: string, readonly testName: string, options: Partial<MetricsOptions> = {}) {
        Object.assign(this.options, {});
        this.metricsPath = this.pathFromTest(testPath);
        this.metricsJson = this.load();
        this.metrics = this.metricsJson[testName] || [];
    }

    private collect(): CollectedMetrics {
        const keys = Object.keys(this.metrics[0]) as Metrics.KEYS[];
        return keys.reduce((acc, key) => {
            acc[key] = this.metrics.map(obj => obj[key]);
            return acc;
        }, {} as Partial<CollectedMetrics>) as CollectedMetrics;
    }

    private load(): MetricsJson {
        if (fs.existsSync(this.metricsPath)) {
            return fs.readJsonSync(this.metricsPath, {throws: false}) || {};
        }
        return {};
    }

    private pathFromTest(
        testPath: string
    ): string {
        const basename = path.basename(testPath, path.extname(testPath)) + METRICS_EXT;
        const dirname = path.dirname(testPath);
        return path.join(dirname, METRICS_DIR, basename);
    }

    analyze(
        sample: ConsolidatedMetrics
    ): MetricsAnalysis[] {
        let results: MetricsAnalysis[] = [];

        if (this.metrics.length < this.options.minSamples) {
            this.metrics.push(sample);
            return results;
        };

        const collected = this.collect();
        const keys = (Object.keys(sample) as Metrics.KEYS[]).filter(key => !this.options.exclude.includes(key));

        for(const key of keys) {
            const threshold = this.options.thresholds[key] || this.options.thresholds['*'];

            if (!threshold) {
                continue;
            }

            const value = sample[key];
            const values = collected[key];
            let limit = threshold.limit || 0; // default is same as Metrics.THRESHOLD.Absolute

            if (threshold.custom) {
                limit = threshold.custom(value, values);

            } else if (threshold.type === Metrics.THRESHOLD.Percentage) {
                limit *= Math.max(...values);

            } else if (threshold.type === Metrics.THRESHOLD.StDev) {
                limit *= stats.stdev(values);
                limit += stats.mean(values);
            }

            if (value > limit) {
                results.push({
                    key,
                    value,
                    limit
                });
            }
        }

        if (this.metrics.length >= this.options.maxSamples) {
            this.metrics.splice(this.metrics.length - 1);
            this.metrics.unshift(sample);
        }
        return results;
    }

    save(): void {
        this.metricsJson[this.testName] = this.metrics;
        fs.outputJsonSync(this.metricsPath, this.metricsJson, {spaces: 2});
    }
}

export namespace Metrics {
    export enum THRESHOLD {
        Absolute = 'absolute',
        Percentage = 'percentage',
        StDev = 'stdev',
    }
    export enum KEYS {
        Timestamp = 'Timestamp',
        Documents = 'Documents',
        Frames = 'Frames',
        JSEventListeners = 'JSEventListeners',
        Nodes = 'Nodes',
        LayoutCount = 'LayoutCount',
        RecalcStyleCount = 'RecalcStyleCount',
        LayoutDuration = 'LayoutDuration',
        RecalcStyleDuration = 'RecalcStyleDuration',
        ScriptDuration = 'ScriptDuration',
        TaskDuration = 'TaskDuration',
        JSHeapUsedSize = 'JSHeapUsedSize',
        JSHeapTotalSize = 'JSHeapTotalSize',
        appcacheTime = 'appcacheTime',
        connectTime = 'connectTime',
        domReadyTime = 'domReadyTime',
        firstPaint = 'firstPaint',
        firstPaintTime = 'firstPaintTime',
        initDomTreeTime = 'initDomTreeTime',
        loadEventTime = 'loadEventTime',
        loadTime = 'loadTime',
        lookupDomainTime = 'lookupDomainTime',
        readyStart = 'readyStart',
        redirectTime = 'redirectTime',
        requestTime = 'requestTime',
        unloadEventTime = 'unloadEventTime',
    }
}