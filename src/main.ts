import { MindMapStore } from './store';
import { Renderer } from './renderer';
import { InteractionHandler } from './interactions';

class MindMapApp {
  private store: MindMapStore;
  private renderer: Renderer;
  private interactions: InteractionHandler;

  constructor() {
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    if (!canvas) throw new Error('Canvas element not found');

    this.store = new MindMapStore();
    this.renderer = new Renderer(canvas);
    this.interactions = new InteractionHandler(canvas, this.store, this.renderer);

    this.store.subscribe(() => {
      this.renderer.render(this.store.getMindMap());
    });

    this.renderer.render(this.store.getMindMap());
    
    this.setupSampleData();
  }

  private setupSampleData(): void {
    const mindmap = this.store.getMindMap();
    if (mindmap.nodes.size === 1) {
      const rootId = mindmap.rootId;
      
      const idea1 = this.store.addNode(rootId, 'アイデア1');
      const idea2 = this.store.addNode(rootId, 'アイデア2');
      const idea3 = this.store.addNode(rootId, 'アイデア3');
      
      this.store.addNode(idea1, 'サブアイデア1-1');
      this.store.addNode(idea1, 'サブアイデア1-2');
      
      this.store.addNode(idea2, 'サブアイデア2-1');
      
      this.store.selectNode(rootId);
      this.renderer.render(this.store.getMindMap());
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new MindMapApp();
});