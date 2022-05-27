import React, { Component } from 'react';
import PropTypes from 'prop-types';

// ----------------------------------------------------------------------------
// vtk.js Rendering stack
// ----------------------------------------------------------------------------

import { debounce } from '@kitware/vtk.js/macros.js';

import vtkBoundingBox from '@kitware/vtk.js/Common/DataModel/BoundingBox.js';
import vtkCubeAxesActor from '@kitware/vtk.js/Rendering/Core/CubeAxesActor.js';

import vtkAxesActor from '@kitware/vtk.js/Rendering/Core/AxesActor';
import vtkOrientationMarkerWidget from '@kitware/vtk.js/Interaction/Widgets/OrientationMarkerWidget';
import vtkInteractorStyleManipulator from '@kitware/vtk.js/Interaction/Style/InteractorStyleManipulator.js';

// Style modes
import vtkMouseCameraTrackballMultiRotateManipulator from '@kitware/vtk.js/Interaction/Manipulators/MouseCameraTrackballMultiRotateManipulator.js';
import vtkMouseCameraTrackballPanManipulator from '@kitware/vtk.js/Interaction/Manipulators/MouseCameraTrackballPanManipulator.js';
import vtkMouseCameraTrackballRollManipulator from '@kitware/vtk.js/Interaction/Manipulators/MouseCameraTrackballRollManipulator.js';
import vtkMouseCameraTrackballRotateManipulator from '@kitware/vtk.js/Interaction/Manipulators/MouseCameraTrackballRotateManipulator.js';
import vtkMouseCameraTrackballZoomManipulator from '@kitware/vtk.js/Interaction/Manipulators/MouseCameraTrackballZoomManipulator.js';
import vtkMouseCameraTrackballZoomToMouseManipulator from '@kitware/vtk.js/Interaction/Manipulators/MouseCameraTrackballZoomToMouseManipulator.js';
import vtkGestureCameraManipulator from '@kitware/vtk.js/Interaction/Manipulators/GestureCameraManipulator.js';
import vtkMouseBoxSelectorManipulator from '@kitware/vtk.js/Interaction/Manipulators/MouseBoxSelectorManipulator.js';

// Picking handling
import vtkOpenGLHardwareSelector from '@kitware/vtk.js/Rendering/OpenGL/HardwareSelector.js';
import { FieldAssociations } from '@kitware/vtk.js/Common/DataModel/DataSet/Constants.js';

// ----------------------------------------------------------------------------
// Context to pass parent variables to children
// ----------------------------------------------------------------------------

export const ViewContext = React.createContext(null);
export const RepresentationContext = React.createContext(null);
export const DataSetContext = React.createContext(null);
export const FieldsContext = React.createContext(null);
export const DownstreamContext = React.createContext(null);

// ----------------------------------------------------------------------------
// Helper constants
// ----------------------------------------------------------------------------

const manipulatorFactory = {
  None: null,
  Pan: vtkMouseCameraTrackballPanManipulator,
  Zoom: vtkMouseCameraTrackballZoomManipulator,
  Roll: vtkMouseCameraTrackballRollManipulator,
  Rotate: vtkMouseCameraTrackballRotateManipulator,
  MultiRotate: vtkMouseCameraTrackballMultiRotateManipulator,
  ZoomToMouse: vtkMouseCameraTrackballZoomToMouseManipulator,
  Select: vtkMouseBoxSelectorManipulator,
};

function assignManipulators(style, settings, view) {
  style.removeAllMouseManipulators();
  settings.forEach((item) => {
    const klass = manipulatorFactory[item.action];
    if (klass) {
      const {
        button,
        shift,
        control,
        alt,
        scrollEnabled,
        dragEnabled,
        useWorldUpVec,
        worldUpVec,
        useFocalPointAsCenterOfRotation,
      } = item;
      const manipulator = klass.newInstance();
      manipulator.setButton(button);
      manipulator.setShift(!!shift);
      manipulator.setControl(!!control);
      manipulator.setAlt(!!alt);
      if (scrollEnabled !== undefined) {
        manipulator.setScrollEnabled(scrollEnabled);
      }
      if (dragEnabled !== undefined) {
        manipulator.setDragEnabled(dragEnabled);
      }
      style.addMouseManipulator(manipulator);
      if (manipulator.onBoxSelectChange && view.onBoxSelectChange) {
        manipulator.onBoxSelectChange(view.onBoxSelectChange);
      }
      if (useWorldUpVec !== undefined) {
        manipulator.setUseWorldUpVec(useWorldUpVec);
      }
      if (worldUpVec !== undefined) {
        manipulator.setWorldUpVec(worldUpVec);
      }
      if (useFocalPointAsCenterOfRotation !== undefined) {
        manipulator.setUseFocalPointAsCenterOfRotation(
          useFocalPointAsCenterOfRotation
        );
      }
    }
  });

  // Always add gesture
  style.addGestureManipulator(vtkGestureCameraManipulator.newInstance());
}

