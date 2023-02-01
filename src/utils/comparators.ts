import { Vector2, Vector3 } from '@kitware/vtk.js/types';

export function valueCompareFirst<T extends unknown[]>(cur: T, prev: T) {
  return !!cur[0] && cur[0] !== prev[0];
}

export function shallowArrayCompareFirst<T extends unknown[][]>(
  cur: T,
  prev: T
) {
  const [a] = cur;
  const [b] = prev;
  if ((a && !b) || (!a && b)) return false;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

/**
 * Compares two objects.
 *
 * If any object is undefined, then the comparison fails.
 */
export function compareShallowObject<T>(
  cur: T | undefined,
  prev: T | undefined
) {
  if (!cur || typeof cur !== 'object') return false;
  if (!prev || typeof prev !== 'object') return false;
  if (cur === prev) return true;

  const keys1 = Object.keys(cur);
  const keys2 = Object.keys(prev);
  const keyset2 = new Set(keys2);

  return (
    keys1.length === keys2.length &&
    keys1.every(
      (k) => keyset2.has(k) && cur[k as keyof T] === prev[k as keyof T]
    )
  );
}

/**
 * Compares 2D vectors.
 */
export function compareVector2(
  cur: Vector2 | undefined,
  prev: Vector2 | undefined
) {
  if (cur === prev) return true;
  if (!cur || !prev) return false;
  return cur[0] === prev[0] && cur[1] === prev[1];
}

/**
 * Compares 3D vectors.
 *
 * If any vector is undefined, then the comparison fails.
 */
export function compareVector3(
  cur: Vector3 | undefined,
  prev: Vector3 | undefined
) {
  if (cur === prev) return true;
  if (!cur || !prev) return false;
  return cur[0] === prev[0] && cur[1] === prev[1] && cur[2] === prev[2];
}

/**
 * Compares arrays shallowly.
 */
export function compareShallowArray(
  cur: unknown[] | undefined,
  prev: unknown[] | undefined
) {
  if (cur === prev) return true;
  if (!cur || !prev) return false;
  if (cur.length !== prev.length) return false;
  for (let i = 0; i < cur.length; i++) {
    if (cur[i] !== prev[i]) return false;
  }
  return true;
}
