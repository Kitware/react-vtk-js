declare module '@kitware/vtk.js/type-patches' {
  import { EventHandler, vtkSubscription } from '@kitware/vtk.js/interfaces';
  import vtkRenderer from '@kitware/vtk.js/Rendering/Core/Renderer';
  import vtkRenderWindowInteractor from '@kitware/vtk.js/Rendering/Core/RenderWindowInteractor';

  export interface FixedVTKRenderWindowInteractor
    extends vtkRenderWindowInteractor {
    setCurrentRenderer(ren: vtkRenderer): void;
  }

  export interface VtkRendererEvent {
    type:
      | 'ComputeVisiblePropBoundsEvent'
      | 'ResetCameraClippingRangeEvent'
      | 'ResetCameraEvent';
    renderer: vtkRenderer;
  }

  export interface FixedVTKRenderer extends vtkRenderer {
    onEvent(cb: EventHandler, priority?: number): Readonly<vtkSubscription>;
  }
}

declare module '@kitware/vtk.js/Rendering/Core/CubeAxesActor' {
  import vtkActor from '@kitware/vtk.js/Rendering/Core/Actor';
  export interface vtkCubeAxesActor extends vtkActor {
    // TODO fill
    getGridLines(): boolean;
  }
  export function newInstance(): vtkCubeAxesActor;
  export const vtkCubeAxesActor: {
    newInstance: typeof newInstance;
  };
  export default vtkCubeAxesActor;
}

declare module '@kitware/vtk.js/Interaction/Style/InteractorStyle/Constants' {
  // TODO correct?
  export enum States {
    IS_START = 0,
    IS_NONE = 0,
    IS_ROTATE = 1,
    IS_PAN = 2,
    IS_SPIN = 3,
    IS_DOLLY = 4,
    IS_CAMERA_POSE = 11,
    IS_WINDOW_LEVEL = 1024,
    IS_SLICE = 1025,
  }
}

declare module '@kitware/vtk.js/Interaction/Style/InteractorStyle' {
  import { EventHandler, vtkSubscription } from '@kitware/vtk.js/interfaces';
  import vtkInteractorObserver from '@kitware/vtk.js/Rendering/Core/InteractorObserver';

  export interface vtkInteractorStyle extends vtkInteractorObserver {
    /**
     * Start a Rotate event.
     */
    startRotate(): void;

    /**
     * Invoke a StartRotate event.
     */
    invokeStartRotateEvent(...args: unknown[]): void;

    /**
     * Registers a callback on a StartRotate event.
     */
    onStartRotateEvent(cb: EventHandler, priority?: number): vtkSubscription;

    /**
     * Ends a Rotate event.
     */
    endRotate(): void;

    /**
     * Invoke an EndRotate event.
     */
    invokeEndRotateEvent(...args: unknown[]): void;

    /**
     * Registers a callback on an EndRotate event.
     */
    onEndRotateEvent(cb: EventHandler, priority?: number): vtkSubscription;
    /**
     * Start a Pan event.
     */
    startPan(): void;

    /**
     * Invoke a StartPan event.
     */
    invokeStartPanEvent(...args: unknown[]): void;

    /**
     * Registers a callback on a StartPan event.
     */
    onStartPanEvent(cb: EventHandler, priority?: number): vtkSubscription;

    /**
     * Ends a Pan event.
     */
    endPan(): void;

    /**
     * Invoke an EndPan event.
     */
    invokeEndPanEvent(...args: unknown[]): void;

    /**
     * Registers a callback on an EndPan event.
     */
    onEndPanEvent(cb: EventHandler, priority?: number): vtkSubscription;
    /**
     * Start a Spin event.
     */
    startSpin(): void;

    /**
     * Invoke a StartSpin event.
     */
    invokeStartSpinEvent(...args: unknown[]): void;

    /**
     * Registers a callback on a StartSpin event.
     */
    onStartSpinEvent(cb: EventHandler, priority?: number): vtkSubscription;

    /**
     * Ends a Spin event.
     */
    endSpin(): void;

    /**
     * Invoke an EndSpin event.
     */
    invokeEndSpinEvent(...args: unknown[]): void;

    /**
     * Registers a callback on an EndSpin event.
     */
    onEndSpinEvent(cb: EventHandler, priority?: number): vtkSubscription;
    /**
     * Start a Dolly event.
     */
    startDolly(): void;

    /**
     * Invoke a StartDolly event.
     */
    invokeStartDollyEvent(...args: unknown[]): void;

    /**
     * Registers a callback on a StartDolly event.
     */
    onStartDollyEvent(cb: EventHandler, priority?: number): vtkSubscription;

    /**
     * Ends a Dolly event.
     */
    endDolly(): void;

    /**
     * Invoke an EndDolly event.
     */
    invokeEndDollyEvent(...args: unknown[]): void;

    /**
     * Registers a callback on an EndDolly event.
     */
    onEndDollyEvent(cb: EventHandler, priority?: number): vtkSubscription;
    /**
     * Start a CameraPose event.
     */
    startCameraPose(): void;

    /**
     * Invoke a StartCameraPose event.
     */
    invokeStartCameraPoseEvent(...args: unknown[]): void;

    /**
     * Registers a callback on a StartCameraPose event.
     */
    onStartCameraPoseEvent(
      cb: EventHandler,
      priority?: number
    ): vtkSubscription;

    /**
     * Ends a CameraPose event.
     */
    endCameraPose(): void;

    /**
     * Invoke an EndCameraPose event.
     */
    invokeEndCameraPoseEvent(...args: unknown[]): void;

    /**
     * Registers a callback on an EndCameraPose event.
     */
    onEndCameraPoseEvent(cb: EventHandler, priority?: number): vtkSubscription;
    /**
     * Start a WindowLevel event.
     */
    startWindowLevel(): void;

    /**
     * Invoke a StartWindowLevel event.
     */
    invokeStartWindowLevelEvent(...args: unknown[]): void;

    /**
     * Registers a callback on a StartWindowLevel event.
     */
    onStartWindowLevelEvent(
      cb: EventHandler,
      priority?: number
    ): vtkSubscription;

    /**
     * Ends a WindowLevel event.
     */
    endWindowLevel(): void;

    /**
     * Invoke an EndWindowLevel event.
     */
    invokeEndWindowLevelEvent(...args: unknown[]): void;

    /**
     * Registers a callback on an EndWindowLevel event.
     */
    onEndWindowLevelEvent(cb: EventHandler, priority?: number): vtkSubscription;
    /**
     * Start a Slice event.
     */
    startSlice(): void;

    /**
     * Invoke a StartSlice event.
     */
    invokeStartSliceEvent(...args: unknown[]): void;

