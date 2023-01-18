import vtkRenderWindow from '@kitware/vtk.js/Rendering/Core/RenderWindow';
import {
  forwardRef,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react';
import { IRenderWindow } from '../types';
import deletionRegistry from '../utils-ts/DeletionRegistry';
import useGetterRef from '../utils-ts/useGetterRef';
import useMount from '../utils-ts/useMount';
import useResizeObserver from '../utils-ts/useResizeObserver';
import useUnmount from '../utils-ts/useUnmount';
import { OpenGLRenderWindowContext, RenderWindowContext } from './contexts';
import useInteractor from './modules/useInteractor';
import {
  ManipulatorSettings,
  useInteractorStyle,
  useInteractorStyleManipulatorSettings,
} from './modules/useInteractorStyle';

export interface Props extends PropsWithChildren {
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

// TODO Wrap in OpenGLRenderWindow by default
export default forwardRef(function RenderWindow(props: Props, fwdRef) {
  const { interactorSettings = DefaultProps.interactorSettings } = props;

  const openGLRenderWindow = useContext(OpenGLRenderWindowContext);
  if (!openGLRenderWindow) throw new Error('No OpenGL Render Window!');

  // --- RenderWindow --- //

  const [rwRef, getRenderWindow] = useGetterRef(() => {
    const rw = vtkRenderWindow.newInstance();
    deletionRegistry.register(rw, () => rw.delete());
    return rw;
  });

  useEffect(() => {
    const rwView = openGLRenderWindow.get();
    deletionRegistry.incRefCount(rwView);
    const renderWindow = getRenderWindow();
    renderWindow.addView(rwView);
    return () => {
      renderWindow.removeView(rwView);
      deletionRegistry.decRefCount(rwView);
    };
  }, [openGLRenderWindow, getRenderWindow]);

  useUnmount(() => {
    if (rwRef.current) {
      deletionRegistry.markForDeletion(rwRef.current);
      rwRef.current = null;
    }
  });

  // --- Interactor --- //

  const getInteractor = useInteractor(openGLRenderWindow);

  useEffect(() => {
    getRenderWindow().setInteractor(getInteractor());
  });

  const [getInteractorStyle, setInteractorStyle] =
    useInteractorStyle(getInteractor);

  useInteractorStyleManipulatorSettings(getInteractorStyle, interactorSettings);

  // --- rendering --- //

  const [renderRequested, setRenderRequested] = useState(false);
  const queueRender = () => setRenderRequested(true);

  useEffect(() => {
    if (renderRequested) {
      setRenderRequested(false);
      const renderWindow = getRenderWindow();
      renderWindow.render();
    }
  }, [renderRequested, getRenderWindow]);

  // --- resize --- //

  const updateViewSize = useCallback(() => {
    const container = openGLRenderWindow.getContainer();
    if (!container) return;

    const renderWindowView = openGLRenderWindow.get();
    const renderWindow = getRenderWindow();
    const devicePixelRatio = window.devicePixelRatio || 1;
    const { width, height } = container.getBoundingClientRect();
    const w = Math.floor(width * devicePixelRatio);
    const h = Math.floor(height * devicePixelRatio);
    renderWindowView.setSize(Math.max(w, 10), Math.max(h, 10));
    renderWindow.render();
  }, [openGLRenderWindow, getRenderWindow]);

  useResizeObserver(openGLRenderWindow.get().getContainer(), updateViewSize);
  useMount(() => updateViewSize());

  // --- api --- //

  const api = useMemo<IRenderWindow>(
    () => ({
      get: getRenderWindow,
      getInteractor,
      getInteractorStyle,
      setInteractorStyle,
      requestRender: queueRender,
    }),
    [getRenderWindow, getInteractor, getInteractorStyle, setInteractorStyle]
  );

  useImperativeHandle(fwdRef, () => api);

  return (
    <RenderWindowContext.Provider value={api}>
      {props.children}
    </RenderWindowContext.Provider>
  );
});
