import { PropsWithChildren, useCallback } from 'react';
import { FieldDataContext, useDatasetContext } from './contexts';

export default function FieldData(props: PropsWithChildren) {
  const dataset = useDatasetContext();
  const getFieldData = useCallback(() => {
    return dataset.getDataSet().getFieldData();
  }, [dataset]);
  return (
    <FieldDataContext.Provider value={getFieldData}>
      {props.children}
    </FieldDataContext.Provider>
  );
}