    /**
     * Registers a callback on a StartSlice event.
     */
    onStartSliceEvent(cb: EventHandler, priority?: number): vtkSubscription;

    /**
     * Ends a Slice event.
     */
    endSlice(): void;

    /**
     * Invoke an EndSlice event.
     */
    invokeEndSliceEvent(...args: unknown[]): void;

    /**
     * Registers a callback on an EndSlice event.
     */
    onEndSliceEvent(cb: EventHandler, priority?: number): vtkSubscription;

    /**
     * Handles a keypress.
     */
    handleKeyPress(callData: unknown): void;
  }

  export interface IInteractorStyleInitialValues {
    autoAdjustCameraClippingRange?: boolean;
  }

  export function extend(
    publicAPI: object,
    model: object,
    initialValues?: IInteractorStyleInitialValues
  ): void;

  export const vtkInteractorStyle: {
    extend: typeof extend;
  };

  export default vtkInteractorStyle;
}

declare module '@kitware/vtk.js/Interaction/Style/InteractorStyleManipulator' {
  import vtkCompositeGestureManipulator from '@kitware/vtk.js/Interaction/Manipulators/CompositeGestureManipulator';
  import vtkCompositeKeyboardManipulator from '@kitware/vtk.js/Interaction/Manipulators/CompositeKeyboardManipulator';
  import vtkCompositeMouseManipulator from '@kitware/vtk.js/Interaction/Manipulators/CompositeMouseManipulator';
  import vtkCompositeVRManipulator from '@kitware/vtk.js/Interaction/Manipulators/CompositeVRManipulator';
  import vtkInteractorStyle from '@kitware/vtk.js/Interaction/Style/InteractorStyle';
  import {
    Device,
    Input,
  } from '@kitware/vtk.js/Rendering/Core/RenderWindowInteractor/Constants';
  import { Nullable, Vector3 } from '@kitware/vtk.js/types';

  export interface vtkInteractorStyleManipulator extends vtkInteractorStyle {
    /**
     * Remove all manipulators.
     */
    removeAllManipulators(): void;

    /**
     * Remove mouse manipulators.
     */
    removeAllMouseManipulators(): void;

    /**
     * Remove keyboard manipulators.
     */
    removeAllKeyboardManipulators(): void;

    /**
     * Remove VR manipulators.
     */
    removeAllVRManipulators(): void;

    /**
     * Remove gesture manipulators.
     */
    removeAllGestureManipulators(): void;

    /**
     * Adds a mouse manipulator.
     * @param manipulator the manipulator to add
     * @returns whether the manipulator has been added
     */
    addMouseManipulator(manipulator: vtkCompositeMouseManipulator): boolean;

    /**
     * Adds a keyboard manipulator.
     * @param manipulator the manipulator to add
     * @returns whether the manipulator has been added
     */
    addKeyboardManipulator(
      manipulator: vtkCompositeKeyboardManipulator
    ): boolean;

    /**
     * Adds a VR manipulator.
     * @param manipulator the manipulator to add
     * @returns whether the manipulator has been added
     */
    addVRManipulator(manipulator: vtkCompositeVRManipulator): boolean;

    /**
     * Adds a gesture manipulator.
     * @param manipulator the manipulator to add
     * @returns whether the manipulator has been added
     */
    addGestureManipulator(manipulator: vtkCompositeGestureManipulator): boolean;

    /**
     * Removes a mouse manipulator.
     * @param manipulator the manipulator to remove
     */
    removeMouseManipulator(manipulator: vtkCompositeMouseManipulator): void;

    /**
     * Removes a keyboard manipulator.
     * @param manipulator the manipulator to remove
     */
    removeKeyboardManipulator(
      manipulator: vtkCompositeKeyboardManipulator
    ): void;

    /**
     * Removes a VR manipulator.
     * @param manipulator the manipulator to remove
     */
    removeVRManipulator(manipulator: vtkCompositeVRManipulator): void;

    /**
     * Removes a gesture manipulator.
     * @param manipulator the manipulator to remove
     */
    removeGestureManipulator(manipulator: vtkCompositeGestureManipulator): void;

    /**
     * Gets the number of mouse manipulators.
     */
    getNumberOfMouseManipulators(): number;

    /**
     * Gets the number of keyboard manipulators.
     */
    getNumberOfKeyboardManipulators(): number;

    /**
     * Gets the number of VR manipulators.
     */
    getNumberOfVRManipulators(): number;

    /**
     * Gets the number of gesture manipulators.
     */
    getNumberOfGestureManipulators(): number;

    /**
     * Resets/clears the current manipulator.
     */
    resetCurrentManipulator(): void;

    /**
     * Finds a mouse manipulator with a given control set.
     * @param button which button
     * @param shift shift enabled
     * @param scroll scroll enabled
     * @param alt alt enabled
     */
    findMouseManipulator(
      button: number,
      shift: boolean,
      scroll: boolean,
      alt: boolean
    ): Nullable<vtkCompositeMouseManipulator>;

    /**
     * Finds a VR manipulator with a given device + input.
     * @param device
     * @param input
     */
    findVRManipulator(
      device: Device,
      input: Input
    ): Nullable<vtkCompositeVRManipulator>;

    /**
     * Handles a left button press event.
     * @param callData event data
     */
    handleLeftButtonPress(callData: unknown): void;

    /**
     * Handles a middle button press event.
     * @param callData event data
     */
    handleMiddleButtonPress(callData: unknown): void;

    /**
     * Handles a right button press event.
     * @param callData event data
     */
    handleRightButtonPress(callData: unknown): void;

    /**
     * Handles a left button release event.
     * @param callData event data
     */
    handleLeftButtonRelease(callData: unknown): void;

    /**
     * Handles a middle button release event.
     * @param callData event data
     */
    handleMiddleButtonRelease(callData: unknown): void;

    /**
     * Handles a right button release event.
     * @param callData event data
     */
    handleRightButtonRelease(callData: unknown): void;

    /**
     * Handles the start of a wheel event.
     * @param callData event data
     */
    handleStartMouseWheel(callData: unknown): void;

    /**
     * Handles a wheel event.
     * @param callData event data
     */
    handleMouseWheel(callData: unknown): void;

    /**
     * Handles the end of a wheel event.
     * @param callData event data
     */
    handleEndMouseWheel(callData: unknown): void;

    /**
     * Handles a mouse move.
     * @param callData event data
     */
    handleMouseMove(callData: unknown): void;

    /**
     * Handles a 3D button event.
     * @param callData event data
     */
    handleButton3D(ed: unknown): void;

    /**
     * Handles a 3D move event.
     * @param ed event data
     */
    handleMove3D(ed: unknown): void;

