import React, { Component } from 'react';
import PropTypes from 'prop-types';

// ----------------------------------------------------------------------------
// vtk.js Rendering stack
// ----------------------------------------------------------------------------

import { debounce } from '@kitware/vtk.js/macro.js';

import vtkOpenGLRenderWindow from '@kitware/vtk.js/Rendering/OpenGL/RenderWindow.js';
import vtkRenderWindow from '@kitware/vtk.js/Rendering/Core/RenderWindow.js';
import vtkRenderWindowInteractor from '@kitware/vtk.js/Rendering/Core/RenderWindowInteractor.js';
import vtkRenderer from '@kitware/vtk.js/Rendering/Core/Renderer.js';
import vtkInteractorStyleManipulator from '@kitware/vtk.js/Interaction/Style/InteractorStyleManipulator.js';

// Style modes
import vtkMouseCameraTrackballMultiRotateManipulator from '@kitware/vtk.js/Interaction/Manipulators/MouseCameraTrackballMultiRotateManipulator.js';
import vtkMouseCameraTrackballPanManipulator from '@kitware/vtk.js/Interaction/Manipulators/MouseCameraTrackballPanManipulator.js';
import vtkMouseCameraTrackballRollManipulator from '@kitware/vtk.js/Interaction/Manipulators/MouseCameraTrackballRollManipulator.js';
import vtkMouseCameraTrackballRotateManipulator from '@kitware/vtk.js/Interaction/Manipulators/MouseCameraTrackballRotateManipulator.js';
import vtkMouseCameraTrackballZoomManipulator from '@kitware/vtk.js/Interaction/Manipulators/MouseCameraTrackballZoomManipulator.js';
import vtkMouseCameraTrackballZoomToMouseManipulator from '@kitware/vtk.js/Interaction/Manipulators/MouseCameraTrackballZoomToMouseManipulator.js';
import vtkGestureCameraManipulator from '@kitware/vtk.js/Interaction/Manipulators/GestureCameraManipulator.js';

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
};

