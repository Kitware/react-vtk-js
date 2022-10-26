import { Nullable } from '@kitware/vtk.js/types';
import {
  createContext,
  DependencyList,
  EffectCallback,
  PropsWithChildren,
  ReactElement,
  useContext,
  useEffect,
  useRef,
} from 'react';

type Destructor = () => void;

interface IOrderedUnmountContext {
  callbacks: EffectCallback[];
  children: IOrderedUnmountContext[];
  Provider(props: PropsWithChildren): ReactElement;
  addChildContext(child: IOrderedUnmountContext): void;
  destroy(): void;
  wrap(cb: Destructor | void): Destructor;
}

const OrderedUnmountContext =
  createContext<Nullable<IOrderedUnmountContext>>(null);

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

/**
 * This registers an Ordered Unmount Context.
 *
 * This must go before any effect (that has cleanup) in a component
 * in order to work effectively!
 *
 * This context must be used in the following manner:
 *   // must be prior to any effects with cleanup that need to run
 *   // after children effects are cleaned up.
 *   const OrderedUnmountContext = useOrderedUnmountEffectContext();
 *   ...other effects
 *   return (
 *     <OrderedUnmountContext.Provider>
 *     ...
 *     </OrderedUnmountContext.Provider>
 *   )
 *
 * If a component provides an object to descendants and expects descendants to
 * clean up registrations on the object, then the component should create
 * an ordered unmount context and the descendants that consume an injected
 * object should clean up registrations inside an useOrderedUnmountEffect().
 */
export function useOrderedUnmountContext() {
  const parentContext = useContext(OrderedUnmountContext);
  const context = useRef<Nullable<IOrderedUnmountContext>>(null);

  if (!context.current) {
    context.current = {
      callbacks: [],
      children: [],
      Provider: (props: PropsWithChildren) => {
        return (
          <OrderedUnmountContext.Provider value={context.current}>
            {props.children ?? null}
          </OrderedUnmountContext.Provider>
        );
      },
      addChildContext: (childContext: IOrderedUnmountContext) => {
        if (!context.current) return;
        context.current.children.push(childContext);
      },
      destroy: () => {
        if (!context.current) return;
        const { callbacks, children } = context.current;
        for (let i = 0; i < children.length; i++) {
          children[i].destroy();
        }
        for (let i = 0; i < callbacks.length; i++) {
          callbacks[i]();
        }
        context.current.children.length = 0;
        context.current.callbacks.length = 0;
      },
      wrap: (cleanup: Destructor | void) => {
        if (!context.current || !cleanup) return noop;
        const { callbacks } = context.current;
        callbacks.push(cleanup);
        return () => {
          const idx = callbacks.indexOf(cleanup);
          // do not call if already removed from callbacks array
          if (idx > -1) {
            callbacks.splice(idx, 1);
            cleanup();
          }
        };
      },
    };

    if (context.current && parentContext)
      parentContext.addChildContext(context.current);
  }

  // unmount
  useEffect(() => {
    const ctxt = context.current;
    return () => {
      if (ctxt) ctxt.destroy();
    };
  }, []);

  return context.current;
}

export function useOrderedUnmountEffect(
  callback: EffectCallback,
  dependencies: DependencyList
) {
  const context = useContext(OrderedUnmountContext);

  useEffect(() => {
    if (context) {
      return context.wrap(callback());
    }
    return callback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);
}