// ----------------------------------------------------------------------------
// Default css styles
// ----------------------------------------------------------------------------

const RENDERER_STYLE = {
  position: 'absolute',
  width: '100%',
  height: '100%',
  overflow: 'hidden',
};
/**
 * View is responsible to render vtk.js data.
 * It takes the following set of properties:
 *   - `background`: [0.2, 0.3, 0.4]
 *   - `cameraPosition`: [0, 0, 1]
 *   - `cameraViewUp`: [0, 1, 0]
 *   - `cameraParallelProjection`: false
 *   - `showOrientationAxes`: true
 */
export default class View extends Component {
  constructor(props) {
    super(props);
    this.containerRef = React.createRef();

    // Create vtk.js view
    this.renderWindow = props.renderWindow;
    this.renderer = props.renderer;
    this.camera = this.renderer.getActiveCamera();

    this.openglRenderWindow = props.renderWindowView;

    this.interactor = props.interactor;
    this.defaultStyle = vtkInteractorStyleManipulator.newInstance();
    this.style = props.interactive ? this.defaultStyle : null;

    // Create orientation widget
    this.axesActor = vtkAxesActor.newInstance();
    this.orientationWidget = vtkOrientationMarkerWidget.newInstance({
      actor: this.axesActor,
      interactor: this.interactor,
      parentRenderer: this.renderer,
    });
    this.orientationWidget.setViewportCorner(
      vtkOrientationMarkerWidget.Corners.BOTTOM_LEFT
    );
    this.orientationWidget.setViewportSize(0.15);
    this.orientationWidget.setMinPixelSize(100);
    this.orientationWidget.setMaxPixelSize(300);

    // Picking handler
    this.selector = vtkOpenGLHardwareSelector.newInstance({
      captureZValues: true,
    });
    this.selector.setFieldAssociation(
      FieldAssociations.FIELD_ASSOCIATION_POINTS
    );
    this.selector.attach(this.openglRenderWindow, this.renderer);

    // expose helper methods
    this.renderView = () => {
      this.updateCubeBounds();
      this.renderWindow.render();
    };
    this.resetCamera = this.resetCamera.bind(this);
    const bbox = vtkBoundingBox.newInstance({ bounds: [0, 0, 0, 0, 0, 0] });
    this.updateCubeBounds = () => {
      if (!this.props.showCubeAxes) {
        return;
      }

      bbox.reset();
      const { props } = this.renderer.get('props');
      for (let i = 0; i < props.length; i++) {
        const prop = props[i];
        if (
          prop.getVisibility() &&
          prop.getUseBounds() &&
          prop !== this.cubeAxes
        ) {
          bbox.addBounds(...prop.getBounds());
        }
      }
      this.cubeAxes.setDataBounds(bbox.getBounds());
    };
    this.debouncedCubeBounds = debounce(this.updateCubeBounds, 50);

    this.setInteractorStyle = (style) => {
      if (this.props.interactive) {
        this.style = style;
        this.interactor.setInteractorStyle(style);
      }
    };

    // Internal functions
    this.hasFocus = false;
    this.handleKey = (e) => {
      if (!this.hasFocus) {
        return;
      }
      switch (e.code) {
        case 'KeyR':
          this.resetCamera();
          break;
        default:
          // console.log(e.code);
          break;
      }
    };
    this.onEnter = () => {
      this.hasFocus = true;
    };
    this.onLeave = () => {
      this.hasFocus = false;
    };

    // Handle picking
    const handlePicking = (callback, pickingMode, { x, y }, event) => {
      if (this.props.pickingModes.indexOf(pickingMode) === -1) {
        return;
      }
      const tolerance = this.getPointerSizeTolerance();
      const selection = this.pickClosest(
        Math.floor(x),
        Math.floor(y),
        tolerance
      );

      // Share the selection with the rest of the world
      if (callback) {
        callback(selection[0], event);
      }

      if ('setProps' in this.props) {
        this.props.setProps({ [`${pickingMode}Info`]: selection[0] });
      }
    };

    this.hover = debounce(({ x, y }, event) => {
      if (this.props.pickingModes.indexOf('hover') === -1) {
        return;
      }

      const tolerance = this.getPointerSizeTolerance();
      const selection = this.pickClosest(
        Math.floor(x),
        Math.floor(y),
        tolerance
      );

      // Guard against trigger of empty selection
      if (this.lastSelection.length === 0 && selection.length === 0) {
        return;
      }
      this.lastSelection = selection;

      // Share the selection with the rest of the world
      if (this.props.onHover) {
        this.props.onHover(selection[0], event);
      }

      if ('setProps' in this.props) {
        this.props.setProps({ hoverInfo: selection[0] });
      }
    }, 10);

    const select = ({ selection }) => {
      if (this.props.pickingModes.indexOf('select') === -1) {
        return;
      }
      const [x1, x2, y1, y2] = selection;
      const pickResult = this.pick(x1, y1, x2, y2, true);

      // Share the selection with the rest of the world
      if (this.props.onSelect) {
        this.props.onSelect(pickResult, event);
      }

      if ('setProps' in this.props) {
        this.props.setProps({ selectInfo: pickResult });
      }
    };

    this.onClick = (e) =>
      handlePicking(
        this.props.onClick,
        'click',
        this.getScreenEventPositionFor(e),
        e
      );
    this.onMouseDown = (e) =>
      handlePicking(
        this.props.onMouseDown,
        'mouseDown',
        this.getScreenEventPositionFor(e),
        e
      );
    this.onMouseUp = (e) =>
      handlePicking(
        this.props.onMouseUp,
        'mouseUp',
        this.getScreenEventPositionFor(e),
        e
      );
    this.onMouseMove = (e) => this.hover(this.getScreenEventPositionFor(e), e);
    this.lastSelection = [];

    this.onBoxSelectChange = select;

    // Cube Axes
    this.cubeAxes = vtkCubeAxesActor.newInstance({
      visibility: false,
      dataBounds: [-1, 1, -1, 1, -1, 1],
    });
    Array.from(this.cubeAxes.getActors()).forEach(({ setVisibility }) =>
      setVisibility(false)
    );
    this.cubeAxes.setCamera(this.camera);
    this.renderer.addActor(this.cubeAxes);

    this.subscriptions = [];
    this.subscriptions.push(
      this.renderer.onEvent(({ type, renderer }) => {
        if (renderer && type === 'ComputeVisiblePropBoundsEvent') {
          this.debouncedCubeBounds();
        }
      })
    );
  }