    /**
     * Handles a keypress.
     * @param callData event data
     */
    handleKeyPress(callData: unknown): void;

    /**
     * Handles a keydown event.
     * @param callData event data
     */
    handleKeyDown(callData: unknown): void;

    /**
     * Handles a keyup event.
     * @param callData event data
     */
    handleKeyUp(callData: unknown): void;

    /**
     * Handles the start of a pinch gesture.
     * @param callData event data
     */
    handleStartPinch(callData: unknown): void;

    /**
     * Handles the end of a pinch gesture.
     * @param callData event data
     */
    handleEndPinch(callData: unknown): void;

    /**
     * Handles the start of a rotate gesture.
     * @param callData event data
     */
    handleStartRotate(callData: unknown): void;

    /**
     * Handles the end of a rotate gesture.
     * @param callData event data
     */
    handleEndRotate(callData: unknown): void;

    /**
     * Handles the start of a pan gesture.
     * @param callData event data
     */
    handleStartPan(callData: unknown): void;

    /**
     * Handles the end of a pan gesture.
     * @param callData event data
     */
    handleEndPan(callData: unknown): void;

    /**
     * Handles a pinch gesture.
     * @param callData event data
     */
    handlePinch(callData: unknown): void;

    /**
     * Handles a rotate gesture.
     * @param callData event data
     */
    handleRotate(callData: unknown): void;

    /**
     * Handles a pan gesture.
     * @param callData event data
     */
    handlePan(callData: unknown): void;

    /**
     * Handles a button down event.
     * @param button which button
     * @param callData event data
     */
    onButtonDown(button: number, callData: unknown): void;

    /**
     * Handles a button up event.
     * @param button which button
     */
    onButtonUp(button: number): void;

    /**
     * Sets the rotation factor.
     * @param factor rotation factor
     */
    setRotationFactor(factor: number): boolean;

    /**
     * Gets the rotation factor.
     */
    getRotationFactor(): number;

    getMouseManipulators(): vtkCompositeMouseManipulator[];
    getMouseManipulators(): vtkCompositeMouseManipulator[];
    getMouseManipulators(): vtkCompositeMouseManipulator[];
    getMouseManipulators(): vtkCompositeMouseManipulator[];
  }

  export interface IInteractorStyleManipulatorInitialValues {
    centerOfRotation?: Vector3;
    rotationFactor?: number;
  }

  export function newInstance(
    initialValues?: IInteractorStyleManipulatorInitialValues
  ): vtkInteractorStyleManipulator;

  export function extend(
    publicAPI: object,
    model: object,
    initialValues?: IInteractorStyleManipulatorInitialValues
  ): void;

  export const vtkInteractorStyleManipulator: {
    newInstance: typeof newInstance;
    extend: typeof extend;
  };

  export default vtkInteractorStyleManipulator;
}

declare module '@kitware/vtk.js/Interaction/Manipulators/CompositeMouseManipulator' {
  import vtkRenderer from '@kitware/vtk.js/Rendering/Core/Renderer';
  import vtkRenderWindowInteractor from '@kitware/vtk.js/Rendering/Core/RenderWindowInteractor';

  export interface vtkCompositeMouseManipulator {
    /**
     * Starts an interaction event.
     */
    startInteraction(): void;

    /**
     * Ends an interaction event.
     */
    endInteraction(): void;

    /**
     * Handles a button down event.
     * @param interactor the interactor
     * @param renderer the renderer
     * @param position the display position
     */
    onButtonDown(
      interactor: vtkRenderWindowInteractor,
      renderer: vtkRenderer,
      position: { x: number; y: number }
    ): void;

    /**
     * Handles a button up event.
     * @param interactor the interactor
     */
    onButtonUp(interactor: vtkRenderWindowInteractor): void;

    /**
     * Handles a mouse move event.
     * @param interactor the interactor
     * @param renderer the renderer
     * @param position the display position
     */
    onMouseMove(
      interactor: vtkRenderWindowInteractor,
      renderer: vtkRenderer,
      position: { x: number; y: number }
    ): void;

    /**
     * Handles a start scroll event.
     * @param interactor the interactor
     * @param renderer the renderer
     * @param delta the scroll delta
     */
    onStartScroll(
      interactor: vtkRenderWindowInteractor,
      renderer: vtkRenderer,
      delta: number
    ): void;

    /**
     * Handles a scroll event.
     * @param interactor the interactor
     */
    onEndScroll(interactor: vtkRenderWindowInteractor): void;

    /**
     * Is drag enabled.
     */
    isDragEnabled(): boolean;

    /**
     * Sets if drag is enabled.
     * @param enabled
     */
    setDragEnabled(enabled: boolean): boolean;

    /**
     * Is scroll enabled.
     */
    isScrollEnabled(): boolean;

    /**
     * Sets if scroll is enabled.
     * @param enabled
     */
    setScrollEnabled(enabled: boolean): boolean;

    /**
     * Sets the associated button.
     * @param btn
     */
    setButton(btn: number): boolean;

    /**
     * Gets the associated button.
     */
    getButton(): number;

    /**
     * Sets if the shift key is required.
     * @param shift
     */
    setShift(shift: boolean): boolean;

    /**
     * Gets flag if shift key is required.
     */
    getShift(): boolean;

    /**
     * Sets if the control key is required.
     * @param ctrl
     */
    setControl(ctrl: boolean): boolean;

    /**
     * Gets flag if control key is required.
     */
    getControl(): boolean;

    /**
     * Sets if the alt key is required.
     * @param alt
     */
    setAlt(alt: boolean): boolean;

    /**
     * Gets flag if alt key is required.
     */
    getAlt(): boolean;
  }

  export interface ICompositeMouseManipulatorInitialValues {
    button?: number;
    shift?: boolean;
    control?: boolean;
    alt?: boolean;
    dragEnabled?: boolean;
    scrollEnabled?: boolean;
  }

  export function extend(
    publicAPI: object,
    model: object,
    initialValues?: ICompositeMouseManipulatorInitialValues
  ): void;

  export const vtkCompositeMouseManipulator: {
    extend: typeof extend;
  };

  export default vtkCompositeMouseManipulator;
}

declare module '@kitware/vtk.js/Interaction/Manipulators/CompositeKeyboardManipulator' {
  import vtkRenderer from '@kitware/vtk.js/Rendering/Core/Renderer';
  import vtkRenderWindowInteractor from '@kitware/vtk.js/Rendering/Core/RenderWindowInteractor';

  export interface vtkCompositeKeyboardManipulator {
    /**
     * Handles a keypress event.
     * @param interactor the interactor
     * @param renderer the renderer
     * @param key the key
     */
    onKeyPress(
      interactor: vtkRenderWindowInteractor,
      renderer: vtkRenderer,
      key: KeyboardEvent['key']
    ): void;

