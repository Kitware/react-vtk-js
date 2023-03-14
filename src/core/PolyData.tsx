import vtkPolyData from '@kitware/vtk.js/Common/DataModel/PolyData';
import {
  forwardRef,
  PropsWithChildren,
  useEffect,
  useImperativeHandle,
  useMemo,
} from 'react';
import {
  DataArrayValues,
  IDataset,
  NumpyEncodedArray,
  TypedArrayConstructor,
} from '../types';
import { dataArraySize, toTypedArray } from '../utils';
import deletionRegistry from '../utils/DeletionRegistry';
import useGetterRef from '../utils/useGetterRef';
import { usePrevious } from '../utils/usePrevious';
import useUnmount from '../utils/useUnmount';
import { DatasetContext, useDownstream, useRepresentation } from './contexts';

export interface PolyDataProps extends PropsWithChildren {
  /**
   * downstream connection port
   */
  port?: number;

  /**
   * xyz coordinates ([] | TypedArray | { bvals, dtype, shape })
   */
  points?: DataArrayValues;

  /**
   * verts cells
   */
  verts?:
    | number[]
    | Uint8Array
    | Uint8ClampedArray
    | Uint16Array
    | Uint32Array
    | NumpyEncodedArray;

  /**
   * lines cells
   */
  lines?:
    | number[]
    | Uint8Array
    | Uint8ClampedArray
    | Uint16Array
    | Uint32Array
    | NumpyEncodedArray;

  /**
   * polys cells
   */
  polys?:
    | number[]
    | Uint8Array
    | Uint8ClampedArray
    | Uint16Array
    | Uint32Array
    | NumpyEncodedArray;

  /**
   * strips cells
   */
  strips?:
    | number[]
    | Uint8Array
    | Uint8ClampedArray
    | Uint16Array
    | Uint32Array
    | NumpyEncodedArray;

  /**
   * Type of connectivity `manual` or implicit such as `points`, `triangles`, `strips`
   */
  connectivity?: string;
}

const DefaultProps = {
  port: 0,
  points: [],
  connectivity: 'manual',
};

export default forwardRef(function PolyData(props: PolyDataProps, fwdRef) {
  const {
    port = DefaultProps.port,
    points = DefaultProps.points,
    connectivity = DefaultProps.connectivity,
    verts,
    lines,
    polys,
    strips,
  } = props;

  const [pdRef, getPolyData] = useGetterRef(() => {
    const pd = vtkPolyData.newInstance();
    deletionRegistry.register(pd, () => pd.delete());
    return pd;
  });

  const representation = useRepresentation();
  const downstream = useDownstream();

  // dataset API
  const dataset = useMemo<IDataset<vtkPolyData>>(
    () => ({
      getDataSet: getPolyData,
      modified: () => {
        const pd = getPolyData();
        pd.modified();

        downstream.setInputData(pd, port);

        // Let the representation know that we have data
        if (pd.getPoints().getData()) {
          representation.dataAvailable();
        }
      },
    }),
    [port, representation, downstream, getPolyData]
  );

  useImperativeHandle(fwdRef, () => dataset);

  const prev = usePrevious({ ...DefaultProps, ...props });

  // update polydata
  useEffect(() => {
    const polyData = getPolyData();
    let modified = !prev;
    let typedArrayClass: TypedArrayConstructor = Uint32Array;

    // TODO shallow array equals? Or tell developer to do this?

    if (points && points !== prev?.points) {
      modified = true;
      const array = toTypedArray(points, Float64Array);
      polyData.getPoints().setData(array, 3);

      // Adapt cell size
      // Max cell size for uint16 is 655356*3=196608.
      // switch to uint32array if this is the case.
      typedArrayClass = array.length > 196608 ? Uint32Array : Uint16Array;
    }

    if (verts && verts !== prev?.verts) {
      modified = true;
      polyData.getVerts().setData(toTypedArray(verts, typedArrayClass));
    }

    if (lines && lines !== prev?.lines) {
      modified = true;
      polyData.getLines().setData(toTypedArray(lines, typedArrayClass));
    }

    if (polys && polys !== prev?.polys) {
      modified = true;
      polyData.getPolys().setData(toTypedArray(polys, typedArrayClass));
    }

    if (strips && strips !== prev?.strips) {
      modified = true;
      polyData.getStrips().setData(toTypedArray(strips, typedArrayClass));
    }

    const curSize = dataArraySize(points);
    const prevSize = prev?.points ? dataArraySize(prev.points) : NaN;
    if (connectivity !== prev?.connectivity || curSize !== prevSize) {
      modified = true;
      const nbPoints = curSize / 3;
      switch (connectivity) {
        case 'points':
          {
            const values = new Uint32Array(nbPoints + 1);
            values[0] = nbPoints;
            for (let i = 0; i < nbPoints; i++) {
              values[i + 1] = i;
            }
            polyData.getVerts().setData(values);
          }
          break;
        case 'triangles':
          {
            const values = new Uint32Array(nbPoints + nbPoints / 3);
            let offset = 0;
            for (let i = 0; i < nbPoints; i += 3) {
              values[offset++] = 3;
              values[offset++] = i + 0;
              values[offset++] = i + 1;
              values[offset++] = i + 2;
            }
            polyData.getPolys().setData(values);
          }
          break;
        case 'strips':
          {
            const values = new Uint32Array(nbPoints + 1);
            values[0] = nbPoints;
            for (let i = 0; i < nbPoints; i++) {
              values[i + 1] = i;
            }
            polyData.getStrips().setData(values);
          }
          break;
        default:
        // do nothing for manual or anything else...
      }
    }

    if (modified) {
      polyData.computeBounds();
      dataset.modified();
    }
  });

  useUnmount(() => {
    if (pdRef.current) {
      deletionRegistry.markForDeletion(pdRef.current);
      pdRef.current = null;
    }
  });

  return (
    <DatasetContext.Provider value={dataset}>
      {props.children}
    </DatasetContext.Provider>
  );
});
