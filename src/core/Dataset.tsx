import { vtkObject } from '@kitware/vtk.js/interfaces';
import { useEffect } from 'react';
import { useDownstreamContext, useRepresentationContext } from './contexts';

export interface DatasetProps {
  dataset: vtkObject | null;
}

export default function Dataset(props: DatasetProps) {
  const representation = useRepresentationContext();
  const downstream = useDownstreamContext();

  const { dataset } = props;

  useEffect(() => {
    if (!dataset) {
      representation.dataAvailable(false);
      return;
    }

    downstream.setInputData(dataset);
    representation.dataAvailable(true);
    representation.dataChanged();
  }, [dataset, downstream, representation]);

  return null;
}