    /**
     * Handles a keydown event.
     * @param interactor the interactor
     * @param renderer the renderer
     * @param key the key
     */
    onKeyDown(
      interactor: vtkRenderWindowInteractor,
      renderer: vtkRenderer,
      key: KeyboardEvent['key']
    ): void;

    /**
     * Handles a keyup event.
     * @param interactor the interactor
     * @param renderer the renderer
     * @param key the key
     */
    onKeyUp(
      interactor: vtkRenderWindowInteractor,
      renderer: vtkRenderer,
      key: KeyboardEvent['key']
    ): void;
  }

  export function extend(publicAPI: object, model: object): void;

  export const vtkCompositeKeyboardManipulator: {
    extend: typeof extend;
  };

  export default vtkCompositeKeyboardManipulator;
}

declare module '@kitware/vtk.js/Interaction/Manipulators/CompositeGestureManipulator' {
  import vtkInteractorStyle from '@kitware/vtk.js/Interaction/Style/InteractorStyle';
  import vtkRenderer from '@kitware/vtk.js/Rendering/Core/Renderer';
  import vtkRenderWindowInteractor from '@kitware/vtk.js/Rendering/Core/RenderWindowInteractor';
  import { Nullable } from '@kitware/vtk.js/types';

  export interface vtkCompositeGestureManipulator {
    /**
     * Starts an interaction event.
     */
    startInteraction(): void;

    /**
     * Ends an interaction event.
     */
    endInteraction(): void;

    /**
     * Handles a start pinch gesture.
     * @param interactor
     * @param scale
     */
    onStartPinch(interactor: vtkRenderWindowInteractor, scale: number): void;

    /**
     * Handles a pinch gesture.
     * @param interactor
     * @param renderer
     * @param scale
     */
    onPinch(
      interactor: vtkRenderWindowInteractor,
      renderer: vtkRenderer,
      scale: number
    ): void;

    /**
     * Handles an end pinch gesture.
     * @param interactor
     */
    onEndPinch(interactor: vtkRenderWindowInteractor): void;

    /**
     * Handles a start rotate gesture.
     * @param interactor
     * @param rotation
     */
    onStartRotate(
      interactor: vtkRenderWindowInteractor,
      rotation: number
    ): void;

    /**
     * Handles a rotate gesture.
     * @param interactor
     * @param renderer
     * @param rotation
     */
    onRotate(
      interactor: vtkRenderWindowInteractor,
      renderer: vtkRenderer,
      rotation: number
    ): void;

    /**
     * Handles an end pinch gesture.
     * @param interactor
     */
    onEndRotate(interactor: vtkRenderWindowInteractor): void;

    /**
     * Handles a start pan gesture.
     * @param interactor
     * @param translation
     */
    onStartPan(
      interactor: vtkRenderWindowInteractor,
      translation: number
    ): void;

    /**
     * Handles a pan gesture.
     * @param interactor
     * @param renderer
     * @param translation
     */
    onPan(
      interactor: vtkRenderWindowInteractor,
      renderer: vtkRenderer,
      translation: number
    ): void;

    /**
     * Handles an end pan gesture.
     * @param interactor
     */
    onEndPan(interactor: vtkRenderWindowInteractor): void;

    /**
     * Is pinch enabled.
     */
    isPinchEnabled(): boolean;

    /**
     * Sets if pinch is enabled.
     * @param pinch
     */
    setPinchEnabled(pinch: boolean): boolean;

    /**
     * Gets flag if pinch is enabled.
     */
    getPinchEnabled(): boolean;

    /**
     * Is pan enabled.
     */
    isPanEnabled(): boolean;

    /**
     * Sets if pan is enabled.
     * @param pan
     */
    setPanEnabled(pan: boolean): boolean;

    /**
     * Gets flag if pan is enabled.
     */
    getPanEnabled(): boolean;

    /**
     * Is rotate enabled.
     */
    isRotateEnabled(): boolean;

    /**
     * Sets if rotate is enabled.
     * @param rotate
     */
    setRotateEnabled(rotate: boolean): boolean;

    /**
     * Gets flag if rotate is enabled.
     */
    getRotateEnabled(): boolean;

    /**
     * Sets the interactor style.
     * @param style vtkInteractorStyle
     */
    setInteractorStyle(style: Nullable<vtkInteractorStyle>): boolean;

    /**
     * Gets the interactor style.
     */
    getInteractorStyle(): Nullable<vtkInteractorStyle>;
  }

  export interface ICompositeGestureManipulatorInitialValues {
    pinchEnabled?: boolean;
    panEnabled?: boolean;
    rotateEnabled?: boolean;
  }

  export function extend(
    publicAPI: object,
    model: object,
    initialValues?: ICompositeGestureManipulatorInitialValues
  ): void;

  export const vtkCompositeGestureManipulator: {
    extend: typeof extend;
  };

  export default vtkCompositeGestureManipulator;
}

declare module '@kitware/vtk.js/Interaction/Manipulators/CompositeVRManipulator' {
  import { States } from '@kitware/vtk.js/Interaction/Style/InteractorStyle/Constants';
  import vtkRenderer from '@kitware/vtk.js/Rendering/Core/Renderer';
  import vtkRenderWindowInteractor from '@kitware/vtk.js/Rendering/Core/RenderWindowInteractor';

  import {
    Device,
    Input,
  } from '@kitware/vtk.js/Rendering/Core/RenderWindowInteractor/Constants';

  export interface vtkCompositeVRManipulator {
    onButton3D(
      interactor: vtkRenderWindowInteractor,
      renderer: vtkRenderer,
      state: States,
      device: Device,
      input: Input,
      pressed: boolean
    ): void;

    onMove3D(
      interactor: vtkRenderWindowInteractor,
      renderer: vtkRenderer,
      state: States,
      device: Device,
      input: Input,
      pressed: boolean
    ): void;
  }

  export interface ICompositeVRManipulatorInitialValues {
    device?: Device;
    input?: Input;
  }

  export function extend(
    publicAPI: object,
    model: object,
    initialValues?: ICompositeVRManipulatorInitialValues
  ): void;

  export const vtkCompositeVRManipulator: {
    extend: typeof extend;
  };

  export default vtkCompositeVRManipulator;
}

declare module '@kitware/vtk.js/Interaction/Manipulators/CompositeCameraManipulator' {
  import vtkInteractorObserver from '@kitware/vtk.js/Rendering/Core/InteractorObserver';
  import vtkRenderer from '@kitware/vtk.js/Rendering/Core/Renderer';
  import { Vector2, Vector3 } from '@kitware/vtk.js/types';

