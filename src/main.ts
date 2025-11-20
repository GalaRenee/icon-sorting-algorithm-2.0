import { ThemeConfig, SortItem, SortingMetrics, AlgorithmResult, AlgorithmName } from './core';
import { getTheme } from './themes';

const ALGORITHM_COLORS: { [key: string]: string } = {
    'insertion': '#FF6B90',
    'merge': '#C77DFF',
    'quick': '#9D4EDD',
    'heap': '#7B2CBF',
    'counting': '#FF8FA3',
    'radix': '#FFB4D6', 
    'bucket': '#FFD60A'
};

class AlgorithmSorter {
    private items: SortItem[] = [];
    private totalElements: number = 500;
    private activeAlgorithms: Set<AlgorithmName> = new Set (['insertion', 'merge', 'quick', 'heap', 'counting', 'radix', 'bucket']);
    private isSorting: boolean = false;
    private algorithmResults: Map<string, AlgorithmResult> = new Map();
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private currentTheme: ThemeConfig;

    constructor() {
        this.currentTheme = getTheme('garden');
        this.canvas = document.getElementById('performanceGraph') as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d')!;
        this.initializeCanvas();
        this.initializeEventListeners();
        this.applyTheme();
        this.generateItems();
        this.renderItems();
        this.updateBucketInfo();
    }

    private initializeCanvas(): void {
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = 400; 
    }

    private initializeCanvas(): void {
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = 400; 
    }

