import React, { Component } from 'react';
import PropTypes from 'prop-types';

// ----------------------------------------------------------------------------
// vtk.js Rendering stack
// ----------------------------------------------------------------------------

import { debounce } from '@kitware/vtk.js/macros.js';

import vtkOpenGLRenderWindow from '@kitware/vtk.js/Rendering/OpenGL/RenderWindow.js';
import vtkRenderWindow from '@kitware/vtk.js/Rendering/Core/RenderWindow.js';
import vtkRenderWindowInteractor from '@kitware/vtk.js/Rendering/Core/RenderWindowInteractor.js';
import vtkRenderer from '@kitware/vtk.js/Rendering/Core/Renderer.js';
import vtkInteractorStyleManipulator from '@kitware/vtk.js/Interaction/Style/InteractorStyleManipulator.js';

import vtkBoundingBox from '@kitware/vtk.js/Common/DataModel/BoundingBox.js';
import vtkCubeAxesActor from '@kitware/vtk.js/Rendering/Core/CubeAxesActor.js';

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
        zoomScale,
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
      if (zoomScale !== undefined) {
        manipulator.setZoomScale(zoomScale);
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
 */
export default class View extends Component {
  constructor(props) {
    super(props);
    this.containerRef = React.createRef();

    // Create vtk.js view
    this.renderWindow = vtkRenderWindow.newInstance();
    this.renderer = vtkRenderer.newInstance();
    this.renderWindow.addRenderer(this.renderer);
    this.camera = this.renderer.getActiveCamera();

    this.openglRenderWindow = vtkOpenGLRenderWindow.newInstance();
    this.renderWindow.addView(this.openglRenderWindow);

    if (props.interactive) {
      this.interactor = vtkRenderWindowInteractor.newInstance();
      this.interactor.setView(this.openglRenderWindow);
      this.interactor.initialize();

      // Interactor style
      this.style = vtkInteractorStyleManipulator.newInstance();
      this.interactor.setInteractorStyle(this.style);
    }

    // Picking handler
    this.selector = vtkOpenGLHardwareSelector.newInstance({
      captureZValues: true,
    });
    this.selector.setFieldAssociation(
      FieldAssociations.FIELD_ASSOCIATION_POINTS
    );
    this.selector.attach(this.openglRenderWindow, this.renderer);

    // Resize handling
    this.resizeObserver = new ResizeObserver(() => this.onResize());

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
      const selection = this.pick(
        Math.floor(x - tolerance),
        Math.floor(y - tolerance),
        Math.ceil(x + tolerance),
        Math.ceil(y + tolerance),
        false
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
      const selection = this.pick(
        Math.floor(x - tolerance),
        Math.floor(y - tolerance),
        Math.ceil(x + tolerance),
        Math.ceil(y + tolerance),
        false
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
    this.cubeAxes
      .getActors()
      .forEach(({ setVisibility }) => setVisibility(false));
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
    const bounds = this.containerRef.current.getBoundingClientRect();
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
        <div>
          <ViewContext.Provider value={this}>{children}</ViewContext.Provider>
        </div>
      </div>
    );
  }

  onResize() {
    const container = this.containerRef.current;
    if (container) {
      const devicePixelRatio = window.devicePixelRatio || 1;
      const { width, height } = container.getBoundingClientRect();
      const w = Math.floor(width * devicePixelRatio);
      const h = Math.floor(height * devicePixelRatio);
      this.openglRenderWindow.setSize(Math.max(w, 10), Math.max(h, 10));
      this.renderWindow.render();
    }
  }

  componentDidMount() {
    const container = this.containerRef.current;
    this.openglRenderWindow.setContainer(container);
    if (this.props.interactive) {
      this.interactor.bindEvents(container);
    }
    this.onResize();
    this.resizeObserver.observe(container);
    this.update(this.props);
    document.addEventListener('keyup', this.handleKey);
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

    document.removeEventListener('keyup', this.handleKey);
    // Stop size listening
    this.resizeObserver.disconnect();
    this.resizeObserver = null;

    // Detatch from DOM
    if (this.interactor) {
      this.interactor.unbindEvents();
    }
    this.openglRenderWindow.setContainer(null);

    // Free memory
    this.renderWindow.removeRenderer(this.renderer);
    this.renderWindow.removeView(this.openglRenderWindow);

    if (this.interactor) {
      this.interactor.delete();
      this.interactor = null;
    }

    this.renderer.delete();
    this.renderer = null;

    this.renderWindow.delete();
    this.renderWindow = null;

    this.openglRenderWindow.delete();
    this.openglRenderWindow = null;
  }

  update(props, previous) {
    const {
      background,
      interactorSettings,
      interactive,
      cameraPosition,
      cameraViewUp,
      cameraParallelProjection,
      triggerRender,
      triggerResetCamera,
      showCubeAxes,
      cubeAxesStyle,
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
      if (previous) {
        this.resetCamera();
      }
    }
    if (
      cameraPosition &&
      (!previous ||
        JSON.stringify(cameraPosition) !==
          JSON.stringify(previous.cameraPosition))
    ) {
      const camera = this.renderer.getActiveCamera();
      camera.set({
        position: cameraPosition,
        viewUp: cameraViewUp,
        focalPoint: [0, 0, 0],
      });
      if (previous) {
        this.resetCamera();
      }
    }

    if (this.cubeAxes.setVisibility(showCubeAxes)) {
      this.cubeAxes
        .getActors()
        .forEach(({ setVisibility }) => setVisibility(showCubeAxes));
      this.renderView();
    }

    if (this.cubeAxes.set(cubeAxesStyle || {})) {
      this.renderView();
    }

    // Allow to trigger method call from property change
    if (previous && triggerRender !== previous.triggerRender) {
      this.renderViewTimeout = setTimeout(this.renderView, 0);
    }
    if (previous && triggerResetCamera !== previous.triggerResetCamera) {
      this.resetCameraTimeout = setTimeout(this.resetCamera, 0);
    }

    // Assign the mouseDown event, we can't use the React event system
    // because the mouseDown event is swallowed by other logic
    const canvas = this.openglRenderWindow.getCanvas();
    canvas.addEventListener('mousedown', this.onMouseDown);
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
   * Initial camera position from an object in [0,0,0]
   */
  cameraViewUp: PropTypes.array,

  /**
   * Use parallel projection (default: false)
   */
  cameraParallelProjection: PropTypes.bool,

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
};
