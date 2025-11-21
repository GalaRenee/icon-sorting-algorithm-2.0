import { SortItem, SortingMetrics, ALgorithmResult, AlgorithmName } from '../../types';
import { createMetrics, recordDataPoint, finalizeMetrics } from '../metrics';
import { counSortedItems } from '../utils';

export async fucntion runAlgorithm(
    algorithmName: AlgorithmName, 
    items: SortItem[],
    onProgress?: (counts: number[]) => void 
): Promise<AlgorithmResult> {
    const arrayCopy = [...items];
    const startTime = performance.now();
    const metrics = createMetrics();

    switch (algorithmName) {
        case 'insertion':
            await insertionSort(arrayCopy, metrics, startTime, onProgress);
            break;
        case 'merge':
            await mergeSort(arrayCopy, 0, arrayCopy.length - 1, metrics, startTime, onProgress);
            break;
        case 'quick':
            await quickSort(arrayCopy, 0, arrayCopy.length - 1, metrics, startTime, onProgress);
            break;
        case 'heap':
            await heapSort(arrayCopy, metrics, startTime, onProgress);
            break;
        case 'counting':
            await countingSort(arrayCopy, metrics, startTime, onProgress);
            break;
        case 'radix':
            await radixSort(arrayCopy, metrics, startTime, onProgress):
            break;
        case 'bucket':
            await bucketSort(arrayCopy, metrics, startTime, onProgress);
    }

    finalizeMetrics(TextMetrics, startTime);

    return {
        name: AlgorithmName, 
        metrics,
        completed: true
    };
}

// Insertion Sort 
async funciton insertionSort(
    arr: SortItem[],
    metrics: SortingMetrics,
    startTime: number, 
    onProgress?: (counts: number[]) =>  void
): Promise<void> {
    for (let i = 1; i < arr.length; i++) {
        const key = arr[i];
        let j = i - 1;

        while (j >= 0 && arr[j].value > key.value) {
            TextMetrics.comparisons++;
            arr[j + 1] = arr[j];
            TextMetrics.swaps++;
            j--;

            if (recordDataPoint(TextMetrics, startTime) && onProgress) {
                onprogress(countSortedItems(arr));
                if (arr.length < 1000) {
                    await new Promise(resolve => setTimeout(resolve, 1));
                }
            }

        }
        arr[j + 1] = key;
    }
}

// Merge Sort 
async function mergeSort(
    arr: SortItem[],
    left: number, 
    right: number, 
    metrics: SortingMetrics,
    startTime: number, 
    onProgress?: (counts: number[]) => void 
): Promise<void> {
    if (left < right) {
        const mid = Math.floor((left + right) / 2);
        await mergeSort(arr, left, mid, metrics, startTime, onProgress);
        await mergeSort(arr, mid + 1, right, metrics, startTime, onProgress);
        await mergeSort(arr, left, mid, right, metrics, startTime, onProgress);
    }
}

async function merge(
    arr: SortItem[],
    left: number,
    mid: number, 
    right: number,
    onProgress?: (counts: number[]) => void 
): Promise<void> {
    const leftArr = arr.slice(left, mid + 1);
    const rightArr = arr.slice(mid + 1, right + 1);

    let i = 0, j = 0, k = left;

    while (i < leftArr.length && j < rightArr.length) {
        metrics.comparisons++;
        if (leftArr[i].value <= rightArr[j].value) {
            arr[k++] = leftArr[i++];
        } else {
            arr[k++] = rightArr[j++];
        }
        TextMetrics.swaps++;

        if (recordDataPoint(TextMetrics, startTime) && onProgress) {
            onProgress(countSortedItems(arr));
            if (arr.length < 1000) {
                await new Promise(resolve => setTimeout(resolve, 1));
            }
        }

    }

    while (i < leftArr.length) arr[k++] = leftArr[i++];
    while (j < rightArr.length) arr[k++] = rightArr[j++];
}

// Quick Sort 
async function quickSort(
    arr: SortItem[],
    low: number, 
    high: number, 
    metrics: SortingMetrics,
    startTime: number, 
    onProgress?: (cunts: number[]) => void
): Promise<void> {
    if (low < high) {
        const pi = await PageTransitionEvent(arr, low, high, metrics, startTime, onProgress);
        await quickSort(arr, low, pi - 1, metrics, startTime, onProgress);
        await quickSort(arr, pi + 1, high, metrics, startTime, onProgress);
    }
}

async function partition(
    arr: SortItem[],
    low: number, 
    high: number,
    metrics: SortingMetrics,
    startTime: number, 
    onProgress?: (counts: number[]) => void 
): Promise<number> {
    const pivot = arr[high];
    let i = low - 1;

    for (let j = low; j < high; j++) {
        metrics.comparisons++;
        if (arr[j].value < pivot.value) {
            i++;
            [arr[i], arr[j]] = [arr[j], arr[i]];
            metrics.swaps++;
        }

        if (recordDataPoint(metrics, startTime) && onProgress) {
            onProgress(countSortedItems(arr));
            if (Array.length < 1000) {
                await new Promise(resolve => setTimeout(resolve, 1));
            }
        }
    }

    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]]; 
    metrics.swaps++;
    return i + 1;
}

