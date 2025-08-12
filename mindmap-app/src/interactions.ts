import { MindMapStore } from './store';
import { Renderer } from './renderer';
import { Point } from './types';

export class InteractionHandler {
  private store: MindMapStore;
  private renderer: Renderer;
  private canvas: HTMLCanvasElement;
  
  private isDragging = false;
  private isNodeDragging = false;
  private dragStart: Point = { x: 0, y: 0 };
  private draggedNodeId: string | null = null;
  private editingNodeId: string | null = null;

  constructor(canvas: HTMLCanvasElement, store: MindMapStore, renderer: Renderer) {
    this.canvas = canvas;
    this.store = store;
    this.renderer = renderer;
    
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
    this.canvas.addEventListener('wheel', this.handleWheel.bind(this));
    this.canvas.addEventListener('dblclick', this.handleDoubleClick.bind(this));
    
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
    
    document.getElementById('addNode')?.addEventListener('click', () => this.addNode());
    document.getElementById('deleteNode')?.addEventListener('click', () => this.deleteNode());
    document.getElementById('resetView')?.addEventListener('click', () => this.resetView());
    document.getElementById('save')?.addEventListener('click', () => this.save());
    document.getElementById('export')?.addEventListener('click', () => this.export());
  }

  private handleMouseDown(e: MouseEvent): void {
    const point = { x: e.clientX, y: e.clientY };
    const node = this.renderer.getNodeAtPoint(this.store.getMindMap(), point);
    
    if (node) {
      this.store.selectNode(node.id);
      this.isNodeDragging = true;
      this.draggedNodeId = node.id;
      this.dragStart = this.renderer.screenToWorld(point);
    } else {
      this.isDragging = true;
      this.dragStart = point;
      this.canvas.style.cursor = 'grabbing';
    }
  }

  private handleMouseMove(e: MouseEvent): void {
    if (this.isDragging) {
      const dx = e.clientX - this.dragStart.x;
      const dy = e.clientY - this.dragStart.y;
      this.renderer.pan(dx, dy);
      this.dragStart = { x: e.clientX, y: e.clientY };
      this.renderer.render(this.store.getMindMap());
    } else if (this.isNodeDragging && this.draggedNodeId) {
      const worldPoint = this.renderer.screenToWorld({ x: e.clientX, y: e.clientY });
      this.store.updateNodePosition(this.draggedNodeId, worldPoint.x, worldPoint.y);
      this.renderer.render(this.store.getMindMap());
    }
  }

  private handleMouseUp(): void {
    this.isDragging = false;
    this.isNodeDragging = false;
    this.draggedNodeId = null;
    this.canvas.style.cursor = 'grab';
  }

  private handleWheel(e: WheelEvent): void {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 0.9 : 1.1;
    this.renderer.zoom(factor, { x: e.clientX, y: e.clientY });
    this.renderer.render(this.store.getMindMap());
  }

  private handleDoubleClick(e: MouseEvent): void {
    const point = { x: e.clientX, y: e.clientY };
    const node = this.renderer.getNodeAtPoint(this.store.getMindMap(), point);
    
    if (node) {
      this.startEditing(node.id);
    }
  }