  getPointerSizeTolerance() {
    return this.props.pointerSize / 2;
  }

  getScreenEventPositionFor(source) {
    const bounds = this.openglRenderWindow.getCanvas().getBoundingClientRect();
    const [canvasWidth, canvasHeight] = this.openglRenderWindow.getSize();
    const scaleX = canvasWidth / bounds.width;
    const scaleY = canvasHeight / bounds.height;
    const position = {
      x: scaleX * (source.clientX - bounds.left),
      y: scaleY * (bounds.height - source.clientY + bounds.top),
      z: 0,
    };
    return position;
  }

  render() {
    const { id, children, style, className } = this.props;

    return (
      <div
        key={id}
        id={id}
        className={className}
        style={{ position: 'relative', ...style }}
        onMouseEnter={this.onEnter}
        onMouseLeave={this.onLeave}
        onClick={this.onClick}
        onMouseUp={this.onMouseUp}
        onMouseMove={this.onMouseMove}
      >
        <div style={RENDERER_STYLE} ref={this.containerRef} />
        <ViewContext.Provider value={this}>{children}</ViewContext.Provider>
      </div>
    );
  }

  componentDidMount() {
    const container = this.containerRef.current;
    document.addEventListener('keyup', this.handleKey);

    // Assign the mouseDown event, we can't use the React event system
    // because the mouseDown event is swallowed by other logic
    container.addEventListener('mousedown', this.onMouseDown);

    this.update(this.props);
    this.resetCamera();

    // Give a chance for the first layout to properly reset the camera
    this.firstResetTimeout = setTimeout(() => this.resetCamera(), 100);
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    this.update(this.props, prevProps);
  }

