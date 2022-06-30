import React, { Component } from 'react';

import {
  RepresentationContext,
  DownstreamContext,
  DataSetContext,
} from './View';

import vtkImageData from '@kitware/vtk.js/Common/DataModel/ImageData.js';

interface ImageDataProps {
  /**
   * The ID used to identify this component.
   */
  id?: string;
  /**
   * downstream connection port
   */
  port?: number;
  /**
   * Number of points along x, y, z
   */
  dimensions?: number[];
  /**
   * Spacing along x, y, z between points in world coordinates
   */
  spacing?: number[];
  /**
   * World coordinate of the lower left corner of your vtkImageData (i=0, j=0, k=0).
   */
  origin?: number[];
  /**
   * 3x3 matrix use to orient the image data
   */
  direction?: number[];
  children?: React.ReactNode[] | React.ReactNode;
}

/**
 * ImageData is exposing a vtkImageData to a downstream filter
 * It takes the following set of properties:
 *   - dimensions: [nx, ny, nz],
 *   - origin: [0, 0, 0]
 *   - spacing: [1, 1, 1]
 *   - direction: [
 *       1, 0, 0,
 *       0, 1, 0,
 *       0, 0, 1
 *     ]
 */
export default class ImageData extends Component<ImageDataProps> {
  static defaultProps = {
    port: 0,
    dimensions: [1, 1, 1],
    spacing: [1, 1, 1],
    origin: [0, 0, 0],
    direction: [1, 0, 0, 0, 1, 0, 0, 0, 1],
  };

  constructor(props) {
    super(props);

    // Create vtk.js ImageData
    this.imageData = vtkImageData.newInstance();
  }

  render() {
    return (
      <RepresentationContext.Consumer>
        {(representation) => (
          <DownstreamContext.Consumer>
            {(downstream) => {
              this.representation = representation;
              if (!this.downstream) {
                this.downstream = downstream;
              }
              return (
                <DataSetContext.Provider value={this}>
                  <div key={this.props.id} id={this.props.id}>
                    {this.props.children}
                  </div>
                </DataSetContext.Provider>
              );
            }}
          </DownstreamContext.Consumer>
        )}
      </RepresentationContext.Consumer>
    );
  }

  componentDidMount() {
    this.update(this.props);
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    this.update(this.props, prevProps);
  }

  componentWillUnmount() {
    this.imageData.delete();
    this.imageData = null;
  }

  update(props, previous) {
    const { dimensions, spacing, origin, direction } = props;
    this.imageData.set({ dimensions, spacing, origin, direction });
  }

  getDataSet() {
    return this.imageData;
  }

  modified() {
    this.imageData.modified();

    // Let the representation know that we have data
    if (this.representation && this.imageData.getPointData().getScalars()) {
      this.downstream.setInputData(this.imageData, this.props.port);
      this.representation.dataAvailable();
      this.representation.dataChanged();
    }
  }
}
