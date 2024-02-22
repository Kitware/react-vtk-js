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
import useViewEvents, { ViewEvents } from '../modules/useViewEvents';
import OpenGLRenderWindow from '../OpenGLRenderWindow';
import Renderer from '../Renderer';
import RenderWindow from '../RenderWindow';
import { viewMountedEvent } from './events';
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

  const [getInteractorStyle, setInteractorStyle, isExternalStyle] =
    useInteractorStyle(getInteractor);

  useMount(() => {
    getInteractor()?.setInteractorStyle(getInteractorStyle());
  });

  const {
    interactorSettings = DefaultProps.interactorSettings,
    autoCenterOfRotation = DefaultProps.autoCenterOfRotation,
  } = props;
  useInteractorStyleManipulatorSettings(
    getInteractorStyle,
    isExternalStyle,
    interactorSettings
  );

  useApplyCenterOfRotation(
    rendererRef,
    getInteractorStyle,
    autoCenterOfRotation
  );

  // --- events --- //

  const { rootListeners, registerEventListener } = useViewEvents();

  // --- api --- //

  let mounted = false;
  useMount(() => {
    mounted = true;
    viewMountedEvent.trigger();
  });

  const api = useMemo<IView>(
    () => ({
      isInMultiViewRoot: () => false,
      isMounted: () => mounted,
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
    [mounted, getInteractorStyle, setInteractorStyle]
  );

  useImperativeHandle(fwdRef, () => api);

  return (
    <ViewContext.Provider value={api}>
      <ViewEvents.Provider value={registerEventListener}>
        <OpenGLRenderWindow
          {...openGLRenderWindowProps}
          {...rootListeners}
          ref={openGLRenderWindowRef}
        >
          <RenderWindow ref={renderWindowRef}>
            <Renderer {...rendererProps} ref={rendererRef}>
              {props.children}
            </Renderer>
          </RenderWindow>
        </OpenGLRenderWindow>
      </ViewEvents.Provider>
    </ViewContext.Provider>
  );
});

export default SingleView;
