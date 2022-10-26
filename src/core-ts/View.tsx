import vtkRenderer from '@kitware/vtk.js/Rendering/Core/Renderer';
import vtkRenderWindow from '@kitware/vtk.js/Rendering/Core/RenderWindow';
import vtkRenderWindowInteractor from '@kitware/vtk.js/Rendering/Core/RenderWindowInteractor';
import vtkOpenGLRenderWindow from '@kitware/vtk.js/Rendering/OpenGL/RenderWindow';
import { Nullable, Vector3 } from '@kitware/vtk.js/types';
import {
  CSSProperties,
  forwardRef,
  PropsWithChildren,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { IView } from '../types';
import useGetterRef from '../utils-ts/useGetterRef';
import useMount from '../utils-ts/useMount';
import { useOrderedUnmountContext } from '../utils-ts/useOrderedUnmountEffect';
import useResizeObserver from '../utils-ts/useResizeObserver';
import useUnmount from '../utils-ts/useUnmount';
import { ViewContext } from './contexts';

const RENDERER_STYLE: CSSProperties = {
  position: 'absolute',
  width: '100%',
  height: '100%',
  overflow: 'hidden',
};

interface Props extends PropsWithChildren {
  /**
   * The ID used to identify this component.
   */
  id?: string;

  /**
   * Allow user to override the default View style { width: '100%', height: '100%' }
   */
  style?: CSSProperties;

  /**
   * Allow user to provide custom className associated to root element
   */
  className?: string;

  /**
   * The color of the view background using 3 floating numbers
   * between 0-1 of Red, Green, Blue component.
   */
  background?: Vector3;

  /**
   * Configure the interactions
   * TODO fix
   */
  interactorSettings?: Record<string, unknown>[];

  /**
   * Enable/Disable interaction
   */
  interactive?: boolean;

  /**
   * Initial camera position from an object in [0,0,0]
   */
  cameraPosition?: Vector3;

  /**
   * Initial camera focal point from an object in [0,0,0]
   */
  cameraFocalPoint?: Vector3;

  /**
   * Initial camera position from an object in [0,0,0]
   */
  cameraViewUp?: Vector3;

  /**
   * Use parallel projection (default: false)
   */
  cameraParallelProjection?: boolean;

  /**
   * Whether to automatically call resetCamera() (default: true)
   *
   * When set to true, resetCamera() will be invoked whenever
   * a render is requested due to a pipeline update, e.g. the data
   * changed or a representation property was modified.
   *
   * When set to false, the user must explicitly provide camera
   * properties. Note that the initial resetCamera() call will
   * still occur upon component mount.
   */
  autoResetCamera?: boolean;

  /**
   * Property use to trigger a render when changing.

   * TODO remove because the recommended way is to use a ref
   */
  // triggerRender?: number;

  /**
   * Property use to trigger a resetCamera when changing.
   *
   * TODO remove because the recommended way is to use a ref
   */
  // triggerResetCamera?: number;

  /**
   * List of picking listeners to bind. By default it is disabled (empty array).
   */
  pickingModes?: 'click' | 'hover' | 'select' | 'mouseDown' | 'mouseUp';

  /**
   * User callback function for click
   */
  onClick?: () => void;

  /**
   * User callback function for mouse down
   */
  onMouseDown?: () => void;

  /**
   * User callback function for mouse up
   */
  onMouseUp?: () => void;

  /**
   * User callback function for hover
   */
  onHover?: () => void;

  /**
   * User callback function for box select
   */
  onSelect?: () => void;

  /**
   * Defines the tolerance of the click and hover selection.
   */
  pointerSize?: number;

  /**
   * Show/Hide Cube Axes for the given representation
   */
  showCubeAxes?: boolean;

  /**
   * Configure cube Axes style by overriding the set of properties defined
   * https://github.com/Kitware/vtk-js/blob/HEAD/Sources/Rendering/Core/CubeAxesActor/index.js#L703-L719
   */
  cubeAxesStyle?: Record<string, unknown>;

  /**
   * Show/Hide orientation axes.
   */
  showOrientationAxes?: boolean;
}

const DefaultProps = {
  interactive: true,
  autoResetCamera: true,
  background: [0.2, 0.3, 0.4],
  style: {
    width: '100%',
    height: '100%',
  } as CSSProperties,
};

function useRenderWindowView(container: Nullable<HTMLElement>) {
  const [viewRef, getView] = useGetterRef(() => {
    return vtkOpenGLRenderWindow.newInstance();
  });

  useEffect(() => {
    const view = getView();
    // FIXME setContainer API should allow null
    view.setContainer(container as HTMLElement);
  }, [container, getView]);

  useUnmount(() => {
    if (viewRef.current) {
      viewRef.current.delete();
      viewRef.current = null;
    }
  });

  return getView;
}

function useInteractor(
  getRWView: () => vtkOpenGLRenderWindow,
  container: Nullable<HTMLElement>,
  props: Props
) {
  const [interactorRef, getInteractor] = useGetterRef(() => {
    return vtkRenderWindowInteractor.newInstance();
  });
  const { interactive = DefaultProps.interactive } = props;

  useEffect(() => {
    if (!container || !interactive) return;
    const interactor = getInteractor();
    const rwView = getRWView();

    interactor.setView(rwView);
    interactor.initialize();
    interactor.bindEvents(container);
  }, [interactive, container, getRWView, getInteractor]);

  useUnmount(() => {
    if (interactorRef.current) {
      interactorRef.current.delete();
      interactorRef.current = null;
    }
  });

  return getInteractor;
}

function useRenderWindow(
  getRWView: () => vtkOpenGLRenderWindow,
  getRenderer: () => vtkRenderer
) {
  const [rwRef, getRenderWindow] = useGetterRef(() => {
    return vtkRenderWindow.newInstance();
  });

  useEffect(() => {
    const rwView = getRWView();
    const renderWindow = getRenderWindow();
    renderWindow.addView(rwView);
    return () => {
      renderWindow.removeView(rwView);
    };
  }, [getRWView, getRenderWindow]);

  useEffect(() => {
    const renderWindow = getRenderWindow();
    const renderer = getRenderer();
    renderWindow.addRenderer(renderer);
    return () => {
      renderWindow.removeRenderer(renderer);
    };
  }, [getRenderer, getRenderWindow]);

  useUnmount(() => {
    if (rwRef.current) {
      rwRef.current.delete();
      rwRef.current = null;
    }
  });

  return getRenderWindow;
}

function useRenderer(props: Props) {
  const [renRef, getRenderer] = useGetterRef(() => vtkRenderer.newInstance());
  const { background = DefaultProps.background } = props;

  useEffect(() => {
    const renderer = getRenderer();
    renderer.setBackground(background);
  }, [background, getRenderer]);

  useUnmount(() => {
    if (renRef.current) {
      renRef.current.delete();
      renRef.current = null;
    }
  });

  return getRenderer;
}

export default forwardRef(function View(props: Props, fwdRef) {
  const OrderedUnmountContext = useOrderedUnmountContext();

  const containerRef = useRef<Nullable<HTMLDivElement>>(null);

  const getRWView = useRenderWindowView(containerRef.current);
  const getRenderer = useRenderer(props);
  // We need to attach the renderWindowView to the renderWindow
  // before setting the view onto the interactor.
  const getRenderWindow = useRenderWindow(getRWView, getRenderer);
  const getInteractor = useInteractor(getRWView, containerRef.current, props);

  const updateViewSize = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const renderWindowView = getRWView();
    const renderWindow = getRenderWindow();
    const devicePixelRatio = window.devicePixelRatio || 1;
    const { width, height } = container.getBoundingClientRect();
    const w = Math.floor(width * devicePixelRatio);
    const h = Math.floor(height * devicePixelRatio);
    renderWindowView.setSize(Math.max(w, 10), Math.max(h, 10));
    renderWindow.render();
  }, [getRWView, getRenderWindow]);

  const [renderRequested, setRenderRequested] = useState(false);
  const { autoResetCamera = DefaultProps.autoResetCamera } = props;

  useEffect(() => {
    if (renderRequested) {
      if (autoResetCamera) {
        getRenderer().resetCamera();
      }
      getRenderWindow().render();
      setRenderRequested(false);
    }
  }, [renderRequested, autoResetCamera, getRenderer, getRenderWindow]);

  const view = useMemo<IView>(() => {
    return {
      getRenderer,
      getRenderWindow,
      getInteractor,
      getAPISpecificRenderWindow: getRWView,
      getCamera: () => getRenderer().getActiveCamera(),
      /**
       * Requests a vtk.js render.
       *
        This will batch render requests, triggering a single
       * vtk.js render once after a react render.
       */
      requestRender: () => {
        setRenderRequested(true);
      },
      /**
       * Resets the camera.
       */
      resetCamera: () => {
        getRenderer().resetCamera();
        getRenderWindow().render();
      },
    };
  }, [getRWView, getRenderer, getRenderWindow, getInteractor]);

  // expose the view as a ref for imperative control
  useImperativeHandle(fwdRef, () => view);

  useResizeObserver(containerRef.current, updateViewSize);
  useMount(() => updateViewSize());

  const { style = DefaultProps.style } = props;
  const containerStyle = useMemo<CSSProperties>(
    () => ({
      position: 'relative',
      ...style,
    }),
    [style]
  );

  return (
    <OrderedUnmountContext.Provider>
      <ViewContext.Provider value={view}>
        <div style={containerStyle}>
          <div ref={containerRef} style={RENDERER_STYLE} />
          {props.children}
        </div>
      </ViewContext.Provider>
    </OrderedUnmountContext.Provider>
  );
});
