// Shell typedef to satisfy TypeScript
declare module 'stats-lite' {
    /**
     * Accepts an array of values and returns an array consisting of only numeric values
     * from the source array. Converts what it can and filters out anything else.
     */
    export function numbers(vals: any[]): number[];

    /**
     * Sum the values in the array.
     */
    export function sum(vals: number[]): number;

    /**
     * Calculate the mean average value of vals.
     */
    export function mean(vals: number[]): number;

    /**
     * Calculate the median average value of vals.
     */
    export function median(vals: number[]): number;

    /**
     * Calculate the mode average value of vals.
     * If vals is multi-modal (contains multiple modes), mode(vals) will return a ES6 Set of the modes.
     */
    export function mode(vals: number[]): number;

    /**
     * Calculate the variance from the mean.
     */
    export function variance(vals: number[]): number | Set<number>;

    /**
     * Calculate the standard deviation of the values from the mean.
     */
    export function stdev(vals: number[]): number;

    /**
     * Calculate the value representing the desired percentile (0 < ptile <= 1). Uses the Estimation
     * method to interpolate non-member percentiles.
     */
    export function percentile(vals: number[], ptile: number): number;

    /**
     * Build a histogram representing the distribution of the data in the provided number of bins. If
     * bins is not set, it will choose one based on Math.sqrt(vals.length).
     */
    export function histogram(vals: number[], bins?: number): Histogram;

    export interface Histogram {
        values: number[],
        bins: number,
        binWidth: number,
        binLimits: number[]
    }
}