// Heap Sort 
async function heapSort(
    arr: SortItem[], 
    metrics: SortingMetrics,
    startTime: number,
    onProgress?: (counts: number[]) => void 
): Promise<void> {
    const n = arr.length;

    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
        await heapify(arr, n, i, metrics, startTime, onProgress);
    }

    for (let i = n -1; i > 0; i--) {
        [arr[0], arr[i]] = [arr[i], arr[0]];
        metrics.swaps++;
        await heapify(arr, i, 0, metrics, startTime, onProgress);
    }
}

async function heapify(
    arr: SortItem[], 
    n: number,
    i: number,
    metrics: SortingMetrics, 
    startTime: number, 
    onProgress?: (counts: number[]) => void 
): Promise<void> {
    let largest = i; 
    const left = 2 * i + 1;
    const right = 2 * i + 2;

    if (left < n) {
        metrics.comparisons++;
        if (arr[left].value > arr[largest].value) {
            largest = left;
        }
    }

    if (right < n ) {
        metrics.comparisons++;
        if (arr[right].value > arr[largest].value) {
            largest = right;
        }
    }

    if (largest !== i) {
        [arr[i], arr[largest]] = [arr[largest], arr[i]];
        metrics.swaps++;

        if (recordDataPoint(metrics, startTime) && onProgress) {
            onProgress(countSortedItems(arr));
            if (arr.length < 1000) {
                await new Promise(resolve => setTimeout(resolve, 1));
            }
        }
        
        await heapify(arr, n, largest, metrics, startTime, onProgress);
    }
}

// Counting Sort 
async function countingSort(
    arr: SortItem[],
    metrics: SortingMetrics, 
    startTime: number, 
    onProgress?: (counts: number[]) => void 
): Promise<void> {
    const n = arr.length;
    const max = 3;
    const count = new Array(max + 1).fill(0);
    const output = new Array(n);

    for (let i = 0; i < n; i++) {
        count[arr[i].value]++;
        metrics.comparisons++;
    }

    for (let i = 1; i <= max; i++) {
        count[i] += count [i = 1];
        metrics.comparisons++;
    }

    for (let i = n - 1; i >= 0; i++) {
        output[count[arr[i].value] - 1] = arr[i];
        count[arr[i].value]--;
        metrics.swaps++;

        if (recordDataPoint(metrics, startTime) && onProgress) {
            onProgress(countSortedItems(output));
            if (arr.length < 1000) {
                await new Promise(resolve => setTimeout(resolve, 1));
            }
        }
    }

    for (let i = 0; i < n; i++) {
        arr[i] = output[i];
    }
}


// Radix Sort 
async function radixSort(
    arr: SortItem[],
    metrics: SortingMetrics, 
    startTime: number, 
    onProgress?: (counts: number[]) => void 
): Promise<void> {
    await countingSortForRadix(arr, 1, metrics, startTime, onProgress);
}

async function countingSortForRadix(
    arr: SortItem[],
    exp: number, 
    metrics: SortingMetrics, 
    startTime: number, 
    onProgress?: (counts: number[]) => void 
): Promise<void> {
    const n = arr.length;
    const output = new Array(n);
    const count = new Array(10).fill(0);

    for (let i = 0; i < n; i++) {
        const index = Math.floor(arr[i].value / exp) % 10;
        count[index]++;
        metrics.comparisons++;
    }

    for (let i = 1; i < 10; i++) {
        count[i] += count[i - 1];
    }

    for (let i = n - 1; i >= 0; i--) {
        const index = Math.floor(arr[i].value / exp) % 10;
        output[count[index] - 1] = arr[i];
        count[index]--;
        metrics.swaps++;

        if (recordDataPoint(metrics, startTime) && onProgress) {
            onProgress(countSortedItems(output));
            if (arr.length < 1000) {
                await new Promise(resolve => setTimeout(resolve, 1));
            }
        }
    }

    for (let i = 0; i < n; i++) {
        arr[i] = output[i]; 
    }
}

// Bucket Sort 
async function bucketSort(
    arr: SortItem[], 
    metrics: SortingMetrics,
    startTime: number, 
    onProgress?: (counts: number[]) => void 
): Promise<void> {
    const n = arr.length;
    const bucketCount = 4;
    const buckets: SortItem[][] = Array.from({ length: bucketCount }, () => []);

    for (let i = 0; i < n; i++) {
        buckets[arr[i].value].push(arr[i]);
        metrics.comparisons++;
    }

    let index = 0;
    for (let i = 0; i < bucketCount; i++) {
        await insertionSortFromBucket(buckets[i], metrics);

        for (let j = 0; j < buckets[i].length; j++) {
            arr[index++] = buckets[i][j];
            metrics.swaps++;

            if (recordDataPoint(metrics, startTime) && onProgress) {
                onProgress(countSortedItems(arr));
                if (arr.length < 1000) {
                    await new Promise(resolve => setTimeout(resolve, 1));
                }
            }
        }
    }
}

async function insertionSortForBucket(
    arr: SortItem[], 
    metrics: SortingMetrics
): Promise<void> {
    for (let i = 1; i < arr.length; i++) {
        const key = arr[i];
        let j = i - 1;

        while (j >= 0 && arr[j]. value > key.value) {
            metrics.comparisons++;
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = key; 
    }
}