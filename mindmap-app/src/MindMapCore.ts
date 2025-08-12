import { MindMapNode, MindMap, Point } from './types';

export class MindMapCore {
  private nodes: Map<string, MindMapNode>;
  private rootId: string;
  private selectedNodeId: string | null = null;
  private nodeIdCounter = 0;

  constructor() {
    this.nodes = new Map();
    this.rootId = this.createNode('メインテーマ', 400, 200);
    this.selectedNodeId = this.rootId;
  }

  private generateId(): string {
    return `node_${Date.now()}_${this.nodeIdCounter++}`;
  }

  createNode(text: string, x: number, y: number, parentId: string | null = null): string {
    const id = this.generateId();
    const node: MindMapNode = {
      id,
      text,
      x,
      y,
      children: [],
      parent: parentId,
      collapsed: false,
    };

    this.nodes.set(id, node);

    if (parentId) {
      const parent = this.nodes.get(parentId);
      if (parent) {
        parent.children.push(id);
      }
    }

    return id;
  }

  deleteNode(nodeId: string): boolean {
    if (nodeId === this.rootId) return false;

    const node = this.nodes.get(nodeId);
    if (!node) return false;

    const deleteRecursive = (id: string) => {
      const n = this.nodes.get(id);
      if (n) {
        n.children.forEach(childId => deleteRecursive(childId));
        this.nodes.delete(id);
      }
    };

    if (node.parent) {
      const parent = this.nodes.get(node.parent);
      if (parent) {
        parent.children = parent.children.filter(id => id !== nodeId);
      }
    }

    deleteRecursive(nodeId);
    
    if (this.selectedNodeId === nodeId) {
      this.selectedNodeId = null;
    }

    return true;
  }

  updateNodeText(nodeId: string, text: string): boolean {
    const node = this.nodes.get(nodeId);
    if (!node) return false;
    node.text = text;
    return true;
  }

  moveNode(nodeId: string, x: number, y: number): boolean {
    const node = this.nodes.get(nodeId);
    if (!node) return false;
    
    const dx = x - node.x;
    const dy = y - node.y;
    
    const moveRecursive = (id: string, deltaX: number, deltaY: number) => {
      const n = this.nodes.get(id);
      if (n) {
        n.x += deltaX;
        n.y += deltaY;
        n.children.forEach(childId => moveRecursive(childId, deltaX, deltaY));
      }
    };

    moveRecursive(nodeId, dx, dy);
    return true;
  }

  toggleCollapse(nodeId: string): boolean {
    const node = this.nodes.get(nodeId);
    if (!node) return false;
    node.collapsed = !node.collapsed;
    return true;
  }

  selectNode(nodeId: string | null): void {
    this.selectedNodeId = nodeId;
  }

  getSelectedNode(): MindMapNode | null {
    return this.selectedNodeId ? this.nodes.get(this.selectedNodeId) || null : null;
  }

  getNode(nodeId: string): MindMapNode | null {
    return this.nodes.get(nodeId) || null;
  }

  getAllNodes(): MindMapNode[] {
    return Array.from(this.nodes.values());
  }

  getRootNode(): MindMapNode | null {
    return this.nodes.get(this.rootId) || null;
  }

  exportToJSON(): string {
    const data: MindMap = {
      nodes: this.nodes,
      rootId: this.rootId,
      metadata: {
        title: 'Mindmap',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    };
    return JSON.stringify(data, (_, value) => {
      if (value instanceof Map) {
        return Array.from(value.entries());
      }
      return value;
    });
  }

  importFromJSON(json: string): void {
    try {
      const data = JSON.parse(json, (key, value) => {
        if (key === 'nodes' && Array.isArray(value)) {
          return new Map(value);
        }
        return value;
      });
      
      this.nodes = data.nodes;
      this.rootId = data.rootId;
      this.selectedNodeId = null;
    } catch (error) {
      console.error('Failed to import JSON:', error);
    }
  }

  findNodeAt(point: Point, nodeWidth = 120, nodeHeight = 40): MindMapNode | null {
    for (const node of this.nodes.values()) {
      if (
        point.x >= node.x - nodeWidth / 2 &&
        point.x <= node.x + nodeWidth / 2 &&
        point.y >= node.y - nodeHeight / 2 &&
        point.y <= node.y + nodeHeight / 2
      ) {
        return node;
      }
    }
    return null;
  }
}