  export interface vtkCompositeCameraManipulator {
    /**
     * Computes the display center.
     * @param observer
     * @param renderer
     */
    computeDisplayCenter(
      observer: vtkInteractorObserver,
      renderer: vtkRenderer
    ): void;

    /**
     * Sets the rotation factor.
     * @param factor
     */
    setRotationFactor(factor: number): boolean;

    /**
     * Gets the rotation factor.
     */
    getRotationFactor(): number;

    /**
     * Sets the display center.
     * @param center
     */
    setDisplayCenter(center: Vector2): boolean;
    setDisplayCenter(x: number, y: number): boolean;

    /**
     * Gets the display center.
     */
    getDisplayCenter(): Vector2;

    /**
     * Sets the center.
     * @param center
     */
    setCenter(center: Vector3): boolean;
    setCenter(x: number, y: number, z: number): boolean;

    /**
     * Gets the center.
     */
    getCenter(): Vector3;
  }

  export interface ICompositeCameraManipulatorInitialValues {
    center?: Vector3;
    rotationFactor?: number;
    displayCenter?: Vector2;
  }

  export function extend(
    publicAPI: object,
    model: object,
    initialValues?: ICompositeCameraManipulatorInitialValues
  ): void;

  export const vtkCompositeCameraManipulator: {
    extend: typeof extend;
  };

  export default vtkCompositeCameraManipulator;
}

declare module '@kitware/vtk.js/Interaction/Manipulators/MouseCameraTrackballPanManipulator' {
  import vtkCompositeCameraManipulator, {
    ICompositeCameraManipulatorInitialValues,
  } from '@kitware/vtk.js/Interaction/Manipulators/CompositeCameraManipulator';
  import vtkCompositeMouseManipulator, {
    ICompositeMouseManipulatorInitialValues,
  } from '@kitware/vtk.js/Interaction/Manipulators/CompositeMouseManipulator';
  import { vtkObject } from '@kitware/vtk.js/interfaces';

  export interface vtkMouseCameraTrackballPanManipulator
    extends vtkObject,
      vtkCompositeCameraManipulator,
      vtkCompositeMouseManipulator {}

  export interface IMouseCameraTrackballPanManipulatorInitialValues
    extends ICompositeCameraManipulatorInitialValues,
      ICompositeMouseManipulatorInitialValues {}

  export function newInstance(
    initialValues?: IMouseCameraTrackballPanManipulatorInitialValues
  ): vtkMouseCameraTrackballPanManipulator;

  export function extend(
    publicAPI: object,
    model: object,
    initialValues?: IMouseCameraTrackballPanManipulatorInitialValues
  ): void;

  export const vtkMouseCameraTrackballPanManipulator: {
    newInstance: typeof newInstance;
    extend: typeof extend;
  };

  export default vtkMouseCameraTrackballPanManipulator;
}

declare module '@kitware/vtk.js/Interaction/Manipulators/MouseCameraTrackballRollManipulator' {
  import vtkCompositeCameraManipulator, {
    ICompositeCameraManipulatorInitialValues,
  } from '@kitware/vtk.js/Interaction/Manipulators/CompositeCameraManipulator';
  import vtkCompositeMouseManipulator, {
    ICompositeMouseManipulatorInitialValues,
  } from '@kitware/vtk.js/Interaction/Manipulators/CompositeMouseManipulator';
  import { vtkObject } from '@kitware/vtk.js/interfaces';

  export interface vtkMouseCameraTrackballRollManipulator
    extends vtkObject,
      vtkCompositeCameraManipulator,
      vtkCompositeMouseManipulator {}

  export interface IMouseCameraTrackballRollManipulatorInitialValues
    extends ICompositeCameraManipulatorInitialValues,
      ICompositeMouseManipulatorInitialValues {}

  export function newInstance(
    initialValues?: IMouseCameraTrackballRollManipulatorInitialValues
  ): vtkMouseCameraTrackballRollManipulator;

  export function extend(
    publicAPI: object,
    model: object,
    initialValues?: IMouseCameraTrackballRollManipulatorInitialValues
  ): void;

  export const vtkMouseCameraTrackballRollManipulator: {
    newInstance: typeof newInstance;
    extend: typeof extend;
  };

  export default vtkMouseCameraTrackballRollManipulator;
}

declare module '@kitware/vtk.js/Interaction/Manipulators/MouseCameraTrackballRotateManipulator' {
  import vtkCompositeCameraManipulator, {
    ICompositeCameraManipulatorInitialValues,
  } from '@kitware/vtk.js/Interaction/Manipulators/CompositeCameraManipulator';
  import vtkCompositeMouseManipulator, {
    ICompositeMouseManipulatorInitialValues,
  } from '@kitware/vtk.js/Interaction/Manipulators/CompositeMouseManipulator';
  import { vtkObject } from '@kitware/vtk.js/interfaces';
  import { Vector3 } from '@kitware/vtk.js/types';

  export interface vtkMouseCameraTrackballRotateManipulator
    extends vtkObject,
      vtkCompositeCameraManipulator,
      vtkCompositeMouseManipulator {
    /**
     * Sets whether to use a given world-up vector.
     * @param use boolean
     */
    setUseWorldUpVec(use: boolean): boolean;

    /**
     * Sets the world-up vector.
     * @param vec the world-up vector
     */
    setWorldUpVec(vec: Vector3): boolean;
    setWorldUpVec(x: number, y: number, z: number): boolean;

    /**
     * Gets the world-up vector.
     */
    getWorldUpVec(): Vector3;

    /**
     * Gets whether to use the focal point as the center of rotation.
     */
    getUseFocalPointAsCenterOfRotation(): boolean;

    /**
     * Sets using the focal point as the center of rotation.
     * @param useFocalPoint
     */
    setUseFocalPointAsCenterOfRotation(useFocalPoint: boolean): boolean;
  }

  export interface IMouseCameraTrackballRotateManipulatorInitialValues
    extends ICompositeCameraManipulatorInitialValues,
      ICompositeMouseManipulatorInitialValues {
    useWorldUpVec?: boolean;
    worldUpVec?: Vector3;
    useFocalPointAsCenterOfRotation?: boolean;
  }

  export function newInstance(
    initialValues?: IMouseCameraTrackballRotateManipulatorInitialValues
  ): vtkMouseCameraTrackballRotateManipulator;

  export function extend(
    publicAPI: object,
    model: object,
    initialValues?: IMouseCameraTrackballRotateManipulatorInitialValues
  ): void;

  export const vtkMouseCameraTrackballRotateManipulator: {
    newInstance: typeof newInstance;
    extend: typeof extend;
  };

  export default vtkMouseCameraTrackballRotateManipulator;
}