    private initializeEventListeners(): void {
        // Theme selector 
        document.getElementById('themeSelect')!.addEventListener('change', (e) => {
            const themeName = (e.target as HTMLSelectElement).value;
            this.currentTheme = getTheme(themeName);
            this.applyTheme();
            this.generateItems();
            this.renderItems();
            this.updateBucketInfo();
            this.algorithmResults.clear();
            this.drawGraph();
        });

        // Control buttons 
        document.getElementById('startBtn')!.addEventListener('click', () => this.startSorting());
        document.getElementById('shuffleBtn')!.addEventListener('click', () => this.shuffleItems());
        document.getElementById('resetBtn')!.addEventListener('click', () => this.resetSorting());
        document.getElementById('elementCount')!.addEventListener('click', () => (e) => {
            this.totalElements = parseInt((e.target as HTMLSelectElement).value);
            this.generateItems();
            this.renderItems();
            this.updateBucketInfo();
        });

        // Algorithm selection 
        document.querySelectorAll('.algo-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.target as HTMLElement;
                const algo = target.getAttribute('data-algo') as AlgorithmName;
                target.classList.toggle('active');

                if (this.activeAlgorithms.has(algo)) {
                    this.activeAlgorithms.delete(algo);
                } else {
                    this.activeAlgorithms.add(algo);
                }
                this.updateGraphLegend();
            });
        });

        // Select all button
        document.getElementById('selectAllBtn')!.addEventListener('click', () => {
            const allSelected = this.activeAlgorithms.size === 7;
            document.querySelectorAll('.algo-btn').forEach(btn => {
                const algo = btn.getAttribute('data-algo') as AlgorithmName;
                if (allSelected) {
                    btn.classList.remove('active');
                    this.activeAlgorithms.delete(algo);
                } else {
                    btn.classList.add('active');
                    this.activeAlgorithms.add(algo);
                }
            });
            this.updateGraphLegend();
        });

        // Resize canvas on window resize 
        window.addEventListener('resize', () => {
            this.initializeCanvas();
            this.drawGraph();
        });
    }

    private applyTheme(): void {
        const root = document.documentElement;
        root.style.setProperty('--color-primary', this.currentTheme.colors.primary);
        root.style.setProperty('--color-secondary', this.currentTheme.colors.secondary);
        root.style.setProperty('--color-teritary', this.currentTheme.colors.teritary);
        root.style.setProperty('--color-quaternary', this.currentTheme.colors.quaternary);
        root.style.setProperty('--color-accent', this.currentTheme.colors.accent);
        root.style.setProperty('--bg-gradient', this.currentTheme.colors.background);

        // Update title 
        document.getElementById('titlePart1')!.textContent = this.currentTheme.title.part1;
        document.getElementById('titlePart2')!.textContent = this.currentTheme.title.part2;

        // Update subtitle
        document.getElementById('displaySubtitle')!.textContent = this.currentTheme.subtitle;

        // Update theme icons 
        const itemTypes = Object.values(this.currentTheme.items);
        const iconsContainer = document.getElementById('themeIcons')!;
        iconsContainer.innerHTML = `
        <span class="icon">${itemTypes[0].emoji}</span>
        <span class="icon">${itemTypes[1].emoji}</span>
        <span class="icon">${itemTypes[2].emoji}</span> 
        `;

        // Update buckets 
        this.renderBuckets();
    }

    private renderBuckets(): void {
        const container = document.getElementById('bucketsContainer')!;
        container.innerHTML = '';

        Object.entries(this.currentTheme.items).forEach(([key, item]) => {
            const bucket = document.createElement('div');
            bucket.className = 'bucket';
            bucket.style.borderColor = item.bucketColor;
            bucket.innerHTML = `
              <h3 class="bucket-title">${item.label} Box</h3>
              <div class="progress-info">
                <span class="progress-text" id="${key}Progress">0/0 Sorted</span>
              </div>
              <div class="progress-bar-container">
                <div class="progress-bar" id=${key}Bar"></div>
              </div>
              <div class="bucket-icon">${item.emoji}</div>
            `;
            container.appendChild(bucket);
        }); 
    }

    private generateItems(): void {
        this.items = [];
        const itemTypes = Object.entries(this.currentTheme.items);

        for (let i = 0; i < this.totalElements; i++) {
            const [key, item] = itemTypes[Math.floor(Math.random() * itemTypes.length)];
            this.items.push({
                type: key,
                emoji: item.emoji,
                label: item.label,
                value: item.value
            });
        }
    }

    private shuffleItems(): void {
        if (this.isSorting) return;

        for (let i = this.items.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.items[i], this.items[j]] = [this.items[j], this.items[i]];
        }

        this.renderItems();
        this.updateBucketInfo();
    }

    private renderItems(): void {
        const grid = document.getElementById('itemGrid')!;
        grid.innerHTML = '';

        const visibleCount = Math.min(this.items.length, 100);
        const strp = Math.max(1, Math.floor(this.items.length / visibleCount));

        for (let i = 0; i < this.items.length; i += step) {
            const item = this.items[i];
            const card = document.createElement('div');
            card.className = 'item-card';
            card.innerHTML = `
              <div class="item-emoji">${item.emoji}</div>
              <div class="item-label">${item.label}</div>
            `;
            grid.appendChild(card);
        }
    }

    private updateBucketInfo(): void {
        const bucketSize = Math.ceil(this.totalElements / 4);
        Object.keys(this.currentTheme.items).forEach(key => {
            const progressEl = document.getElementById(`${key}Progress`);
            const barEl = document.getElementById(`${key}Bar`) as HTMLElement;
            if (progressEl && barEl) {
                progressEl.textContent = `0/${bucketSize} Sorted`;
                barEl.style.width = '0%';
            }
        });
    }

    private updateBucketProgress(counts: number[]): void {
        const bucketSize = Math.ceil(this.totalElements / 4);
        const keys = Object.keys(this.currentTheme.items);

        keys.forEach((key, index) => {
            const count = Math.min(counts[index], bucketSize);
            const progressEl = document.getElementById(`${key}Bar`) as HTMLElement;
            if (progressEl && barEl) {
                progressEl.textContent = `${count}/${bucketSize} Sorted`;
                const percentage = (count / bucketSize) * 100;
                barEl.style.width = `${percentage}%`;
            }
        });
    }

    private async startSorting(): Promise<void> {
        if (this.isSorting || this.activeAlgorithms.size === 0) return;

        this.isSorting = true;
        this.algorithmResults.clear();
        this.updateGraphLegend();

        const startBtn = document.getElementById('startBtn') as HTMLButtonElement;
        startBtn.disabled = true;
        startBtn.innerHTML = '<span class="btn-icon loading">⏳</span> Sorting...';

        const promises: Promise<AlgorithmResult>[] =[];

        this.activeAlgorithms.forEach(algo => {
            promises.push(this.runAlgorithm(algo));
        });

        this.startGraphAnimation();
        const results = await Promise.all(promises);

        results.forEach(result => {
            this.algorithmResults.set(result.name, result);
        });

        this.isSorting = false; 
        startBtn.disabled = false;
        startBtn.innerHTML = '<span class="btn-icon">▶</span> Start Sorting';

        this.drawGraph();
    }

    private async runAlgorithm(algorithmName: AlgorithmName): Promise<AlgorithmResults> {
        const arrayCopy = [...this.items];
        const startTime = performance.now();
        const metrics: SortingMetrics = {
            comparisons: 0,
            swaps: 0,
            timeElapsed: 0,
            dataPoints: []
        };

        switch (algorithmName) {
            case 'insertion':
                await this.insertionSort(arrayCopy, metrics);
                break;
            case 'merge':
                await this.mergeSort(arrayCopy, 0, arrayCopy.length -1, metrics);
                break;
            case 'quick':
                await this.quickSort(arrayCopy, 0, arrayCopy.length - 1, metrics);
                break;
            case 'heap':
                await this.heapSort(arrayCopy, metrics);
                break;
            case 'counting':
                await this.countingSort(arrayCopy, metrics);
                break;
            case 'radix':
                await this.radixSort(arrayCopy, metrics);
                break;
            case 'bucket':
                await this.bucketSort(arrayCopy, metrics):
                break;
        }

        metrics.timeElapsed = performance.now() - startTime;

        return {
            name: algorithmName,
            metrics,
            completed: true
        };
    }

    // Sorting Algorithms 
    private async insertionSort(arr: SortItem[], metrics: SortingMetrics): Promise<void> {
        const startTime = performance.now();

        for (let i = 1; < arr.length; i++) {
            const key = arr[i];
            let j = i - 1;

            while (j >= 0 && arr[j].value > key.value) {
                metrics.comparisons++;
                arr[j + 1] = arr[j];
                metrics.swaps++;
                j--;

                if (metrics.comparisons % 100 === 0) {
                    const elapsed = performance.now() - startTime;
                    metrics.dataPoints.push({ time: elapsed, operations: metrics.comparisons + metrics.swaps });
                    await this.updateBucketProgress(arr):
                }
            }
            arr[j + 1] = key;
        }

        metrics.dataPoints.push({ time: performance.now() - startTime, operations: metrics.comparisons + metrics.swaps});
    }

    private async mergeSort(arr: SortItem[], left: number, right: number, metrics: SortingMetrics): Promise<void> {
        if (left < right) {
            const mid = Math.floor((left + right) / 2);
            await this.mergeSort(arr, left, mid, metrics);
            await this.mergeSort(arr, mid + 1, right, metrics);
            await this.mergeSort(arr, left, mid, right, metrics);
        }
    }

    private async merge(arr: SortTime[], left: number, mid: number, right: number, metrics: SortingMetrics): Promise<void> {
        const startTime = performance.now();
        const LeftArr = arr.slice(left, mid + 1);
        const rightArr = arr.slice(mid +1, right + 1);

        let i = 0, j = 0, k = left;

        while (i < LeftArr.length && j < rightArr.length) {
            metrics.comparisons++;
            if (leftArr[i].value <= rightArr[j].value) {
                arr[k++] = leftArr[i++];
            } else {
                arr[k++] = rightArr[j++];
            }
            metrics.swaps++;

            if (metrics.comparisons % 100 === 0) {
                const elapsed = performance.now() - startTime;
                metrics.dataPoints.push({ time: elapsed, operations: metrics.comparisons + metrics.swaps });
                await this.updateBucketProgress(arr);
            }
        }

        while (i < LeftArr.length) arr[k++] = leftArr[i++];
        while (j < rightArr.length) arr[k++] = rightArr[j++];
    }

    private async quickSort(arr: SortItem[], low: number, high: number, metrics: SortingMetrics): Promise<void> {
        if (low < high) {
            const pi = await this.partition(arr, low, high, metrics);
            await this.quickSort(arr, low, pi - 1, metrics);
            await this.quickSort(arr, pi + 1, high, metrics);
        }
    }

    private async partition(arr: SortItem[], low: number, high: number, metrics: SortingMetrics): Promise<number> {
        const startTime = performance.now();
        const pivot = arr[high];
        let i = low - 1;

        for (let j = low; j < high; j++) {
            metrics.comparisons++;
            if (arr[j].value < pivot.value) {
                i++;
                [arr[i], arr[j]] = [arr[j], arr[i]];
                metrics.swaps++;
            }

            if (metrics.comparisons % 100 === 0) {
                const elapsed = performance.now() - startTime;
                metrics.dataPoints.push({ time: elapsed, operations: metrics.comparisons + metrics.swaps });
                await this.updateBucketProgress(arr);
            }
        }

        [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
        metrics.swaps++;
        return i + 1; 
    }
    
    private async heapSort(arr: SortItem[], metrics: SortingMetrics): Promise<void> {
        const startTime = performance.now();
        const n = arr.length;

        for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
            await this.heapify(arr, n, i, metrics, startTime);
        }

        for (let i = n - 1; i > 0; i--) {
            [arr[0], arr[i]] = [arr[i], arr[0]];
            metrics.swaps++;
            await this.heapify(arr, n, i, metrics, startTime);
        }
    }
    private async heapify(arr: SortItem[], n: number, i: number, metrics: SortingMetrics, startTime: number): Promise<void> {
        let largest = i;
        const left = 2 * i + 1;
        const right = 2 * i + 2;

        if (left < n) {
            metrics.comparisons++;
            if (arr[left].value > arr[largest].value) {
                largest = left; 
            }
        }

        if (right < n) {
            metrics.comparisons++;
            if (arr[right].value > arr[largest].value) {
                largest = right;
            }
        }

        if (largest !== i) {
            [arr[i], arr[largest]] = [arr[largest], arr[i]];
            metrics.swaps++;

            if (metrics.comparisons % 100 === 0) {
                const elapsed = performance.now() - startTime;
                metrics.dataPoints.push({ time: elapsed, operations: metrics.comparisons + metrics.swaps });
                await this.updateProgress(arr);
            }

            await this.heapify(arr, n, largest, metrics, startTime);
        }
    }

    private async countingSort(arr: SortItem[], metrics: SortingMetrics): Promise<void> {
        const startTime = performance.now();
        const n = arr.length;
        const max = 3;
        const count = new Array(max + 1).fill(0);
        const output = new Array(n);

        for (let i = 0; i < n; i++) {
            count[arr[i].value]++;
            metrics.comparisons++;
        }

        for (let i = 1; i <= max; i++) {
            count[i] += count[i - 1];
            metrics.comparisons++;
        }

        for (let i = n - 1; i >= 0; i--) {
            output[count[arr[i].value] - 1] = arr[i];
            count[arr[i].value]--;
            metrics.swaps++;

            if (metrics.swaps % 100 === 0) {
                const elapsed = performance.now() - startTime;
                metrics.dataPoints.push({ time: elapsed, operations: metrics.comparisons + metrics.swap });
                await this.updateBucketProgress(output);
            }
        }

        for (let i = 0; i < n; i++) {
            arr[i] = output[i];
        }

        metrics.dataPoints.push({ time: performance.now() - startTime, operations: metrics.comparisons + metrics.swaps });
    }

    private async radixSort(arr: SortItem[], metrics: SortingMetrics): Promise<void> {
        const startTime = performance.now();
        await this.countingSortForRadix(arr, 1, metrics, startTime);
        metrics.dataPoints.push({ time: performance.now() - startTime, operations: metrics.comparisons + metrics.swap });
    }

    private async radixSort(arr: SortItem[], metrics: SortingMetrics): Promise<void> {
        const startTime = performance.now();
        await this.countingSortForRadix(arr, 1, metrics, startTime);
        metrics.dataPoints.push({ time: performance.now() - startTime, operations: metrics.comparisons + metrics.swaps });
    }

    private async countingSortForRadix(arr: SortItem[], exp: number, metrics: SortingMetrics, startTime: number): Promise<void> {
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

            if (metrics.swaps % 100 === 0) {
                const elapsed = performance.now() - startTime;
                metrics.dataPoints.push({ time: elapsed, operations: metrics.comparisons + metrics.swaps });
            }
        }

        private async bucketSort(arr: SortItem[], metrics: SortingMetrics): Promise<void> {
            const startTime = performance.now();
            const n = arr.length;
            const bucketCount = 4;
            const buckets: sortItem[][] = Array.from({ length: bucketCount }, () => []);


            for (let i = 0; i < n; i++) {
                buckets[arr[i].value].push(arr[i]);
                metrics.comparisons++;
            }

            let index = 0;
            for (let i = 0; i < bucketCount; i++) {
                await this.insertionSortForBucket(buckets[i], metrics);

                for (let j = 0; j < buckets[i].length; j++) {
                    arr[index++] = buckets[i][j];
                    metrics.swaps++;

                if (metrics.swaps % 100 === 0) {
                    const elapsed = performance.now() - startTime;
                    metrics.dataPoints.push({ time: elapsed, operations: metrics.comparisons + metrics.swaps });
                    await this.updateBucketProgress(arr);
                }
                }
            }

            metrics.dataPoint.push({ time: performance.now() - startTime, operations: metrics.comparisons + metrics.swaps });
        }

        private async inerstionSortForBucket(arr: SortItem[], metrics: SortingMetrics): Promise<void> {
          for (let i = 1; i < arr.length; i++) {
            const key = arr[i];
            let j = i - 1; 

            while (j >= 0 && arr[j].value > key.value) {
                metrics.comparisons++;
                arr[j + 1] = arr[j];
                j--;
            }
            arr[j + 1] = key;
          }
        }

        private async updateProgress(arr: SortItem[]): Promise<void> {
            const counts = [0, 0, 0, 0]:
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

            this.updateBucketProgress(counts);

            if (this.items.length < 1000) {
                await new Promise(resolve => setTimeout(resolve, 1));
            }
        }

        private startGraphAnimation(): void {
            const animate = () => {
                this.drawGraph();
                if (this.isSorting) {
                    requestAnimationFrame(animate);
                }
            };
            animate();
        }

        private drawGraph(): void {
            const ctx = this.ctx;
            const width = this.canvas.width;
            const height = this.canvas.height;

            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, width, height);

            ctx.strokeStyle = '#f0f0f0';
            ctx.lineWidth = 1; 

            for(let i = 0; i <= 10; i++) {
                const y = (height / 10) * 1;
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(width, y);
                ctx.stroke();
            }

            for (let i = 0; i <= 10; i++) {
                const y = (height / 10) * i;
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(width, y);
                ctx.stroke();
            }

            let maxTime = 0;
            let maxOps = 0;

            this.algorithmResults.forEach(result => {
                result.metrics.dataPoints.forEach(point => {
                    maxTime = Math.max(maxTime, point.time);
                    maxOps = Math.max(maxOps, point.operations);
                });
            });

            if (maxTime === 0 || maxOps === 0) return ;

            this.algorithmResults.forEach(result => {
                const color = ALGORITHM_COLORS[result.name];
                ctx.strokeStyle = color;
                ctx.lineWidth = 3;
                ctx.beginPath();

                result.metrics.dataPoints.forEach((point, index) => {
                    const x = (point.time / maxTime) * width;
                    const y = height - (point.operations / maxOps) * height;

                    if (index === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                });

                ctx.stroke();
            });

            ctx.fillStyle = this.currentTheme.colors.quaternary;
            ctx.font = '12px Arial';
            ctx.fillText('Time (mx)', width - 80, height - 10);
            ctx.save();
            ctx.translate(15, height / 2);
            ctx.rotate(-Math.PI / 2);
            ctx.fillText('Operations', 0, 0);
            ctx.restore();
        }

        private updateGraphLegend(): void {
            const legend = document.getElementById('graphLegend')!;
            legend.innerHTML = '';

            this.activeAlgorithms.forEach(algo => {
                const item = document.createElement('div');
                item.className = 'legend-item';
                item.innerHTML = `
                <div class="legend-color" style="background-color: ${ALGORITHM_COLORS[algo]}"></div>
                <span>${this.getAlgorithmDisplayName(algo)}</span>
                `;
                legend.appendChild(item);
            });
        }

        private getAlgorithmDisplayName(algo: string): string {
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

        private resetSorting(): void {
            if (this.isSorting) return;

            this.algorithmResults.clear();
            this.generateItems();
            this.renderItems();
            this.updateBucketInfo();
            this.drawGraph();
            this.updateGraphLegend();
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        new AlgorithmSorter();
    });
}

