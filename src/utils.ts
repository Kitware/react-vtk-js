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

export function vec2Equals(v1, v2) {
  if (!v1 || v1.length !== 2 || !v2 || v2.length !== 2) {
    return false;
  }
  return v1[0] === v2[0] && v1[1] === v2[1];
}

// assumes two not null objects
function objSubsetEquals(a, b) {
  for (const k in a) {
    if (!(k in b) || a[k] !== b[k]) {
      return false;
    }
  }
  return true;
}

// assumes two array-like objects
export function arrayEquals(a, b) {
  if (a.length !== b.length) {
    return false;
  }
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return false;
    }
  }
  return true;
}

// array-like: Arrays or TypedArrays
export function isArrayLike(a) {
  return (
    Array.isArray(a) || (ArrayBuffer.isView(a) && !(a instanceof DataView))
  );
}

// performs shallow equality checks for arrays and objects.
// regular equality check otherwise.
export function smartEqualsShallow(a, b) {
  if (typeof a !== typeof b) {
    return false;
  }
  // handle arrays
  if (isArrayLike(a) && isArrayLike(b)) {
    return arrayEquals(a, b);
  }
  // handle objects
  if (typeof a === 'object' && a && b) {
    return objSubsetEquals(a, b) && objSubsetEquals(b, a);
  }
  return a === b;
}
