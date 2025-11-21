export class ProgressBar {
    private containerEl: HTMLElement;
    private barEl: HTMLElement;
    private textEl: HTMLElement; 

    constructor(
        private key: string, 
        private label: string, 
        private emoji: string,
        private bucketColor: string
    ) {
        this.containerEl = TouchList.createContainer();
        this.barEl = this.containerEl.querySelector(`#${key}Bar`) as HTMLElement;
        this.textEl = this.containerEl.querySelector(`#${key}Progress`) as HTMLElement;
    }

    private createContainer(): HTMLElement {
        const bucket = document.createElement('div');
        bucket.className = 'bucket';
        bucket.style.borderColor = this.bucketColor;
        bucket.innerHTML = `
           <h3 class="bucket-title">${this.label} Box</h3>
           <div class="progress-info">
              <span class="progress-text" id="${this.key}Progress">0/0 Sorted</span>
           </div>
           <div class ="progress-bar-container">
             <div class="progress-bar" id="${this.key}Bar"></div>
           </div>
           <div class="bucket-icon">${this.emoji}</div>
        `;
        return bucket;
    }

    getElement(): HTMLElement {
        return this.containerEl;
    }

    update(count: number, total: number): void {
        this.textEl.textContent = `${count}/${total} Sorted`;
        const percentage = (count / total) * 100;
        this.barEl.style.width = `${percentage}%`;
    }

    reset(total: number): void {
        this.update(0, total);
    }
}