import vtkInteractorStyle from '@kitware/vtk.js/Rendering/Core/InteractorStyle';
import {
  FixedVTKRenderer,
  VtkRendererEvent,
} from '@kitware/vtk.js/type-patches';
import { Vector3 } from '@kitware/vtk.js/types';
import { RefObject, useEffect } from 'react';
import { IRenderer } from '../../types';

export default function useApplyCenterOfRotation(
  rendererRef: RefObject<IRenderer | null>,
  getInteractorStyle: () => vtkInteractorStyle,
  autoCenterOfRotation: boolean
) {
  // This runs every react render, since I'm not sure what deps would
  // trigger whenever the underlying renderer changes.
  useEffect(() => {
    const ren = rendererRef.current;
    if (!ren) return;

    const sub = (ren.get() as FixedVTKRenderer).onEvent((ev) => {
      const rendererEvent = ev as VtkRendererEvent;
      if (rendererEvent.type === 'ResetCameraEvent') {
        const style = getInteractorStyle() as vtkInteractorStyle & {
          setCenterOfRotation?(center: Vector3): boolean;
        };
        if (!autoCenterOfRotation || !style.setCenterOfRotation) {
          return;
        }

        const center = rendererEvent.renderer.getActiveCamera().getFocalPoint();
        style.setCenterOfRotation(center);
      }
    });
    return () => {
      sub.unsubscribe();
    };
  });
}
