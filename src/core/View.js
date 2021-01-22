import React, { Component } from 'react';
import PropTypes from 'prop-types';

// ----------------------------------------------------------------------------
// vtk.js Rendering stack
// ----------------------------------------------------------------------------

import vtkOpenGLRenderWindow from 'vtk.js/Rendering/OpenGL/RenderWindow/index.js';
import vtkRenderWindow from 'vtk.js/Rendering/Core/RenderWindow/index.js';
import vtkRenderWindowInteractor from 'vtk.js/Rendering/Core/RenderWindowInteractor/index.js';
import vtkRenderer from 'vtk.js/Rendering/Core/Renderer/index.js';
import vtkInteractorStyleManipulator from 'vtk.js/Interaction/Style/InteractorStyleManipulator/index.js';

// Style modes
import vtkMouseCameraTrackballMultiRotateManipulator from 'vtk.js/Interaction/Manipulators/MouseCameraTrackballMultiRotateManipulator/index.js';
import vtkMouseCameraTrackballPanManipulator from 'vtk.js/Interaction/Manipulators/MouseCameraTrackballPanManipulator/index.js';
import vtkMouseCameraTrackballRollManipulator from 'vtk.js/Interaction/Manipulators/MouseCameraTrackballRollManipulator/index.js';
import vtkMouseCameraTrackballRotateManipulator from 'vtk.js/Interaction/Manipulators/MouseCameraTrackballRotateManipulator/index.js';
import vtkMouseCameraTrackballZoomManipulator from 'vtk.js/Interaction/Manipulators/MouseCameraTrackballZoomManipulator/index.js';
import vtkMouseCameraTrackballZoomToMouseManipulator from 'vtk.js/Interaction/Manipulators/MouseCameraTrackballZoomToMouseManipulator/index.js';
import vtkGestureCameraManipulator from 'vtk.js/Interaction/Manipulators/GestureCameraManipulator/index.js';

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

const CONTAINER_STYLE = { width: '100%', height: '100%', position: 'relative' };
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
  }

  render() {
    const { id, children } = this.props;

    return (
      <div
        key={id}
        id={id}
        style={CONTAINER_STYLE}
        onMouseEnter={this.onEnter}
        onMouseLeave={this.onLeave}
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
  }

  resetCamera() {
    this.renderer.resetCamera();
    this.style.setCenterOfRotation(
      this.renderer.getActiveCamera().getFocalPoint()
    );
    this.renderWindow.render();
  }
}

View.defaultProps = {
  background: [0.2, 0.3, 0.4],
  cameraPosition: [0, 0, 1],
  cameraViewUp: [0, 1, 0],
  cameraParallelProjection: false,
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
};

View.propTypes = {
  /**
   * The ID used to identify this component.
   */
  id: PropTypes.string,

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
   * List of representation to show
   */
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
};