declare module '@kitware/vtk.js/Interaction/Manipulators/MouseCameraTrackballMultiRotateManipulator' {
  import vtkCompositeCameraManipulator, {
    ICompositeCameraManipulatorInitialValues,
  } from '@kitware/vtk.js/Interaction/Manipulators/CompositeCameraManipulator';
  import vtkCompositeMouseManipulator, {
    ICompositeMouseManipulatorInitialValues,
  } from '@kitware/vtk.js/Interaction/Manipulators/CompositeMouseManipulator';
  import { vtkObject } from '@kitware/vtk.js/interfaces';
  export interface vtkMouseCameraTrackballMultiRotateManipulator
    extends vtkObject,
      vtkCompositeCameraManipulator,
      vtkCompositeMouseManipulator {}

  export interface IMouseCameraTrackballMultiRotateManipulatorInitialValues
    extends ICompositeCameraManipulatorInitialValues,
      ICompositeMouseManipulatorInitialValues {}

  export function newInstance(
    initialValues?: IMouseCameraTrackballMultiRotateManipulatorInitialValues
  ): vtkMouseCameraTrackballMultiRotateManipulator;

  export function extend(
    publicAPI: object,
    model: object,
    initialValues?: IMouseCameraTrackballMultiRotateManipulatorInitialValues
  ): void;

  export const vtkMouseCameraTrackballMultiRotateManipulator: {
    newInstance: typeof newInstance;
    extend: typeof extend;
  };

  export default vtkMouseCameraTrackballMultiRotateManipulator;
}

declare module '@kitware/vtk.js/Interaction/Manipulators/MouseCameraTrackballZoomManipulator' {
  import vtkCompositeCameraManipulator, {
    ICompositeCameraManipulatorInitialValues,
  } from '@kitware/vtk.js/Interaction/Manipulators/CompositeCameraManipulator';
  import vtkCompositeMouseManipulator, {
    ICompositeMouseManipulatorInitialValues,
  } from '@kitware/vtk.js/Interaction/Manipulators/CompositeMouseManipulator';
  import { vtkObject } from '@kitware/vtk.js/interfaces';
  export interface vtkMouseCameraTrackballZoomManipulator
    extends vtkObject,
      vtkCompositeCameraManipulator,
      vtkCompositeMouseManipulator {
    /**
     * Sets whether to flip the zoom direction.
     * @param flip
     */
    setFlipDirection(flip: boolean): boolean;

    /**
     * Gets the flip direction.
     */
    getFlipDirection(): boolean;
  }

  export interface IMouseCameraTrackballZoomManipulatorInitialValues
    extends ICompositeCameraManipulatorInitialValues,
      ICompositeMouseManipulatorInitialValues {
    flipDirection?: boolean;
  }

  export function newInstance(
    initialValues?: IMouseCameraTrackballZoomManipulatorInitialValues
  ): vtkMouseCameraTrackballZoomManipulator;

  export function extend(
    publicAPI: object,
    model: object,
    initialValues?: IMouseCameraTrackballZoomManipulatorInitialValues
  ): void;

  export const vtkMouseCameraTrackballZoomManipulator: {
    newInstance: typeof newInstance;
    extend: typeof extend;
  };

  export default vtkMouseCameraTrackballZoomManipulator;
}

declare module '@kitware/vtk.js/Interaction/Manipulators/MouseCameraTrackballZoomToMouseManipulator' {
  import vtkMouseCameraTrackballZoomManipulator, {
    IMouseCameraTrackballZoomManipulatorInitialValues,
  } from '@kitware/vtk.js/Interaction/Manipulators/MouseCameraTrackballZoomManipulator';

  export type vtkMouseCameraTrackballZoomToMouseManipulator =
    vtkMouseCameraTrackballZoomManipulator;

  export type IMouseCameraTrackballZoomToMouseManipulatorInitialValues =
    IMouseCameraTrackballZoomManipulatorInitialValues;

  export function newInstance(
    initialValues?: IMouseCameraTrackballZoomToMouseManipulatorInitialValues
  ): vtkMouseCameraTrackballZoomToMouseManipulator;

  export function extend(
    publicAPI: object,
    model: object,
    initialValues?: IMouseCameraTrackballZoomToMouseManipulatorInitialValues
  ): void;

  export const vtkMouseCameraTrackballZoomToMouseManipulator: {
    newInstance: typeof newInstance;
    extend: typeof extend;
  };

  export default vtkMouseCameraTrackballZoomToMouseManipulator;
}

declare module '@kitware/vtk.js/Interaction/Manipulators/MouseBoxSelectorManipulator' {
  import vtkCompositeMouseManipulator, {
    ICompositeMouseManipulatorInitialValues,
  } from '@kitware/vtk.js/Interaction/Manipulators/CompositeMouseManipulator';
  import {
    EventHandler,
    vtkObject,
    vtkSubscription,
  } from '@kitware/vtk.js/interfaces';
  import { Nullable } from '@kitware/vtk.js/types';

  export interface vtkMouseBoxSelectorManipulator
    extends vtkObject,
      vtkCompositeMouseManipulator {
    /**
     * Invokes a box select change event.
     */
    invokeBoxSelectChange(data: unknown): void;

    /**
     * Registers a callback when a box select change event occurs.
     * @param cb EventHandler
     */
    onBoxSelectChange(cb: EventHandler): vtkSubscription;

    /**
     * Invokes a box select input event.
     */
    invokeBoxSelectInput(data: unknown): void;

    /**
     * Registers a callback when a box select input event occurs.
     * @param cb EventHandler
     */
    onBoxSelectInput(cb: EventHandler): vtkSubscription;

    /**
     * Sets whether to render the selection.
     * @param render
     */
    setRenderSelection(render: boolean): boolean;

    /**
     * Get whether to render the selection.
     */
    getRenderSelection(): boolean;

    /**
     * Sets the selection box style.
     * @param style
     */
    setSelectionStyle(style: Record<string, string>): boolean;

    /**
     * Gets the selection box style.
     */
    getSelectionStyle(): Record<string, string>;

    /**
     * Sets the box container.
     * @param container
     */
    setContainer(container: Element): boolean;

    /**
     * Gets the box container.
     */
    getContainer(): Nullable<Element>;
  }

  export interface IMouseBoxSelectorManipulatorInitialValues
    extends ICompositeMouseManipulatorInitialValues {
    renderSelection?: boolean;
    selectionStyle?: Record<string, string>;
    container?: Element;
  }

  export function newInstance(
    initialValues?: IMouseBoxSelectorManipulatorInitialValues
  ): vtkMouseBoxSelectorManipulator;

  export function extend(
    publicAPI: object,
    model: object,
    initialValues?: IMouseBoxSelectorManipulatorInitialValues
  ): void;

