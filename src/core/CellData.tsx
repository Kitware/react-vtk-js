import React from 'react';

import { DataSetContext, FieldsContext } from './View';

interface CellDataProps {
  children?: React.ReactNode[] | React.ReactNode;
}

/**
 * CellData is exposing a vtkCellData to a downstream element
 */
export default function CellData(props: CellDataProps) {
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
