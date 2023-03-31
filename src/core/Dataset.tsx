import { vtkObject } from '@kitware/vtk.js/interfaces';
import { useEffect } from 'react';
import { useDownstream, useRepresentation } from './contexts';

export interface DatasetProps {
  dataset: vtkObject | null;
}

export default function Dataset(props: DatasetProps) {
  const representation = useRepresentation();
  const downstream = useDownstream();

  const { dataset } = props;

  useEffect(() => {
    if (!dataset) {
      return;
    }

    downstream.setInputData(dataset);
    representation.dataAvailable();
    representation.dataChanged();
  }, [dataset, downstream, representation]);

  return null;
}
