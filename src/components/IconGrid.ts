import { SortItem } from '../types';

export class IconGrid {
    private container: HTMLElement;

    constructor(containerId: string) {
        this.container = document.getElementById(containerId)!;
    }

    render(items: SortItem[]): void {
        this.container.innerHTML = '';

        const visibleCount = Math.min(items.length, 100);
        const step = Math.max(1, Math.floor(items.length / visibleCount));

        for (let i = 0; i < items.length; i += step) {
            const item = items[i];
            const card = document.createElement('div');
            card.className = 'item-card';
            card.innerHTML = `
              <div class="item-emoji">${item.emoji}</div>
              <div class="item-label">${item.label}</div>
            `;
            this.container.appendChild(card);
        }
    }

    clear(): void {
        this.container.innerHTML = ''; 
    }
}