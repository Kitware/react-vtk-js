import vtkOpenGLRenderWindow from '@kitware/vtk.js/Rendering/OpenGL/RenderWindow';
import { Nullable } from '@kitware/vtk.js/types';
import { useEffect } from 'react';
import useGetterRef from '../../utils-ts/useGetterRef';
import useUnmount from '../../utils-ts/useUnmount';

export default function useRenderWindowView(container: Nullable<HTMLElement>) {
  const [viewRef, getView] = useGetterRef(() => {
    return vtkOpenGLRenderWindow.newInstance();
  });

  useEffect(() => {
    const view = getView();
    // FIXME setContainer API should allow null
    view.setContainer(container as HTMLElement);
  }, [container, getView]);

  useUnmount(() => {
    if (viewRef.current) {
      viewRef.current.delete();
      viewRef.current = null;
    }
  });

  return getView;
}