  export const vtkMouseBoxSelectorManipulator: {
    newInstance: typeof newInstance;
    extend: typeof extend;
  };

  export default vtkMouseBoxSelectorManipulator;
}

declare module '@kitware/vtk.js/Interaction/Manipulators/GestureCameraManipulator' {
  import vtkCompositeCameraManipulator, {
    ICompositeCameraManipulatorInitialValues,
  } from '@kitware/vtk.js/Interaction/Manipulators/CompositeCameraManipulator';
  import vtkCompositeGestureManipulator, {
    ICompositeGestureManipulatorInitialValues,
  } from '@kitware/vtk.js/Interaction/Manipulators/CompositeGestureManipulator';
  import { vtkObject } from '@kitware/vtk.js/interfaces';
  export interface vtkGestureCameraManipulator
    extends vtkObject,
      vtkCompositeCameraManipulator,
      vtkCompositeGestureManipulator {}

  export interface IGestureCameraManipulatorInitialValues
    extends ICompositeCameraManipulatorInitialValues,
      ICompositeGestureManipulatorInitialValues {
    flipDirection?: boolean;
  }

  export function newInstance(
    initialValues?: IGestureCameraManipulatorInitialValues
  ): vtkGestureCameraManipulator;

  export function extend(
    publicAPI: object,
    model: object,
    initialValues?: IGestureCameraManipulatorInitialValues
  ): void;

  export const vtkGestureCameraManipulator: {
    newInstance: typeof newInstance;
    extend: typeof extend;
  };

  export default vtkGestureCameraManipulator;
}

declare module '@kitware/vtk.js/Common/DataModel/SelectionNode' {
  import { vtkObject } from '@kitware/vtk.js/interfaces';
  import vtkProp from '@kitware/vtk.js/Rendering/Core/Prop';
  import { Bounds, Vector3 } from '@kitware/vtk.js/types';

  export enum SelectionContent {
    GLOBALIDS,
    PEDIGREEIDS,
    VALUES,
    INDICES,
    FRUSTUM,
    LOCATIONS,
    THRESHOLDS,
    BLOCKS,
    QUERY,
  }

  export enum SelectionField {
    CELL,
    POINT,
    FIELD,
    VERTEX,
    EDGE,
    ROW,
  }

  export interface SelectionProperties {
    propID: number;
    prop: vtkProp | null;
    compositeID: number;
    attributeID: number;
    pixelCount: number;
    displayPosition?: Vector3;
    worldPosition?: Vector3;
  }

  export interface ISelectionNodeInitialValues {
    contentType?: SelectionContent;
    fieldType?: SelectionField;
  }

  export interface vtkSelectionNode extends vtkObject {
    getBounds(): Bounds;
    setContentType(type: SelectionContent): boolean;
    getContentType(): number;
    setFieldType(type: SelectionField): boolean;
    getFieldType(): SelectionField;
    setProperties(properties: SelectionProperties): boolean;
    getProperties(): SelectionProperties;
    setSelectionList(selections: number[]): boolean;
    getSelectionList(): number[];
  }

  /**
   * Method used to decorate a given object (publicAPI+model) with vtkSelectionNode characteristics.
   *
   * @param publicAPI object on which methods will be bounds (public)
   * @param model object on which data structure will be bounds (protected)
   * @param {ISelectionNodeInitialValues} [initialValues] (default: {})
   */
  export function extend(
    publicAPI: object,
    model: object,
    initialValues?: ISelectionNodeInitialValues
  ): void;

  /**
   * Method used to create a new instance of vtkSelectionNode.
   * @param {ISelectionNodeInitialValues} [initialValues] for pre-setting some of its content
   */
  export function newInstance(
    initialValues?: ISelectionNodeInitialValues
  ): vtkSelectionNode;

  /**
   * vtkSelectionNode represents a 2D n-sided polygon.
   *
   * The polygons cannot have any internal holes, and cannot self-intersect.
   * Define the polygon with n-points ordered in the counter-clockwise direction.
   * Do not repeat the last point.
   */
  export const vtkSelectionNode: {
    newInstance: typeof newInstance;
    extend: typeof extend;
  };
  export default vtkSelectionNode;
}

declare module '@kitware/vtk.js/Rendering/Core/HardwareSelector' {
  import { FieldAssociations } from '@kitware/vtk.js/Common/DataModel/DataSet/Constants';
  import vtkSelectionNode from '@kitware/vtk.js/Common/DataModel/SelectionNode';
  import { vtkObject } from '@kitware/vtk.js/interfaces';
  import vtkRenderer from '@kitware/vtk.js/Rendering/Core/Renderer';

  export interface vtkHardwareSelector extends vtkObject {
    /**
     * Get the picking source data.
     *
     * @param {vtkRenderer} renderer
     * @param {number} fx1 bottom left x coord
     * @param {number} fy1 bottom right x coord
     * @param {number} fx2 bottom left y coord
     * @param {number} fy2 bottom right y coord
     */
    getSourceDataAsync(
      renderer: vtkRenderer,
      fx1: number,
      fy1: number,
      fx2: number,
      fy2: number
    ): Promise<unknown>;

    /**
     * Generates a selection.
     *
     * @param {vtkRenderer} renderer
     * @param {number} fx1 bottom left x coord
     * @param {number} fy1 bottom right x coord
     * @param {number} fx2 bottom left y coord
     * @param {number} fy2 bottom right y coord
     */
    selectAsync(
      renderer: vtkRenderer,
      fx1: number,
      fy1: number,
      fx2: number,
      fy2: number
    ): Promise<vtkSelectionNode[]>;

    /**
     * Sets the field association.
     * @param {FieldAssociations} assoc
     */
    setFieldAssociation(assoc: FieldAssociations): boolean;

    /**
     * Gets the field association.
     */
    getFieldAssociation(): FieldAssociations;

    /**
     * Sets whether to capture Z values.
     * @param {boolean} capture
     */
    setCaptureZValues(capture: boolean): boolean;

    /**
     * Gets whether to capture Z values.
     */
    getCaptureZValues(): boolean;
  }

  export interface IHardwareSelectorInitialValues {
    fieldAssociation?: FieldAssociations;
    captureZValues?: boolean;
  }

  export function newInstance(
    initialValues?: IHardwareSelectorInitialValues
  ): vtkHardwareSelector;

  export function extend(
    publicAPI: object,
    model: object,
    initialValues?: IHardwareSelectorInitialValues
  ): void;

  export const vtkHardwareSelector: {
    newInstance: typeof newInstance;
    extend: typeof extend;
  };

  export default vtkHardwareSelector;
}

