import { PropsWithChildren } from 'react';
import { ManipulatorSettings } from '../modules/useInteractorStyle';
import { Props as OpenGLRenderWindowProps } from '../OpenGLRenderWindow';
import { Props as RendererProps } from '../Renderer';
import { Props as RenderWindowProps } from '../RenderWindow';

export interface Props
  extends PropsWithChildren,
    OpenGLRenderWindowProps,
    RenderWindowProps,
    RendererProps {
  /**
   * Show/Hide orientation axes.
   */
  // showOrientationAxes?: boolean;

  /**
   * Configure the interactions
   */
  interactorSettings?: ManipulatorSettings[];

  /**
   * Whether to automatically re-set the interactor style's center of rotation. (default: true)
   *
   * This is a convenience property for interactor styles that support setCenterOfRotation().
   */
  autoCenterOfRotation?: boolean;
}

export const DefaultProps = {
  interactorSettings: [
    {
      button: 1,
      action: 'Rotate',
    },
    {
      button: 2,
      action: 'Pan',
    },
    {
      button: 3,
      action: 'Zoom',
      scrollEnabled: true,
    },
    {
      button: 1,
      action: 'Pan',
      alt: true,
    },
    {
      button: 1,
      action: 'Zoom',
      control: true,
    },
    {
      button: 1,
      action: 'Select',
      shift: true,
    },
    {
      button: 1,
      action: 'Roll',
      alt: true,
      shift: true,
    },
  ] as ManipulatorSettings[],
  autoCenterOfRotation: true,
};
