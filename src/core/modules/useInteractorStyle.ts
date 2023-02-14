import vtkGestureCameraManipulator from '@kitware/vtk.js/Interaction/Manipulators/GestureCameraManipulator';
import vtkMouseBoxSelectorManipulator, {
  IMouseBoxSelectorManipulatorInitialValues,
} from '@kitware/vtk.js/Interaction/Manipulators/MouseBoxSelectorManipulator';
import vtkMouseCameraTrackballMultiRotateManipulator, {
  IMouseCameraTrackballMultiRotateManipulatorInitialValues,
} from '@kitware/vtk.js/Interaction/Manipulators/MouseCameraTrackballMultiRotateManipulator';
import vtkMouseCameraTrackballPanManipulator, {
  IMouseCameraTrackballPanManipulatorInitialValues,
} from '@kitware/vtk.js/Interaction/Manipulators/MouseCameraTrackballPanManipulator';
import vtkMouseCameraTrackballRollManipulator, {
  IMouseCameraTrackballRollManipulatorInitialValues,
} from '@kitware/vtk.js/Interaction/Manipulators/MouseCameraTrackballRollManipulator';
import vtkMouseCameraTrackballRotateManipulator, {
  IMouseCameraTrackballRotateManipulatorInitialValues,
} from '@kitware/vtk.js/Interaction/Manipulators/MouseCameraTrackballRotateManipulator';
import vtkMouseCameraTrackballZoomManipulator, {
  IMouseCameraTrackballZoomManipulatorInitialValues,
} from '@kitware/vtk.js/Interaction/Manipulators/MouseCameraTrackballZoomManipulator';
import vtkMouseCameraTrackballZoomToMouseManipulator, {
  IMouseCameraTrackballZoomToMouseManipulatorInitialValues,
} from '@kitware/vtk.js/Interaction/Manipulators/MouseCameraTrackballZoomToMouseManipulator';
import vtkInteractorStyle from '@kitware/vtk.js/Interaction/Style/InteractorStyle';
import vtkInteractorStyleManipulator from '@kitware/vtk.js/Interaction/Style/InteractorStyleManipulator';
import vtkRenderWindowInteractor from '@kitware/vtk.js/Rendering/Core/RenderWindowInteractor';
import deepEqual from 'deep-equal';
import { useCallback, useEffect } from 'react';
import deletionRegistry from '../../utils/DeletionRegistry';
import useComparableEffect from '../../utils/useComparableEffect';
import useGetterRef from '../../utils/useGetterRef';

interface PanSettings extends IMouseCameraTrackballPanManipulatorInitialValues {
  action: 'Pan';
}

interface ZoomSettings
  extends IMouseCameraTrackballZoomManipulatorInitialValues {
  action: 'Zoom';
}

interface RollSettings
  extends IMouseCameraTrackballRollManipulatorInitialValues {
  action: 'Roll';
}

interface RotateSettings
  extends IMouseCameraTrackballRotateManipulatorInitialValues {
  action: 'Rotate';
}

interface MultiRotateSettings
  extends IMouseCameraTrackballMultiRotateManipulatorInitialValues {
  action: 'MultiRotate';
}

interface ZoomToMouseSettings
  extends IMouseCameraTrackballZoomToMouseManipulatorInitialValues {
  action: 'ZoomToMouse';
}

interface SelectSettings extends IMouseBoxSelectorManipulatorInitialValues {
  action: 'Select';
}

export type ManipulatorSettings =
  | PanSettings
  | ZoomSettings
  | RollSettings
  | RotateSettings
  | MultiRotateSettings
  | ZoomToMouseSettings
  | SelectSettings;

const settingToManipulator = (setting: ManipulatorSettings) => {
  switch (setting.action) {
    case 'Pan':
      return vtkMouseCameraTrackballPanManipulator.newInstance(setting);
    case 'Zoom':
      return vtkMouseCameraTrackballZoomManipulator.newInstance(setting);
    case 'Roll':
      return vtkMouseCameraTrackballRollManipulator.newInstance(setting);
    case 'Rotate':
      return vtkMouseCameraTrackballRotateManipulator.newInstance(setting);
    case 'MultiRotate':
      return vtkMouseCameraTrackballMultiRotateManipulator.newInstance(setting);
    case 'ZoomToMouse':
      return vtkMouseCameraTrackballZoomToMouseManipulator.newInstance(setting);
    case 'Select':
      return vtkMouseBoxSelectorManipulator.newInstance(setting);
  }
};

export function useInteractorStyleManipulatorSettings(
  getStyle: () => vtkInteractorStyle,
  settings: ManipulatorSettings[]
) {
  useComparableEffect(
    () => {
      if (!getStyle().isA('vtkInteractorStyleManipulator')) return;
      const style = getStyle() as vtkInteractorStyleManipulator;
      style.removeAllManipulators();
      // always add gestures
      style.addGestureManipulator(vtkGestureCameraManipulator.newInstance());

      settings.forEach((setting) => {
        const manip = settingToManipulator(setting);
        // TODO on box select change
        style.addMouseManipulator(manip);
      });
    },
    [settings],
    ([cur], [prev]) => deepEqual(cur, prev)
  );
}

export function useInteractorStyle(
  getInteractor: () => vtkRenderWindowInteractor | null
) {
  const [styleRef, getStyle] = useGetterRef<vtkInteractorStyle>(() => {
    const style = vtkInteractorStyleManipulator.newInstance();
    deletionRegistry.register(style, () => style.delete());
    return style;
  });

  const setStyle = useCallback(
    (style: vtkInteractorStyle) => {
      const interactor = getInteractor();
      if (!interactor) return;
      interactor.setInteractorStyle(style ?? styleRef.current);
    },
    [getInteractor, styleRef]
  );

  useEffect(() => {
    const interactor = getInteractor();
    if (!interactor) return;

    deletionRegistry.incRefCount(interactor);
    if (styleRef.current) {
      setStyle(styleRef.current);
    }

    return () => {
      if (styleRef.current) {
        if (interactor.getInteractorStyle() === styleRef.current) {
          interactor.setInteractorStyle(null);
        }

        deletionRegistry.markForDeletion(styleRef.current);
        styleRef.current = null;
      }

      deletionRegistry.decRefCount(interactor);
    };
  }, [getInteractor, styleRef, setStyle]);

  return [getStyle, setStyle] as const;
}
