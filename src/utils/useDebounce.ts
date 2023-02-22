import { vtkDebouncedFunction } from '@kitware/vtk.js/interfaces';
import { debounce } from '@kitware/vtk.js/macros';
import { useCallback, useEffect, useRef } from 'react';

export default function useDebounce(fn: CallableFunction, threshold: number) {
  const ref = useRef<CallableFunction>(
    debounce(fn as vtkDebouncedFunction, threshold)
  );

  useEffect(() => {
    ref.current = debounce(fn as vtkDebouncedFunction, threshold);
  }, [fn, threshold]);

  const wrapper = useCallback((...args: unknown[]) => ref.current(...args), []);
  return wrapper;
}
