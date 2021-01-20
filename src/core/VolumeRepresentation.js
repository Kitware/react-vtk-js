import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { ViewContext, RepresentationContext, DownstreamContext } from './View';

import vtkVolume from 'vtk.js/Sources/Rendering/Core/Volume';
import vtkVolumeMapper from 'vtk.js/Sources/Rendering/Core/VolumeMapper';
import vtkColorMaps from 'vtk.js/Sources/Rendering/Core/ColorTransferFunction/ColorMaps';
import vtkColorTransferFunction from 'vtk.js/Sources/Rendering/Core/ColorTransferFunction';
import vtkPiecewiseFunction from 'vtk.js/Sources/Common/DataModel/PiecewiseFunction';

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

    // Create vtk.js objects
    this.lookupTable = vtkColorTransferFunction.newInstance();
    this.piecewiseFunction = vtkPiecewiseFunction.newInstance();
    this.volume = vtkVolume.newInstance();
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
    if (this.view) {
      this.view.renderer.removeVolume(this.volume);
    }

    this.volume.delete();
    this.volume = null;

    this.mapper.delete();
    this.mapper = null;
  }

  update(props, previous) {
    const { volume, property, mapper, colorMapPreset, colorDataRange } = props;
    if (volume && (!previous || volume !== previous.volume)) {
      this.volume.set(volume);
    }
    if (property && (!previous || property !== previous.property)) {
      this.volume.getProperty().set(property);
    }
    if (mapper && (!previous || mapper !== previous.mapper)) {
      this.mapper.set(mapper);
    }
    if (colorMapPreset && (!previous || colorMapPreset !== previous.colorMapPreset)) {
      const preset = vtkColorMaps.getPresetByName(colorMapPreset);
      this.lookupTable.applyColorMap(preset);
      this.lookupTable.setMappingRange(...colorDataRange);
      this.lookupTable.updateRange();
    }

    if (colorDataRange && (!previous || colorDataRange !== previous.colorDataRange)) {
      if (typeof colorDataRange === 'string') {
        if (previous) {
          console.log('from update');
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
