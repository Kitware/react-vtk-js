type DeletionCallback = (obj: unknown) => void;

/**
 * Tracks the usage of a particular object, triggering a deletion callback when refs hit zero and the object is marked for deletion.
 *
 * register() is the entrypoint for tracking an object.
 * markForDeletion() is the counterpart to register(), indicating that the object should be deleted in the future.
 * incRefCount() and decRefCount() should be used to track when code uses/stops using the object.
 * unregister() is used only if there's not reason to continue tracking the object.
 */
export class DeletionRegistry {
  private refCount: Map<unknown, number>;
  private callbacks: Map<unknown, DeletionCallback>;
  private toDelete: Set<unknown>;

  constructor() {
    this.refCount = new Map();
    this.callbacks = new Map();
    this.toDelete = new Set();
  }

  get liveCount() {
    return this.refCount.size;
  }

  register(obj: unknown, deleteCallback: DeletionCallback) {
    this.refCount.set(obj, 0);
    this.callbacks.set(obj, deleteCallback);
  }

  unregister(obj: unknown) {
    this.refCount.delete(obj);
    this.callbacks.delete(obj);
    this.toDelete.delete(obj);
  }

  markForDeletion(obj: unknown) {
    if (this.refCount.has(obj) && this.callbacks.has(obj)) {
      this.toDelete.add(obj);
      this.tryToDispose(obj);
    }
  }

  incRefCount(obj: unknown) {
    const count = this.refCount.get(obj) ?? 0;
    this.refCount.set(obj, count + 1);
  }

  decRefCount(obj: unknown) {
    let count = this.refCount.get(obj);
    if (count != null) {
      if (count === 0) throw new Error('Cannot decrease ref count below 0');
      count -= 1;
      this.refCount.set(obj, count);
      if (count === 0) {
        this.tryToDispose(obj);
      }
    }
  }

  private tryToDispose(obj: unknown) {
    if (!this.toDelete.has(obj)) return;

    const count = this.refCount.get(obj) ?? Infinity;
    const callback = this.callbacks.get(obj);
    if (count === 0 && callback) {
      callback(obj);
      this.refCount.delete(obj);
      this.callbacks.delete(obj);
      this.toDelete.delete(obj);
    }
  }
}

const deletionRegistry = new DeletionRegistry();
export default deletionRegistry;
