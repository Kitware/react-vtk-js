import {
  createContext,
  EventHandler,
  SyntheticEvent,
  useContext,
  useEffect,
  useRef,
} from 'react';

type HandledEvents = 'pointermove' | 'pointerdown' | 'pointerup' | 'click';

type Handler = EventHandler<SyntheticEvent<unknown>>;

function createEvent() {
  const handlers: Handler[] = [];
  const add = (callback: Handler) => {
    handlers.push(callback);
  };
  const remove = (callback: Handler) => {
    const idx = handlers.indexOf(callback);
    if (idx < 0) return;
    handlers.splice(idx, 1);
  };
  const trigger = (ev: SyntheticEvent<unknown>) => {
    handlers.forEach((h) => h(ev));
  };
  return { add, remove, trigger };
}

export default function useViewEvents() {
  const eventMap = useRef<
    Record<HandledEvents, ReturnType<typeof createEvent>>
  >({
    pointermove: createEvent(),
    pointerdown: createEvent(),
    pointerup: createEvent(),
    click: createEvent(),
  });

  const rootListeners = useRef({
    onPointerDown: eventMap.current.pointerdown.trigger,
    onPointerUp: eventMap.current.pointerup.trigger,
    onPointerMove: eventMap.current.pointermove.trigger,
    onClick: eventMap.current.click.trigger,
  });

  const registerEventListener = (
    eventName: HandledEvents,
    callback: Handler
  ) => {
    const bus = eventMap.current[eventName];
    if (!bus) {
      throw new Error(`${eventName} is not supported in useViewEvents`);
    }

    bus.add(callback);
    return () => bus.remove(callback);
  };

  return {
    rootListeners: rootListeners.current,
    registerEventListener,
  };
}

export type ViewEventRegistrar = ReturnType<
  typeof useViewEvents
>['registerEventListener'];

export const ViewEvents = createContext<ViewEventRegistrar | null>(null);

export function useViewEventListener(
  eventName: HandledEvents,
  callback: Handler
) {
  const registerEventListener = useContext<ViewEventRegistrar | null>(
    ViewEvents
  );
  if (!registerEventListener) {
    throw new Error('useViewEventListener needs ViewEventRegistrar!');
  }

  useEffect(() => {
    return registerEventListener(eventName, callback);
  }, [eventName, callback, registerEventListener]);
}
