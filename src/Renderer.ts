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
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
  }

  private resizeCanvas(): void {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight - 50;
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
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.ctx.save();
    this.ctx.translate(this.viewState.offset.x, this.viewState.offset.y);
    this.ctx.scale(this.viewState.zoom, this.viewState.zoom);

    const nodes = mindMap.getAllNodes();
    const selectedNode = mindMap.getSelectedNode();

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
    const width = 120;
    const height = 40;
    const x = node.x - width / 2;
    const y = node.y - height / 2;

    this.ctx.fillStyle = isSelected ? '#e3f2fd' : '#ffffff';
    this.ctx.strokeStyle = isSelected ? '#2196f3' : '#9e9e9e';
    this.ctx.lineWidth = isSelected ? 2 : 1;

    this.ctx.beginPath();
    this.ctx.roundRect(x, y, width, height, 8);
    this.ctx.fill();
    this.ctx.stroke();

    this.ctx.fillStyle = '#333333';
    this.ctx.font = '14px sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    
    const maxWidth = width - 10;
    const text = this.truncateText(node.text, maxWidth);
    this.ctx.fillText(text, node.x, node.y);

    if (node.children.length > 0 && node.collapsed) {
      this.ctx.fillStyle = '#666666';
      this.ctx.font = '12px sans-serif';
      this.ctx.fillText('[+]', node.x + width / 2 - 15, node.y);
    }
  }

  private drawConnection(parent: MindMapNode, child: MindMapNode): void {
    this.ctx.strokeStyle = '#9e9e9e';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    
    const cp1x = parent.x + (child.x - parent.x) * 0.5;
    const cp1y = parent.y;
    const cp2x = parent.x + (child.x - parent.x) * 0.5;
    const cp2y = child.y;
    
    this.ctx.moveTo(parent.x, parent.y);
    this.ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, child.x, child.y);
    this.ctx.stroke();
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