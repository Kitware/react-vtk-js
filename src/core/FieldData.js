import React from 'react';
import PropTypes from 'prop-types';

import { DataSetContext, FieldsContext } from './View';

/**
 * FieldData is exposing a FieldData to a downstream element
 */
export default function FieldData(props) {
  return (
    <DataSetContext.Consumer>
      {(dataset) => (
        <FieldsContext.Provider value={dataset.getDataSet().getFieldData()}>
          {props.children}
        </FieldsContext.Provider>
      )}
    </DataSetContext.Consumer>
  );
}

FieldData.defaultProps = {};

FieldData.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
};
