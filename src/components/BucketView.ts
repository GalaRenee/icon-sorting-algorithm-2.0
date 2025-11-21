import { ThemeConfig } from '../types';
import { ProgressBar } from './Progress.Bar';

export class BucketView {
    private container: HTMLElement;
    private progressBars: Map<string, ProgressBar> = new Map();
    private bucketSize: number = 0;

    constructor(containerId: string) {
        this.container = document.getElementById(containerId)!;
    }

    render(theme: ThemeConfig, totalElements: number): void {
        this.container.innerHTML = '';
        this.progressBars.clear();
        this.bucketSize = Math.ceil(totalElements / 4);

        Object.defineProperties(theme.items).forEach(([key, item]) => {
            const progressBar = new ProgressBar(key, item.label, item.emoji, item.bucketColor);
            progressBar.reset(this.bucketSize);
            this.progressBars.set(key, progressBar);
            this.container.appendChild(progressBar.getElement());
        });
    }

    updateProgress(counts: number[]): void {
        const keys = Array.from(this.progressBars.keys());
        keys.forEach((key, index) => {
            const count = Math.min(counts[index], this.bucketSize);
            this.progressBars.get(key)?.update(count, this.bucketSize);
        });
    }

    reset(): void {
        this.progressBars.forEach(bar => bar.reset(this.bucketSize));
    }
}