import { useEffect, useRef } from 'react';

export function usePrevious<T>(val: T) {
  const ref = useRef<T | undefined>(undefined);

  useEffect(() => {
    ref.current = val;
  });

  return ref.current;
}
