import { PropsWithChildren, useCallback } from 'react';
import { FieldDataContext, useDataset } from './contexts';

export default function PointData(props: PropsWithChildren) {
  const dataset = useDataset();
  const getPointData = useCallback(() => {
    return dataset.getDataSet().getPointData();
  }, [dataset]);
  return (
    <FieldDataContext.Provider value={getPointData}>
      {props.children}
    </FieldDataContext.Provider>
  );
}
