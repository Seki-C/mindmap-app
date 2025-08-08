export interface NodeStyle {
  color?: string;
  backgroundColor?: string;
  fontSize?: number;
  fontFamily?: string;
  borderRadius?: number;
}

export interface MindMapNode {
  id: string;
  text: string;
  x: number;
  y: number;
  children: string[];
  parent: string | null;
  collapsed: boolean;
  style?: NodeStyle;
}

export interface MindMap {
  nodes: Map<string, MindMapNode>;
  rootId: string;
  metadata: {
    title: string;
    createdAt: Date;
    updatedAt: Date;
  };
}

export interface Point {
  x: number;
  y: number;
}

export interface ViewState {
  zoom: number;
  offset: Point;
}

export interface Command {
  execute(): void;
  undo(): void;
}