declare module '@kitware/vtk.js/Rendering/OpenGL/HardwareSelector' {
  import vtkSelectionNode from '@kitware/vtk.js/Common/DataModel/SelectionNode';
  import {
    IHardwareSelectorInitialValues,
    vtkHardwareSelector,
  } from '@kitware/vtk.js/Rendering/Core/HardwareSelector';
  import vtkProp from '@kitware/vtk.js/Rendering/Core/Prop';
  import vtkRenderer from '@kitware/vtk.js/Rendering/Core/Renderer';
  import vtkOpenGLRenderWindow from '@kitware/vtk.js/Rendering/OpenGL/RenderWindow';
  import { Vector2 } from '@kitware/vtk.js/types';

  type Area = [number, number, number, number];

  export interface BufferData {
    area: Area;
    pixBuffer: Uint8Array[];
  }

  export interface SourceData {
    area: Area;
    pixBuffer: Uint8Array[];
    captureZValues: boolean;
    zBuffer: Uint8Array;
    props: vtkProp[];
    fieldAssociation: unknown;
    renderer: vtkRenderer;
    openGLRenderWindow: vtkOpenGLRenderWindow;
    generateSelection(
      buffdata: BufferData,
      fx1: number,
      fy1: number,
      fx2: number,
      fy2: number
    ): vtkSelectionNode[];
  }

  export interface PixelInformation {
    valid: boolean;
    prop: vtkProp;
    propID: number;
    compositeID: number;
    zValue: number;
    displayPosition: Vector2;
    attributeID?: number;
  }

  // TODO extends vtkHardwareSelector
  export interface vtkOpenGLHardwareSelector extends vtkHardwareSelector {
    /**
     * Releases internal pixel buffer memory.
     */
    releasePixBuffers(): void;

    /**
     * Preps for picking the scene.
     *
     * Call endSelection() afterwards.
     */
    beginSelection(): void;

    /**
     * Cleans up picking state.
     *
     * Should be after a call to beginSelection();
     */
    endSelection(): void;

    /**
     * Runs a pre-capture pass.
     */
    preCapturePass(): void;

    /**
     * Runs a post-capture pass.
     */
    postCapturePass(): void;

    /**
     * Generates a selection.
     */
    select(): unknown;

    /**
     * Get the picking source data.
     *
     * @param {vtkRenderer} renderer
     * @param {number} fx1 bottom left x coord
     * @param {number} fy1 bottom right x coord
     * @param {number} fx2 bottom left y coord
     * @param {number} fy2 bottom right y coord
     */
    getSourceDataAsync(
      renderer: vtkRenderer,
      fx1: number,
      fy1: number,
      fx2: number,
      fy2: number
    ): Promise<SourceData>;

    /**
     * Captures the scene for picking.
     * @returns whether the capture succeeded.
     */
    captureBuffers(): boolean;

    /**
     * Processes the pixel buffers for actors.
     */
    processPixelBuffers(): void;

    /**
     * Determines if a pass is required.
     * @param {PassTypes} pass
     */
    passRequired(pass: unknown): void;

    /**
     * Saves the pixel buffer from the view.
     * @param {PassTypes} pass
     */
    savePixelBuffer(pass: unknown): void;

    /**
     * Builds the prop hit list.
     * @param {Uint8Array} pixelBuffer
     */
    buildPropHitList(pixelBuffer: Uint8Array): void;

    /**
     * Renders a prop for picking.
     * @param {vtkProp} prop
     */
    renderProp(prop: vtkProp): void;

    /**
     * Sets the current prop's color value for the composite index.
     * @param {number} index
     */
    renderCompositeIndex(index: number): void;

    /**
     * Renders an attribute ID.
     * @param {number} attribId
     */
    renderAttributeId(attribId: number): void;

    /**
     * Returns the pass type name as a string.
     * @param {PassTypes} type
     */
    passTypeToString(type: unknown): string;

    /**
     * Has the prop with the given internal ID been hit.
     * @param {number} id
     */
    isPropHit(id: number): boolean;

    /**
     * Sets the internal color used for coloring the current prop.
     * @param {number} val
     */
    setPropColorValueFromInt(val: number): void;

    /**
     * Gets the selection information for a given pixel.
     *
     * @param inDispPos The input diplay position.
     * @param maxDistance The max distance to consider from the input position.
     * @param outDispPos The output display position.
     */
    getPixelInformation(
      inDispPos: Vector2,
      maxDistance: number,
      outDispPos: Vector2
    ): PixelInformation | null;

    /**
     * Generates selections in a given area.
     *
     * @param {number} fx1 bottom left x coord
     * @param {number} fy1 bottom right x coord
     * @param {number} fx2 bottom left y coord
     * @param {number} fy2 bottom right y coord
     */
    generateSelection(
      fx1: number,
      fy1: number,
      fx2: number,
      fy2: number
    ): vtkSelectionNode[];
    // generateSelection
    // getRawPixelBuffer
    // getPixelBuffer

    /**
     * Attaches a render window + renderer to this hardware selector.
     * @param {vtkOpenGLRenderWindow | null} openglRenderWindow
     * @param {vtkRenderer | null} renderer
     */
    attach(
      openglRenderWindow: vtkOpenGLRenderWindow | null,
      renderer: vtkRenderer | null
    ): void;

    // setRenderer
    // getRenderer
    // setCurrentPass
    // getCurrentPass
    // setOpenGLRenderWindow
    // getOpenGLRenderWindow
    // setMaximumPointId
    // getMaximumPointId
    // setMaximumCellId
    // getMaximumCellId
    // setPropColorValue (array)
    // getPropColorValue (array)

    /**
     * Sets the selection area.
     *
     * @param area An area bounding box
     */
    setArea(area: Area): boolean;

    /**
     * Sets the selection area.
     * @param {number} fx1 bottom left x coord
     * @param {number} fy1 bottom right x coord
     * @param {number} fx2 bottom left y coord
     * @param {number} fy2 bottom right y coord
     */
    setArea(fx1: number, fy1: number, fx2: number, fy2: number): boolean;

    // getArea (array)
    // onEvent ({type: 'StartEvent' | 'EndEvent' })
  }
  export interface IOpenGLHardwareSelectorInitialValues
    extends IHardwareSelectorInitialValues {
    maximumPointId?: number;
    maximumCellId?: number;
    idOffset?: number;
  }

  export function newInstance(
    initialValues?: IOpenGLHardwareSelectorInitialValues
  ): vtkOpenGLHardwareSelector;

  export function extend(
    publicAPI: object,
    model: object,
    initialValues?: IOpenGLHardwareSelectorInitialValues
  ): void;

  export const vtkOpenGLHardwareSelector: {
    newInstance: typeof newInstance;
    extend: typeof extend;
  };

  export default vtkOpenGLHardwareSelector;
}
