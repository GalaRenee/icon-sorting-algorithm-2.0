export interface ThemeConfig {
    name: string;
    displayName: string;
    colors: {
        primary: string;
        secondary: string;
        teritary: string;
        quaternary: string;
        accent: string;
        background: string;
    };
    items: {
        [key: string]: {
            emoji: string;
            label: string;
            value: number;
            bucketColor: string;
        };
    };
    title: {
        part1: string;
        part2: string;
    };
    subtitle: string;
}

export interface SortItem {
    type: string;
    emoji: string;
    label: string;
    value: number;
}

export interface SortingMetrics {
    comparisons: number;
    swaps: number;
    timeElapsed: number;
    dataPoints: { time: number; operations: number }[];
}

export interface AlgorithmResult {
    name: string;
    metrics: SortingMetrics;
    completed: boolean;
}

export type AlgorithmName = 'insertion' | 'merge' | 'quick' | 'heap' | 'counting' | 'radix' | 'bucket';