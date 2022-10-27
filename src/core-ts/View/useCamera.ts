import { ICameraInitialValues } from '@kitware/vtk.js/Rendering/Core/Camera';
import vtkRenderer from '@kitware/vtk.js/Rendering/Core/Renderer';
import { useCallback } from 'react';
import { compareShallowObject } from '../../utils-ts/comparators';
import useComparableEffect from '../../utils-ts/useComparableEffect';

export default function useCamera(
  getRenderer: () => vtkRenderer,
  requestRender: () => void,
  cameraProps?: ICameraInitialValues
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
      camera.set(cameraProps);
      // camera.set doesn't return whether a change occurred,
      // since setPosition/etc. don't return this flag.
      if (mtime < camera.getMTime()) {
        requestRender();
      }
    },
    [cameraProps],
    ([cur], [prev]) => compareShallowObject(cur, prev)
  );

  return getCamera;
}
