import { FieldAssociations } from '@kitware/vtk.js/Common/DataModel/DataSet/Constants.js';
import vtkOpenGLHardwareSelector from '@kitware/vtk.js/Rendering/OpenGL/HardwareSelector';
import { Vector2, Vector3 } from '@kitware/vtk.js/types';
import {
  forwardRef,
  MouseEvent,
  PointerEvent,
  useCallback,
  useContext,
  useImperativeHandle,
  useMemo,
} from 'react';
import deletionRegistry from '../utils/DeletionRegistry';
import useDebounce from '../utils/useDebounce';
import useGetterRef from '../utils/useGetterRef';
import useMount from '../utils/useMount';
import useUnmount from '../utils/useUnmount';
import {
  OpenGLRenderWindowContext,
  RendererContext,
  ViewContext,
} from './contexts';
import { useViewEventListener } from './modules/useViewEvents';

export interface PickResult {
  representationId?: string;
  worldPosition: Vector3;
  displayPosition: Vector3;
  compositeID: number;
  ray: [Vector3, Vector3];
}

export interface FrustumPickResult {
  frustum: number[][];
  representationIds: string[];
}

function useOpenGLHardwareSelector() {
  const [selectorRef, getSelector] = useGetterRef(() => {
    const selector = vtkOpenGLHardwareSelector.newInstance({
      captureZValues: true,
    });
    deletionRegistry.register(selector, () => selector.delete());
    return selector;
  });

  useUnmount(() => {
    if (selectorRef.current) {
      deletionRegistry.markForDeletion(selectorRef.current);
      selectorRef.current = null;
    }
  });

  return getSelector;
}

export interface PickingProps {
  /**
   * Whether to enable picking and callbacks.
   *
   * Defaults to true.
   */
  enabled?: boolean;

  /**
   * Callback when an actor is hovered.
   *
   * @param selection Selection info
   * @param event the originating pointer event
   */
  onHover?: (selection: PickResult, event: PointerEvent) => void;

  /**
   * Callback when an actor is clicked with a mouse.
   *
   * @param selection Selection info
   * @param event the originating mouse event
   */
  onClick?: (selection: PickResult, event: MouseEvent) => void;

  /**
   * Callback when the pointer is pressed down on an actor.
   *
   * @param selection Selection info
   * @param event the originating pointer event
   */
  onPointerDown?: (selection: PickResult, event: PointerEvent) => void;

  /**
   * Callback when the pointer is pressed up on an actor.
   *
   * @param selection Selection info
   * @param event the originating pointer event
   */
  onPointerUp?: (selection: PickResult, event: PointerEvent) => void;

  /**
   * Defines the tolerance of the click and hover selection.
   */
  pointerSize?: number;

  /**
   * Sets the debounce wait for onHover calls.
   *
   * This is only useful if you desire to reduce the frequency
   * at which onHover is called.
   */
  onHoverDebounceWait?: number;
}

const DefaultProps = {
  enabled: true,
  pointerSize: 0,
  onHoverDebounceWait: 4,
};

