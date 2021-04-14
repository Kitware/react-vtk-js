import Base64 from '@kitware/vtk.js/Common/Core/Base64.js';

const NUMPY_DTYPES = {
  int32: Int32Array,
  int16: Int16Array,
  int8: Int8Array,
  uint32: Uint32Array,
  uint16: Uint16Array,
  uint8: Uint8Array,
  float32: Float32Array,
  float64: Float64Array,
};

export function toTypedArray(values, TypedArray) {
  if (!values) {
    return null;
  }

  if (Array.isArray(values)) {
    return TypedArray.from(values);
  }

  if (values.dtype) {
    const { bvals, dtype } = values;
    const arrayBuffer = Base64.toArrayBuffer(bvals);
    return new NUMPY_DTYPES[dtype](arrayBuffer);
  }

  return values;
}
