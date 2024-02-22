export type EventListener = (...args: any[]) => void;

function createEvent() {
  const callbacks: EventListener[] = [];

  const off = (callback: EventListener) => {
    const idx = callbacks.indexOf(callback);
    if (idx === -1) return;
    callbacks.splice(idx, 1);
  };

  const on = (callback: EventListener) => {
    callbacks.push(callback);
    return () => off(callback);
  };

  const once = (callback: EventListener) => {
    const stop = on(() => {
      stop();
      callback();
    });
  };

  const trigger = (...args: any[]) => {
    callbacks.forEach((cb) => {
      cb(...args);
    });
  };

  return { off, on, once, trigger };
}

export const viewMountedEvent = createEvent();
