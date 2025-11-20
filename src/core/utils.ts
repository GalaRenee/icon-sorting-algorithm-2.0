import { SortItem, ThemeConfig } from '../types';

export function generateItems(count: number, theme: ThemeConfig): SortItem [] {
    const items: SortItem[] = [];
    const itemTypes = Object.entries(theme.items);

    for (let i = 0; i < count; i++) {
        const [key, item] = itemTypes[Math.floor(Math.random() * itemTypes.length)];
        items.push({
            type: key,
            emoji: item.emoji,
            label: item.label,
            value: item.value
        });
    }

    return items;
}

export function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

export function countSortedItems(arr: SortItem[]): number[] {
    const counts = [0, 0, 0, 0];
    let lastValue = -1;
    let isSorted = true;

    for (let i = 0; i < arr.length; i++) {
        if (arr[i].value < lastValue) {
            isSorted = false;
            break;
        }
        if (isSorted) {
            counts[arr[i].value]++;
        }
        lastValue = arr[i].value;
    }

    return counts; 
}

export const ALGORITHM_COLORS: { [key: string]: string } = {
    'insertion': '#FF6B90',
    'merge': '#C77DFF',
    'quick': '#9D4EDD',
    'heap': '#7B2CBF',
    'counting': '#FF8FA3',
    'radix': '#FFB4D6',
    'bucket': '#FFD60A'
};

export function getAlgorithmDisplayName(algo: string): string {
    const names: { [key: string]: string } = {
        'insertion': 'Insertion Sort',
        'merge': 'Merge Sort',
        'quick': 'Quick Sort',
        'heap': 'Heap Sort',
        'counting': 'Counting Sort',
        'radix': 'Radix Sort',
        'bucket': 'Bucket Sort'
    };
    return names[algo] || algo;
}