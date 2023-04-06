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
import vtkInteractorStyleManipulator from '@kitware/vtk.js/Interaction/Style/InteractorStyleManipulator';
import vtkInteractorStyle from '@kitware/vtk.js/Rendering/Core/InteractorStyle';
import vtkRenderWindowInteractor from '@kitware/vtk.js/Rendering/Core/RenderWindowInteractor';
import deepEqual from 'deep-equal';
import { useCallback, useEffect, useRef } from 'react';
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
  isExternalStyle: () => boolean,
  settings: ManipulatorSettings[]
) {
  useComparableEffect(
    () => {
      // Assumes external styles are externally controlled
      if (isExternalStyle()) return;
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
    [settings, isExternalStyle],
    (cur, prev) => deepEqual(cur, prev)
  );
}

export function useInteractorStyle(
  getInteractor: () => vtkRenderWindowInteractor | null
) {
  /**
   * internalStyle: self-managed InteractorStyleManipulator
   * externalStyle: user-set style
   *   - The external style takes precedence over the internal style in getStyle().
   *
   * In a parented view, the style gets set on the interactor whenever
   *   the user hovers over the view.
   * In a single view, the style gets set unconditionally.
   *
   * If the external style is updated:
   *   Single view: set it on the interactor unconditionally
   *   Parented view: set it on the interactor if the previous style
   *     is currently registered to the interactor.
   */
  const [internalStyleRef, getInternalStyle] = useGetterRef<vtkInteractorStyle>(
    () => {
      const style = vtkInteractorStyleManipulator.newInstance();
      deletionRegistry.register(style, () => style.delete());
      return style;
    }
  );

  const externalStyleRef = useRef<vtkInteractorStyle | null>(null);
  const isExternalStyle = useCallback(() => !!externalStyleRef.current, []);

  const getStyle = useCallback(() => {
    return externalStyleRef.current ?? getInternalStyle();
  }, [getInternalStyle]);

  const setStyle = useCallback(
    (style: vtkInteractorStyle) => {
      const currentStyle = getStyle();
      const interactor = getInteractor();
      if (!interactor) return;

      // Single view: always true
      // Parented view: true if we've hovered over the View
      const isCurrentlySet = interactor.getInteractorStyle() === currentStyle;
      if (isCurrentlySet) {
        interactor.setInteractorStyle(style);
      }

      externalStyleRef.current = style;
    },
    [getInteractor, getStyle]
  );

  useEffect(() => {
    const interactor = getInteractor();
    if (!interactor) return;

    deletionRegistry.incRefCount(interactor);
    return () => {
      if (interactor.getInteractorStyle() === getStyle()) {
        interactor.setInteractorStyle(null);
      }
      deletionRegistry.decRefCount(interactor);
      deletionRegistry.markForDeletion(internalStyleRef.current);
      internalStyleRef.current = null;
    };
  }, [getInteractor, getStyle, internalStyleRef]);

  return [getStyle, setStyle, isExternalStyle] as const;
}