  componentWillUnmount() {
    if (this.debouncedCubeBounds) this.debouncedCubeBounds.cancel();
    if (this.hover) this.hover.cancel();
    clearTimeout(this.resetCameraTimeout);
    clearTimeout(this.renderViewTimeout);
    clearTimeout(this.firstResetTimeout);

    while (this.subscriptions.length) {
      this.subscriptions.pop().unsubscribe();
    }

    const container = this.containerRef.current;
    container.removeEventListener('mousedown', this.onMouseDown);

    document.removeEventListener('keyup', this.handleKey);

    this.selector.delete();
    this.orientationWidget.delete();
    this.defaultStyle.delete();

    this.defaultStyle = null;
    this.style = null;
    this.renderer = null;
    this.selector = null;
    this.orientationWidget = null;
  }

  update(props, previous) {
    const {
      background,
      interactorSettings,
      interactive,
      cameraPosition,
      cameraViewUp,
      cameraFocalPoint,
      cameraParallelProjection,
      autoResetCamera,
      triggerRender,
      triggerResetCamera,
      showCubeAxes,
      cubeAxesStyle,
      showOrientationAxes,
    } = props;
    if (background && (!previous || background !== previous.background)) {
      this.renderer.setBackground(background);
    }
    if (
      interactive &&
      interactorSettings &&
      (!previous || interactorSettings !== previous.interactorSettings)
    ) {
      assignManipulators(this.style, interactorSettings, this);
    }
    if (
      cameraParallelProjection &&
      (!previous ||
        cameraParallelProjection !== previous.cameraParallelProjection)
    ) {
      const camera = this.renderer.getActiveCamera();
      camera.setParallelProjection(cameraParallelProjection);
      if (previous && autoResetCamera) {
        this.resetCamera();
      }
    }
    if (
      (cameraPosition &&
        (!previous ||
          JSON.stringify(cameraPosition) !==
            JSON.stringify(previous.cameraPosition))) ||
      (cameraViewUp &&
        (!previous ||
          JSON.stringify(cameraViewUp) !==
            JSON.stringify(previous.cameraViewUp))) ||
      (cameraFocalPoint &&
        (!previous ||
          JSON.stringify(cameraFocalPoint) !==
            JSON.stringify(previous.cameraFocalPoint)))
    ) {
      const camera = this.renderer.getActiveCamera();
      camera.set({
        position: cameraPosition,
        viewUp: cameraViewUp,
        focalPoint: cameraFocalPoint,
      });
      if (previous && autoResetCamera) {
        this.resetCamera();
      }
    }

    if (this.cubeAxes.setVisibility(showCubeAxes)) {
      Array.from(this.cubeAxes.getActors()).forEach(({ setVisibility }) =>
        setVisibility(showCubeAxes)
      );
      this.renderView();
    }

    if (this.cubeAxes.set(cubeAxesStyle || {})) {
      this.renderView();
    }

    if (showOrientationAxes !== this.orientationWidget.getEnabled()) {
      this.orientationWidget.setEnabled(showOrientationAxes);
    }

    // Allow to trigger method call from property change
    if (previous && triggerRender !== previous.triggerRender) {
      this.renderViewTimeout = setTimeout(this.renderView, 0);
    }
    if (previous && triggerResetCamera !== previous.triggerResetCamera) {
      this.resetCameraTimeout = setTimeout(this.resetCamera, 0);
    }
  }

  resetCamera() {
    this.renderer.resetCamera();
    if (this.props.interactive) {
      this.style.setCenterOfRotation(
        this.renderer.getActiveCamera().getFocalPoint()
      );
    }
    this.renderWindow.render();
  }

