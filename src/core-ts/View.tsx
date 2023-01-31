import vtkInteractorStyle from '@kitware/vtk.js/Interaction/Style/InteractorStyle';
import { FixedVTKRenderWindowInteractor } from '@kitware/vtk.js/type-patches';
import { Bounds } from '@kitware/vtk.js/types';
import {
  CSSProperties,
  forwardRef,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react';
import { IOpenGLRenderWindow, IRenderer, IRenderWindow, IView } from '../types';
import { omit, pick } from '../utils-ts';
import { ResizeWatcherContext } from '../utils-ts/ResizeWatcher';
import { useEventListener } from '../utils-ts/useEventListener';
import useMount from '../utils-ts/useMount';
import {
  MultiViewRootContext,
  OpenGLRenderWindowContext,
  RenderWindowContext,
} from './contexts';
import {
  ManipulatorSettings,
  useInteractorStyle,
  useInteractorStyleManipulatorSettings,
} from './modules/useInteractorStyle';
import OpenGLRenderWindow, {
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
  /**
   * Configure the interactions
   */
  interactorSettings?: ManipulatorSettings[];
}

const DefaultProps = {
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
};

/**
 * A standalone View (not within a MultiViewRoot).
 */
const SingleView = forwardRef(function SingleView(props: Props, fwdRef) {
  // view API just exposes the render window + renderer
  const openGLRenderWindowRef = useRef<IOpenGLRenderWindow | null>(null);
  const renderWindowRef = useRef<IRenderWindow | null>(null);
  const rendererRef = useRef<IRenderer | null>(null);

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
    ...([...Object.keys(rendererProps)] as (keyof Props)[])
  );

  // --- interactor style --- //

  const getInteractor = useCallback(
    () => renderWindowRef.current?.getInteractor() ?? null,
    []
  );

  const [getInteractorStyle, setInteractorStyle] =
    useInteractorStyle(getInteractor);

  const { interactorSettings = DefaultProps.interactorSettings } = props;
  useInteractorStyleManipulatorSettings(getInteractorStyle, interactorSettings);

  // --- api --- //

  const api = useMemo<IView>(
    () => ({
      isInMultiViewRoot: () => false,
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
  );
});

/**
 * A View that is within a MultiViewRoot.
 */
const ParentedView = forwardRef(function ParentedView(props: Props, fwdRef) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<IRenderer | null>(null);

  const rendererProps = pick(
    props,
    'background',
    'interactive',
    'camera',
    'autoResetCamera',
    'autoCenterOfRotation'
  );

  const openGLRenderWindowAPI = useContext(OpenGLRenderWindowContext);
  if (!openGLRenderWindowAPI) {
    throw new Error('OpenGLRenderWindow is missing inside the MultiViewRoot');
  }

  const renderWindowAPI = useContext(RenderWindowContext);
  if (!renderWindowAPI) {
    throw new Error('RenderWindow is missing inside the MultiViewRoot');
  }

  // --- interactor binding --- //

  useEventListener(containerRef, 'pointerenter', (ev: PointerEvent) => {
    const rendererAPI = rendererRef.current;
    if (!rendererAPI) return;

    const interactor = renderWindowAPI.getInteractor();
    (interactor as FixedVTKRenderWindowInteractor).setCurrentRenderer(
      rendererAPI.get()
    );

    const oldContainer = interactor.getContainer();
    const newContainer = containerRef.current;
    if (oldContainer !== newContainer) {
      if (oldContainer) {
        interactor.unbindEvents();
      }
      if (newContainer) {
        interactor.bindEvents(newContainer);
      }

      // forward event to interactor
      interactor.handlePointerEnter(ev);
    }
  });

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

  // --- api --- //

  const api = useMemo<IView>(
    () => ({
      isInMultiViewRoot: () => true,
      getOpenGLRenderWindow: () => openGLRenderWindowAPI,
      getRenderWindow: () => renderWindowAPI,
      getRenderer: () => rendererRef.current,
      // TODO
      getInteractorStyle: () => ({} as unknown as vtkInteractorStyle),
      // TODO
      setInteractorStyle: (style) => {
        console.log(style);
      },
      requestRender: () => rendererRef.current?.requestRender(),
      getCamera: () => rendererRef.current?.get().getActiveCamera() ?? null,
      resetCamera: (boundsToUse?: Bounds) =>
        rendererRef.current?.resetCamera(boundsToUse),
    }),
    [openGLRenderWindowAPI, renderWindowAPI]
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
    <div style={style} ref={containerRef}>
      <Renderer {...rendererProps} ref={rendererRef}>
        {props.children}
      </Renderer>
    </div>
  );
});

export default forwardRef(function View(props: Props, fwdRef) {
  const singleViewRef = useRef<IView | null>(null);
  const parentedViewRef = useRef<IView | null>(null);

  const multiViewRoot = useContext(MultiViewRootContext);

  const api = useMemo<IView | null>(() => {
    const getView = () =>
      multiViewRoot ? parentedViewRef.current : singleViewRef.current;
    return {
      isInMultiViewRoot: () => multiViewRoot,
      getOpenGLRenderWindow: () => getView()?.getOpenGLRenderWindow() ?? null,
      getRenderWindow: () => getView()?.getRenderWindow() ?? null,
      getRenderer: () => getView()?.getRenderer() ?? null,
      getInteractorStyle: () => getView()?.getInteractorStyle() ?? null,
      setInteractorStyle: (style) => getView()?.setInteractorStyle(style),
      requestRender: () => getView()?.requestRender(),
      getCamera: () => getView()?.getCamera() ?? null,
      resetCamera: (boundsToUse?: Bounds) =>
        getView()?.resetCamera(boundsToUse),
    };
  }, [multiViewRoot]);

  useImperativeHandle(fwdRef, () => api);

  if (multiViewRoot) {
    return <ParentedView {...props} ref={parentedViewRef} />;
  } else {
    return <SingleView {...props} ref={singleViewRef} />;
  }
});
