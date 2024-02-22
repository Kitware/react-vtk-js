import { useContext, useRef } from 'react';
import { Contexts } from '..';
import { viewMountedEvent } from '../core/internal/events';
import { makeDeferred } from '../utils/deferred';

type Status = 'pending' | 'error' | 'success';

/**
 * A suspense-aware hook that waits for the containing View to be mounted before evaluating the getter.
 * @param getter
 * @returns
 */
export function useViewReadySuspense<T>(getter: () => T): T {
  const view = useContext(Contexts.ViewContext);
  if (!view) throw new Error('No view context');

  let status = 'pending' as Status;
  const deferred = useRef(makeDeferred<void>());

  if (view.isMounted()) {
    status = 'success';
  } else {
    viewMountedEvent.once(() => {
      status = 'success';
      deferred.current.resolve();
    });
  }

  switch (status) {
    case 'success':
      return getter();
    case 'pending':
      throw deferred.current.promise;
    case 'error':
    default:
      throw new Error('Unexpected unreachable code execution');
  }
}
