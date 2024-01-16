/**
 * Creates an event for listening.
 */
export function createEvent<T>() {
  type Callback = (ev?: T) => void;

  const callbacks: Callback[] = [];

  const removeEventListener = (cb: () => void) => {
    const idx = callbacks.indexOf(cb);
    if (idx > -1) {
      callbacks.splice(idx, 1);
    }
  };

  const addEventListener = (cb: (ev?: T) => void) => {
    callbacks.push(cb);
    return () => {
      removeEventListener(cb);
    };
  };

  const dispatchEvent = (ev?: T) => {
    callbacks.forEach((cb) => {
      cb(ev);
    });
  };

  return { addEventListener, removeEventListener, dispatchEvent };
}
