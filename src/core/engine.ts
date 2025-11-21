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