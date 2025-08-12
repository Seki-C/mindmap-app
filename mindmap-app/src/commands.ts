import { Command } from './types';
import { MindMapCore } from './MindMapCore';

export class AddNodeCommand implements Command {
  private mindMap: MindMapCore;
  private parentId: string;
  private text: string;
  private x: number;
  private y: number;
  private createdNodeId: string | null = null;

  constructor(mindMap: MindMapCore, parentId: string, text: string, x: number, y: number) {
    this.mindMap = mindMap;
    this.parentId = parentId;
    this.text = text;
    this.x = x;
    this.y = y;
  }

  execute(): void {
    this.createdNodeId = this.mindMap.createNode(this.text, this.x, this.y, this.parentId);
  }

  undo(): void {
    if (this.createdNodeId) {
      this.mindMap.deleteNode(this.createdNodeId);
    }
  }
}

export class DeleteNodeCommand implements Command {
  private mindMap: MindMapCore;
  private nodeId: string;
  private nodeData: any;
  private _parentId: string | null;
  private childrenData: Map<string, any> = new Map();

  constructor(mindMap: MindMapCore, nodeId: string) {
    this.mindMap = mindMap;
    this.nodeId = nodeId;
    
    const node = mindMap.getNode(nodeId);
    if (node) {
      this.nodeData = { ...node };
      this.parentId = node.parent;
      this.saveChildren(nodeId);
    } else {
      this.parentId = null;
    }
  }

  private saveChildren(nodeId: string): void {
    const node = this.mindMap.getNode(nodeId);
    if (node) {
      this.childrenData.set(nodeId, { ...node });
      node.children.forEach(childId => this.saveChildren(childId));
    }
  }

  execute(): void {
    this.mindMap.deleteNode(this.nodeId);
  }

  undo(): void {
    if (this.nodeData) {
      this.restoreNode(this.nodeId);
    }
  }

  private restoreNode(nodeId: string): void {
    const data = this.childrenData.get(nodeId);
    if (data) {
      const newId = this.mindMap.createNode(data.text, data.x, data.y, data.parent);
      data.children.forEach((childId: string) => {
        const childData = this.childrenData.get(childId);
        if (childData) {
          childData.parent = newId;
          this.restoreNode(childId);
        }
      });
    }
  }
}

export class EditNodeCommand implements Command {
  private mindMap: MindMapCore;
  private nodeId: string;
  private oldText: string;
  private newText: string;

  constructor(mindMap: MindMapCore, nodeId: string, newText: string) {
    this.mindMap = mindMap;
    this.nodeId = nodeId;
    this.newText = newText;
    
    const node = mindMap.getNode(nodeId);
    this.oldText = node ? node.text : '';
  }

  execute(): void {
    this.mindMap.updateNodeText(this.nodeId, this.newText);
  }

  undo(): void {
    this.mindMap.updateNodeText(this.nodeId, this.oldText);
  }
}

export class MoveNodeCommand implements Command {
  private mindMap: MindMapCore;
  private nodeId: string;
  private oldX: number;
  private oldY: number;
  private newX: number;
  private newY: number;

  constructor(mindMap: MindMapCore, nodeId: string, newX: number, newY: number) {
    this.mindMap = mindMap;
    this.nodeId = nodeId;
    this.newX = newX;
    this.newY = newY;
    
    const node = mindMap.getNode(nodeId);
    if (node) {
      this.oldX = node.x;
      this.oldY = node.y;
    } else {
      this.oldX = 0;
      this.oldY = 0;
    }
  }

  execute(): void {
    this.mindMap.moveNode(this.nodeId, this.newX, this.newY);
  }

  undo(): void {
    this.mindMap.moveNode(this.nodeId, this.oldX, this.oldY);
  }
}