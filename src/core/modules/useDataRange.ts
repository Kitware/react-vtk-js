import vtkDataArray from '@kitware/vtk.js/Common/Core/DataArray';
import { useCallback, useEffect, useState } from 'react';

const DEFAULT_RANGE: [number, number] = [0, 1];

export default function useDataRange(
  getDataArray: () => vtkDataArray | null | undefined,
  defaultRange = DEFAULT_RANGE
) {
  const [dataRange, setRange] = useState<[number, number]>(defaultRange);

  const updateDataRange = useCallback(() => {
    const range = getDataArray()?.getRange();
    if (!range) return;
    setRange(range);
  }, [getDataArray]);

  useEffect(() => {
    updateDataRange();
  }, [updateDataRange]);

  return {
    dataRange,
    updateDataRange,
  };
}
