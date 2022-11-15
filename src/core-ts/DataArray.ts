import vtkDataArray from '@kitware/vtk.js/Common/Core/DataArray';
import { vtkRange } from '@kitware/vtk.js/interfaces';
import { TYPED_ARRAYS } from '@kitware/vtk.js/macros';
import { useEffect } from 'react';
import { DataArrayValues } from '../types';
import { toTypedArray, TypedArrayLookup } from '../utils-ts';
import useGetterRef from '../utils-ts/useGetterRef';
import { useOrderedUnmountEffect } from '../utils-ts/useOrderedUnmountEffect';
import { usePrevious } from '../utils-ts/usePrevious';
import useUnmount from '../utils-ts/useUnmount';
import { useDataset, useFieldData } from './contexts';

interface Props {
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

export default function DataArray(props: Props) {
  const prev = usePrevious({ ...DefaultProps, ...props });

  const [daRef, getDataArray] = useGetterRef(() =>
    vtkDataArray.newInstance({
      name: 'scalars',
      empty: true,
    })
  );

  const getFieldData = useFieldData();
  const dataset = useDataset();

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
  useOrderedUnmountEffect(() => {
    const array = getDataArray();
    const ds = dataset.getDataSet();
    const fieldData = getFieldData();

    const register = fieldData[registration as keyof typeof fieldData] as (
      da: vtkDataArray
    ) => void;
    register(array);

    ds.modified();

    return () => {
      fieldData.removeArray(array.getName());
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
        array.setRange(range, numberOfComponents);
      }
    }

    if (modified) dataset.modified();
  });

  useUnmount(() => {
    if (daRef.current) {
      daRef.current.delete();
      daRef.current = null;
    }
  });

  return null;
}
