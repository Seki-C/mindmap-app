import { Node, MindMap, ViewState, Point, Theme } from './types';
import { PerformanceOptimizer } from './performance';
import { LayoutEngine } from './layout';

export class Renderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private viewState: ViewState;
  private optimizer: PerformanceOptimizer;
  private layoutEngine: LayoutEngine;
  private gradientCache = new Map<string, CanvasGradient>();

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) throw new Error('Canvas context not available');
    this.ctx = ctx;
    
    this.viewState = {
      zoom: 1,
      offsetX: 0,
      offsetY: 0,
      focusMode: false,
      focusNodeId: null,
      showProgress: true,
      showPriority: true,
      showTags: true,
    };

    this.optimizer = new PerformanceOptimizer();
    this.layoutEngine = new LayoutEngine();
    this.resize();
    window.addEventListener('resize', PerformanceOptimizer.debounce(() => this.resize(), 100));
  }

  private resize(): void {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.viewState.offsetX = this.canvas.width / 2;
    this.viewState.offsetY = this.canvas.height / 2;
  }

  render(mindmap: MindMap): void {
    this.layoutEngine.layout(mindmap, mindmap.layout);
    
    this.optimizer.requestRender(() => {
      this.clear(mindmap.theme);
      this.ctx.save();
      this.ctx.translate(this.viewState.offsetX, this.viewState.offsetY);
      this.ctx.scale(this.viewState.zoom, this.viewState.zoom);

      if (this.viewState.focusMode && this.viewState.focusNodeId) {
        this.renderFocusMode(mindmap);
      } else {
        this.renderConnections(mindmap);
        this.renderNodes(mindmap);
      }

      this.ctx.restore();
      this.renderUI(mindmap);
    });
  }

  private clear(theme: Theme): void {
    if (theme.background.includes('gradient')) {
      const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
      const colors = theme.background.match(/#[0-9a-fA-F]{6}/g) || ['#f5f5f5', '#e0e0e0'];
      gradient.addColorStop(0, colors[0]);
      gradient.addColorStop(1, colors[1]);
      this.ctx.fillStyle = gradient;
    } else {
      this.ctx.fillStyle = theme.background;
    }
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private renderConnections(mindmap: MindMap): void {
    const theme = mindmap.theme;
    
    mindmap.nodes.forEach(node => {
      if (node.collapsed) return;
      
      node.children.forEach(childId => {
        const child = mindmap.nodes.get(childId);
        if (!child) return;

        this.ctx.beginPath();
        this.ctx.strokeStyle = theme.connectionColor;
        this.ctx.lineWidth = theme.connectionWidth;
        this.ctx.globalAlpha = this.viewState.focusMode ? 0.3 : 1;

        const startX = node.x;
        const startY = node.y;
        const endX = child.x;
        const endY = child.y;

        switch (theme.connectionStyle) {
          case 'straight':
            this.ctx.moveTo(startX, startY);
            this.ctx.lineTo(endX, endY);
            break;
          case 'orthogonal':
            const midX = (startX + endX) / 2;
            this.ctx.moveTo(startX, startY);
            this.ctx.lineTo(midX, startY);
            this.ctx.lineTo(midX, endY);
            this.ctx.lineTo(endX, endY);
            break;
          case 'curved':
          default:
            const controlX1 = startX + (endX - startX) * 0.5;
            const controlY1 = startY;
            const controlX2 = startX + (endX - startX) * 0.5;
            const controlY2 = endY;
            this.ctx.moveTo(startX, startY);
            this.ctx.bezierCurveTo(controlX1, controlY1, controlX2, controlY2, endX, endY);
        }
        
        this.ctx.stroke();
        this.ctx.globalAlpha = 1;
      });
    });
  }

  private renderNodes(mindmap: MindMap): void {
    const renderNode = (node: Node, depth: number = 0) => {
      if (this.viewState.focusMode && depth > 2) return;
      
      this.renderNodeShape(node);
      this.renderNodeContent(node);
      
      if (!node.collapsed) {
        node.children.forEach(childId => {
          const child = mindmap.nodes.get(childId);
          if (child) renderNode(child, depth + 1);
        });
      }
    };

    const root = mindmap.nodes.get(mindmap.rootId);
    if (root) renderNode(root);
  }

  private renderNodeShape(node: Node): void {
    const style = node.style;
    const x = node.x - node.width / 2;
    const y = node.y - node.height / 2;

    if (style.shadow) {
      this.ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
      this.ctx.shadowBlur = 8;
      this.ctx.shadowOffsetX = 2;
      this.ctx.shadowOffsetY = 2;
    }

    if (style.gradient) {
      const gradient = this.ctx.createLinearGradient(x, y, x, y + node.height);
      gradient.addColorStop(0, this.lightenColor(style.fillColor, 20));
      gradient.addColorStop(1, style.fillColor);
      this.ctx.fillStyle = gradient;
    } else {
      this.ctx.fillStyle = style.fillColor;
    }

    this.ctx.strokeStyle = node.selected ? '#007AFF' : style.borderColor;
    this.ctx.lineWidth = node.selected ? style.borderWidth + 2 : style.borderWidth;

    this.ctx.beginPath();
    
    switch (style.shape) {
      case 'rectangle':
        this.ctx.rect(x, y, node.width, node.height);
        break;
      case 'rounded':
        this.drawRoundedRect(x, y, node.width, node.height, 8);
        break;
      case 'ellipse':
        this.ctx.ellipse(node.x, node.y, node.width / 2, node.height / 2, 0, 0, 2 * Math.PI);
        break;
      case 'cloud':
        this.drawCloud(node.x, node.y, node.width, node.height);
        break;
      case 'hexagon':
        this.drawHexagon(node.x, node.y, node.width, node.height);
        break;
      case 'underline':
        this.ctx.moveTo(x, y + node.height);
        this.ctx.lineTo(x + node.width, y + node.height);
        break;
    }

    if (style.shape !== 'underline') {
      this.ctx.fill();
    }
    this.ctx.stroke();

    this.ctx.shadowColor = 'transparent';
    this.ctx.shadowBlur = 0;
    this.ctx.shadowOffsetX = 0;
    this.ctx.shadowOffsetY = 0;
  }

  private renderNodeContent(node: Node): void {
    const style = node.style;
    
    this.ctx.fillStyle = style.textColor;
    this.ctx.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize}px -apple-system, BlinkMacSystemFont, sans-serif`;
    this.ctx.textAlign = style.textAlign;
    this.ctx.textBaseline = 'middle';

    let textX = node.x;
    if (style.textAlign === 'left') textX = node.x - node.width / 2 + 10;
    if (style.textAlign === 'right') textX = node.x + node.width / 2 - 10;

    if (node.icon) {
      this.ctx.font = `${style.fontSize + 4}px sans-serif`;
      this.ctx.fillText(node.icon, node.x - node.width / 2 + 15, node.y);
      textX += 20;
    }

    this.ctx.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize}px -apple-system, BlinkMacSystemFont, sans-serif`;
    this.ctx.fillText(node.text, textX, node.y);

    if (this.viewState.showProgress && node.progress > 0) {
      this.renderProgressBar(node);
    }

    if (this.viewState.showPriority && node.priority > 0) {
      this.renderPriority(node);
    }

    if (this.viewState.showTags && node.tags.length > 0) {
      this.renderTags(node);
    }

    if (node.children.length > 0 && node.style.shape !== 'underline') {
      const indicatorX = node.x + node.width / 2 - 15;
      const indicatorY = node.y;
      this.ctx.fillStyle = '#999';
      this.ctx.font = '12px sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(node.collapsed ? '▶' : '▼', indicatorX, indicatorY);
    }
  }

  private renderProgressBar(node: Node): void {
    const barWidth = node.width - 20;
    const barHeight = 4;
    const x = node.x - node.width / 2 + 10;
    const y = node.y + node.height / 2 - 10;

    this.ctx.fillStyle = '#e0e0e0';
    this.ctx.fillRect(x, y, barWidth, barHeight);

    this.ctx.fillStyle = node.progress === 100 ? '#4caf50' : '#2196f3';
    this.ctx.fillRect(x, y, barWidth * (node.progress / 100), barHeight);
  }

  private renderPriority(node: Node): void {
    const stars = '★'.repeat(node.priority) + '☆'.repeat(5 - node.priority);
    const x = node.x + node.width / 2 - 40;
    const y = node.y - node.height / 2 - 5;
    
    this.ctx.fillStyle = '#ffa500';
    this.ctx.font = '10px sans-serif';
    this.ctx.textAlign = 'right';
    this.ctx.fillText(stars, x, y);
  }

  private renderTags(node: Node): void {
    const x = node.x - node.width / 2;
    const y = node.y + node.height / 2 + 10;
    
    this.ctx.fillStyle = '#666';
    this.ctx.font = '10px sans-serif';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(node.tags.map(t => `#${t}`).join(' '), x, y);
  }

  private renderFocusMode(mindmap: MindMap): void {
    const focusNode = mindmap.nodes.get(this.viewState.focusNodeId!);
    if (!focusNode) return;

    this.ctx.globalAlpha = 0.2;
    this.renderConnections(mindmap);
    this.renderNodes(mindmap);
    this.ctx.globalAlpha = 1;

    const renderFocusedNode = (node: Node, depth: number) => {
      if (depth > 2) return;
      
      this.renderNodeShape(node);
      this.renderNodeContent(node);
      
      if (!node.collapsed) {
        node.children.forEach(childId => {
          const child = mindmap.nodes.get(childId);
          if (child) renderFocusedNode(child, depth + 1);
        });
      }
    };

    renderFocusedNode(focusNode, 0);
  }

  private renderUI(mindmap: MindMap): void {
    const selectedNode = mindmap.nodes.get(mindmap.selectedNodeId || '');
    if (!selectedNode) return;

    const x = 20;
    const y = this.canvas.height - 100;
    
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    this.ctx.fillRect(x, y, 300, 80);
    
    this.ctx.fillStyle = '#fff';
    this.ctx.font = 'bold 14px sans-serif';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(selectedNode.text, x + 10, y + 20);
    
    this.ctx.font = '12px sans-serif';
    this.ctx.fillText(`進捗: ${selectedNode.progress}%`, x + 10, y + 40);
    this.ctx.fillText(`優先度: ${'★'.repeat(selectedNode.priority)}${'☆'.repeat(5 - selectedNode.priority)}`, x + 10, y + 55);
    
    if (selectedNode.notes) {
      this.ctx.fillText(`📝 ${selectedNode.notes.substring(0, 30)}...`, x + 10, y + 70);
    }
  }

  private drawRoundedRect(x: number, y: number, width: number, height: number, radius: number): void {
    this.ctx.moveTo(x + radius, y);
    this.ctx.lineTo(x + width - radius, y);
    this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    this.ctx.lineTo(x + width, y + height - radius);
    this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    this.ctx.lineTo(x + radius, y + height);
    this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    this.ctx.lineTo(x, y + radius);
    this.ctx.quadraticCurveTo(x, y, x + radius, y);
  }

  private drawCloud(x: number, y: number, width: number, height: number): void {
    const curves = 6;
    const radius = Math.min(width, height) / 4;
    
    this.ctx.beginPath();
    for (let i = 0; i < curves; i++) {
      const angle = (i / curves) * Math.PI * 2;
      const cx = x + Math.cos(angle) * width / 3;
      const cy = y + Math.sin(angle) * height / 3;
      this.ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    }
    this.ctx.closePath();
  }

  private drawHexagon(x: number, y: number, width: number, height: number): void {
    const size = Math.min(width, height) / 2;
    this.ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 6;
      const hx = x + size * Math.cos(angle);
      const hy = y + size * Math.sin(angle);
      if (i === 0) {
        this.ctx.moveTo(hx, hy);
      } else {
        this.ctx.lineTo(hx, hy);
      }
    }
    this.ctx.closePath();
  }

  private lightenColor(color: string, percent: number): string {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255))
      .toString(16).slice(1);
  }

  screenToWorld(point: Point): Point {
    return {
      x: (point.x - this.viewState.offsetX) / this.viewState.zoom,
      y: (point.y - this.viewState.offsetY) / this.viewState.zoom,
    };
  }

  worldToScreen(point: Point): Point {
    return {
      x: point.x * this.viewState.zoom + this.viewState.offsetX,
      y: point.y * this.viewState.zoom + this.viewState.offsetY,
    };
  }

  getNodeAtPoint(mindmap: MindMap, point: Point): Node | null {
    const worldPoint = this.screenToWorld(point);
    let foundNode: Node | null = null;

    mindmap.nodes.forEach(node => {
      const halfWidth = node.width / 2;
      const halfHeight = node.height / 2;
      
      if (worldPoint.x >= node.x - halfWidth &&
          worldPoint.x <= node.x + halfWidth &&
          worldPoint.y >= node.y - halfHeight &&
          worldPoint.y <= node.y + halfHeight) {
        foundNode = node;
      }
    });

    return foundNode;
  }

  pan(dx: number, dy: number): void {
    this.viewState.offsetX += dx;
    this.viewState.offsetY += dy;
  }

  zoom(factor: number, center?: Point): void {
    const newZoom = Math.max(0.1, Math.min(3, this.viewState.zoom * factor));
    
    if (center) {
      const worldPoint = this.screenToWorld(center);
      this.viewState.zoom = newZoom;
      const newScreenPoint = this.worldToScreen(worldPoint);
      this.viewState.offsetX += center.x - newScreenPoint.x;
      this.viewState.offsetY += center.y - newScreenPoint.y;
    } else {
      this.viewState.zoom = newZoom;
    }
  }

  resetView(): void {
    this.viewState.zoom = 1;
    this.viewState.offsetX = this.canvas.width / 2;
    this.viewState.offsetY = this.canvas.height / 2;
  }

  centerNode(node: Node): void {
    const screenPoint = this.worldToScreen({ x: node.x, y: node.y });
    const dx = this.canvas.width / 2 - screenPoint.x;
    const dy = this.canvas.height / 2 - screenPoint.y;
    this.pan(dx, dy);
  }

  toggleFocusMode(nodeId?: string): void {
    this.viewState.focusMode = !this.viewState.focusMode;
    this.viewState.focusNodeId = nodeId || null;
  }

  setShowProgress(show: boolean): void {
    this.viewState.showProgress = show;
  }

  setShowPriority(show: boolean): void {
    this.viewState.showPriority = show;
  }

  setShowTags(show: boolean): void {
    this.viewState.showTags = show;
  }
}