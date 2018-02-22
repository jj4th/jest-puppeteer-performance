import {default as fetch, Response} from 'node-fetch';
import { URL } from 'url';
import { PerformanceEvent, EVENTS } from '../analyze';
import { Metrics, ConsolidatedMetrics } from '../metrics';

interface NewRelicEvent extends ConsolidatedMetrics {
    eventType: 'Performance';
    currentTestName: string;
    testPath: string;
    failed: Metrics.KEYS[];
}

export class NewRelic {
    private collectorUri: string;
    private apiKey: string;
    private events: NewRelicEvent[] = [];

    constructor ( performanceEvents: NodeJS.EventEmitter, apiKey: string, collectorUri: string) {
        this.apiKey = apiKey;
        this.collectorUri = collectorUri;

        if (!this.apiKey) {
            throw new Error('Please specify a valid NewRelic API Key.');
        }

        try {
            new URL(this.collectorUri);
        } catch (err) {
            console.error('Please specify a valid NewRelic Collector URI.');
            throw err;
        }
        performanceEvents.on(EVENTS.ANALYZED, this.collect.bind(this));
    }

    collect(event: PerformanceEvent) {
        let nrEvent = {
            eventType: 'Performance',
            currentTestName: event.currentTestName,
            testPath: event.testPath,
            failed: (event.failed || []).map(({key}) => key),
            ...event.metrics
        } as NewRelicEvent;

        this.events.push(nrEvent);
    }

    clear() {
        this.events = [];
    }

    async send() {
        if (this.events.length === 0) {
            throw new Error('No performance events recorded.');
        }

        return fetch(this.collectorUri, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Insert-Key': this.apiKey,
            },
            body: JSON.stringify(this.events)
        });
    }
}
