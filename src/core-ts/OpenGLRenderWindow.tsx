import vtkOpenGLRenderWindow from '@kitware/vtk.js/Rendering/OpenGL/RenderWindow';
import {
  CSSProperties,
  forwardRef,
  HTMLProps,
  PropsWithChildren,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react';
import { IOpenGLRenderWindow } from '../types';
import deletionRegistry from '../utils-ts/DeletionRegistry';
import useGetterRef from '../utils-ts/useGetterRef';
import useUnmount from '../utils-ts/useUnmount';
import { OpenGLRenderWindowContext } from './contexts';

const RENDERWINDOW_STYLE: CSSProperties = {
  position: 'absolute',
  width: '100%',
  height: '100%',
  overflow: 'hidden',
};

export interface Props extends PropsWithChildren, HTMLProps<HTMLDivElement> {
  renderWindowStyle?: CSSProperties;
}

export default forwardRef(function OpenGLRenderWindow(props: Props, fwdRef) {
  const rwContainerRef = useRef<HTMLDivElement | null>(null);

  const [viewRef, getRWView] = useGetterRef(() => {
    const view = vtkOpenGLRenderWindow.newInstance();
    deletionRegistry.register(view, () => view.delete());
    return view;
  });

  useEffect(() => {
    const view = getRWView();
    view.setContainer(rwContainerRef.current as HTMLElement);
    return () => {
      // FIXME setContainer API should allow null
      view.setContainer(null as unknown as HTMLElement);
    };
  }, [getRWView]);

  useUnmount(() => {
    if (viewRef.current) {
      deletionRegistry.markForDeletion(viewRef.current);
      viewRef.current = null;
    }
  });

  const api = useMemo<IOpenGLRenderWindow>(
    () => ({
      get: getRWView,
      getContainer: () => rwContainerRef.current,
    }),
    [getRWView]
  );

  useImperativeHandle(fwdRef, () => api);

  const { children, style, renderWindowStyle, ...containerProps } = props;
  const containerStyle = useMemo<CSSProperties>(
    () => ({
      position: 'relative',
      width: '100%',
      height: '100%',
      ...style,
    }),
    [style]
  );

  const rwContainerStyle = useMemo<CSSProperties>(
    () => ({
      ...RENDERWINDOW_STYLE,
      ...renderWindowStyle,
    }),
    [renderWindowStyle]
  );

  return (
    <div {...containerProps} style={containerStyle}>
      <div ref={rwContainerRef} style={rwContainerStyle} />
      <OpenGLRenderWindowContext.Provider value={api}>
        {children}
      </OpenGLRenderWindowContext.Provider>
    </div>
  );
});
