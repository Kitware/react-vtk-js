import { FixedVTKRenderWindowInteractor } from '@kitware/vtk.js/type-patches';
import { Bounds } from '@kitware/vtk.js/types';
import {
  CSSProperties,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react';
import { IRenderer, IView } from '../../types';
import { pick } from '../../utils';
import { ResizeWatcherContext } from '../../utils/ResizeWatcher';
import { useEventListener } from '../../utils/useEventListener';
import useMount from '../../utils/useMount';
import {
  OpenGLRenderWindowContext,
  RenderWindowContext,
  ViewContext,
} from '../contexts';
import useApplyCenterOfRotation from '../modules/useApplyCenterOfRotation';
import {
  useInteractorStyle,
  useInteractorStyleManipulatorSettings,
} from '../modules/useInteractorStyle';
import useViewEvents, { ViewEvents } from '../modules/useViewEvents';
import Renderer from '../Renderer';
import { viewMountedEvent } from './events';
import { DefaultProps, ViewProps } from './view-shared';

/**
 * A View that is within a MultiViewRoot.
 */
const ParentedView = forwardRef(function ParentedView(
  props: ViewProps,
  fwdRef
) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<IRenderer | null>(null);

  const rendererProps = pick(
    props,
    'background',
    'interactive',
    'camera',
    'autoResetCamera'
  );

  const openGLRenderWindowAPI = useContext(OpenGLRenderWindowContext);
  if (!openGLRenderWindowAPI) {
    throw new Error('OpenGLRenderWindow is missing inside the MultiViewRoot');
  }

  const renderWindowAPI = useContext(RenderWindowContext);
  if (!renderWindowAPI) {
    throw new Error('RenderWindow is missing inside the MultiViewRoot');
  }

  // --- interactor & style binding --- //

  const getInteractor = useCallback(
    () => renderWindowAPI.getInteractor(),
    [renderWindowAPI]
  );

  const [getInteractorStyle, setInteractorStyle, isExternalStyle] =
    useInteractorStyle(getInteractor);

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

  /**
   * 1. Switch to targeted renderer.
   * 2. Switch to this View's interactor style.
   */
  const switchTarget = (): boolean => {
    const rendererAPI = rendererRef.current;
    if (!rendererAPI) return false;

    const interactor = getInteractor() as FixedVTKRenderWindowInteractor;

    interactor.setCurrentRenderer(rendererAPI.get());
    interactor.setInteractorStyle(getInteractorStyle());

    const oldContainer = interactor.getContainer();
    const newContainer = containerRef.current;
    if (oldContainer !== newContainer) {
      return interactor.setContainer(newContainer);
    }
    return false;
  };

  // Use wheel events to cover the posibility of interacting
  // with an out-of-focus browser window.
  useEventListener(
    containerRef,
    'wheel',
    () => {
      switchTarget();
    },
    { capture: true }
  );

  useEventListener(
    containerRef,
    'pointerenter',
    () => {
      switchTarget();
    },
    { capture: true }
  );

  // --- resize handling --- //

  const resizeWatcher = useContext(ResizeWatcherContext);

  const onResize = useCallback(() => {
    const renderer = rendererRef.current;
    const viewContainer = openGLRenderWindowAPI.getContainer();
    const rendererContainer = containerRef.current;

    if (!renderer || !viewContainer || !rendererContainer) return;

    const viewBox = viewContainer.getBoundingClientRect();
    const rendererBox = rendererContainer.getBoundingClientRect();

    const top = rendererBox.top - viewBox.top;
    const left = rendererBox.left - viewBox.left;

    const xmin = left / viewBox.width;
    const xmax = (left + rendererBox.width) / viewBox.width;
    const ymin = 1 - (top + rendererBox.height) / viewBox.height;
    const ymax = 1 - top / viewBox.height;

    renderer.get().setViewport(xmin, ymin, xmax, ymax);
    renderer.requestRender();
  }, [openGLRenderWindowAPI]);

  useMount(() => onResize());

  useEffect(() => {
    const rendererContainer = containerRef.current;
    const renderer = rendererRef.current;
    const viewContainer = openGLRenderWindowAPI.getContainer();
    if (resizeWatcher && rendererContainer && renderer && viewContainer) {
      resizeWatcher.watch(rendererContainer, onResize);
      resizeWatcher.watch(viewContainer, onResize);
      return () => {
        resizeWatcher.unwatch(rendererContainer, onResize);
        resizeWatcher.unwatch(viewContainer, onResize);
      };
    }
  }, [onResize, openGLRenderWindowAPI, resizeWatcher]);

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
      isInMultiViewRoot: () => true,
      isMounted: () => mounted,
      getViewContainer: () => containerRef.current,
      getOpenGLRenderWindow: () => openGLRenderWindowAPI,
      getRenderWindow: () => renderWindowAPI,
      getRenderer: () => rendererRef.current,
      getInteractorStyle: () => getInteractorStyle(),
      setInteractorStyle: (style) => setInteractorStyle(style),
      requestRender: () => rendererRef.current?.requestRender(),
      getCamera: () => rendererRef.current?.get().getActiveCamera() ?? null,
      resetCamera: (boundsToUse?: Bounds) =>
        rendererRef.current?.resetCamera(boundsToUse),
    }),
    [
      mounted,
      openGLRenderWindowAPI,
      renderWindowAPI,
      getInteractorStyle,
      setInteractorStyle,
    ]
  );

  useImperativeHandle(fwdRef, () => api);

  const style = useMemo<CSSProperties>(
    () => ({
      position: 'relative',
      width: '100%',
      height: '100%',
      overflow: 'hidden',
      touchAction: 'none',
      userSelect: 'none',
      WebkitTapHighlightColor: 'rgba(0, 0, 0, 0)',
    }),
    []
  );

  return (
    <ViewContext.Provider value={api}>
      <ViewEvents.Provider value={registerEventListener}>
        <div style={style} ref={containerRef} {...rootListeners}>
          <Renderer {...rendererProps} ref={rendererRef}>
            {props.children}
          </Renderer>
        </div>
      </ViewEvents.Provider>
    </ViewContext.Provider>
  );
});

export default ParentedView;
