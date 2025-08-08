import { Command } from './types';

export class CommandManager {
  private history: Command[] = [];
  private currentIndex = -1;
  private maxHistorySize = 100;

  execute(command: Command): void {
    command.execute();
    
    this.history = this.history.slice(0, this.currentIndex + 1);
    this.history.push(command);
    
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    } else {
      this.currentIndex++;
    }
  }

  undo(): boolean {
    if (this.currentIndex < 0) return false;
    
    const command = this.history[this.currentIndex];
    command.undo();
    this.currentIndex--;
    return true;
  }

  redo(): boolean {
    if (this.currentIndex >= this.history.length - 1) return false;
    
    this.currentIndex++;
    const command = this.history[this.currentIndex];
    command.execute();
    return true;
  }

  canUndo(): boolean {
    return this.currentIndex >= 0;
  }

  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1;
  }

  clear(): void {
    this.history = [];
    this.currentIndex = -1;
  }
}