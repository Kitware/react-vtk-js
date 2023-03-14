import { Bounds } from '@kitware/vtk.js/types';
import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react';
import {
  IOpenGLRenderWindow,
  IRenderer,
  IRenderWindow,
  IView,
} from '../../types';
import { omit, pick } from '../../utils';
import useMount from '../../utils/useMount';
import { ViewContext } from '../contexts';
import useApplyCenterOfRotation from '../modules/useApplyCenterOfRotation';
import {
  useInteractorStyle,
  useInteractorStyleManipulatorSettings,
} from '../modules/useInteractorStyle';
import OpenGLRenderWindow from '../OpenGLRenderWindow';
import Renderer from '../Renderer';
import RenderWindow from '../RenderWindow';
import { DefaultProps, ViewProps } from './view-shared';

/**
 * A standalone View (not within a MultiViewRoot).
 */
const SingleView = forwardRef(function SingleView(props: ViewProps, fwdRef) {
  // view API just exposes the render window + renderer
  const openGLRenderWindowRef = useRef<IOpenGLRenderWindow | null>(null);
  const renderWindowRef = useRef<IRenderWindow | null>(null);
  const rendererRef = useRef<IRenderer | null>(null);

  const rendererProps = pick(
    props,
    'background',
    'interactive',
    'camera',
    'autoResetCamera'
  );

  const openGLRenderWindowProps = omit(
    props,
    ...([...Object.keys(rendererProps)] as (keyof ViewProps)[])
  );

  // --- interactor style --- //

  const getInteractor = useCallback(
    () => renderWindowRef.current?.getInteractor() ?? null,
    []
  );

  const [getInteractorStyle, setInteractorStyle] =
    useInteractorStyle(getInteractor);

  useMount(() => {
    getInteractor()?.setInteractorStyle(getInteractorStyle());
  });

  const {
    interactorSettings = DefaultProps.interactorSettings,
    autoCenterOfRotation = DefaultProps.autoCenterOfRotation,
  } = props;
  useInteractorStyleManipulatorSettings(getInteractorStyle, interactorSettings);

  useApplyCenterOfRotation(
    rendererRef,
    getInteractorStyle,
    autoCenterOfRotation
  );

  // --- api --- //

  const api = useMemo<IView>(
    () => ({
      isInMultiViewRoot: () => false,
      getViewContainer: () =>
        openGLRenderWindowRef.current?.getContainer() ?? null,
      getOpenGLRenderWindow: () => openGLRenderWindowRef.current,
      getRenderWindow: () => renderWindowRef.current,
      getRenderer: () => rendererRef.current,
      getInteractorStyle: () => getInteractorStyle(),
      setInteractorStyle: (style) => setInteractorStyle(style),
      requestRender: () => rendererRef.current?.requestRender(),
      getCamera: () => rendererRef.current?.get().getActiveCamera() ?? null,
      resetCamera: (boundsToUse?: Bounds) =>
        rendererRef.current?.resetCamera(boundsToUse),
    }),
    [getInteractorStyle, setInteractorStyle]
  );

  useImperativeHandle(fwdRef, () => api);

  return (
    <ViewContext.Provider value={api}>
      <OpenGLRenderWindow
        {...openGLRenderWindowProps}
        ref={openGLRenderWindowRef}
      >
        <RenderWindow ref={renderWindowRef}>
          <Renderer {...rendererProps} ref={rendererRef}>
            {props.children}
          </Renderer>
        </RenderWindow>
      </OpenGLRenderWindow>
    </ViewContext.Provider>
  );
});

export default SingleView;
