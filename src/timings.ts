/**
 * Based on Timing.js 1.0.4
 * Based on Node-timing.js 1.1.0
 * Copyright 2015 Addy Osmani
 * Copyright 2015 Andrew Yurisich
 *
 * Create a function that returns an object containing timings for Chrome.
 */
import { ConsolidatedMetrics, Metrics } from './metrics';

export function getTimings() {
    let chrome: any = (window as any).chrome;
    let timing = window.performance.timing;
    let api: Partial<ConsolidatedMetrics> = {};

    if (chrome) {
       let firstPaint = chrome.loadTimes().firstPaintTime * 1000;
       api.firstPaintTime = firstPaint - chrome.loadTimes().startLoadTime*1000;
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
