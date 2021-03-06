import React from 'react';
import PropTypes from 'prop-types';

import VolumeRepresentation from '../core/VolumeRepresentation';
import ImageData from '../core/ImageData';
import PointData from '../core/PointData';
import DataArray from '../core/DataArray';
import VolumeController from '../core/VolumeController';

/**
 * VolumneDataRepresentation expect the following set of properties
 *   - dimensions: [10, 20, 5]
 *   - spacing: [1, 1, 1]
 *   - origin: [0, 0, 0]
 *   - rgb: [...]
 *   - rgba: [...]
 *   - scalars: [...]
 *   - scalarsType: Float32Array
 */
export default function VolumneDataRepresentation(props) {
  let nbComponents = 0;
  let values = null;
  let type = null;
  if (props.rgb) {
    values = props.rgb;
    nbComponents = 3;
    type = 'Uint8Array';
  }
  if (props.rgba) {
    values = props.rgb;
    nbComponents = 4;
    type = 'Uint8Array';
  }
  if (props.scalars) {
    values = props.scalars;
    nbComponents = 1;
    type = props.scalarsType;
  }
  return (
    <VolumeRepresentation
      id={props.id}
      colorMapPreset={props.colorMapPreset}
      colorDataRange={props.colorDataRange}
      property={props.property}
      mapper={props.mapper}
      volume={props.volume}
    >
      {props.volumeController && (
        <VolumeController
          rescaleColorMap={props.rescaleColorMap}
          size={props.controllerSize}
        />
      )}
      <ImageData
        dimensions={props.dimensions}
        origin={props.origin}
        spacing={props.spacing}
      >
        <PointData>
          <DataArray
            registration='setScalars'
            numberOfComponents={nbComponents}
            values={values}
            type={type}
          />
        </PointData>
      </ImageData>
    </VolumeRepresentation>
  );
}

VolumneDataRepresentation.defaultProps = {
  scalarsType: 'Float32Array',
  colorMapPreset: 'erdc_rainbow_bright',
  colorDataRange: 'auto',
  volumeController: true,
  rescaleColorMap: true,
  controllerSize: [400, 150],
};

VolumneDataRepresentation.propTypes = {
  /**
   * The ID used to identify this component.
   */
  id: PropTypes.string,
  /**
   * Number of points along x, y, z
   */
  dimensions: PropTypes.arrayOf(PropTypes.number),

  /**
   * Spacing along x, y, z between points in world coordinates
   */
  spacing: PropTypes.arrayOf(PropTypes.number),

  /**
   * World coordinate of the lower left corner of your vtkImageData (i=0, j=0, k=0).
   */
  origin: PropTypes.arrayOf(PropTypes.number),

  /**
   * Use RGB values to attach to the points/vertex
   */
  rgb: PropTypes.arrayOf(PropTypes.number),
  /**
   * Use RGBA values to attach to the points/vertex
   */
  rgba: PropTypes.arrayOf(PropTypes.number),

  /**
   * Field values to attach to the points
   */
  scalars: PropTypes.arrayOf(PropTypes.number),

  /**
   * Types of numbers provided in scalars
   */
  scalarsType: PropTypes.string,

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
   * Show volumeController
   */
  volumeController: PropTypes.bool,

  /**
   * Controller size in pixels
   */
  controllerSize: PropTypes.arrayOf(PropTypes.number),

  /**
   * Use opacity range to rescale color map
   */
  rescaleColorMap: PropTypes.bool,

  /**
   * Data range use for the colorMap
   */
  colorDataRange: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.number),
    PropTypes.string,
  ]),
};
