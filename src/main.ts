import { MindMapCore } from './MindMapCore';
import { Renderer } from './Renderer';
import { CommandManager } from './CommandManager';
import { AddNodeCommand, DeleteNodeCommand, EditNodeCommand, MoveNodeCommand } from './commands';
import './style.css';

class MindMapApp {
  private mindMap: MindMapCore;
  private renderer: Renderer;
  private commandManager: CommandManager;
  private canvas: HTMLCanvasElement;
  private isDragging = false;
  private isPanning = false;
  private dragStartPoint = { x: 0, y: 0 };
  private panStartPoint = { x: 0, y: 0 };
  private panStartOffset = { x: 0, y: 0 };

  constructor() {
    this.canvas = document.getElementById('mindmap-canvas') as HTMLCanvasElement;
    this.mindMap = new MindMapCore();
    this.renderer = new Renderer(this.canvas);
    this.commandManager = new CommandManager();
    
    this.initializeEventListeners();
    this.loadFromLocalStorage();
    this.scheduleRender();
  }

  private initializeEventListeners(): void {
    this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
    this.canvas.addEventListener('dblclick', this.handleDoubleClick.bind(this));
    this.canvas.addEventListener('wheel', this.handleWheel.bind(this));
    
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
    
    document.getElementById('add-node')?.addEventListener('click', () => this.addNode());
    document.getElementById('delete-node')?.addEventListener('click', () => this.deleteSelectedNode());
    document.getElementById('undo')?.addEventListener('click', () => this.undo());
    document.getElementById('redo')?.addEventListener('click', () => this.redo());
    document.getElementById('zoom-in')?.addEventListener('click', () => this.zoomIn());
    document.getElementById('zoom-out')?.addEventListener('click', () => this.zoomOut());
    document.getElementById('fit')?.addEventListener('click', () => this.fitToScreen());
    document.getElementById('save')?.addEventListener('click', () => this.saveToFile());
    document.getElementById('load')?.addEventListener('click', () => this.loadFromFile());
    
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    fileInput?.addEventListener('change', (e) => this.handleFileLoad(e));
    
    window.addEventListener('beforeunload', () => this.saveToLocalStorage());
  }

  private handleMouseDown(e: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const worldPos = this.renderer.screenToWorld(x, y);
    
    if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
      this.isPanning = true;
      this.panStartPoint = { x: e.clientX, y: e.clientY };
      const viewState = this.renderer.getViewState();
      this.panStartOffset = { ...viewState.offset };
      e.preventDefault();
      return;
    }
    
    const node = this.mindMap.findNodeAt(worldPos);
    
    if (node) {
      this.mindMap.selectNode(node.id);
      this.isDragging = true;
      this.dragStartPoint = worldPos;
    } else {
      this.mindMap.selectNode(null);
    }
    
