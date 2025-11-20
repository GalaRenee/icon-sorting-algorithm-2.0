import { SortingMetrics } from '../types';

export function createMetrics(): SortingMetrics {
    return {
        comparisons: 0,
        swaps: 0,
        timeElapsed: 0, 
        dataPoints: []
    };
}

export function recordDataPoint(
    metrics: SortingMetrics,
    startTime: number, 
    interval: number = 100
): boolean {
    if (metrics.comparisons % interval === 0) {
        const elapsed = performance.now() - startTime;
        metrics.dataPoints.push({
            time: elapsed,
            operations: metrics.comparisons + metrics.swaps
        });
        return true;
    }
    return false; 
}

export function finalizeMetrics(metrics: SortingMetrics, startTime: number): void {
    metrics.timeElapsed = performance.now() - startTime;
    metrics.dataPoints.push({
        time: metrics.timeElapsed,
        operations: metrics.comparisons + metrics.swaps
    });
}