import { PropsWithChildren, useCallback } from 'react';
import { FieldDataContext, useDatasetContext } from './contexts';

export default function PointData(props: PropsWithChildren) {
  const dataset = useDatasetContext();
  const getPointData = useCallback(() => {
    return dataset.getDataSet().getPointData();
  }, [dataset]);
  return (
    <FieldDataContext.Provider value={getPointData}>
      {props.children}
    </FieldDataContext.Provider>
  );
}
