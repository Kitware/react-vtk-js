import vtkRenderWindowInteractor from '@kitware/vtk.js/Rendering/Core/RenderWindowInteractor';
import vtkOpenGLRenderWindow from '@kitware/vtk.js/Rendering/OpenGL/RenderWindow';
import { Nullable } from '@kitware/vtk.js/types';
import { useEffect } from 'react';
import useGetterRef from '../../utils-ts/useGetterRef';
import useUnmount from '../../utils-ts/useUnmount';

export default function useInteractor(
  getRWView: () => vtkOpenGLRenderWindow,
  container: Nullable<HTMLElement>,
  interactive: boolean
) {
  const [interactorRef, getInteractor] = useGetterRef(() => {
    return vtkRenderWindowInteractor.newInstance();
  });

  useEffect(() => {
    if (!container || !interactive) return;
    const interactor = getInteractor();
    const rwView = getRWView();

    interactor.setView(rwView);
    interactor.initialize();
    interactor.bindEvents(container);
  }, [interactive, container, getRWView, getInteractor]);

  useUnmount(() => {
    if (interactorRef.current) {
      interactorRef.current.delete();
      interactorRef.current = null;
    }
  });

  return getInteractor;
}
