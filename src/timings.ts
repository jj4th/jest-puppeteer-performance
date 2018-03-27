/**
 * Based on Timing.js 1.0.4
 * Based on Node-timing.js 1.1.0
 * Copyright 2015 Addy Osmani
 * Copyright 2015 Andrew Yurisich
 * Copyright 2018 J. Andrichak (replaced Chrome specific firstPaint logic)
 *
 * Create a function that returns an object containing timings for Chrome.
 */
import { ConsolidatedMetrics, Metrics } from './metrics';

export function getTimings() {
    let chrome: any = (window as any).chrome;
    let timing = window.performance.timing;
    let api: Partial<ConsolidatedMetrics> = {};

    // The Performance API is still experimental and not supported in all browsers.
    if ((window as any).PerformancePaintTiming) {
        let firstPaint = window.performance.getEntriesByName('first-paint')[0];
        let firstContentfulPaint = window.performance.getEntriesByName('first-contentful-paint')[0];
        console.error('Paint Entries:', window.performance.getEntriesByType('paint'));
        api.firstPaint = firstPaint.startTime;
        api.firstPaintTime = firstPaint.startTime - timing.navigationStart;
        api.firstContentfulPaintTime = firstContentfulPaint.startTime - timing.navigationStart;
    }

    // Total time from start to load
    api.loadTime = timing.loadEventEnd - timing.fetchStart;
    // Time spent constructing the DOM tree
    api.domReadyTime = timing.domComplete - timing.domInteractive;
    // Time consumed preparing the new page
    api.readyStart = timing.fetchStart - timing.navigationStart;
    // Time spent during redirection
    api.redirectTime = timing.redirectEnd - timing.redirectStart;
    // AppCache
    api.appcacheTime = timing.domainLookupStart - timing.fetchStart;
    // Time spent unloading documents
    api.unloadEventTime = timing.unloadEventEnd - timing.unloadEventStart;
    // DNS query time
    api.lookupDomainTime = timing.domainLookupEnd - timing.domainLookupStart;
    // TCP connection time
    api.connectTime = timing.connectEnd - timing.connectStart;
    // Time spent during the request
    api.requestTime = timing.responseEnd - timing.requestStart;
    // Request to completion of the DOM loading
    api.initDomTreeTime = timing.domInteractive - timing.responseEnd;
    // Load event time
    api.loadEventTime = timing.loadEventEnd - timing.loadEventStart;

    return api;
};