  private handleKeyDown(e: KeyboardEvent): void {
    const selectedNode = this.store.getSelectedNode();
    
    switch (e.key) {
      case 'Tab':
        e.preventDefault();
        if (selectedNode) {
          this.store.addNode(selectedNode.id);
          this.renderer.render(this.store.getMindMap());
        }
        break;
        
      case 'Enter':
        e.preventDefault();
        if (selectedNode && selectedNode.parent) {
          this.store.addNode(selectedNode.parent);
          this.renderer.render(this.store.getMindMap());
        }
        break;
        
      case 'Delete':
      case 'Backspace':
        if (!this.editingNodeId && selectedNode) {
          e.preventDefault();
          this.store.deleteNode(selectedNode.id);
          this.renderer.render(this.store.getMindMap());
        }
        break;
        
      case 'F2':
        e.preventDefault();
        if (selectedNode) {
          this.startEditing(selectedNode.id);
        }
        break;
        
      case 'ArrowUp':
      case 'ArrowDown':
      case 'ArrowLeft':
      case 'ArrowRight':
        e.preventDefault();
        this.navigateNodes(e.key);
        break;
        
      case ' ':
        if (!this.editingNodeId) {
          e.preventDefault();
          this.canvas.style.cursor = this.isDragging ? 'grab' : 'grabbing';
        }
        break;
        
      case '+':
      case '=':
        e.preventDefault();
        this.renderer.zoom(1.2);
        this.renderer.render(this.store.getMindMap());
        break;
        
      case '-':
      case '_':
        e.preventDefault();
        this.renderer.zoom(0.8);
        this.renderer.render(this.store.getMindMap());
        break;
        
      case 'r':
      case 'R':
        e.preventDefault();
        this.resetView();
        break;
        
      case 's':
      case 'S':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          this.save();
        }
        break;
    }
  }

  private navigateNodes(direction: string): void {
    const selectedNode = this.store.getSelectedNode();
    if (!selectedNode) return;
    
    const mindmap = this.store.getMindMap();
    let targetId: string | null = null;
    
    switch (direction) {
      case 'ArrowLeft':
        targetId = selectedNode.parent;
        break;
      case 'ArrowRight':
        if (selectedNode.children.length > 0) {
          targetId = selectedNode.children[0];
        }
        break;
      case 'ArrowUp':
        if (selectedNode.parent) {
          const parent = mindmap.nodes.get(selectedNode.parent);
          if (parent) {
            const index = parent.children.indexOf(selectedNode.id);
            if (index > 0) {
              targetId = parent.children[index - 1];
            }
          }
        }
        break;
      case 'ArrowDown':
        if (selectedNode.parent) {
          const parent = mindmap.nodes.get(selectedNode.parent);
          if (parent) {
            const index = parent.children.indexOf(selectedNode.id);
            if (index < parent.children.length - 1) {
              targetId = parent.children[index + 1];
            }
          }
        }
        break;
    }
    
    if (targetId) {
      this.store.selectNode(targetId);
      const targetNode = mindmap.nodes.get(targetId);
      if (targetNode) {
        this.renderer.centerNode(targetNode);
      }
      this.renderer.render(mindmap);
    }
  }

  private startEditing(nodeId: string): void {
    const node = this.store.getNode(nodeId);
    if (!node) return;
    
    this.editingNodeId = nodeId;
    
    const input = document.createElement('input');
    input.type = 'text';
    input.value = node.text;
    input.style.position = 'fixed';
    
    const screenPoint = this.renderer.worldToScreen({ x: node.x, y: node.y });
    input.style.left = `${screenPoint.x - 50}px`;
    input.style.top = `${screenPoint.y - 10}px`;
    input.style.width = '100px';
    input.style.textAlign = 'center';
    input.style.fontSize = '14px';
    input.style.padding = '4px';
    input.style.border = '2px solid #007AFF';
    input.style.borderRadius = '4px';
    input.style.outline = 'none';
    input.style.zIndex = '1000';
    
    document.body.appendChild(input);
    input.focus();
    input.select();
    
    const finishEditing = () => {
      if (input.value.trim()) {
        this.store.updateNodeText(nodeId, input.value.trim());
      }
      document.body.removeChild(input);
      this.editingNodeId = null;
      this.renderer.render(this.store.getMindMap());
    };
    
    input.addEventListener('blur', finishEditing);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        finishEditing();
      } else if (e.key === 'Escape') {
        document.body.removeChild(input);
        this.editingNodeId = null;
      }
    });
  }

  private addNode(): void {
    const selectedNode = this.store.getSelectedNode();
    if (selectedNode) {
      this.store.addNode(selectedNode.id);
      this.renderer.render(this.store.getMindMap());
    }
  }

  private deleteNode(): void {
    const selectedNode = this.store.getSelectedNode();
    if (selectedNode) {
      this.store.deleteNode(selectedNode.id);
      this.renderer.render(this.store.getMindMap());
    }
  }

  private resetView(): void {
    this.renderer.resetView();
    this.renderer.render(this.store.getMindMap());
  }

  private save(): void {
    const mindmap = this.store.getMindMap();
    console.log('Mindmap saved!', mindmap);
  }

  private export(): void {
    const json = this.store.exportToJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mindmap.json';
    a.click();
    URL.revokeObjectURL(url);
  }
}