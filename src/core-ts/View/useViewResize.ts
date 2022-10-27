import { Nullable } from '@kitware/vtk.js/types';
import { RefObject, useCallback } from 'react';
import { IView } from '../../types';
import useMount from '../../utils-ts/useMount';
import useResizeObserver from '../../utils-ts/useResizeObserver';

export function useViewResize(
  containerRef: RefObject<Nullable<Element>>,
  view: IView
) {
  const updateViewSize = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const renderWindowView = view.getAPISpecificRenderWindow();
    const renderWindow = view.getRenderWindow();
    const devicePixelRatio = window.devicePixelRatio || 1;
    const { width, height } = container.getBoundingClientRect();
    const w = Math.floor(width * devicePixelRatio);
    const h = Math.floor(height * devicePixelRatio);
    renderWindowView.setSize(Math.max(w, 10), Math.max(h, 10));
    renderWindow.render();
  }, [containerRef, view]);

  useResizeObserver(containerRef.current, updateViewSize);
  useMount(() => updateViewSize());
}
