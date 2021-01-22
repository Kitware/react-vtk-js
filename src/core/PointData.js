import React from 'react';
import PropTypes from 'prop-types';

import { DataSetContext, FieldsContext } from './View';

/**
 * PointData is exposing a vtkPointData to a downstream element
 */
export default function PointData(props) {
  return (
    <DataSetContext.Consumer>
      {(dataset) => (
        <FieldsContext.Provider value={dataset.getPointData()}>
          {props.children}
        </FieldsContext.Provider>
      )}
    </DataSetContext.Consumer>
  );
}

PointData.defaultProps = {};

PointData.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
};
