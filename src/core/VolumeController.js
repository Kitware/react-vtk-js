import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { ViewContext, RepresentationContext } from './View';

import vtkVolumeController from 'vtk.js/Interaction/UI/VolumeController.js';

/**
 * VolumeController is a GUI to control the piecewise function
 */
export default class VolumeController extends Component {
  constructor(props) {
    super(props);
    this.containerRef = React.createRef();

    // Create vtk.js object
    const { size, rescaleColorMap } = props;
    this.controller = vtkVolumeController.newInstance({
      size,
      rescaleColorMap,
    });
  }

  render() {
    return (
      <ViewContext.Consumer>
        {(view) => (
          <RepresentationContext.Consumer>
            {(representation) => {
              this.view = view;
              this.representation = representation;
              return <div ref={this.containerRef} />;
            }}
          </RepresentationContext.Consumer>
        )}
      </ViewContext.Consumer>
    );
  }

  componentDidMount() {
    this.init();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    this.controller.setSize(...this.props.size);
    this.controller.render();
  }

  componentWillUnmount() {
    this.controller.setContainer(null);
    this.controller.delete();
    this.controller = null;
  }

  init() {
    const container = this.containerRef.current;
    const { renderWindow, props } = this.view;
    const { volume } = this.representation;
    const isBackgroundDark =
      props.background[0] + props.background[1] + props.background[2] < 1.5;

    const ds = volume.getMapper().getInputData();
    if (ds) {
      this.controller.setContainer(container);
      this.controller.setupContent(renderWindow, volume, isBackgroundDark);
      this.controller.render();
      this.view.resetCamera();
      this.view.renderView();
    } else {
      setTimeout(() => this.init(), 100);
    }
  }
}

VolumeController.defaultProps = {
  size: [400, 150],
  rescaleColorMap: true,
};

VolumeController.propTypes = {
  /**
   * The ID used to identify this component.
   */
  id: PropTypes.string,

  /**
   * Controller size in pixels
   */
  size: PropTypes.arrayOf(PropTypes.number),

  /**
   * Use opacity range to rescale color map
   */
  rescaleColorMap: PropTypes.bool,
};
