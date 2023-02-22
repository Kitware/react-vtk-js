import { RefObject, useEffect, useRef } from 'react';

type EventCallback<E> = (this: HTMLElement, ev: E) => void;
type Target<T> = (() => T | null) | RefObject<T | null> | HTMLElement | null;

function getElementTarget<T>(target: Target<T>) {
  if (typeof target === 'function') {
    return target();
  }
  if (target && 'current' in target) {
    return target.current;
  }
  return target;
}

export function useEventListener<E extends keyof HTMLElementEventMap>(
  target: () => HTMLElement | null,
  eventName: E,
  callback: EventCallback<HTMLElementEventMap[E]>,
  options?: AddEventListenerOptions | boolean
): void;

export function useEventListener<E extends keyof HTMLElementEventMap>(
  target: RefObject<HTMLElement | null>,
  eventName: E,
  callback: EventCallback<HTMLElementEventMap[E]>,
  options?: AddEventListenerOptions | boolean
): void;

export function useEventListener<E extends keyof HTMLElementEventMap>(
  target: HTMLElement | null,
  eventName: E,
  callback: EventCallback<HTMLElementEventMap[E]>,
  options?: AddEventListenerOptions | boolean
): void;

/**
 * Event Listener.
 *
 * The typing currently only supports HTMLElement targets.
 */
export function useEventListener<E extends keyof HTMLElementEventMap>(
  target: Target<HTMLElement>,
  eventName: E,
  callback: EventCallback<HTMLElementEventMap[E]>,
  options?: AddEventListenerOptions | boolean
) {
  // avoid add/remove listener whenever callback changes
  const cachedCallback = useRef<typeof callback>(callback);
  useEffect(() => {
    cachedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    const el = getElementTarget(target);
    if (el) {
      el.addEventListener(eventName, cachedCallback.current, options);
      return () => {
        el.removeEventListener(eventName, cachedCallback.current, options);
      };
    }
  }, [eventName, options, target]);
}
