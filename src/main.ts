import { ThemeConfig, SortItem, AlgorithmResult, AlgorithmName } from './types';
import { getTheme } from './core';
import { generateItems, shuffleArray } from './core/utils';
import { runAlgorithm } from './core/algos/engine';
import { IconGrid } from './components/IconGrid';
import { BucketView } from './components/BucketView';
import { GraphView } from './components/GraphView';


class AlgorithmSorter {
    private items: SortItem[] = [];
    private totalElements: number = 500;
    private activeAlgorithms: Set<AlgorithmName> = new Set (['insertion', 'merge', 'quick', 'heap', 'counting', 'radix', 'bucket']);
    private isSorting: boolean = false;
    private algorithmResults: Map<string, AlgorithmResult> = new Map();
    private currentTheme: ThemeConfig;

    // Components 
    private iconGrid: IconGrid;
    private bucketView: BucketView;
    private graphView: GraphView; 


    constructor() {
        this.currentTheme = getTheme('garden');

        // Initialize components 
        this.iconGrid = new IconGrid('itemGrid');
        this.bucketView = new BucketView('bucketsContainer');
        this.graphView = new GraphView('performanceGraph', 'graphLegend'); 


        this.initializeEventListeners();
        this.applyTheme();
        this.generateItems();
        this.renderItems();
        this.updateBucketInfo();
        this.graphView.updateLegend(this.activeAlgorithms);
    }

    private initializeEventListeners(): void {
        // Theme selector 
        const themeSelect = document.getElementById('themeSelect') as HTMLSelectElement;
        themeSelect.addEventListener('change', (e) => {
            const themeName = (e.target as HTMLSelectElement).value;
            this.currentTheme = getTheme(themeName);
            this.applyTheme();
            this.generateItems();
            this.renderItems();
            this.updateBucketInfo();
            this.algorithmResults.clear();
            this.graphView.clear();
        }); 

        // Control buttons 
        const startBTN = document.getElementById('startBtn')!;
        startBTN.addEventListener('click', () => this.startSorting()); 

        const shuffleBtn = document.getElementById('shuffleBtn')!;
        shuffleBtn.addEventListener('click', () => this.shuffleItems()); 

        const resetBtn = document.getElementById('resetBtn')!;
        resetBtn.addEventListener('click', () => this.resetSorting()); 

        const elementCount = document.getElementById('elementCount') as HTMLSelectElement;
        elementCount.addEventListener('change', (e) => {
            this.totalElements = parseInt((e.target as HTMLSelectElement).value);
            this.generateItems();
            this.renderItems();
            this.updateBucketInfo();
        }); 

        // Algorithm selection 
        const algoBtns = document.querySelectorAll('.algo-btn');
        algoBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.target as HTMLElement;
                const algo = target.getAttribute('data-algo') as AlgorithmName;
                target.classList.toggle('active');

                if (this.activeAlgorithms.has(algo)) {
                    this.activeAlgorithms.delete(algo);
                } else {
                    this.activeAlgorithms.add(algo);
                }
                this.graphView.updateLegend(this.activeAlgorithms);
            });
        });

        // Select all button 
        const selectAllBtn = document.getElementById('selectAllBtn')!;
        selectAllBtn.addEventListener('click', () => {
            const allSelected = this.activeAlgorithms.size === 7;
            algoBtns.forEach(btn => {
                const algo = btn.getAttribute('data-algo') as AlgorithmName;
                if (allSelected) {
                    btn.classList.remove('active');
                    this.activeAlgorithms.delete(algo);
                } else {
                    btn.classList.add('active');
                    this.activeAlgorithms.add(algo);
                }
            });
            this.graphView.updateLegend(this.activeAlgorithms);
        });
    }

    private applyTheme(): void {
        const root = document.documentElement;
        root.style.setProperty('--color-primary', this.currentTheme.colors.primary);
        root.style.setProperty('--color-secondary', this.currentTheme.colors.secondary);
        root.style.setProperty('--color-tertiary', this.currentTheme.colors.teritary);
        root.style.setProperty('--color-quaternary', this.currentTheme.colors.quaternary);
        root.style.setProperty('--color-accent', this.currentTheme.colors.accent);
        root.style.setProperty('--bg-gradient', this.currentTheme.colors.background); 

        // Update title 
        const titlePart1 = document.getElementById('titlePart1')!;
        const titlePart2 = document.getElementById('titlePart2')!;
        titlePart1.textContent = this.currentTheme.title.part1;
        titlePart2.textContent = this.currentTheme.title.part2; 

        // Update subtitle
        const displaySubtitle = document.getElementById('displaySubtitle')!;
        displaySubtitle.textContent = this.currentTheme.subtitle;

        // Update theme icons 
        const itemTypes = Object.values(this.currentTheme.items);
        const iconsContainer = document.getElementById('themeIcons')!;
        iconsContainer.innerHTML = `
           <span class="icon">${itemTypes[0].emoji}</span> 
           <span class="icon">${itemTypes[1].emoji}</span>
           <span class="icon">${itemTypes[2].emoji}</span> 
        `;

        // Update buckets 
        this.bucketView.render(this.currentTheme, this.totalElements);
    }

    private generateItems(): void {
        this.items = generateItems(this.totalElements, this.currentTheme);
    }

    private shuffleItems(): void {
        if (this.isSorting) return;
        this.items = shuffleArray(this.items);
        this.renderItems();
        this.updateBucketInfo();
    }

    private renderItems(): void {
        this.iconGrid.render(this.items);
    }

    private updateBucketInfo(): void {
        this.bucketView.reset();
    }

    private async startSorting(): Promise<void> {
        if (this.isSorting || this.activeAlgorithms.size === 0) return; 

        this.isSorting = true;
        this.algorithmResults.clear();
        this.graphView.updateLegend(this.activeAlgorithms);

        const startBtn = document.getElementById('startBtn') as HTMLButtonElement;
        startBtn.disabled = true;
        startBtn.innerHTML = '<span class="btn-icon loading">⏳</span> Sorting...';

        const promises: Promise<AlgorithmResult>[] = [];

        this.activeAlgorithms.forEach(algo => {
            promises.push(
                runAlgorithm(algo, this.items, (counts) => {
                    this.bucketView.updateProgress(counts);
                })
            );
        });

        this.startGraphAnimation();

        const results = await Promise.all(promises);

        results.forEach(result => {
            this.algorithmResults.set(result.name, result);
        }); 

        this.isSorting = false; 
        startBtn.disabled = false; 
        startBtn.innerHTML = '<span class="btn-icon">▶</span> Start Sorting';

        this.graphView.draw(this.algorithmResults, this.currentTheme.colors.quaternary);
    }

    private startGraphAnimation(): void {
        const animate = () => {
            this.graphView.draw(this.algorithmResults, this.currentTheme.colors.quaternary);
            if (this.isSorting) {
                requestAnimationFrame(animate); 
            }
        };
        animate();
    }

    private resetSorting(): void {
        if (this.isSorting) return;

        this.algorithmResults.clear();
        this.generateItems();
        this.renderItems();
        this.updateBucketInfo();
        this.graphView.clear();
        this.graphView.updateLegend(this.activeAlgorithms);
    }
}

// Initialize the application when DOM is loaded 
document.addEventListener('DOMContentLoaded', () => {
    new AlgorithmSorter();
}); 