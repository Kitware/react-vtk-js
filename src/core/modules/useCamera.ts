import { ICameraInitialValues } from '@kitware/vtk.js/Rendering/Core/Camera';
import vtkRenderer from '@kitware/vtk.js/Rendering/Core/Renderer';
import { Vector3 } from '@kitware/vtk.js/types';
import { useCallback } from 'react';
import { compareShallowObject } from '../../utils/comparators';
import { BooleanAccumulator } from '../../utils/useBooleanAccumulator';
import useComparableEffect from '../../utils/useComparableEffect';

export default function useCamera(
  getRenderer: () => vtkRenderer,
  cameraProps: ICameraInitialValues | undefined,
  trackModified: BooleanAccumulator
) {
  const getCamera = useCallback(
    () => getRenderer().getActiveCamera(),
    [getRenderer]
  );

  useComparableEffect(
    () => {
      if (!cameraProps) return;
      const camera = getCamera();
      const mtime = camera.getMTime();

      // filter out any null props
      Object.keys(cameraProps).forEach((key) => {
        const name = key as keyof ICameraInitialValues;
        if (!cameraProps[name]) {
          delete cameraProps[name];
        }
      });

      camera.set(cameraProps);

      // force-set focal point and direction of projection,
      // as setting the position changes the focal point and dop
      if (cameraProps.directionOfProjection) {
        camera.setDirectionOfProjection(
          ...(cameraProps.directionOfProjection as Vector3)
        );
      }
      if (cameraProps.focalPoint) {
        camera.setFocalPoint(...(cameraProps.focalPoint as Vector3));
      }

      // camera.set doesn't return whether a change occurred,
      // since setPosition/etc. don't return this flag.
      trackModified(mtime < camera.getMTime());
    },
    [cameraProps],
    ([cur], [prev]) => compareShallowObject(cur, prev)
  );

  return getCamera;
}
