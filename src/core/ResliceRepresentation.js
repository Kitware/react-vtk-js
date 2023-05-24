import React from 'react';
import PropTypes from 'prop-types';

import { ViewContext, RepresentationContext, DownstreamContext } from './View';
import vtkSliceRepresentation from './SliceRepresentation';
import vtkImageResliceMapper from '@kitware/vtk.js/Rendering/Core/ImageResliceMapper.js';
import { SlabTypes } from '@kitware/vtk.js/Rendering/Core/ImageResliceMapper/Constants.js';

/**
 * ResliceRepresentation is an image slice representation that allows:
 *   - Orthogonal slicing
 *   - Oblique slicing
 *   - Slab mode (thick slices)
 *   - Slice a volume using arbitary geometry
 */
export default class ResliceRepresentation extends vtkSliceRepresentation {
  constructor(props) {
    super(props);
    // Create the vtk.js objects
    this.mapper = props.mapperInstance ?? vtkImageResliceMapper.newInstance();
    this.actor.setMapper(this.mapper);
    this.actor.getProperty().setRGBTransferFunction(0, this.lookupTable);
    // this.actor.getProperty().setScalarOpacity(0, this.piecewiseFunction);
    this.actor.getProperty().setInterpolationTypeToLinear();
  }

  render() {
    return (
      <ViewContext.Consumer>
        {(view) => {
          if (!this.view) {
            view.renderer.addActor(this.actor);
            this.view = view;
          }
          return (
            <RepresentationContext.Provider value={this}>
              <DownstreamContext.Provider value={this.mapper}>
                <div key={this.props.id} id={this.props.id}>
                  {this.props.children}
                </div>
              </DownstreamContext.Provider>
            </RepresentationContext.Provider>
          );
        }}
      </ViewContext.Consumer>
    );
  }

  componentDidMount() {
    this.update(this.props);
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    this.update(this.props, prevProps);
  }

  componentWillUnmount() {
    super.componentWillUnmount();
    if (this.view && this.view.renderer) {
      this.view.renderer.removeActor(this.actor);
    }
  }

  update(props, previous) {
    const {
      slicePlane,
      slicePolyData,
      slabType,
      slabThickness,
      slabTrapezoidIntegration,
    } = props;
    let changed = false;
    if (slicePlane && (!previous || slicePlane !== previous.slicePlane)) {
      changed = this.slicePlane.set(slicePlane) || changed;
    }
    if (
      slicePolyData &&
      (!previous || slicePolyData !== previous.slicePolyData)
    ) {
      changed = this.slicePolyData.set(slicePolyData) || changed;
    }
    if (this.validData) {
      if (slabType != null && (!previous || slabType !== previous.slabType)) {
        changed = this.mapper.setSlabType(slabType);
      }
      if (
        slabThickness != null &&
        (!previous || slabThickness !== previous.slabThickness)
      ) {
        changed = this.mapper.setSlabThickness(slabThickness);
      }
      if (
        slabTrapezoidIntegration != null &&
        (!previous ||
          slabTrapezoidIntegration !== previous.slabTrapezoidIntegration)
      ) {
        changed = this.mapper.setSlabTrapezoidIntegration(
          slabTrapezoidIntegration
        );
      }
    }
    super.update(props, previous);

    // trigger render
    if (changed) {
      super.dataChanged();
    }
  }
}

ResliceRepresentation.propTypes = {
  /**
   * Slice plane
   */
  slicePlane: PropTypes.object,

  /**
   * Optional slice polydata
   */
  slicePolyData: PropTypes.object,

  /**
   * Slab type
   */
  slabType: PropTypes.arrayOf(PropTypes.oneOf(SlabTypes)),

  /**
   * Slab thickness
   */
  slabThickness: PropTypes.number,

  /**
   * Slab trapezoid integration
   */
  slabTrapezoidIntegration: PropTypes.bool,

  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
};
