import { PropsWithChildren, useCallback } from 'react';
import { FieldDataContext, useDataset } from './contexts';

export default function CellData(props: PropsWithChildren) {
  const dataset = useDataset();
  const getCellData = useCallback(() => {
    return dataset.getDataSet().getCellData();
  }, [dataset]);
  return (
    <FieldDataContext.Provider value={getCellData}>
      {props.children}
    </FieldDataContext.Provider>
  );
}
