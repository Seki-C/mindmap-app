export interface Node {
  id: string;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  parent: string | null;
  children: string[];
  collapsed: boolean;
  selected: boolean;
  
  // iThoughts風の拡張プロパティ
  style: NodeStyle;
  priority: number; // 1-5
  progress: number; // 0-100
  notes: string;
  tags: string[];
  attachments: Attachment[];
  createdAt: Date;
  modifiedAt: Date;
  dueDate?: Date;
  icon?: string;
  link?: string;
}

export interface NodeStyle {
  shape: 'rectangle' | 'rounded' | 'ellipse' | 'underline' | 'cloud' | 'hexagon';
  fillColor: string;
  borderColor: string;
  borderWidth: number;
  textColor: string;
  fontSize: number;
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  textAlign: 'left' | 'center' | 'right';
  shadow: boolean;
  gradient: boolean;
}

export interface Attachment {
  id: string;
  name: string;
  type: 'image' | 'link' | 'file';
  data: string;
}

export interface MindMap {
  nodes: Map<string, Node>;
  rootId: string;
  selectedNodeId: string | null;
  title: string;
  layout: LayoutType;
  theme: Theme;
}

export type LayoutType = 'radial' | 'tree' | 'org' | 'fishbone' | 'timeline';

export interface Theme {
  name: string;
  background: string;
  primaryColor: string;
  secondaryColor: string;
  connectionStyle: 'curved' | 'straight' | 'orthogonal';
  connectionWidth: number;
  connectionColor: string;
  defaultNodeStyle: NodeStyle;
}

export interface ViewState {
  zoom: number;
  offsetX: number;
  offsetY: number;
  focusMode: boolean;
  focusNodeId: string | null;
  showProgress: boolean;
  showPriority: boolean;
  showTags: boolean;
}

export interface Point {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const ICONS = {
  task: '✓',
  idea: '💡',
  warning: '⚠️',
  question: '❓',
  star: '⭐',
  flag: '🚩',
  home: '🏠',
  person: '👤',
  calendar: '📅',
  document: '📄',
  folder: '📁',
  email: '✉️',
  phone: '📞',
  location: '📍',
  heart: '❤️',
  thumb: '👍',
} as const;

export const THEMES: Record<string, Theme> = {
  default: {
    name: 'Default',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    primaryColor: '#667eea',
    secondaryColor: '#764ba2',
    connectionStyle: 'curved',
    connectionWidth: 2,
    connectionColor: '#e0e0e0',
    defaultNodeStyle: {
      shape: 'rounded',
      fillColor: '#ffffff',
      borderColor: '#667eea',
      borderWidth: 2,
      textColor: '#333333',
      fontSize: 14,
      fontWeight: 'normal',
      fontStyle: 'normal',
      textAlign: 'center',
      shadow: true,
      gradient: false,
    },
  },
  dark: {
    name: 'Dark',
    background: 'linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%)',
    primaryColor: '#bb86fc',
    secondaryColor: '#3700b3',
    connectionStyle: 'curved',
    connectionWidth: 2,
    connectionColor: '#4a4a4a',
    defaultNodeStyle: {
      shape: 'rounded',
      fillColor: '#2d2d2d',
      borderColor: '#bb86fc',
      borderWidth: 2,
      textColor: '#ffffff',
      fontSize: 14,
      fontWeight: 'normal',
      fontStyle: 'normal',
      textAlign: 'center',
      shadow: true,
      gradient: false,
    },
  },
  nature: {
    name: 'Nature',
    background: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
    primaryColor: '#84fab0',
    secondaryColor: '#8fd3f4',
    connectionStyle: 'curved',
    connectionWidth: 3,
    connectionColor: '#6eb89f',
    defaultNodeStyle: {
      shape: 'cloud',
      fillColor: '#ffffff',
      borderColor: '#84fab0',
      borderWidth: 3,
      textColor: '#2d5f3f',
      fontSize: 14,
      fontWeight: 'normal',
      fontStyle: 'normal',
      textAlign: 'center',
      shadow: false,
      gradient: true,
    },
  },
};