import React from 'react';

import { DataSetContext, FieldsContext } from './View';

interface PointDataProps {
  children?: React.ReactNode[] | React.ReactNode;
}

/**
 * PointData is exposing a vtkPointData to a downstream element
 */
export default function PointData(props: PointDataProps) {
  return (
    <DataSetContext.Consumer>
      {(dataset) => (
        <FieldsContext.Provider value={dataset.getDataSet().getPointData()}>
          {props.children}
        </FieldsContext.Provider>
      )}
    </DataSetContext.Consumer>
  );
}

PointData.defaultProps = {};
