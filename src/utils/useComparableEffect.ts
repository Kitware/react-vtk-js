import { DependencyList, EffectCallback, useEffect, useRef } from 'react';

type Comparator<T extends DependencyList> = (cur: T, prev: T) => boolean;

/**
 * useEffect, but with a custom dependency array comparator.
 *
 * If the comparator returns false, the effect is run.
 */
export default function useComparableEffect<
  D extends DependencyList = DependencyList
>(callback: EffectCallback, deps: D, comparator: Comparator<D>) {
  const dependencies = useRef<D>();
  if (
    dependencies.current === undefined ||
    !comparator(dependencies.current, deps)
  ) {
    dependencies.current = deps;
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(callback, dependencies.current);
}
