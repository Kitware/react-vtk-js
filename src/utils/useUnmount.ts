import { useEffect, useRef } from 'react';

export default function useUnmount(func: () => void) {
  const funcRef = useRef(func);
  funcRef.current = func;
  useEffect(() => {
    return () => {
      funcRef.current();
    };
  }, []);
}
