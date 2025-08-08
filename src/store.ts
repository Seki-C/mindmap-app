import { Node, MindMap, THEMES, NodeStyle } from './types';

export class MindMapStore {
  private mindmap: MindMap;
  private listeners: Set<() => void> = new Set();

  constructor() {
    const now = new Date();
    const defaultStyle = THEMES.default.defaultNodeStyle;
    
    const rootNode: Node = {
      id: 'root',
      text: 'メインテーマ',
      x: 0,
      y: 0,
      width: 120,
      height: 40,
      parent: null,
      children: [],
      collapsed: false,
      selected: true,
      style: { ...defaultStyle, fillColor: '#667eea', textColor: '#ffffff', fontSize: 18, fontWeight: 'bold' },
      priority: 0,
      progress: 0,
      notes: '',
      tags: [],
      attachments: [],
      createdAt: now,
      modifiedAt: now,
    };

    this.mindmap = {
      nodes: new Map([[rootNode.id, rootNode]]),
      rootId: rootNode.id,
      selectedNodeId: rootNode.id,
      title: '新しいマインドマップ',
      layout: 'radial',
      theme: THEMES.default,
    };

    this.loadFromStorage();
  }

  getMindMap(): MindMap {
    return this.mindmap;
  }

  getNode(id: string): Node | undefined {
    return this.mindmap.nodes.get(id);
  }

