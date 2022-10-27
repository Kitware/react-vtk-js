import vtkRenderer from '@kitware/vtk.js/Rendering/Core/Renderer';
import vtkRenderWindow from '@kitware/vtk.js/Rendering/Core/RenderWindow';
import vtkOpenGLRenderWindow from '@kitware/vtk.js/Rendering/OpenGL/RenderWindow';
import { useEffect } from 'react';
import useGetterRef from '../../utils-ts/useGetterRef';
import useUnmount from '../../utils-ts/useUnmount';

export default function useRenderWindow(
  getRWView: () => vtkOpenGLRenderWindow,
  getRenderer: () => vtkRenderer
) {
  const [rwRef, getRenderWindow] = useGetterRef(() => {
    return vtkRenderWindow.newInstance();
  });

  useEffect(() => {
    const rwView = getRWView();
    const renderWindow = getRenderWindow();
    renderWindow.addView(rwView);
    return () => {
      renderWindow.removeView(rwView);
    };
  }, [getRWView, getRenderWindow]);

  useEffect(() => {
    const renderWindow = getRenderWindow();
    const renderer = getRenderer();
    renderWindow.addRenderer(renderer);
    return () => {
      renderWindow.removeRenderer(renderer);
    };
  }, [getRenderer, getRenderWindow]);

  useUnmount(() => {
    if (rwRef.current) {
      rwRef.current.delete();
      rwRef.current = null;
    }
  });

  return getRenderWindow;
}
