import { useRef } from 'react';

export default function useLatest<T>(val: T) {
  const ref = useRef(val);
  ref.current = val;
  return ref;
}