  addNode(parentId: string, text: string = '新しいノード'): string {
    const parent = this.mindmap.nodes.get(parentId);
    if (!parent) return '';

    const id = `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();
    
    const angle = (parent.children.length * Math.PI) / 4;
    const distance = 150;
    
    const newNode: Node = {
      id,
      text,
      x: parent.x + Math.cos(angle) * distance,
      y: parent.y + Math.sin(angle) * distance,
      width: 100,
      height: 36,
      parent: parentId,
      children: [],
      collapsed: false,
      selected: false,
      style: { ...this.mindmap.theme.defaultNodeStyle },
      priority: 0,
      progress: 0,
      notes: '',
      tags: [],
      attachments: [],
      createdAt: now,
      modifiedAt: now,
    };

    parent.children.push(id);
    this.mindmap.nodes.set(id, newNode);
    this.selectNode(id);
    this.notify();
    this.saveToStorage();
    
    return id;
  }

  deleteNode(id: string): void {
    if (id === this.mindmap.rootId) return;

    const node = this.mindmap.nodes.get(id);
    if (!node) return;

    const deleteRecursive = (nodeId: string) => {
      const n = this.mindmap.nodes.get(nodeId);
      if (!n) return;
      
      n.children.forEach(childId => deleteRecursive(childId));
      this.mindmap.nodes.delete(nodeId);
    };

    if (node.parent) {
      const parent = this.mindmap.nodes.get(node.parent);
      if (parent) {
        parent.children = parent.children.filter(childId => childId !== id);
      }
    }

    deleteRecursive(id);
    
    if (this.mindmap.selectedNodeId === id) {
      this.mindmap.selectedNodeId = node.parent || this.mindmap.rootId;
    }
    
    this.notify();
    this.saveToStorage();
  }

  updateNodeText(id: string, text: string): void {
    const node = this.mindmap.nodes.get(id);
    if (node) {
      node.text = text;
      node.modifiedAt = new Date();
      const ctx = document.createElement('canvas').getContext('2d');
      if (ctx) {
        ctx.font = `${node.style.fontSize}px sans-serif`;
        const metrics = ctx.measureText(text);
        node.width = Math.max(60, metrics.width + 20);
      }
      this.notify();
      this.saveToStorage();
    }
  }

  updateNodeStyle(id: string, style: Partial<NodeStyle>): void {
    const node = this.mindmap.nodes.get(id);
    if (node) {
      node.style = { ...node.style, ...style };
      node.modifiedAt = new Date();
      this.notify();
      this.saveToStorage();
    }
  }

  updateNodePriority(id: string, priority: number): void {
    const node = this.mindmap.nodes.get(id);
    if (node) {
      node.priority = Math.max(0, Math.min(5, priority));
      node.modifiedAt = new Date();
      this.notify();
      this.saveToStorage();
    }
  }

  updateNodeProgress(id: string, progress: number): void {
    const node = this.mindmap.nodes.get(id);
    if (node) {
      node.progress = Math.max(0, Math.min(100, progress));
      node.modifiedAt = new Date();
      this.notify();
      this.saveToStorage();
    }
  }

  updateNodeNotes(id: string, notes: string): void {
    const node = this.mindmap.nodes.get(id);
    if (node) {
      node.notes = notes;
      node.modifiedAt = new Date();
      this.notify();
      this.saveToStorage();
    }
  }

  addNodeTag(id: string, tag: string): void {
    const node = this.mindmap.nodes.get(id);
    if (node && !node.tags.includes(tag)) {
      node.tags.push(tag);
      node.modifiedAt = new Date();
      this.notify();
      this.saveToStorage();
    }
  }

  removeNodeTag(id: string, tag: string): void {
    const node = this.mindmap.nodes.get(id);
    if (node) {
      node.tags = node.tags.filter(t => t !== tag);
      node.modifiedAt = new Date();
      this.notify();
      this.saveToStorage();
    }
  }

  setNodeIcon(id: string, icon: string | undefined): void {
    const node = this.mindmap.nodes.get(id);
    if (node) {
      node.icon = icon;
      node.modifiedAt = new Date();
      this.notify();
      this.saveToStorage();
    }
  }

  updateNodePosition(id: string, x: number, y: number): void {
    const node = this.mindmap.nodes.get(id);
    if (node) {
      node.x = x;
      node.y = y;
      node.modifiedAt = new Date();
      this.notify();
    }
  }

  selectNode(id: string | null): void {
    this.mindmap.nodes.forEach(node => {
      node.selected = false;
    });
    
    if (id) {
      const node = this.mindmap.nodes.get(id);
      if (node) {
        node.selected = true;
        this.mindmap.selectedNodeId = id;
      }
    } else {
      this.mindmap.selectedNodeId = null;
    }
    
    this.notify();
  }

  toggleCollapse(id: string): void {
    const node = this.mindmap.nodes.get(id);
    if (node) {
      node.collapsed = !node.collapsed;
      this.notify();
      this.saveToStorage();
    }
  }

  getSelectedNode(): Node | null {
    if (!this.mindmap.selectedNodeId) return null;
    return this.mindmap.nodes.get(this.mindmap.selectedNodeId) || null;
  }

  setTheme(themeName: string): void {
    const theme = THEMES[themeName];
    if (theme) {
      this.mindmap.theme = theme;
      this.notify();
      this.saveToStorage();
    }
  }

  setLayout(layout: 'radial' | 'tree' | 'org' | 'fishbone' | 'timeline'): void {
    this.mindmap.layout = layout;
    this.notify();
    this.saveToStorage();
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach(listener => listener());
  }

  private saveToStorage(): void {
    const data = {
      nodes: Array.from(this.mindmap.nodes.entries()).map(([id, node]) => ({
        ...node,
        createdAt: node.createdAt.toISOString(),
        modifiedAt: node.modifiedAt.toISOString(),
        dueDate: node.dueDate?.toISOString(),
      })),
      rootId: this.mindmap.rootId,
      selectedNodeId: this.mindmap.selectedNodeId,
      title: this.mindmap.title,
      layout: this.mindmap.layout,
      theme: this.mindmap.theme.name,
    };
    localStorage.setItem('mindmap', JSON.stringify(data));
  }

  private loadFromStorage(): void {
    const stored = localStorage.getItem('mindmap');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        const nodes = new Map<string, Node>();
        
        data.nodes.forEach((nodeData: any) => {
          const node: Node = {
            ...nodeData,
            createdAt: new Date(nodeData.createdAt),
            modifiedAt: new Date(nodeData.modifiedAt),
            dueDate: nodeData.dueDate ? new Date(nodeData.dueDate) : undefined,
          };
          nodes.set(node.id, node);
        });
        
        this.mindmap.nodes = nodes;
        this.mindmap.rootId = data.rootId;
        this.mindmap.selectedNodeId = data.selectedNodeId;
        this.mindmap.title = data.title || '新しいマインドマップ';
        this.mindmap.layout = data.layout || 'radial';
        this.mindmap.theme = THEMES[data.theme] || THEMES.default;
      } catch (e) {
        console.error('Failed to load mindmap from storage:', e);
      }
    }
  }

  exportToJSON(): string {
    const data = {
      nodes: Array.from(this.mindmap.nodes.values()),
      rootId: this.mindmap.rootId,
      title: this.mindmap.title,
      layout: this.mindmap.layout,
      theme: this.mindmap.theme.name,
    };
    return JSON.stringify(data, null, 2);
  }

  importFromJSON(json: string): void {
    try {
      const data = JSON.parse(json);
      this.mindmap.nodes.clear();
      data.nodes.forEach((node: Node) => {
        this.mindmap.nodes.set(node.id, {
          ...node,
          createdAt: new Date(node.createdAt),
          modifiedAt: new Date(node.modifiedAt),
          dueDate: node.dueDate ? new Date(node.dueDate) : undefined,
        });
      });
      this.mindmap.rootId = data.rootId;
      this.mindmap.selectedNodeId = data.rootId;
      this.mindmap.title = data.title || '新しいマインドマップ';
      this.mindmap.layout = data.layout || 'radial';
      this.mindmap.theme = THEMES[data.theme] || THEMES.default;
      this.notify();
      this.saveToStorage();
    } catch (e) {
      console.error('Failed to import mindmap:', e);
    }
  }
}