import { toArrayBuffer } from '@kitware/vtk.js/Common/Core/Base64';
import { TYPED_ARRAYS } from '@kitware/vtk.js/macros';
import { DataArrayValues, TypedArrayConstructor } from '../types';
import { NUMPY_DTYPES } from './numpy';

export const noop = Object.freeze(() => {
  /* noop */
});

export const TypedArrayLookup: Record<TYPED_ARRAYS, TypedArrayConstructor> = {
  [TYPED_ARRAYS.Uint8Array]: Uint8Array,
  [TYPED_ARRAYS.Uint16Array]: Uint16Array,
  [TYPED_ARRAYS.Uint32Array]: Uint32Array,
  [TYPED_ARRAYS.Int8Array]: Int8Array,
  [TYPED_ARRAYS.Int16Array]: Int16Array,
  [TYPED_ARRAYS.Int32Array]: Int32Array,
  [TYPED_ARRAYS.Float32Array]: Float32Array,
  [TYPED_ARRAYS.Float64Array]: Float64Array,
};

export function dataArraySize(v: DataArrayValues) {
  if ('length' in v) return v.length;
  return v.shape.reduce((size, dim) => size * dim, 1);
}

export function toTypedArray(
  values: DataArrayValues,
  constructor: TypedArrayConstructor
) {
  if (Array.isArray(values)) {
    return constructor.from(values);
  }

  if ('dtype' in values) {
    const { bvals, dtype } = values;
    const arrayBuffer = toArrayBuffer(bvals);
    return new NUMPY_DTYPES[dtype](arrayBuffer);
  }

  return values;
}

export function pick<T extends object, K extends keyof T>(
  source: T,
  ...keys: K[]
): Pick<T, K> {
  const lookup = new Set<K>(keys);
  return Object.entries(source)
    .filter(([key]) => lookup.has(key as K))
    .reduce(
      (out, [key, value]) => ({ ...out, [key]: value }),
      {} as Pick<T, K>
    );
}

export function omit<T extends object, K extends keyof T>(
  source: T,
  ...keys: K[]
): Omit<T, K> {
  const lookup = new Set<K>(keys);
  return Object.entries(source)
    .filter(([key]) => !lookup.has(key as K))
    .reduce(
      (out, [key, value]) => ({ ...out, [key]: value }),
      {} as Omit<T, K>
    );
}
