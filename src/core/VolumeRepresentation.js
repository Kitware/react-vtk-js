import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { ViewContext, RepresentationContext, DownstreamContext } from './View';
import { smartEqualsShallow } from '../utils';

import vtkVolume from '@kitware/vtk.js/Rendering/Core/Volume.js';
import vtkVolumeMapper from '@kitware/vtk.js/Rendering/Core/VolumeMapper.js';
import vtkColorMaps from '@kitware/vtk.js/Rendering/Core/ColorTransferFunction/ColorMaps.js';
import vtkColorTransferFunction from '@kitware/vtk.js/Rendering/Core/ColorTransferFunction.js';
import vtkPiecewiseFunction from '@kitware/vtk.js/Common/DataModel/PiecewiseFunction.js';

/**
 * VolumeRepresentation is responsible to convert a vtkPolyData into rendering
 * It takes the following set of properties:
 *   - colorBy: ['POINTS', ''],
 *   - pointSize: 1,
 *   - color: [1,1,1],
 */
export default class VolumeRepresentation extends Component {
  constructor(props) {
    super(props);

    // Guard to prevent rendering if no data
    this.validData = false;
    this.currentVisibility = true;

    // Create vtk.js objects
    this.lookupTable = vtkColorTransferFunction.newInstance();
    this.piecewiseFunction = vtkPiecewiseFunction.newInstance();
    this.volume = vtkVolume.newInstance({ visibility: false });
    this.mapper = vtkVolumeMapper.newInstance();
    this.volume.setMapper(this.mapper);

    this.volume.getProperty().setRGBTransferFunction(0, this.lookupTable);
    this.volume.getProperty().setScalarOpacity(0, this.piecewiseFunction);
    this.volume.getProperty().setInterpolationTypeToLinear();
  }

  render() {
    return (
      <ViewContext.Consumer>
        {(view) => {
          if (!this.view) {
            view.renderer.addVolume(this.volume);
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
    if (this.view && this.view.renderer) {
      this.view.renderer.removeVolume(this.volume);
      this.view = null;
    }

    this.volume.delete();
    this.volume = null;

    this.mapper.delete();
    this.mapper = null;
  }

  update(props, previous) {
    const { volume, property, mapper, colorMapPreset, colorDataRange } = props;
    let changed = false;

    if (volume && (!previous || volume !== previous.volume)) {
      changed = this.volume.set(volume) || changed;
    }
    if (property && (!previous || property !== previous.property)) {
      changed = this.volume.getProperty().set(property) || changed;
    }
    if (mapper && (!previous || mapper !== previous.mapper)) {
      changed = this.mapper.set(mapper) || changed;
    }
    if (
      colorMapPreset &&
      (!previous || colorMapPreset !== previous.colorMapPreset)
    ) {
      changed = true;
      const preset = vtkColorMaps.getPresetByName(colorMapPreset);
      this.lookupTable.applyColorMap(preset);
      this.lookupTable.setMappingRange(...colorDataRange);
      this.lookupTable.updateRange();
    }

    if (
      colorDataRange &&
      (!previous ||
        !smartEqualsShallow(colorDataRange, previous.colorDataRange))
    ) {
      changed = true;
      if (typeof colorDataRange === 'string') {
        if (previous) {
          this.dataChanged();
        } else {
          this.lookupTable.setMappingRange(0, 1);
          this.lookupTable.updateRange();

          this.piecewiseFunction.setNodes([
            { x: 0, y: 0, midpoint: 0.5, sharpness: 0 },
            { x: 1, y: 1, midpoint: 0.5, sharpness: 0 },
          ]);
        }
      } else {
        this.lookupTable.setMappingRange(...colorDataRange);
        this.lookupTable.updateRange();

        this.piecewiseFunction.setNodes([
          { x: colorDataRange[0], y: 0, midpoint: 0.5, sharpness: 0 },
          { x: colorDataRange[1], y: 1, midpoint: 0.5, sharpness: 0 },
        ]);
      }
    }

    // actor visibility
    if (volume && volume.visibility !== undefined) {
      this.currentVisibility = volume.visibility;
      changed =
        this.volume.setVisibility(this.currentVisibility && this.validData) ||
        changed;
    }

    // trigger render
    if (changed) {
      this.dataChanged();
    }
  }

  dataAvailable() {
    if (!this.validData) {
      this.validData = true;
      this.volume.setVisibility(this.currentVisibility);

      // trigger render
      this.dataChanged();
    }
  }

  dataChanged() {
    if (this.props.colorDataRange === 'auto') {
      this.mapper.update();
      const input = this.mapper.getInputData();
      const array = input && input.getPointData().getScalars();
      const dataRange = array && array.getRange();
      if (dataRange) {
        this.lookupTable.setMappingRange(...dataRange);
        this.lookupTable.updateRange();
        this.piecewiseFunction.setNodes([
          { x: dataRange[0], y: 0, midpoint: 0.5, sharpness: 0 },
          { x: dataRange[1], y: 1, midpoint: 0.5, sharpness: 0 },
        ]);
      }

      if (this.view) {
        this.view.renderView();
      }
    }
  }
}

VolumeRepresentation.defaultProps = {
  colorMapPreset: 'erdc_rainbow_bright',
  colorDataRange: 'auto',
};

VolumeRepresentation.propTypes = {
  /**
   * The ID used to identify this component.
   */
  id: PropTypes.string,

  /**
   * Properties to set to the mapper
   */
  mapper: PropTypes.object,

  /**
   * Properties to set to the volume
   */
  volume: PropTypes.object,

  /**
   * Properties to set to the volume.property
   */
  property: PropTypes.object,

  /**
   * Preset name for the lookup table color map
   */
  colorMapPreset: PropTypes.string,

  /**
   * Data range use for the colorMap
   */
  colorDataRange: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.number),
    PropTypes.string,
  ]),

  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
};