    this.scheduleRender();
  }

  private handleMouseMove(e: MouseEvent): void {
    if (this.isPanning) {
      const dx = e.clientX - this.panStartPoint.x;
      const dy = e.clientY - this.panStartPoint.y;
      this.renderer.setOffset(
        this.panStartOffset.x + dx,
        this.panStartOffset.y + dy
      );
      this.scheduleRender();
      return;
    }
    
    if (this.isDragging) {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const worldPos = this.renderer.screenToWorld(x, y);
      
      const selectedNode = this.mindMap.getSelectedNode();
      if (selectedNode) {
        this.mindMap.moveNode(selectedNode.id, worldPos.x, worldPos.y);
        this.scheduleRender();
      }
    }
  }

  private handleMouseUp(e: MouseEvent): void {
    if (this.isDragging) {
      const selectedNode = this.mindMap.getSelectedNode();
      if (selectedNode) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const worldPos = this.renderer.screenToWorld(x, y);
        
        const command = new MoveNodeCommand(this.mindMap, selectedNode.id, worldPos.x, worldPos.y);
        this.commandManager.execute(command);
      }
    }
    
    this.isDragging = false;
    this.isPanning = false;
    this.saveToLocalStorage();
  }

  private handleDoubleClick(e: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const worldPos = this.renderer.screenToWorld(x, y);
    
    const node = this.mindMap.findNodeAt(worldPos);
    
    if (node) {
      if (e.ctrlKey || e.metaKey) {
        this.mindMap.toggleCollapse(node.id);
        this.scheduleRender();
      } else {
        const newText = prompt('ノードのテキストを編集:', node.text);
        if (newText !== null && newText !== node.text) {
          const command = new EditNodeCommand(this.mindMap, node.id, newText);
          this.commandManager.execute(command);
          this.scheduleRender();
        }
      }
    } else {
      const selectedNode = this.mindMap.getSelectedNode();
      const parentId = selectedNode ? selectedNode.id : this.mindMap.getRootNode()?.id || null;
      
      if (parentId) {
        const command = new AddNodeCommand(
          this.mindMap,
          parentId,
          '新しいノード',
          worldPos.x,
          worldPos.y
        );
        this.commandManager.execute(command);
        this.scheduleRender();
      }
    }
    
    this.saveToLocalStorage();
  }

  private handleWheel(e: WheelEvent): void {
    e.preventDefault();
    const viewState = this.renderer.getViewState();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    this.renderer.setZoom(viewState.zoom * delta);
    this.scheduleRender();
  }

  private handleKeyDown(e: KeyboardEvent): void {
    const selectedNode = this.mindMap.getSelectedNode();
    
    if (e.key === 'Tab' && selectedNode) {
      e.preventDefault();
      this.addNode();
    } else if (e.key === 'Delete' && selectedNode) {
      e.preventDefault();
      this.deleteSelectedNode();
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
      e.preventDefault();
      this.undo();
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
      e.preventDefault();
      this.redo();
    } else if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      this.saveToFile();
    }
  }

  private addNode(): void {
    const selectedNode = this.mindMap.getSelectedNode();
    const parentId = selectedNode ? selectedNode.id : this.mindMap.getRootNode()?.id || null;
    
    if (parentId) {
      const parent = this.mindMap.getNode(parentId);
      if (parent) {
        const angle = (parent.children.length * 60 - 30) * Math.PI / 180;
        const distance = 150;
        const x = parent.x + Math.cos(angle) * distance;
        const y = parent.y + Math.sin(angle) * distance;
        
        const command = new AddNodeCommand(
          this.mindMap,
          parentId,
          '新しいノード',
          x,
          y
        );
        this.commandManager.execute(command);
        this.scheduleRender();
        this.saveToLocalStorage();
      }
    }
  }

  private deleteSelectedNode(): void {
    const selectedNode = this.mindMap.getSelectedNode();
    if (selectedNode && selectedNode.id !== this.mindMap.getRootNode()?.id) {
      const command = new DeleteNodeCommand(this.mindMap, selectedNode.id);
      this.commandManager.execute(command);
      this.scheduleRender();
      this.saveToLocalStorage();
    }
  }

  private undo(): void {
    if (this.commandManager.undo()) {
      this.scheduleRender();
      this.saveToLocalStorage();
    }
  }

  private redo(): void {
    if (this.commandManager.redo()) {
      this.scheduleRender();
      this.saveToLocalStorage();
    }
  }

  private zoomIn(): void {
    const viewState = this.renderer.getViewState();
    this.renderer.setZoom(viewState.zoom * 1.2);
    this.scheduleRender();
  }

  private zoomOut(): void {
    const viewState = this.renderer.getViewState();
    this.renderer.setZoom(viewState.zoom * 0.8);
    this.scheduleRender();
  }

  private fitToScreen(): void {
    this.renderer.fitToScreen(this.mindMap);
    this.scheduleRender();
  }

  private saveToLocalStorage(): void {
    const data = this.mindMap.exportToJSON();
    localStorage.setItem('mindmap-data', data);
  }

  private loadFromLocalStorage(): void {
    const data = localStorage.getItem('mindmap-data');
    if (data) {
      this.mindMap.importFromJSON(data);
    }
  }

  private saveToFile(): void {
    const data = this.mindMap.exportToJSON();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mindmap-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  private loadFromFile(): void {
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    fileInput?.click();
  }

  private handleFileLoad(e: Event): void {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        this.mindMap.importFromJSON(content);
        this.commandManager.clear();
        this.scheduleRender();
        this.saveToLocalStorage();
      };
      reader.readAsText(file);
    }
  }

  private render(): void {
    this.renderer.render(this.mindMap);
  }

  private scheduleRender(): void {
    if (!this.renderScheduled) {
      this.renderScheduled = true;
      requestAnimationFrame(() => {
        this.scheduleRender();
        this.renderScheduled = false;
      });
    }
  }

  private renderScheduled = false;
}

new MindMapApp();