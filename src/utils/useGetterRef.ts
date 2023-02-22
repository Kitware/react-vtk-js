import { useRef } from 'react';

export default function useGetterRef<T>(initFunc: () => T) {
  const ref = useRef<T | null>(null);
  const getterRef = useRef(() => {
    if (ref.current === null) {
      ref.current = initFunc();
    }
    return ref.current;
  });

  // these values are referentially stable
  return [ref, getterRef.current] as const;
}