export default forwardRef(function ViewPicking(props: PickingProps, fwdRef) {
  const openGLRenderWindowAPI = useContext(OpenGLRenderWindowContext);
  const rendererAPI = useContext(RendererContext);
  const viewAPI = useContext(ViewContext);

  if (!openGLRenderWindowAPI || !rendererAPI || !viewAPI) {
    throw new Error('<Picking> must have a <View> ancestor');
  }

  const getSelector = useOpenGLHardwareSelector();

  useMount(() => {
    const selector = getSelector();
    selector.setFieldAssociation(FieldAssociations.FIELD_ASSOCIATION_POINTS);
    selector.attach(openGLRenderWindowAPI.get(), rendererAPI.get());

    return () => {
      // avoids keeping refs to the openglrenderwindow and renderer
      selector.attach(null, null);
    };
  });

  // --- Props --- //

  const {
    enabled = DefaultProps.enabled,
    pointerSize = DefaultProps.pointerSize,
  } = props;

  const getPointerSizeTolerance = useCallback(
    () => pointerSize / 2,
    [pointerSize]
  );

  // --- API --- //

  const pickClosest = useCallback(
    (xp: number, yp: number, tolerance: number): PickResult[] => {
      const x1 = Math.floor(xp - tolerance);
      const y1 = Math.floor(yp - tolerance);
      const x2 = Math.ceil(xp + tolerance);
      const y2 = Math.ceil(yp + tolerance);

      const selector = getSelector();
      const openGLRenderWindow = openGLRenderWindowAPI.get();
      const renderer = rendererAPI.get();

      selector.setArea(x1, y1, x2, y2);

      if (!selector.captureBuffers()) {
        return [];
      }

      const pos: Vector2 = [xp, yp];
      const outSelectedPosition: Vector2 = [0, 0];
      const info = selector.getPixelInformation(
        pos,
        tolerance,
        outSelectedPosition
      );

      if (info == null || info.prop == null) return [];

      const startPoint = openGLRenderWindow.displayToWorld(
        Math.round((x1 + x2) / 2),
        Math.round((y1 + y2) / 2),
        0,
        renderer
      );

      const endPoint = openGLRenderWindow.displayToWorld(
        Math.round((x1 + x2) / 2),
        Math.round((y1 + y2) / 2),
        1,
        renderer
      );

      const ray = [Array.from(startPoint), Array.from(endPoint)];

      const worldPosition = Array.from(
        openGLRenderWindow.displayToWorld(
          info.displayPosition[0],
          info.displayPosition[1],
          info.zValue,
          renderer
        )
      );

      const displayPosition = [
        info.displayPosition[0],
        info.displayPosition[1],
        info.zValue,
      ];

      return [
        {
          worldPosition,
          displayPosition,
          compositeID: info.compositeID,
          ...info.prop.get('representationId'),
          ray,
        },
      ] as PickResult[];
    },
    [rendererAPI, openGLRenderWindowAPI, getSelector]
  );

  const pick = useCallback(
    (x1: number, y1: number, x2: number, y2: number): PickResult[] => {
      const selector = getSelector();
      const openGLRenderWindow = openGLRenderWindowAPI.get();
      const renderer = rendererAPI.get();

      selector.setArea(x1, y1, x2, y2);

      if (!selector.captureBuffers()) {
        return [];
      }

      const ray = [
        Array.from(
          openGLRenderWindow.displayToWorld(
            Math.round((x1 + x2) / 2),
            Math.round((y1 + y2) / 2),
            0,
            renderer
          )
        ),
        Array.from(
          openGLRenderWindow.displayToWorld(
            Math.round((x1 + x2) / 2),
            Math.round((y1 + y2) / 2),
            1,
            renderer
          )
        ),
      ];

      const selections = selector.generateSelection(x1, y1, x2, y2) || [];
      return selections
        .map((v) => {
          const { prop, compositeID, displayPosition } = v.getProperties();

          // Return false to mark this item for removal
          if (prop == null || !displayPosition) return false;

          return {
            worldPosition: Array.from(
              openGLRenderWindow.displayToWorld(
                displayPosition[0],
                displayPosition[1],
                displayPosition[2],
                renderer
              )
            ),
            displayPosition,
            compositeID, // Not yet useful unless GlyphRepresentation
            ...prop.get('representationId'),
            ray,
          };
        })
        .filter(Boolean) as PickResult[];
    },
    [rendererAPI, openGLRenderWindowAPI, getSelector]
  );

  const pickWithFrustum = useCallback(
    (
      x1: number,
      y1: number,
      x2: number,
      y2: number
    ): FrustumPickResult | null => {
      const selector = getSelector();
      const openGLRenderWindow = openGLRenderWindowAPI.get();
      const renderer = rendererAPI.get();

      selector.setArea(x1, y1, x2, y2);

      if (!selector.captureBuffers()) {
        return null;
      }

      const frustum = [
        Array.from(openGLRenderWindow.displayToWorld(x1, y1, 0, renderer)),
        Array.from(openGLRenderWindow.displayToWorld(x2, y1, 0, renderer)),
        Array.from(openGLRenderWindow.displayToWorld(x2, y2, 0, renderer)),
        Array.from(openGLRenderWindow.displayToWorld(x1, y2, 0, renderer)),
        Array.from(openGLRenderWindow.displayToWorld(x1, y1, 1, renderer)),
        Array.from(openGLRenderWindow.displayToWorld(x2, y1, 1, renderer)),
        Array.from(openGLRenderWindow.displayToWorld(x2, y2, 1, renderer)),
        Array.from(openGLRenderWindow.displayToWorld(x1, y2, 1, renderer)),
      ];

      const representationIds: string[] = [];
      const selections = selector.generateSelection(x1, y1, x2, y2) || [];
      selections.forEach((v) => {
        const { prop } = v.getProperties();
        const getterResult:
          | {
              representationId?: string;
            }
          | undefined = prop?.get('representationId');
        const representationId = getterResult?.representationId;
        if (representationId) {
          representationIds.push(representationId);
        }
      });
      return { frustum, representationIds };
    },
    [rendererAPI, openGLRenderWindowAPI, getSelector]
  );

  const api = useMemo(
    () => ({
      pick,
      pickWithFrustum,
      pickClosest,
    }),
    [pick, pickWithFrustum, pickClosest]
  );

  useImperativeHandle(fwdRef, () => api);

  // --- Pointer event handling --- //

  const getScreenEventPositionFor = useCallback(
    (source: MouseEvent) => {
      const rw = openGLRenderWindowAPI.get();
      const canvas = rw.getCanvas();
      if (!canvas) return { x: 0, y: 0, z: 0 };

      const bounds = canvas.getBoundingClientRect();
      const [canvasWidth, canvasHeight] = rw.getSize();
      const scaleX = canvasWidth / bounds.width;
      const scaleY = canvasHeight / bounds.height;
      const position = {
        x: scaleX * (source.clientX - bounds.left),
        y: scaleY * (bounds.height - source.clientY + bounds.top),
        z: 0,
      };
      return position;
    },
    [openGLRenderWindowAPI]
  );

  const { onHover, onPointerDown, onPointerUp, onClick } = props;

  const makeSelection = useCallback(
    <T extends MouseEvent>(ev: T) => {
      const { x, y } = getScreenEventPositionFor(ev);
      const tolerance = getPointerSizeTolerance();
      const selections = pickClosest(Math.floor(x), Math.floor(y), tolerance);
      return selections[0];
    },
    [getScreenEventPositionFor, getPointerSizeTolerance, pickClosest]
  );

  // --- register event handlers --- //

  const { onHoverDebounceWait = DefaultProps.onHoverDebounceWait } = props;

  // TODO last selection? (see View.js)
  useViewEventListener(
    'pointermove',
    useDebounce(
      useCallback(
        (ev: PointerEvent) => {
          if (!enabled || !onHover) return;
          onHover(makeSelection(ev), ev);
        },
        [makeSelection, onHover, enabled]
      ),
      onHoverDebounceWait
    )
  );

  useViewEventListener(
    'pointerdown',
    useCallback(
      (ev: PointerEvent) => {
        if (!enabled || !onPointerDown) return;
        onPointerDown(makeSelection(ev), ev);
      },
      [makeSelection, onPointerDown, enabled]
    )
  );

  useViewEventListener(
    'pointerup',
    useCallback(
      (ev: PointerEvent) => {
        if (!enabled || !onPointerUp) return;
        onPointerUp(makeSelection(ev), ev);
      },
      [makeSelection, onPointerUp, enabled]
    )
  );

  useViewEventListener(
    'click',
    useCallback(
      (ev: MouseEvent) => {
        if (!enabled || !onClick) return;
        onClick(makeSelection(ev), ev);
      },
      [makeSelection, onClick, enabled]
    )
  );

  return null;
});
