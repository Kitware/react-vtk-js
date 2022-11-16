import { forwardRef, PropsWithChildren, useRef } from 'react';
import { IRenderer, IRenderWindow } from '../types';
import { omit, pick } from '../utils-ts';
import OpenGLRenderWindow, {
  IOpenGLRenderWindow,
  Props as OpenGLRenderWindowProps,
} from './OpenGLRenderWindow';
import Renderer, { Props as RendererProps } from './Renderer';
import RenderWindow, { Props as RenderWindowProps } from './RenderWindow';

interface Props
  extends PropsWithChildren,
    OpenGLRenderWindowProps,
    RenderWindowProps,
    RendererProps {
  /**
   * List of picking listeners to bind. By default it is disabled (empty array).
   */
  // pickingModes?: 'click' | 'hover' | 'select' | 'mouseDown' | 'mouseUp';
  /**
   * User callback function for click
   */
  // onClick?: () => void;
  /**
   * User callback function for mouse down
   */
  // onMouseDown?: () => void;
  /**
   * User callback function for mouse up
   */
  // onMouseUp?: () => void;
  /**
   * User callback function for hover
   */
  // onHover?: () => void;
  /**
   * User callback function for box select
   */
  // onSelect?: () => void;
  /**
   * Defines the tolerance of the click and hover selection.
   */
  // pointerSize?: number;
  /**
   * Show/Hide orientation axes.
   */
  // showOrientationAxes?: boolean;
}

export default forwardRef(function View(props: Props, fwdRef) {
  const openGLRenderWindowRef = useRef<IOpenGLRenderWindow | null>(null);
  const renderWindowRef = useRef<IRenderWindow | null>(null);
  const rendererRef = useRef<IRenderer | null>(null);

  const renderWindowProps = pick(props, 'interactorSettings');
  const rendererProps = pick(
    props,
    'background',
    'interactive',
    'camera',
    'autoResetCamera',
    'autoCenterOfRotation'
  );

  const openGLRenderWindowProps = omit(
    props,
    ...([
      ...Object.keys(renderWindowProps),
      ...Object.keys(rendererProps),
    ] as (keyof Props)[])
  );

  // view API just exposes the render window + renderer
  return (
    <OpenGLRenderWindow
      {...openGLRenderWindowProps}
      ref={openGLRenderWindowRef}
    >
      <RenderWindow {...renderWindowProps} ref={renderWindowRef}>
        <Renderer {...rendererProps} ref={rendererRef}>
          {props.children}
        </Renderer>
      </RenderWindow>
    </OpenGLRenderWindow>
  );
});
