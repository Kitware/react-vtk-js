import React from 'react';
import PropTypes from 'prop-types';

import { DataSetContext, FieldsContext } from './View';

/**
 * CellData is exposing a vtkCellData to a downstream element
 */
export default function CellData(props) {
  return (
    <DataSetContext.Consumer>
      {(dataset) => (
        <FieldsContext.Provider value={dataset.getDataSet().getCellData()}>
          {props.children}
        </FieldsContext.Provider>
      )}
    </DataSetContext.Consumer>
  );
}

CellData.defaultProps = {};

CellData.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
};
