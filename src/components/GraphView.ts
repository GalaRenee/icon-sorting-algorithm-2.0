import { AlgorithmResult } from '../types';
import { ALGORITHM_COLORS, getAlgorithmDisplayName } from '../core/utils';

export class GraphView {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private legendContainer: HTMLElement;

    constructor(canvasId: string, legendId: string) {
        this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d')!;
        this.legendContainer = document.getElementById(legendId)!;
        this.initializeCanvas();

        window.addEventListener('resize', () => {
            this.initializeCanvas();
            this.draw(new Map());
        });
    }

    private initializeCanvas(): void {
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = 400; 
    }

    updateLegend(activeAlgorithms: Set<string>): void {
        this.legendContainer.innerHTML = '';

        activeAlgorithms.forEach(algo => {
            const item = document.createElement('div');
            item.className = 'legend-item';
            item.innerHTML = `
               <div class="legend-color" style="background-color: ${ALGORITHM_COLORS[algo]}"></div>
               <span>${getAlgorithmDisplayName(algo)}</span>
            `;
            this.legendContainer.appendChild(item);
        });
    }

    draw(results: Map<string, AlgorithmResult>, quaternaryColor: string = '#7B2CBF'): void {
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;

        // Clear canvas 
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, width, height);

        // Draw grid
        ctx.strokeStyle = '#f0f0f0';
        ctx.lineWidth = 1; 

        for (let i = 0; i <= 10; i++) {
            const y = (height / 10) * i;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }

        for (let i = 0; i <= 10; i++) {
            const x = (width / 10) * i;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }

        // Find max values for scaling 
        let maxTime = 0;
        let maxOps = 0;

        results.forEach(result => {
            result.metrics.dataPoints.forEach(point => {
                maxTime = Math.max(maxTime, point.time);
                maxOps = Math.max(maxOps, point.operations);
            });
        });

        if (maxTime === 0 || maxOps === 0) return;

        // Draw algorithm lines 
        results.forEach(result => {
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

        // Draw axes labels 
        ctx.fillStyle = quaternaryColor;
        ctx.font = '12px Arial';
        ctx.fillText('Time (ms)', width - 80, height - 10);
        ctx.save();
        ctx.translate(15, height / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('Operations', 0, 0);
        ctx.restore();
    }

    clear(): void {
        this.draw(new Map());
    }
}
