import { useCallback, useRef } from 'react';

export type BooleanAccumulator = (b: boolean) => void;

/**
 * Simple helper to accumulate a boolean result.
 */
export default function useBooleanAccumulator() {
  const valueRef = useRef(false);

  const reset = useCallback(() => {
    valueRef.current = false;
  }, []);

  const accumulate = useCallback((b: boolean) => {
    valueRef.current ||= b;
  }, []);

  return [valueRef, accumulate, reset] as const;
}
