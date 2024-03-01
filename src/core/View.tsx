import { Bounds } from '@kitware/vtk.js/types';
import {
  forwardRef,
  useContext,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react';
import { IView } from '../types';
import { MultiViewRootContext } from './contexts';
import ParentedView from './internal/ParentedView';
import SingleView from './internal/SingleView';
import { ViewProps } from './internal/view-shared';
export type { ViewProps } from './internal/view-shared';

export default forwardRef(function View(props: ViewProps, fwdRef) {
  const singleViewRef = useRef<IView | null>(null);
  const parentedViewRef = useRef<IView | null>(null);

  const multiViewRoot = useContext(MultiViewRootContext);

  const api = useMemo<IView>(() => {
    const getView = () =>
      multiViewRoot ? parentedViewRef.current : singleViewRef.current;
    return {
      isInMultiViewRoot: () => multiViewRoot,
      isMounted: () => getView()?.isMounted() ?? false,
      getViewContainer: () => getView()?.getViewContainer() ?? null,
      getOpenGLRenderWindow: () => getView()?.getOpenGLRenderWindow() ?? null,
      getRenderWindow: () => getView()?.getRenderWindow() ?? null,
      getRenderer: () => getView()?.getRenderer() ?? null,
      getInteractorStyle: () => getView()?.getInteractorStyle() ?? null,
      setInteractorStyle: (style) => getView()?.setInteractorStyle(style),
      requestRender: () => getView()?.requestRender(),
      getCamera: () => getView()?.getCamera() ?? null,
      resetCamera: (boundsToUse?: Bounds) =>
        getView()?.resetCamera(boundsToUse),
    };
  }, [multiViewRoot]);

  useImperativeHandle(fwdRef, () => api);

  if (multiViewRoot) {
    return <ParentedView {...props} ref={parentedViewRef} />;
  } else {
    return <SingleView {...props} ref={singleViewRef} />;
  }
});
