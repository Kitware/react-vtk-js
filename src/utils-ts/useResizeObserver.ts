import { Nullable } from '@kitware/vtk.js/types';
import { useEffect, useRef } from 'react';
import useUnmount from './useUnmount';

export default function useResizeObserver<T extends Element>(
  el: Nullable<T>,
  callback: (entry: ResizeObserverEntry) => void
) {
  const cbRef = useRef<typeof callback>(callback);
  cbRef.current = callback;

  const handleResize = (entry: ResizeObserverEntry) => cbRef.current(entry);

  const observer = useRef<Nullable<ResizeObserver>>(null);
  if (!observer.current) {
    observer.current = new ResizeObserver((entries) => {
      if (entries.length === 1) {
        handleResize(entries[0]);
      }
    });
  }

  useEffect(() => {
    const obs = observer.current;
    if (!obs || !el) return;
    obs.observe(el);
    return () => {
      obs.unobserve(el);
    };
  }, [el]);

  useUnmount(() => {
    if (observer.current) {
      observer.current.disconnect();
    }
  });
}
