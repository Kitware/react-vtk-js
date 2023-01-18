import { RefObject, useEffect } from 'react';

type EventCallback<E> = (this: HTMLElement, ev: E) => void;

/**
 * Event Listener.
 *
 * The typing currently only supports HTMLElement targets.
 */
export function useEventListener<E extends keyof HTMLElementEventMap>(
  targetRef: RefObject<HTMLElement>,
  eventName: E,
  callback: EventCallback<HTMLElementEventMap[E]>,
  options?: AddEventListenerOptions | boolean
) {
  useEffect(() => {
    const target = targetRef.current;
    if (target) {
      target.addEventListener(eventName, callback, options);
      return () => {
        target.removeEventListener(eventName, callback, options);
      };
    }
  }, [eventName, callback, options, targetRef]);
}