  pickClosest(xp, yp, tolerance) {
    const x1 = Math.floor(xp - tolerance);
    const y1 = Math.floor(yp - tolerance);
    const x2 = Math.ceil(xp + tolerance);
    const y2 = Math.ceil(yp + tolerance);

    this.selector.setArea(x1, y1, x2, y2);
    this.previousSelectedData = null;

    if (this.selector.captureBuffers()) {
      const pos = [xp, yp];
      const outSelectedPosition = [0, 0];
      const info = this.selector.getPixelInformation(
        pos,
        tolerance,
        outSelectedPosition
      );

      if (info == null || info.prop == null) return [];

      const startPoint = this.openglRenderWindow.displayToWorld(
        Math.round((x1 + x2) / 2),
        Math.round((y1 + y2) / 2),
        0,
        this.renderer
      );

      const endPoint = this.openglRenderWindow.displayToWorld(
        Math.round((x1 + x2) / 2),
        Math.round((y1 + y2) / 2),
        1,
        this.renderer
      );

      const ray = [Array.from(startPoint), Array.from(endPoint)];

      const worldPosition = Array.from(
        this.openglRenderWindow.displayToWorld(
          info.displayPosition[0],
          info.displayPosition[1],
          info.zValue,
          this.renderer
        )
      );

      const displayPosition = [
        info.displayPosition[0],
        info.displayPosition[1],
        info.zValue,
      ];

      const selection = [];
      selection[0] = {
        worldPosition,
        displayPosition,
        compositeID: info.compositeID,
        ...info.prop.get('representationId'),
        ray,
      };
      return selection;
    }
    return [];
  }

  pick(x1, y1, x2, y2, useFrustrum = false) {
    this.selector.setArea(x1, y1, x2, y2);
    this.previousSelectedData = null;
    if (this.selector.captureBuffers()) {
      this.selections = this.selector.generateSelection(x1, y1, x2, y2) || [];
      if (useFrustrum) {
        const frustrum = [
          Array.from(
            this.openglRenderWindow.displayToWorld(x1, y1, 0, this.renderer)
          ),
          Array.from(
            this.openglRenderWindow.displayToWorld(x2, y1, 0, this.renderer)
          ),
          Array.from(
            this.openglRenderWindow.displayToWorld(x2, y2, 0, this.renderer)
          ),
          Array.from(
            this.openglRenderWindow.displayToWorld(x1, y2, 0, this.renderer)
          ),
          Array.from(
            this.openglRenderWindow.displayToWorld(x1, y1, 1, this.renderer)
          ),
          Array.from(
            this.openglRenderWindow.displayToWorld(x2, y1, 1, this.renderer)
          ),
          Array.from(
            this.openglRenderWindow.displayToWorld(x2, y2, 1, this.renderer)
          ),
          Array.from(
            this.openglRenderWindow.displayToWorld(x1, y2, 1, this.renderer)
          ),
        ];
        const representationIds = [];
        this.selections.forEach((v) => {
          const { prop } = v.getProperties();
          const representationId =
            prop?.get('representationId').representationId;
          if (representationId) {
            representationIds.push(representationId);
          }
        });
        return { frustrum, representationIds };
      }
      const ray = [
        Array.from(
          this.openglRenderWindow.displayToWorld(
            Math.round((x1 + x2) / 2),
            Math.round((y1 + y2) / 2),
            0,
            this.renderer
          )
        ),
        Array.from(
          this.openglRenderWindow.displayToWorld(
            Math.round((x1 + x2) / 2),
            Math.round((y1 + y2) / 2),
            1,
            this.renderer
          )
        ),
      ];
      return this.selections
        .map((v) => {
          const { prop, compositeID, displayPosition } = v.getProperties();

          // Return false to mark this item for removal
          if (prop == null) return false;

          return {
            worldPosition: Array.from(
              this.openglRenderWindow.displayToWorld(
                displayPosition[0],
                displayPosition[1],
                displayPosition[2],
                this.renderer
              )
            ),
            displayPosition,
            compositeID, // Not yet useful unless GlyphRepresentation
            ...prop.get('representationId'),
            ray,
          };
        })
        .filter(Boolean);
    }
    return [];
  }
}

View.defaultProps = {
  style: {
    width: '100%',
    height: '100%',
  },
  background: [0.2, 0.3, 0.4],
  cameraPosition: [0, 0, 1],
  cameraViewUp: [0, 1, 0],
  cameraFocalPoint: [0, 0, 0],
  autoResetCamera: true,
  cameraParallelProjection: false,
  triggerRender: 0,
  triggerResetCamera: 0,
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
  ],
  interactive: true,
  pickingModes: [],
  showCubeAxes: false,
  pointerSize: 0,
  showOrientationAxes: false,
};

