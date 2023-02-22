import { ICameraInitialValues } from '@kitware/vtk.js/Rendering/Core/Camera';
import vtkRenderer from '@kitware/vtk.js/Rendering/Core/Renderer';
import { Bounds, Vector3, Vector4 } from '@kitware/vtk.js/types';
import {
  forwardRef,
  PropsWithChildren,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
} from 'react';
import { IRenderer } from '../types';
import deletionRegistry from '../utils/DeletionRegistry';
import useBooleanAccumulator from '../utils/useBooleanAccumulator';
import useGetterRef from '../utils/useGetterRef';
import useUnmount from '../utils/useUnmount';
import { RendererContext, useRenderWindowContext } from './contexts';
import useCamera from './modules/useCamera';

export interface Props extends PropsWithChildren {
  /**
   * The color of the view background using 3 floating numbers
   * between 0-1 of Red, Green, Blue component.
   */
  background?: Vector3 | Vector4;

  /**
   * Whether this renderer is interactive.
   */
  interactive?: boolean;

  /**
   * Camera properties, such as position, focal point, etc.
   */
  camera?: ICameraInitialValues;

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
}

export const DefaultProps = {
  background: [0.2, 0.3, 0.4] as Vector3,
  interactive: true,
  autoResetCamera: true,
};

export default forwardRef(function Renderer(props: Props, fwdRef) {
  const renderWindow = useRenderWindowContext();
  const [modifiedRef, trackModified, resetModified] = useBooleanAccumulator();

  const [renRef, getRenderer] = useGetterRef(() => {
    const ren = vtkRenderer.newInstance();
    deletionRegistry.register(ren, () => ren.delete());
    return ren;
  });

  const {
    background = DefaultProps.background,
    interactive = DefaultProps.interactive,
  } = props;

  useEffect(() => {
    getRenderer().setBackground(background);
  }, [background, getRenderer]);

  useEffect(() => {
    getRenderer().setInteractive(interactive);
  }, [interactive, getRenderer]);

  useEffect(() => {
    const rw = renderWindow.get();
    deletionRegistry.incRefCount(rw);
    const renderer = getRenderer();
    rw.addRenderer(renderer);
    return () => {
      rw.removeRenderer(renderer);
      deletionRegistry.decRefCount(rw);
    };
  }, [renderWindow, getRenderer]);

  // --- camera --- //

  const {
    camera: cameraProps,
    autoResetCamera = DefaultProps.autoResetCamera,
  } = props;

  useCamera(getRenderer, cameraProps, trackModified);

  const resetCamera = useCallback(
    (boundsToUse?: Bounds) => {
      getRenderer().resetCamera(boundsToUse);
    },
    [getRenderer]
  );

  // --- cleanup --- //

  useUnmount(() => {
    if (renRef.current) {
      deletionRegistry.markForDeletion(renRef.current);
      renRef.current = null;
    }
  });

  // --- api --- //

  const api = useMemo<IRenderer>(
    () => ({
      get: getRenderer,
      resetCamera,
      requestRender: () => {
        if (autoResetCamera) {
          resetCamera();
        }
        renderWindow.requestRender();
      },
    }),
    [autoResetCamera, renderWindow, resetCamera, getRenderer]
  );

  useEffect(() => {
    if (modifiedRef.current) {
      api.requestRender();
      resetModified();
    }
  });

  useImperativeHandle(fwdRef, () => api);
  return (
    <RendererContext.Provider value={api}>
      {props.children}
    </RendererContext.Provider>
  );
});
