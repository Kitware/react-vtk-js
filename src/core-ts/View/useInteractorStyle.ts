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
import { Nullable } from '@kitware/vtk.js/types';
import deepEqual from 'deep-equal';
import { useEffect, useState } from 'react';
import useComparableEffect from '../../utils-ts/useComparableEffect';
import useGetterRef from '../../utils-ts/useGetterRef';
import useUnmount from '../../utils-ts/useUnmount';

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
      if (getStyle().getClassName() !== 'vtkInteractorStyleManipulator') return;
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
  getInteractor: () => vtkRenderWindowInteractor
) {
  const [externalStyle, setExternalStyle] =
    useState<Nullable<vtkInteractorStyle>>(null);

  const [styleRef, getStyle] = useGetterRef<vtkInteractorStyle>(() => {
    setExternalStyle(null);
    return vtkInteractorStyleManipulator.newInstance();
  });

  useEffect(() => {
    getInteractor().setInteractorStyle(getStyle());
  });

  useUnmount(() => {
    if (styleRef.current && !externalStyle) {
      styleRef.current.delete();
      styleRef.current = null;
    }
  });

  const setStyle = (style: vtkInteractorStyle) => {
    if (!externalStyle && styleRef.current) {
      styleRef.current.delete();
    }
    styleRef.current = style;
    // should help retrigger effects dependent on the style
    setExternalStyle(style);
  };

  return [getStyle, setStyle] as const;
}
