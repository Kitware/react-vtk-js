import React from 'react';
import PropTypes from 'prop-types';

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
  return (
    <PolyData points={props.xyz} connectivity="points">
      { nbComponents &&
        <PointData >
          <DataArray
            registration="setScalars"
            numberOfComponents={nbComponents}
            values={values}
            type={type}
          />
        </PointData>
      }
    </PolyData>
  );
}

PointCloudRepresentation.defaultProps = {
  xyz: [0, 0, 0],
};

PointCloudRepresentation.propTypes = {
  xyz: PropTypes.arrayOf(PropTypes.number),
  rgb: PropTypes.arrayOf(PropTypes.number),
  rgba: PropTypes.arrayOf(PropTypes.number),
  scalars: PropTypes.arrayOf(PropTypes.number),
};
