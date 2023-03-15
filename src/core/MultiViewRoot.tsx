import {
  CSSProperties,
  PropsWithChildren,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import { IOpenGLRenderWindow, IRenderWindow } from '../types';
import {
  IResizeWatcher,
  ResizeWatcher,
  ResizeWatcherContext,
} from '../utils/ResizeWatcher';
import { MultiViewRootContext } from './contexts';
import OpenGLRenderWindow, {
  OpenGLRenderWindowProps,
} from './OpenGLRenderWindow';
import RenderWindow from './RenderWindow';

export interface MultiViewRootProps
  extends PropsWithChildren,
    OpenGLRenderWindowProps {}

const RW_STYLE: CSSProperties = {
  pointerEvents: 'none',
};

export default function MultiViewRoot(props: MultiViewRootProps) {
  const openGLRenderWindowRef = useRef<IOpenGLRenderWindow | null>(null);
  const renderWindowRef = useRef<IRenderWindow | null>(null);
  const resizeWatcherRef = useRef<IResizeWatcher>(new ResizeWatcher());

  const onResize = useCallback((target: Element) => {
    const oglrw = openGLRenderWindowRef.current;
    const rw = renderWindowRef.current;
    if (!oglrw || !rw) return;

    const devicePixelRatio = window.devicePixelRatio || 1;
    const { width, height } = target.getBoundingClientRect();
    const w = Math.floor(width * devicePixelRatio);
    const h = Math.floor(height * devicePixelRatio);
    oglrw.get().setSize(Math.max(w, 10), Math.max(h, 10));
    rw.requestRender();
  }, []);

  useEffect(() => {
    const oglrw = openGLRenderWindowRef.current;
    const container = oglrw?.getContainer();
    if (oglrw && container) {
      const resize = resizeWatcherRef.current;
      resize.watch(container, onResize);
      return () => {
        resize.unwatch(container, onResize);
      };
    }
  }, [onResize]);

  return (
    <ResizeWatcherContext.Provider value={resizeWatcherRef.current}>
      <MultiViewRootContext.Provider value={true}>
        <OpenGLRenderWindow
          {...props}
          renderWindowStyle={RW_STYLE}
          ref={openGLRenderWindowRef}
        >
          <RenderWindow ref={renderWindowRef}>{props.children}</RenderWindow>
        </OpenGLRenderWindow>
      </MultiViewRootContext.Provider>
    </ResizeWatcherContext.Provider>
  );
}