function assignManipulators(style, settings) {
  style.removeAllMouseManipulators();
  settings.forEach((item) => {
    const klass = manipulatorFactory[item.action];
    if (klass) {
      const { button, shift, control, alt, scrollEnabled, dragEnabled } = item;
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

    this.openglRenderWindow = vtkOpenGLRenderWindow.newInstance();
    this.renderWindow.addView(this.openglRenderWindow);

    this.interactor = vtkRenderWindowInteractor.newInstance();
    this.interactor.setView(this.openglRenderWindow);
    this.interactor.initialize();

    // Interactor style
    this.style = vtkInteractorStyleManipulator.newInstance();
    this.interactor.setInteractorStyle(this.style);

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
    this.renderView = this.renderWindow.render;
    this.resetCamera = this.resetCamera.bind(this);

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
    this.onClick = this.onClick.bind(this);
    this.onMouseMove = debounce((e) => this.onHover(e), 50);
    this.lastSelection = [];
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
      const { width, height } = container.getBoundingClientRect();
      this.openglRenderWindow.setSize(
        Math.max(width, 10),
        Math.max(height, 10)
      );
      this.renderWindow.render();
    }
  }

  componentDidMount() {
    const container = this.containerRef.current;
    this.openglRenderWindow.setContainer(container);
    this.interactor.bindEvents(container);
    this.onResize();
    this.resizeObserver.observe(container);
    this.update(this.props);
    document.addEventListener('keyup', this.handleKey);
    this.resetCamera();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    this.update(this.props, prevProps);
  }

  componentWillUnmount() {
    document.removeEventListener('keyup', this.handleKey);
    // Stop size listening
    this.resizeObserver.disconnect();
    this.resizeObserver = null;

    // Detatch from DOM
    this.interactor.unbindEvents();
    this.openglRenderWindow.setContainer(null);

    // Free memory
    this.renderWindow.removeRenderer(this.renderer);
    this.renderWindow.removeView(this.openglRenderWindow);

    this.interactor.delete();
    this.interactor = null;

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
      cameraPosition,
      cameraViewUp,
      cameraParallelProjection,
      triggerRender,
      triggerResetCamera,
    } = props;
    if (background && (!previous || background !== previous.background)) {
      this.renderer.setBackground(background);
    }
    if (
      interactorSettings &&
      (!previous || interactorSettings !== previous.interactorSettings)
    ) {
      assignManipulators(this.style, interactorSettings);
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

    // Allow to trigger method call from property change
    if (previous && triggerRender !== previous.triggerRender) {
      setTimeout(this.renderView, 0);
    }
    if (previous && triggerResetCamera !== previous.triggerResetCamera) {
      setTimeout(this.resetCamera, 0);
    }
  }

  resetCamera() {
    this.renderer.resetCamera();
    this.style.setCenterOfRotation(
      this.renderer.getActiveCamera().getFocalPoint()
    );
    this.renderWindow.render();
  }

  pick(x1, y1, x2, y2) {
    this.selector.setArea(x1, y1, x2, y2);
    this.selector.releasePixBuffers();
    this.previousSelectedData = null;
    if (this.selector.captureBuffers()) {
      this.selections = this.selector.generateSelection(x1, y1, x2, y2) || [];
      return this.selections.map((v) => {
        const { prop, compositeID, displayPosition } = v.getProperties();
        const selectionBounds = [];
        let selectionType = '';
        if (x1 !== x2 || y1 !== y2) {
          selectionType = 'frustrum';
          selectionBounds.push(this.renderer.viewToWorld(x1, y1, 0));
          selectionBounds.push(this.renderer.viewToWorld(x2, y1, 0));
          selectionBounds.push(this.renderer.viewToWorld(x2, y2, 0));
          selectionBounds.push(this.renderer.viewToWorld(x1, y2, 0));
          selectionBounds.push(this.renderer.viewToWorld(x1, y1, 1));
          selectionBounds.push(this.renderer.viewToWorld(x2, y1, 1));
          selectionBounds.push(this.renderer.viewToWorld(x2, y2, 1));
          selectionBounds.push(this.renderer.viewToWorld(x1, y2, 1));
        } else {
          selectionType = 'ray';
          selectionBounds.push(this.renderer.viewToWorld(x1, y1, 0));
          selectionBounds.push(this.renderer.viewToWorld(x1, y1, 1));
        }
        return {
          worldPosition: this.renderer.viewToWorld(
            displayPosition[0],
            displayPosition[1],
            displayPosition[2]
          ),
          displayPosition,
          compositeID, // Not yet useful unless GlyphRepresentation
          ...prop.get('representationId'),
          [selectionType]: selectionBounds,
        };
      });
    }
    return [];
  }

  onClick(e) {
    if (this.props.pickingModes.indexOf('click') === -1) {
      return;
    }
    const { x, y } = this.getScreenEventPositionFor(e);
    const selection = this.pick(x, y, x, y);

    // Guard against trigger of empty selection
    if (this.lastSelection.length === 0 && selection.length === 0) {
      return;
    }
    this.lastSelection = selection;

    // Share the selection with the rest of the world
    if (this.props.onClick) {
      this.props.onClick(selection[0]);
    }

    if ('setProps' in this.props) {
      this.props.setProps({ clickInfo: selection[0] });
    }
  }

  onHover(e) {
    if (this.props.pickingModes.indexOf('hover') === -1) {
      return;
    }
    const { x, y } = this.getScreenEventPositionFor(e);
    const selection = this.pick(x, y, x, y);

    // Guard against trigger of empty selection
    if (this.lastSelection.length === 0 && selection.length === 0) {
      return;
    }
    this.lastSelection = selection;

    // Share the selection with the rest of the world
    if (this.props.onHover) {
      this.props.onHover(selection[0]);
    }

    if ('setProps' in this.props) {
      this.props.setProps({ hoverInfo: selection[0] });
    }
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
      shift: true,
    },
    {
      button: 1,
      action: 'Zoom',
      alt: true,
    },
    {
      button: 1,
      action: 'ZoomToMouse',
      control: true,
    },
    {
      button: 1,
      action: 'Roll',
      alt: true,
      shift: true,
    },
  ],
  pickingModes: [],
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
   * List of picking listeners to bind. The supported values are `click` and `hover`. By default it is disabled (empty array).
   */
  pickingModes: PropTypes.arrayOf(PropTypes.string),

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
   * User callback function for hover
   */
  onHover: PropTypes.func,

  /**
   * Read-only prop. To use this, make sure that `pickingModes` contains `hover`.
   * This prop is updated when an element in the map is hovered. This contains
   * the picking info describing the object being hovered.
   */
  hoverInfo: PropTypes.object,
};
