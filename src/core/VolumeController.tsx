import React, { Component } from 'react';

import { ViewContext, RepresentationContext } from './View';

import vtkVolumeController from '@kitware/vtk.js/Interaction/UI/VolumeController.js';

interface VolumeControllerProps {
  /**
   * The ID used to identify this component.
   */
  id?: string;
  /**
   * Controller size in pixels
   */
  size?: number[];
  /**
   * Use opacity range to rescale color map
   */
  rescaleColorMap?: boolean;
}

/**
 * VolumeController is a GUI to control the piecewise function
 */
export default class VolumeController extends Component<VolumeControllerProps> {
  constructor(props) {
    super(props);
    this.subscriptions = [];
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
    while (this.subscriptions.length) {
      this.subscriptions.pop().unsubscribe();
    }
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

    if (volume && volume.getMapper() && volume.getMapper().getInputData()) {
      const ds = volume.getMapper().getInputData();
      this.controller.setContainer(container);
      this.controller.setupContent(renderWindow, volume, isBackgroundDark);
      this.controller.render();
      this.view.resetCamera();
      this.view.renderView();
      this.subscriptions.push(ds.onModified(() => this.onDataChange(), -1));
    } else {
      setTimeout(() => this.init(), 100);
    }
  }

  onDataChange() {
    const widget = this.controller.getWidget();
    if (this.representation && this.representation.volume) {
      const { volume } = this.representation;
      const sourceDS = volume.getMapper().getInputData();
      const dataArray =
        sourceDS.getPointData().getScalars() ||
        sourceDS.getPointData().getArrays()[0];
      widget.setDataArray(dataArray.getData());
    }
  }
}

VolumeController.defaultProps = {
  size: [400, 150],
  rescaleColorMap: true,
};