=======
import { ThemeConfig, SortItem, SortingMetrics, AlgorithmResult, AlgorithmName } from './types';
import { getTheme } from './themes';

const ALGORITHM_COLORS: { [key: string]: string } = {
    'insertion': '#FF6B90',
    'merge': '#C77DFF',
    'quick': '#9D4EDD',
    'heap': '#7B2CBF',
    'counting': '#FF8FA3',
    'radix': '#FFB4D6', 
    'bucket': '#FFD60A'
};

class AlgorithmSorter {
    private items: SortItem[] = [];
    private totalElements: number = 500;
    private activeAlgorithms: Set<AlgorithmName> = new Set (['insertion', 'merge', 'quick', 'heap', 'counting', 'radix', 'bucket']);
    private isSorting: boolean = false;
    private algorithmResults: Map<string, AlgorithmResult> = new Map();
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private currentTheme: ThemeConfig;

    constructor() {
        this.currentTheme = getTheme('garden');
        this.canvas = document.getElementById('performanceGraph') as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d')!;
        this.initializeCanvas();
        this.initializeEventListeners();
        this.applyTheme();
        this.generateItems();
        this.renderItems();
        this.updateBucketInfo();
    }

    private initializeCanvas(): void {
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = 400; 
    }

    private initializeCanvas(): void {
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = 400; 
    }

