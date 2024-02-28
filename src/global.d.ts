declare module '@kitware/vtk.js/type-patches' {
  import { EventHandler, vtkSubscription } from '@kitware/vtk.js/interfaces';
  import vtkRenderer from '@kitware/vtk.js/Rendering/Core/Renderer';
  import vtkRenderWindowInteractor from '@kitware/vtk.js/Rendering/Core/RenderWindowInteractor';

  export interface FixedVTKRenderWindowInteractor
    extends vtkRenderWindowInteractor {
    setCurrentRenderer(ren: vtkRenderer): void;
    setContainer(el: HTMLElement | null): boolean;
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

declare module '@kitware/vtk.js/Interaction/UI/VolumeController' {
  const VolumeController: any;
  export default VolumeController;
}