View.propTypes = {
  /**
   * The ID used to identify this component.
   */
  id: PropTypes.string,

  /**
   * Allow user to override the default View style { width: '100%', height: '100%' }
   */
  style: PropTypes.object,

  /**
   * Allow user to provide custom className associated to root element
   */
  className: PropTypes.string,

  /**
   * The color of the view background using 3 floating numbers
   * between 0-1 of Red, Green, Blue component.
   */
  background: PropTypes.array,

  /**
   * Configure the interactions
   */
  interactorSettings: PropTypes.array,

  /**
   * Enable/Disable interaction
   */
  interactive: PropTypes.bool,

  /**
   * Initial camera position from an object in [0,0,0]
   */
  cameraPosition: PropTypes.array,

  /**
   * Initial camera focal point from an object in [0,0,0]
   */
  cameraFocalPoint: PropTypes.array,

  /**
   * Initial camera position from an object in [0,0,0]
   */
  cameraViewUp: PropTypes.array,

  /**
   * Use parallel projection (default: false)
   */
  cameraParallelProjection: PropTypes.bool,

  /**
   * Whether to automatically call resetCamera() (default: true)
   *
   * When set to false, the user must explicitly provide camera
   * properties. Note that the initial resetCamera() call will
   * still occur upon component mount.
   */
  autoResetCamera: PropTypes.bool,

  /**
   * Property use to trigger a render when changing.
   */
  triggerRender: PropTypes.number,

  /**
   * Property use to trigger a resetCamera when changing.
   */
  triggerResetCamera: PropTypes.number,

  /**
   * List of representation to show
   */
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),

  /**
   * List of picking listeners to bind. By default it is disabled (empty array).
   */
  pickingModes: PropTypes.arrayOf(
    PropTypes.oneOf(['click', 'hover', 'select', 'mouseDown', 'mouseUp'])
  ),

  /**
   * User callback function for click
   */
  onClick: PropTypes.func,

  /**
   * Read-only prop. To use this, make sure that `pickingModes` contains `click`.
   * This prop is updated when an element in the map is clicked. This contains
   * the picking info describing the object being clicked on.
   */
  clickInfo: PropTypes.object,

  /**
   * User callback function for mouse down
   */
  onMouseDown: PropTypes.func,

  /**
   * Read-only prop. To use this, make sure that `pickingModes` contains `mouseDown`.
   * This prop is updated when a mouse down event is fired on an element in the map. This contains
   * the picking info describing the object interested by the event.
   */
  mouseDownInfo: PropTypes.object,

  /**
   * User callback function for mouse up
   */
  onMouseUp: PropTypes.func,

  /**
   * Read-only prop. To use this, make sure that `pickingModes` contains `mouseUp`.
   * This prop is updated when a mouse up event is fired on an element in the map. This contains
   * the picking info describing the object interested by the event.
   */
  mouseUpInfo: PropTypes.object,

  /**
   * User callback function for hover
   */
  onHover: PropTypes.func,

  /**
   * Read-only prop. To use this, make sure that `pickingModes` contains `hover`.
   * This prop is updated when an element in the map is hovered. This contains
   * the picking info describing the object being hovered.
   */
  hoverInfo: PropTypes.object,

  /**
   * User callback function for box select
   */
  onSelect: PropTypes.func,

  /**
   * Read-only prop. To use this, make sure that `pickingModes` contains `select`.
   * This prop is updated when an element in the view is select. This contains
   * the picking info describing the object being select along with the frustrum.
   */
  selectInfo: PropTypes.object,

  /**
   * Defines the tolerance of the click and hover selection.
   */
  pointerSize: PropTypes.number,

  /**
   * Show/Hide Cube Axes for the given representation
   */
  showCubeAxes: PropTypes.bool,

  /**
   * Configure cube Axes style by overriding the set of properties defined
   * https://github.com/Kitware/vtk-js/blob/HEAD/Sources/Rendering/Core/CubeAxesActor/index.js#L703-L719
   */
  cubeAxesStyle: PropTypes.object,

  /**
   * Show/Hide orientation axes.
   */
  showOrientationAxes: PropTypes.bool,
};
