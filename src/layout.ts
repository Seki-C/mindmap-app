import { Node, MindMap, LayoutType } from './types';

export class LayoutEngine {
  private readonly LEVEL_DISTANCE = 200;
  private readonly NODE_SPACING = 50;
  
  layout(mindmap: MindMap, layoutType: LayoutType): void {
    switch (layoutType) {
      case 'radial':
        this.radialLayout(mindmap);
        break;
      case 'tree':
        this.treeLayout(mindmap);
        break;
      case 'org':
        this.orgLayout(mindmap);
        break;
      case 'fishbone':
        this.fishboneLayout(mindmap);
        break;
      case 'timeline':
        this.timelineLayout(mindmap);
        break;
      default:
        this.radialLayout(mindmap);
    }
  }

  private radialLayout(mindmap: MindMap): void {
    const root = mindmap.nodes.get(mindmap.rootId);
    if (!root) return;

    root.x = 0;
    root.y = 0;

    const visited = new Set<string>();
    this.layoutRadialRecursive(mindmap, root, 0, 0, 2 * Math.PI, 1, visited);
  }

  private layoutRadialRecursive(
    mindmap: MindMap,
    node: Node,
    startAngle: number,
    endAngle: number,
    totalAngle: number,
    level: number,
    visited: Set<string>
  ): void {
    if (visited.has(node.id)) return;
    visited.add(node.id);

    const children = node.children
      .map(id => mindmap.nodes.get(id))
      .filter((child): child is Node => child !== undefined && !visited.has(child.id));

    if (children.length === 0) return;

    const radius = this.LEVEL_DISTANCE * level;
    const angleStep = totalAngle / children.length;
    let currentAngle = startAngle;

    children.forEach((child, index) => {
      const angle = currentAngle + angleStep * (index + 0.5);
      child.x = node.x + Math.cos(angle) * radius;
      child.y = node.y + Math.sin(angle) * radius;

      const childStartAngle = currentAngle + angleStep * index;
      const childEndAngle = childStartAngle + angleStep;
      
      this.layoutRadialRecursive(
        mindmap,
        child,
        childStartAngle - Math.PI / 4,
        childEndAngle + Math.PI / 4,
        angleStep + Math.PI / 6,
        level + 1,
        visited
      );
    });
  }

  private treeLayout(mindmap: MindMap): void {
    const root = mindmap.nodes.get(mindmap.rootId);
    if (!root) return;

    root.x = 0;
    root.y = 0;

    const visited = new Set<string>();
    this.layoutTreeRecursive(mindmap, root, 0, -500, 500, 1, visited);
  }

  private layoutTreeRecursive(
    mindmap: MindMap,
    node: Node,
    x: number,
    minX: number,
    maxX: number,
    level: number,
    visited: Set<string>
  ): void {
    if (visited.has(node.id)) return;
    visited.add(node.id);

    node.x = x;
    node.y = level * this.LEVEL_DISTANCE;

    const children = node.children
      .map(id => mindmap.nodes.get(id))
      .filter((child): child is Node => child !== undefined && !visited.has(child.id));

    if (children.length === 0) return;

    const width = maxX - minX;
    const childWidth = width / children.length;

    children.forEach((child, index) => {
      const childX = minX + childWidth * (index + 0.5);
      const childMinX = minX + childWidth * index;
      const childMaxX = childMinX + childWidth;

      this.layoutTreeRecursive(mindmap, child, childX, childMinX, childMaxX, level + 1, visited);
    });
  }

  private orgLayout(mindmap: MindMap): void {
    const root = mindmap.nodes.get(mindmap.rootId);
    if (!root) return;

    root.x = 0;
    root.y = 0;

    const visited = new Set<string>();
    const levelWidths = new Map<number, number>();
    this.calculateLevelWidths(mindmap, root, 0, levelWidths, visited);
    
    visited.clear();
    this.layoutOrgRecursive(mindmap, root, 0, 0, visited, levelWidths);
  }

  private calculateLevelWidths(
    mindmap: MindMap,
    node: Node,
    level: number,
    levelWidths: Map<number, number>,
    visited: Set<string>
  ): number {
    if (visited.has(node.id)) return 0;
    visited.add(node.id);

    const children = node.children
      .map(id => mindmap.nodes.get(id))
      .filter((child): child is Node => child !== undefined && !visited.has(child.id));

    if (children.length === 0) {
      return node.width + this.NODE_SPACING;
    }

    let totalWidth = 0;
    children.forEach(child => {
      totalWidth += this.calculateLevelWidths(mindmap, child, level + 1, levelWidths, visited);
    });

    const currentWidth = levelWidths.get(level) || 0;
    levelWidths.set(level, Math.max(currentWidth, totalWidth));

    return Math.max(node.width + this.NODE_SPACING, totalWidth);
  }

