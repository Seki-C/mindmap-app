export class PerformanceOptimizer {
  private renderQueue: Set<() => void> = new Set();
  private rafId: number | null = null;
  private lastFrameTime = 0;
  private frameCount = 0;
  private fps = 60;

  requestRender(callback: () => void): void {
    this.renderQueue.add(callback);
    
    if (!this.rafId) {
      this.rafId = requestAnimationFrame((timestamp) => {
        this.processRenderQueue(timestamp);
      });
    }
  }

  private processRenderQueue(timestamp: number): void {
    if (timestamp - this.lastFrameTime >= 1000) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.lastFrameTime = timestamp;
    }
    
    this.frameCount++;
    
    this.renderQueue.forEach(callback => callback());
    this.renderQueue.clear();
    this.rafId = null;
  }

  getFPS(): number {
    return this.fps;
  }

  static debounce<T extends (...args: any[]) => void>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null;
    
    return (...args: Parameters<T>) => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        func(...args);
        timeout = null;
      }, wait);
    };
  }

  static throttle<T extends (...args: any[]) => void>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle = false;
    
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => {
          inThrottle = false;
        }, limit);
      }
    };
  }
}

export class CanvasPool {
  private pool: HTMLCanvasElement[] = [];
  private inUse: Set<HTMLCanvasElement> = new Set();

  getCanvas(width: number, height: number): HTMLCanvasElement {
    let canvas = this.pool.find(c => 
      !this.inUse.has(c) && 
      c.width >= width && 
      c.height >= height
    );

    if (!canvas) {
      canvas = document.createElement('canvas');
      this.pool.push(canvas);
    }

    canvas.width = width;
    canvas.height = height;
    this.inUse.add(canvas);
    
    return canvas;
  }

  releaseCanvas(canvas: HTMLCanvasElement): void {
    this.inUse.delete(canvas);
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }
}