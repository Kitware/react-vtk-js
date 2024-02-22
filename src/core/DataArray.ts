import vtkDataArray from '@kitware/vtk.js/Common/Core/DataArray';
import { vtkRange } from '@kitware/vtk.js/interfaces';
import { TYPED_ARRAYS } from '@kitware/vtk.js/macros';
import { useEffect } from 'react';
import { DataArrayValues } from '../types';
import { toTypedArray, TypedArrayLookup } from '../utils';
import deletionRegistry from '../utils/DeletionRegistry';
import useGetterRef from '../utils/useGetterRef';
import { usePrevious } from '../utils/usePrevious';
import useUnmount from '../utils/useUnmount';
import { useDatasetContext, useFieldDataContext } from './contexts';

export interface DataArrayProps {
  /**
   * The ID used to identify this component.
   */
  name?: string;

  /**
   * Typed array name
   */
  type?: keyof typeof TYPED_ARRAYS;

  /**
   * Actual values to use inside our array ([] | TypedArray | { bvals, dtype, shape })
   */
  values?: DataArrayValues;

  /**
   * Number of components / Tuple size
   */
  numberOfComponents?: number;

  /**
   * Name of the method to call on the fieldData (addArray, setScalars, setVectors...)
   */
  registration?: string;

  /**
   * Data values range
   */
  range?: vtkRange;
}

const DefaultProps = {
  registration: 'addArray',
  name: 'scalars',
  type: 'Float32Array' as const,
  numberOfComponents: 1,
};

export default function DataArray(props: DataArrayProps) {
  const prev = usePrevious({ ...DefaultProps, ...props });

  const [daRef, getDataArray] = useGetterRef(() => {
    const da = vtkDataArray.newInstance({
      name: 'scalars',
      empty: true,
    });
    deletionRegistry.register(da, () => da.delete());
    return da;
  });

  const getFieldData = useFieldDataContext();
  const dataset = useDatasetContext();

  const { registration = DefaultProps.registration } = props;

  const {
    name = DefaultProps.name,
    type = DefaultProps.type,
    values = [],
    numberOfComponents = DefaultProps.numberOfComponents,
    range,
  } = props;

  // register array with the dataset must happen before dataset.modified()
  // cleanup should happend before the polydata is deleted
  useEffect(() => {
    const array = getDataArray();
    const ds = dataset.getDataSet();
    deletionRegistry.incRefCount(ds);

    const fieldData = getFieldData();

    const register = fieldData[registration as keyof typeof fieldData] as (
      da: vtkDataArray
    ) => void;
    register(array);

    ds.modified();

    return () => {
      fieldData.removeArray(array.getName());
      deletionRegistry.decRefCount(ds);
    };
  }, [registration, dataset, getDataArray, getFieldData]);

  useEffect(() => {
    const array = getDataArray();

    let modified = !prev;

    modified = array.setName(name) || modified;
    modified = type !== prev?.type || modified;
    modified = numberOfComponents !== prev?.numberOfComponents || modified;
    modified = values !== prev?.values || modified;

    if (modified) {
      const typedArrayClass = TypedArrayLookup[TYPED_ARRAYS[type]];
      array.setData(toTypedArray(values, typedArrayClass), numberOfComponents);
      if (range) {
        if (numberOfComponents === 1) {
          array.setRange(range, 0);
        } else {
          array.setRange(range, numberOfComponents);
        }
      }
    }

    if (modified) dataset.modified();
  });

  useUnmount(() => {
    if (daRef.current) {
      deletionRegistry.markForDeletion(daRef.current);
      daRef.current = null;
    }
  });

  return null;
}