  private layoutOrgRecursive(
    mindmap: MindMap,
    node: Node,
    x: number,
    level: number,
    visited: Set<string>,
    levelWidths: Map<number, number>
  ): void {
    if (visited.has(node.id)) return;
    visited.add(node.id);

    node.x = x;
    node.y = level * this.LEVEL_DISTANCE;

    const children = node.children
      .map(id => mindmap.nodes.get(id))
      .filter((child): child is Node => child !== undefined && !visited.has(child.id));

    if (children.length === 0) return;

    const levelWidth = levelWidths.get(level + 1) || 0;
    let currentX = x - levelWidth / 2;

    children.forEach(child => {
      const childWidth = this.getSubtreeWidth(mindmap, child, new Set());
      this.layoutOrgRecursive(mindmap, child, currentX + childWidth / 2, level + 1, visited, levelWidths);
      currentX += childWidth;
    });
  }

  private getSubtreeWidth(mindmap: MindMap, node: Node, visited: Set<string>): number {
    if (visited.has(node.id)) return 0;
    visited.add(node.id);

    const children = node.children
      .map(id => mindmap.nodes.get(id))
      .filter((child): child is Node => child !== undefined && !visited.has(child.id));

    if (children.length === 0) {
      return node.width + this.NODE_SPACING;
    }

    let totalWidth = 0;
    children.forEach(child => {
      totalWidth += this.getSubtreeWidth(mindmap, child, visited);
    });

    return Math.max(node.width + this.NODE_SPACING, totalWidth);
  }

  private fishboneLayout(mindmap: MindMap): void {
    const root = mindmap.nodes.get(mindmap.rootId);
    if (!root) return;

    root.x = 0;
    root.y = 0;

    const visited = new Set<string>();
    const children = root.children
      .map(id => mindmap.nodes.get(id))
      .filter((child): child is Node => child !== undefined);

    const halfPoint = Math.ceil(children.length / 2);
    const topChildren = children.slice(0, halfPoint);
    const bottomChildren = children.slice(halfPoint);

    topChildren.forEach((child, index) => {
      child.x = (index + 1) * this.LEVEL_DISTANCE;
      child.y = -this.LEVEL_DISTANCE;
      this.layoutFishboneRecursive(mindmap, child, 1, -1, visited);
    });

    bottomChildren.forEach((child, index) => {
      child.x = (index + 1) * this.LEVEL_DISTANCE;
      child.y = this.LEVEL_DISTANCE;
      this.layoutFishboneRecursive(mindmap, child, 1, 1, visited);
    });
  }

  private layoutFishboneRecursive(
    mindmap: MindMap,
    node: Node,
    level: number,
    direction: number,
    visited: Set<string>
  ): void {
    if (visited.has(node.id)) return;
    visited.add(node.id);

    const children = node.children
      .map(id => mindmap.nodes.get(id))
      .filter((child): child is Node => child !== undefined && !visited.has(child.id));

    children.forEach((child, index) => {
      child.x = node.x + this.LEVEL_DISTANCE * 0.7;
      child.y = node.y + direction * (index + 1) * this.NODE_SPACING;
      this.layoutFishboneRecursive(mindmap, child, level + 1, direction, visited);
    });
  }

  private timelineLayout(mindmap: MindMap): void {
    const root = mindmap.nodes.get(mindmap.rootId);
    if (!root) return;

    const allNodes = Array.from(mindmap.nodes.values());
    const sortedNodes = allNodes.sort((a, b) => {
      if (a.dueDate && b.dueDate) {
        return a.dueDate.getTime() - b.dueDate.getTime();
      }
      return a.createdAt.getTime() - b.createdAt.getTime();
    });

    const timelineLength = sortedNodes.length * this.LEVEL_DISTANCE;
    const startX = -timelineLength / 2;

    sortedNodes.forEach((node, index) => {
      node.x = startX + index * this.LEVEL_DISTANCE;
      node.y = 0;

      const children = node.children
        .map(id => mindmap.nodes.get(id))
        .filter((child): child is Node => child !== undefined);

      children.forEach((child, childIndex) => {
        child.x = node.x;
        child.y = (childIndex + 1) * this.NODE_SPACING * (childIndex % 2 === 0 ? 1 : -1);
      });
    });
  }

  autoArrange(mindmap: MindMap): void {
    const nodes = Array.from(mindmap.nodes.values());
    const centerX = nodes.reduce((sum, node) => sum + node.x, 0) / nodes.length;
    const centerY = nodes.reduce((sum, node) => sum + node.y, 0) / nodes.length;

    nodes.forEach(node => {
      node.x -= centerX;
      node.y -= centerY;
    });
  }
}