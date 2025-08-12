import { MindMapNode, ViewState } from './types';
import { MindMapCore } from './MindMapCore';

export class Renderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private viewState: ViewState = {
    zoom: 1,
    offset: { x: 0, y: 0 }
  };

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get canvas context');
    this.ctx = ctx;
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.resizeCanvas());
    } else {
      this.resizeCanvas();
    }
    
    window.addEventListener('resize', () => this.resizeCanvas());
    console.log('Renderer initialized with canvas:', canvas.width, 'x', canvas.height);
  }

  private resizeCanvas(): void {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    this.canvas.width = (window.innerWidth || 800) * dpr;
    this.canvas.height = ((window.innerHeight || 600) - 56) * dpr;
    
    this.canvas.style.width = (window.innerWidth || 800) + 'px';
    this.canvas.style.height = ((window.innerHeight || 600) - 56) + 'px';
    
    this.ctx.scale(dpr, dpr);
    
    console.log('Canvas resized to:', this.canvas.width, 'x', this.canvas.height, 'DPR:', dpr);
  }

  setZoom(zoom: number): void {
    this.viewState.zoom = Math.max(0.2, Math.min(3, zoom));
  }

  setOffset(x: number, y: number): void {
    this.viewState.offset = { x, y };
  }

  getViewState(): ViewState {
    return { ...this.viewState };
  }

  screenToWorld(screenX: number, screenY: number): { x: number; y: number } {
    return {
      x: (screenX - this.viewState.offset.x) / this.viewState.zoom,
      y: (screenY - this.viewState.offset.y) / this.viewState.zoom
    };
  }

  worldToScreen(worldX: number, worldY: number): { x: number; y: number } {
    return {
      x: worldX * this.viewState.zoom + this.viewState.offset.x,
      y: worldY * this.viewState.zoom + this.viewState.offset.y
    };
  }

  render(mindMap: MindMapCore): void {
    const dpr = window.devicePixelRatio || 1;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.ctx.save();
    this.ctx.translate(this.viewState.offset.x, this.viewState.offset.y);
    this.ctx.scale(this.viewState.zoom, this.viewState.zoom);

    const nodes = mindMap.getAllNodes();
    const selectedNode = mindMap.getSelectedNode();
    
    console.log(`Rendering ${nodes.length} nodes, canvas: ${this.canvas.width}x${this.canvas.height}, zoom: ${this.viewState.zoom}, DPR: ${dpr}`);

    for (const node of nodes) {
      if (node.parent) {
        const parent = mindMap.getNode(node.parent);
        if (parent && !parent.collapsed) {
          this.drawConnection(parent, node);
        }
      }
    }

    for (const node of nodes) {
      if (node.parent) {
        const parent = mindMap.getNode(node.parent);
        if (parent && parent.collapsed) continue;
      }
      this.drawNode(node, node === selectedNode);
    }

    this.ctx.restore();
  }

  private drawNode(node: MindMapNode, isSelected: boolean): void {
    const width = 140;
    const height = 50;
    const x = node.x - width / 2;
    const y = node.y - height / 2;
    const radius = 12;

    this.ctx.save();

    if (isSelected) {
      this.ctx.shadowColor = 'rgba(99, 102, 241, 0.4)';
      this.ctx.shadowBlur = 20;
      this.ctx.shadowOffsetX = 0;
      this.ctx.shadowOffsetY = 4;
    } else {
      this.ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
      this.ctx.shadowBlur = 10;
      this.ctx.shadowOffsetX = 0;
      this.ctx.shadowOffsetY = 2;
    }

    const gradient = this.ctx.createLinearGradient(x, y, x, y + height);
    if (isSelected) {
      gradient.addColorStop(0, '#6366f1');
      gradient.addColorStop(1, '#4f46e5');
    } else {
      gradient.addColorStop(0, '#ffffff');
      gradient.addColorStop(1, '#f8fafc');
    }
    
    this.ctx.fillStyle = gradient;

    this.ctx.beginPath();
    this.ctx.roundRect(x, y, width, height, radius);
    this.ctx.fill();

    this.ctx.shadowBlur = 0;
    this.ctx.strokeStyle = isSelected ? '#4f46e5' : '#e2e8f0';
    this.ctx.lineWidth = isSelected ? 2 : 1;
    this.ctx.stroke();

    const textColor = isSelected ? '#ffffff' : '#1e293b';
    this.ctx.fillStyle = textColor;
    this.ctx.font = '600 14px Inter, -apple-system, sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    
    const maxWidth = width - 20;
    const text = this.truncateText(node.text, maxWidth);
    this.ctx.fillText(text, node.x, node.y);

    if (node.children.length > 0 && node.collapsed) {
      const buttonX = node.x + width / 2 - 15;
      const buttonY = node.y + height / 2 - 10;
      
      this.ctx.fillStyle = isSelected ? 'rgba(255, 255, 255, 0.3)' : 'rgba(99, 102, 241, 0.1)';
      this.ctx.beginPath();
      this.ctx.roundRect(buttonX - 8, buttonY - 8, 16, 16, 4);
      this.ctx.fill();
      
      this.ctx.fillStyle = isSelected ? '#ffffff' : '#6366f1';
      this.ctx.font = '600 12px Inter, sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText('+', buttonX, buttonY);
    }

    this.ctx.restore();
  }

  private drawConnection(parent: MindMapNode, child: MindMapNode): void {
    this.ctx.save();
    
    const gradient = this.ctx.createLinearGradient(parent.x, parent.y, child.x, child.y);
    gradient.addColorStop(0, 'rgba(99, 102, 241, 0.6)');
    gradient.addColorStop(1, 'rgba(99, 102, 241, 0.3)');
    
    this.ctx.strokeStyle = gradient;
    this.ctx.lineWidth = 2;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    
    this.ctx.shadowColor = 'rgba(99, 102, 241, 0.2)';
    this.ctx.shadowBlur = 4;
    
    this.ctx.beginPath();
    
    const cp1x = parent.x + (child.x - parent.x) * 0.6;
    const cp1y = parent.y;
    const cp2x = parent.x + (child.x - parent.x) * 0.4;
    const cp2y = child.y;
    
    this.ctx.moveTo(parent.x, parent.y);
    this.ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, child.x, child.y);
    this.ctx.stroke();
    
    this.ctx.restore();
  }

  private truncateText(text: string, maxWidth: number): string {
    const metrics = this.ctx.measureText(text);
    if (metrics.width <= maxWidth) return text;

    let truncated = text;
    while (truncated.length > 0) {
      truncated = truncated.slice(0, -1);
      const truncatedWithEllipsis = truncated + '...';
      if (this.ctx.measureText(truncatedWithEllipsis).width <= maxWidth) {
        return truncatedWithEllipsis;
      }
    }
    return '...';
  }

  fitToScreen(mindMap: MindMapCore): void {
    const nodes = mindMap.getAllNodes();
    if (nodes.length === 0) return;

    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;

    for (const node of nodes) {
      minX = Math.min(minX, node.x - 60);
      minY = Math.min(minY, node.y - 20);
      maxX = Math.max(maxX, node.x + 60);
      maxY = Math.max(maxY, node.y + 20);
    }

    const padding = 50;
    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;
    const canvasWidth = this.canvas.width - padding * 2;
    const canvasHeight = this.canvas.height - padding * 2;

    const scaleX = canvasWidth / contentWidth;
    const scaleY = canvasHeight / contentHeight;
    const scale = Math.min(scaleX, scaleY, 2);

    this.viewState.zoom = scale;
    this.viewState.offset = {
      x: (this.canvas.width - contentWidth * scale) / 2 - minX * scale,
      y: (this.canvas.height - contentHeight * scale) / 2 - minY * scale
    };
  }
}