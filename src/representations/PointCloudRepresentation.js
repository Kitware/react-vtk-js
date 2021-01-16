import React from 'react';
import PropTypes from 'prop-types';

import GeometryRepresentation from '../core/GeometryRepresentation';
import PolyData from '../core/PolyData';
import PointData from '../core/PointData';
import DataArray from '../core/DataArray';

/**
 * PointCloudRepresentation expect the following set of properties
 *   - xyz: [x0, y0, z0, x1, ..., zn]
 *   - rgb: [...]
 *   - rgba: [...]
 *   - scalars: [...]
 */
export default function PointCloudRepresentation(props) {
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
    type = 'Float32Array';
  }
  console.log('nbComponents', nbComponents);
  return (
    <GeometryRepresentation
      colorMapPreset={props.colorMapPreset}
      colorDataRange={props.colorDataRange}
      property={props.property}
    >
      <PolyData points={props.xyz} connectivity="points">
        { nbComponents &&
          <PointData>
            <DataArray
              registration="setScalars"
              numberOfComponents={nbComponents}
              values={values}
              type={type}
            />
          </PointData>
        }
      </PolyData>
    </GeometryRepresentation>
  );
}

PointCloudRepresentation.defaultProps = {
  xyz: [0, 0, 0],
  colorMapPreset: 'erdc_rainbow_bright',
  colorDataRange: [0, 1],
};

PointCloudRepresentation.propTypes = {
  /**
   * Points coordinates
   */
  xyz: PropTypes.arrayOf(PropTypes.number),
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
   * Preset name for the lookup table color map
   */
  colorMapPreset: PropTypes.string,

  /**
   * Data range use for the colorMap
   */
  colorDataRange: PropTypes.arrayOf(PropTypes.number),

  /**
   * Properties to set to the actor.property
   */
  property: PropTypes.object,
};
