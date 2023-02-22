import vtkRenderWindowInteractor from '@kitware/vtk.js/Rendering/Core/RenderWindowInteractor';
import { useEffect } from 'react';
import { IOpenGLRenderWindow } from '../../types';
import deletionRegistry from '../../utils/DeletionRegistry';
import useGetterRef from '../../utils/useGetterRef';
import useUnmount from '../../utils/useUnmount';

export default function useInteractor(openglRenderWindow: IOpenGLRenderWindow) {
  const [interactorRef, getInteractor] = useGetterRef(() => {
    const interactor = vtkRenderWindowInteractor.newInstance();
    deletionRegistry.register(interactor, () => interactor.delete());
    return interactor;
  });

  useEffect(() => {
    const container = openglRenderWindow.getContainer();
    if (!container) return;

    const interactor = getInteractor();
    const rwView = openglRenderWindow.get();
    deletionRegistry.incRefCount(rwView);

    interactor.setView(rwView);
    interactor.initialize();
    interactor.bindEvents(container);
    return () => {
      interactor.disable();
      interactor.unbindEvents();
      deletionRegistry.decRefCount(rwView);
    };
  }, [openglRenderWindow, getInteractor]);

  useUnmount(() => {
    if (interactorRef.current) {
      deletionRegistry.markForDeletion(interactorRef.current);
      interactorRef.current = null;
    }
  });

  return getInteractor;
}
