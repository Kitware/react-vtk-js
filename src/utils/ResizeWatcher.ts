import { createContext } from 'react';

export type ResizeWatcherCallback = (target: Element) => void;
export type ResizeWatcherStop = () => void;

export interface IResizeWatcher {
  watch(element: Element, callback: ResizeWatcherCallback): void;
  unwatch(element: Element, callback: ResizeWatcherCallback): void;
}

export const ResizeWatcherContext = createContext<IResizeWatcher | null>(null);

/**
 * A variant of ResizeObserver that acts similarly to add/removeEventListener.
 */
export class ResizeWatcher implements IResizeWatcher {
  private resizeObserver: ResizeObserver;
  private callbacks: Map<Element, ResizeWatcherCallback[]>;

  constructor() {
    this.resizeObserver = new ResizeObserver((entries) =>
      this.onResize(entries)
    );
    this.callbacks = new Map();
  }

  onResize(entries: ResizeObserverEntry[]) {
    entries.forEach((entry) => {
      const callbacks = this.callbacks.get(entry.target);
      if (callbacks) {
        callbacks.forEach((cb) => cb(entry.target));
      }
    });
  }

  watch(element: Element, callback: ResizeWatcherCallback) {
    const cbs = this.callbacks.get(element) ?? [];
    cbs.push(callback);
    this.callbacks.set(element, cbs);
    this.resizeObserver.observe(element);
  }

  unwatch(element: Element, callback: ResizeWatcherCallback) {
    this.resizeObserver.unobserve(element);
    const cbs = this.callbacks.get(element) ?? [];
    const idx = cbs.indexOf(callback);
    if (idx > -1) {
      cbs.splice(idx, 1);
    }
  }
}
