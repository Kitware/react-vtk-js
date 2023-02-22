import { PropsWithChildren, useCallback } from 'react';
import { FieldDataContext, useDataset } from './contexts';

export default function FieldData(props: PropsWithChildren) {
  const dataset = useDataset();
  const getFieldData = useCallback(() => {
    return dataset.getDataSet().getFieldData();
  }, [dataset]);
  return (
    <FieldDataContext.Provider value={getFieldData}>
      {props.children}
    </FieldDataContext.Provider>
  );
}
