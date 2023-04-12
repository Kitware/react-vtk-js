import vtkRenderWindow from '@kitware/vtk.js/Rendering/Core/RenderWindow';
import {
  forwardRef,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react';
import { IRenderWindow } from '../types';
import deletionRegistry from '../utils/DeletionRegistry';
import useGetterRef from '../utils/useGetterRef';
import useMount from '../utils/useMount';
import useResizeObserver from '../utils/useResizeObserver';
import useUnmount from '../utils/useUnmount';
import {
  IPicking,
  OpenGLRenderWindowContext,
  RenderWindowContext,
} from './contexts';
import useInteractor from './modules/useInteractor';

export type RenderWindowProps = PropsWithChildren & Partial<IPicking>;

export default forwardRef(function RenderWindow(
  props: RenderWindowProps,
  fwdRef
) {
  const openGLRenderWindow = useContext(OpenGLRenderWindowContext);
  if (!openGLRenderWindow) throw new Error('No OpenGL Render Window!');

  // --- RenderWindow --- //

  const [rwRef, getRenderWindow] = useGetterRef(() => {
    const rw = vtkRenderWindow.newInstance();
    deletionRegistry.register(rw, () => rw.delete());
    return rw;
  });

  useEffect(() => {
    const rwView = openGLRenderWindow.get();
    deletionRegistry.incRefCount(rwView);
    const renderWindow = getRenderWindow();
    renderWindow.addView(rwView);
    return () => {
      renderWindow.removeView(rwView);
      deletionRegistry.decRefCount(rwView);
    };
  }, [openGLRenderWindow, getRenderWindow]);

  useUnmount(() => {
    if (rwRef.current) {
      deletionRegistry.markForDeletion(rwRef.current);
      rwRef.current = null;
    }
  });

  // --- Interactor --- //

  const getInteractor = useInteractor(openGLRenderWindow);

  useEffect(() => {
    getRenderWindow().setInteractor(getInteractor());
  });

  // --- rendering --- //

  const renderTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const queueRender = useCallback(() => {
    if (renderTimeoutRef.current == null) {
      renderTimeoutRef.current = setTimeout(() => {
        renderTimeoutRef.current = null;
        const renderWindow = getRenderWindow();
        renderWindow.render();
      });
    }
  }, [getRenderWindow]);

  // --- resize --- //

  const updateViewSize = useCallback(() => {
    const container = openGLRenderWindow.getContainer();
    if (!container) return;

    const renderWindowView = openGLRenderWindow.get();
    const devicePixelRatio = window.devicePixelRatio || 1;
    const { width, height } = container.getBoundingClientRect();
    const w = Math.floor(width * devicePixelRatio);
    const h = Math.floor(height * devicePixelRatio);
    renderWindowView.setSize(Math.max(w, 10), Math.max(h, 10));
    queueRender();
  }, [openGLRenderWindow, queueRender]);

  useResizeObserver(openGLRenderWindow.get().getContainer(), updateViewSize);
  useMount(() => updateViewSize());

  // --- api --- //

  const api = useMemo<IRenderWindow>(
    () => ({
      get: getRenderWindow,
      getInteractor,
      requestRender: queueRender,
    }),
    [getRenderWindow, getInteractor, queueRender]
  );

  useImperativeHandle(fwdRef, () => api);

  return (
    <RenderWindowContext.Provider value={api}>
      {props.children}
    </RenderWindowContext.Provider>
  );
});