    private initializeEventListeners(): void {
        // Theme selector 
        document.getElementById('themeSelect')!.addEventListener('change', (e) => {
            const themeName = (e.target as HTMLSelectElement).value;
            this.currentTheme = getTheme(themeName);
            this.applyTheme();
            this.generateItems();
            this.renderItems();
            this.updateBucketInfo();
            this.algorithmResults.clear();
            this.drawGraph();
        });

        // Control buttons 
        document.getElementById('startBtn')!.addEventListener('click', () => this.startSorting());
        document.getElementById('shuffleBtn')!.addEventListener('click', () => this.shuffleItems());
        document.getElementById('resetBtn')!.addEventListener('click', () => this.resetSorting());
        document.getElementById('elementCount')!.addEventListener('click', () => (e) => {
            this.totalElements = parseInt((e.target as HTMLSelectElement).value);
            this.generateItems();
            this.renderItems();
            this.updateBucketInfo();
        });

        // Algorithm selection 
        document.querySelectorAll('.algo-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.target as HTMLElement;
                const algo = target.getAttribute('data-algo') as AlgorithmName;
                target.classList.toggle('active');

                if (this.activeAlgorithms.has(algo)) {
                    this.activeAlgorithms.delete(algo);
                } else {
                    this.activeAlgorithms.add(algo);
                }
                this.updateGraphLegend();
            });
        });

        // Select all button
        document.getElementById('selectAllBtn')!.addEventListener('click', () => {
            const allSelected = this.activeAlgorithms.size === 7;
            document.querySelectorAll('.algo-btn').forEach(btn => {
                const algo = btn.getAttribute('data-algo') as AlgorithmName;
                if (allSelected) {
                    btn.classList.remove('active');
                    this.activeAlgorithms.delete(algo);
                } else {
                    btn.classList.add('active');
                    this.activeAlgorithms.add(algo);
                }
            });
            this.updateGraphLegend();
        });

        // Resize canvas on window resize 
        window.addEventListener('resize', () => {
            this.initializeCanvas();
            this.drawGraph();
        });
    }

    private applyTheme(): void {
        const root = document.documentElement;
        root.style.setProperty('--color-primary', this.currentTheme.colors.primary);
        root.style.setProperty('--color-secondary', this.currentTheme.colors.secondary);
        root.style.setProperty('--color-teritary', this.currentTheme.colors.teritary);
        root.style.setProperty('--color-quaternary', this.currentTheme.colors.quaternary);
        root.style.setProperty('--color-accent', this.currentTheme.colors.accent);
        root.style.setProperty('--bg-gradient', this.currentTheme.colors.background);

        // Update title 
        document.getElementById('titlePart1')!.textContent = this.currentTheme.title.part1;
        document.getElementById('titlePart2')!.textContent = this.currentTheme.title.part2;

        // Update subtitle
        document.getElementById('displaySubtitle')!.textContent = this.currentTheme.subtitle;

        // Update theme icons 
        const itemTypes = Object.values(this.currentTheme.items);
        const iconsContainer = document.getElementById('themeIcons')!;
        iconsContainer.innerHTML = `
        <span class="icon">${itemTypes[0].emoji}</span>
        <span class="icon">${itemTypes[1].emoji}</span>
        <span class="icon">${itemTypes[2].emoji}</span> 
        `;

        // Update buckets 
        this.renderBuckets();
    }

    private renderBuckets(): void {
        const container = document.getElementById('bucketsContainer')!;
        container.innerHTML = '';

        Object.entries(this.currentTheme.items).forEach(([key, item]) => {
            const bucket = document.createElement('div');
            bucket.className = 'bucket';
            bucket.style.borderColor = item.bucketColor;
            bucket.innerHTML = `
              <h3 class="bucket-title">${item.label} Box</h3>
              <div class="progress-info">
                <span class="progress-text" id="${key}Progress">0/0 Sorted</span>
              </div>
              <div class="progress-bar-container">
                <div class="progress-bar" id=${key}Bar"></div>
              </div>
              <div class="bucket-icon">${item.emoji}</div>
            `;
            container.appendChild(bucket);
        }); 
    }

    private generateItems(): void {
        this.items = [];
        const itemTypes = Object.entries(this.currentTheme.items);

        for (let i = 0; i < this.totalElements; i++) {
            const [key, item] = itemTypes[Math.floor(Math.random() * itemTypes.length)];
            this.items.push({
                type: key,
                emoji: item.emoji,
                label: item.label,
                value: item.value
            });
        }
    }

    private shuffleItems(): void {
        if (this.isSorting) return;

        for (let i = this.items.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.items[i], this.items[j]] = [this.items[j], this.items[i]];
        }

        this.renderItems();
        this.updateBucketInfo();
    }

    private renderItems(): void {
        const grid = document.getElementById('itemGrid')!;
        grid.innerHTML = '';

        const visibleCount = Math.min(this.items.length, 100);
        const strp = Math.max(1, Math.floor(this.items.length / visibleCount));

        for (let i = 0; i < this.items.length; i += step) {
            const item = this.items[i];
            const card = document.createElement('div');
            card.className = 'item-card';
            card.innerHTML = `
              <div class="item-emoji">${item.emoji}</div>
              <div class="item-label">${item.label}</div>
            `;
            grid.appendChild(card);
        }
    }

    private updateBucketInfo(): void {
        const bucketSize = Math.ceil(this.totalElements / 4);
        Object.keys(this.currentTheme.items).forEach(key => {
            const progressEl = document.getElementById(`${key}Progress`);
            const barEl = document.getElementById(`${key}Bar`) as HTMLElement;
            if (progressEl && barEl) {
                progressEl.textContent = `0/${bucketSize} Sorted`;
                barEl.style.width = '0%';
            }
        });
    }

    private updateBucketProgress(counts: number[]): void {
        const bucketSize = Math.ceil(this.totalElements / 4);
        const keys = Object.keys(this.currentTheme.items);

        keys.forEach((key, index) => {
            const count = Math.min(counts[index], bucketSize);
            const progressEl = document.getElementById(`${key}Bar`) as HTMLElement;
            if (progressEl && barEl) {
                progressEl.textContent = `${count}/${bucketSize} Sorted`;
                const percentage = (count / bucketSize) * 100;
                barEl.style.width = `${percentage}%`;
            }
        });
    }

    private async startSorting(): Promise<void> {
        if (this.isSorting || this.activeAlgorithms.size === 0) return;

        this.isSorting = true;
        this.algorithmResults.clear();
        this.updateGraphLegend();

        const startBtn = document.getElementById('startBtn') as HTMLButtonElement;
        startBtn.disabled = true;
        startBtn.innerHTML = '<span class="btn-icon loading">⏳</span> Sorting...';

        const promises: Promise<AlgorithmResult>[] =[];

        this.activeAlgorithms.forEach(algo => {
            promises.push(this.runAlgorithm(algo));
        });

        this.startGraphAnimation();
        const results = await Promise.all(promises);

        results.forEach(result => {
            this.algorithmResults.set(result.name, result);
        });

        this.isSorting = false; 
        startBtn.disabled = false;
        startBtn.innerHTML = '<span class="btn-icon">▶</span> Start Sorting';

        this.drawGraph();
    }

    private async runAlgorithm(algorithmName: AlgorithmName): Promise<AlgorithmResults> {
        const arrayCopy = [...this.items];
        const startTime = performance.now();
        const metrics: SortingMetrics = {
            comparisons: 0,
            swaps: 0,
            timeElapsed: 0,
            dataPoints: []
        };

        switch (algorithmName) {
            case 'insertion':
                await this.insertionSort(arrayCopy, metrics);
                break;
            case 'merge':
                await this.mergeSort(arrayCopy, 0, arrayCopy.length -1, metrics);
                break;
            case 'quick':
                await this.quickSort(arrayCopy, 0, arrayCopy.length - 1, metrics);
                break;
            case 'heap':
                await this.heapSort(arrayCopy, metrics);
                break;
            case 'counting':
                await this.countingSort(arrayCopy, metrics);
                break;
            case 'radix':
                await this.radixSort(arrayCopy, metrics);
                break;
            case 'bucket':
                await this.bucketSort(arrayCopy, metrics):
                break;
        }

        metrics.timeElapsed = performance.now() - startTime;

        return {
            name: algorithmName,
            metrics,
            completed: true
        };
    }

    // Sorting Algorithms 
    private async insertionSort(arr: SortItem[], metrics: SortingMetrics): Promise<void> {
        const startTime = performance.now();

        for (let i = 1; < arr.length; i++) {
            const key = arr[i];
            let j = i - 1;

            while (j >= 0 && arr[j].value > key.value) {
                metrics.comparisons++;
                arr[j + 1] = arr[j];
                metrics.swaps++;
                j--;

                if (metrics.comparisons % 100 === 0) {
                    const elapsed = performance.now() - startTime;
                    metrics.dataPoints.push({ time: elapsed, operations: metrics.comparisons + metrics.swaps });
                    await this.updateBucketProgress(arr):
                }
            }
            arr[j + 1] = key;
        }

        metrics.dataPoints.push({ time: performance.now() - startTime, operations: metrics.comparisons + metrics.swaps});
    }

    private async mergeSort(arr: SortItem[], left: number, right: number, metrics: SortingMetrics): Promise<void> {
        if (left < right) {
            const mid = Math.floor((left + right) / 2);
            await this.mergeSort(arr, left, mid, metrics);
            await this.mergeSort(arr, mid + 1, right, metrics);
            await this.mergeSort(arr, left, mid, right, metrics);
        }
    }

    private async merge(arr: SortTime[], left: number, mid: number, right: number, metrics: SortingMetrics): Promise<void> {
        const startTime = performance.now();
        const LeftArr = arr.slice(left, mid + 1);
        const rightArr = arr.slice(mid +1, right + 1);

        let i = 0, j = 0, k = left;

        while (i < LeftArr.length && j < rightArr.length) {
            metrics.comparisons++;
            if (leftArr[i].value <= rightArr[j].value) {
                arr[k++] = leftArr[i++];
            } else {
                arr[k++] = rightArr[j++];
            }
            metrics.swaps++;

            if (metrics.comparisons % 100 === 0) {
                const elapsed = performance.now() - startTime;
                metrics.dataPoints.push({ time: elapsed, operations: metrics.comparisons + metrics.swaps });
                await this.updateBucketProgress(arr);
            }
        }

        while (i < LeftArr.length) arr[k++] = leftArr[i++];
        while (j < rightArr.length) arr[k++] = rightArr[j++];
    }

    private async quickSort(arr: SortItem[], low: number, high: number, metrics: SortingMetrics): Promise<void> {
        if (low < high) {
            const pi = await this.partition(arr, low, high, metrics);
            await this.quickSort(arr, low, pi - 1, metrics);
            await this.quickSort(arr, pi + 1, high, metrics);
        }
    }

    private async partition(arr: SortItem[], low: number, high: number, metrics: SortingMetrics): Promise<number> {
        const startTime = performance.now();
        const pivot = arr[high];
        let i = low - 1;

        for (let j = low; j < high; j++) {
            metrics.comparisons++;
            if (arr[j].value < pivot.value) {
                i++;
                [arr[i], arr[j]] = [arr[j], arr[i]];
                metrics.swaps++;
            }

            if (metrics.comparisons % 100 === 0) {
                const elapsed = performance.now() - startTime;
                metrics.dataPoints.push({ time: elapsed, operations: metrics.comparisons + metrics.swaps });
                await this.updateBucketProgress(arr);
            }
        }

        [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
        metrics.swaps++;
        return i + 1; 
    }
    
    private async heapSort(arr: SortItem[], metrics: SortingMetrics): Promise<void> {
        const startTime = performance.now();
        const n = arr.length;

        for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
            await this.heapify(arr, n, i, metrics, startTime);
        }

        for (let i = n - 1; i > 0; i--) {
            [arr[0], arr[i]] = [arr[i], arr[0]];
            metrics.swaps++;
            await this.heapify(arr, n, i, metrics, startTime);
        }
    }
    private async heapify(arr: SortItem[], n: number, i: number, metrics: SortingMetrics, startTime: number): Promise<void> {
        let largest = i;
        const left = 2 * i + 1;
        const right = 2 * i + 2;

        if (left < n) {
            metrics.comparisons++;
            if (arr[left].value > arr[largest].value) {
                largest = left; 
            }
        }

        if (right < n) {
            metrics.comparisons++;
            if (arr[right].value > arr[largest].value) {
                largest = right;
            }
        }

        if (largest !== i) {
            [arr[i], arr[largest]] = [arr[largest], arr[i]];
            metrics.swaps++;

            if (metrics.comparisons % 100 === 0) {
                const elapsed = performance.now() - startTime;
                metrics.dataPoints.push({ time: elapsed, operations: metrics.comparisons + metrics.swaps });
                await this.updateProgress(arr);
            }

            await this.heapify(arr, n, largest, metrics, startTime);
        }
    }

    private async countingSort(arr: SortItem[], metrics: SortingMetrics): Promise<void> {
        const startTime = performance.now();
        const n = arr.length;
        const max = 3;
        const count = new Array(max + 1).fill(0);
        const output = new Array(n);

        for (let i = 0; i < n; i++) {
            count[arr[i].value]++;
            metrics.comparisons++;
        }

        for (let i = 1; i <= max; i++) {
            count[i] += count[i - 1];
            metrics.comparisons++;
        }

        for (let i = n - 1; i >= 0; i--) {
            output[count[arr[i].value] - 1] = arr[i];
            count[arr[i].value]--;
            metrics.swaps++;

            if (metrics.swaps % 100 === 0) {
                const elapsed = performance.now() - startTime;
                metrics.dataPoints.push({ time: elapsed, operations: metrics.comparisons + metrics.swap });
                await this.updateBucketProgress(output);
            }
        }

        for (let i = 0; i < n; i++) {
            arr[i] = output[i];
        }

        metrics.dataPoints.push({ time: performance.now() - startTime, operations: metrics.comparisons + metrics.swaps });
    }

    private async radixSort(arr: SortItem[], metrics: SortingMetrics): Promise<void> {
        const startTime = performance.now();
        await this.countingSortForRadix(arr, 1, metrics, startTime);
        metrics.dataPoints.push({ time: performance.now() - startTime, operations: metrics.comparisons + metrics.swap });
    }

    private async radixSort(arr: SortItem[], metrics: SortingMetrics): Promise<void> {
        const startTime = performance.now();
        await this.countingSortForRadix(arr, 1, metrics, startTime);
        metrics.dataPoints.push({ time: performance.now() - startTime, operations: metrics.comparisons + metrics.swaps });
    }

    private async countingSortForRadix(arr: SortItem[], exp: number, metrics: SortingMetrics, startTime: number): Promise<void> {
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

            if (metrics.swaps % 100 === 0) {
                const elapsed = performance.now() - startTime;
                metrics.dataPoints.push({ time: elapsed, operations: metrics.comparisons + metrics.swaps });
            }
        }

        private async bucketSort(arr: SortItem[], metrics: SortingMetrics): Promise<void> {
            const startTime = performance.now();
            const n = arr.length;
            const bucketCount = 4;
            const buckets: sortItem[][] = Array.from({ length: bucketCount }, () => []);


            for (let i = 0; i < n; i++) {
                buckets[arr[i].value].push(arr[i]);
                metrics.comparisons++;
            }

            let index = 0;
            for (let i = 0; i < bucketCount; i++) {
                await this.insertionSortForBucket(buckets[i], metrics);

                for (let j = 0; j < buckets[i].length; j++) {
                    arr[index++] = buckets[i][j];
                    metrics.swaps++;

                if (metrics.swaps % 100 === 0) {
                    const elapsed = performance.now() - startTime;
                    metrics.dataPoints.push({ time: elapsed, operations: metrics.comparisons + metrics.swaps });
                    await this.updateBucketProgress(arr);
                }
                }
            }

            metrics.dataPoint.push({ time: performance.now() - startTime, operations: metrics.comparisons + metrics.swaps });
        }

        private async inerstionSortForBucket(arr: SortItem[], metrics: SortingMetrics): Promise<void> {
          for (let i = 1; i < arr.length; i++) {
            const key = arr[i];
            let j = i - 1; 

            while (j >= 0 && arr[j].value > key.value) {
                metrics.comparisons++;
                arr[j + 1] = arr[j];
                j--;
            }
            arr[j + 1] = key;
          }
        }

        private async updateProgress(arr: SortItem[]): Promise<void> {
            const counts = [0, 0, 0, 0]:
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

            this.updateBucketProgress(counts);

            if (this.items.length < 1000) {
                await new Promise(resolve => setTimeout(resolve, 1));
            }
        }

        private startGraphAnimation(): void {
            const animate = () => {
                this.drawGraph();
                if (this.isSorting) {
                    requestAnimationFrame(animate);
                }
            };
            animate();
        }

        private drawGraph(): void {
            const ctx = this.ctx;
            const width = this.canvas.width;
            const height = this.canvas.height;

            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, width, height);

            ctx.strokeStyle = '#f0f0f0';
            ctx.lineWidth = 1; 

            for(let i = 0; i <= 10; i++) {
                const y = (height / 10) * 1;
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(width, y);
                ctx.stroke();
            }

            for (let i = 0; i <= 10; i++) {
                const y = (height / 10) * i;
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(width, y);
                ctx.stroke();
            }

            let maxTime = 0;
            let maxOps = 0;

            this.algorithmResults.forEach(result => {
                result.metrics.dataPoints.forEach(point => {
                    maxTime = Math.max(maxTime, point.time);
                    maxOps = Math.max(maxOps, point.operations);
                });
            });

            if (maxTime === 0 || maxOps === 0) return ;

            this.algorithmResults.forEach(result => {
                const color = ALGORITHM_COLORS[result.name];
                ctx.strokeStyle = color;
                ctx.lineWidth = 3;
                ctx.beginPath();

                result.metrics.dataPoints.forEach((point, index) => {
                    const x = (point.time / maxTime) * width;
                    const y = height - (point.operations / maxOps) * height;

                    if (index === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                });

                ctx.stroke();
            });

            ctx.fillStyle = this.currentTheme.colors.quaternary;
            ctx.font = '12px Arial';
            ctx.fillText('Time (mx)', width - 80, height - 10);
            ctx.save();
            ctx.translate(15, height / 2);
            ctx.rotate(-Math.PI / 2);
            ctx.fillText('Operations', 0, 0);
            ctx.restore();
        }

        private updateGraphLegend(): void {
            const legend = document.getElementById('graphLegend')!;
            legend.innerHTML = '';

            this.activeAlgorithms.forEach(algo => {
                const item = document.createElement('div');
                item.className = 'legend-item';
                item.innerHTML = `
                <div class="legend-color" style="background-color: ${ALGORITHM_COLORS[algo]}"></div>
                <span>${this.getAlgorithmDisplayName(algo)}</span>
                `;
                legend.appendChild(item);
            });
        }

        private getAlgorithmDisplayName(algo: string): string {
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

        private resetSorting(): void {
            if (this.isSorting) return;

            this.algorithmResults.clear();
            this.generateItems();
            this.renderItems();
            this.updateBucketInfo();
            this.drawGraph();
            this.updateGraphLegend();
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        new AlgorithmSorter();
    });
}

>>>>>>> 8abeb0120aff34e33ce0c31eeb27fcecb6b60b3b
