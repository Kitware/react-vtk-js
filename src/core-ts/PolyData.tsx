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
import { dataArraySize, toTypedArray } from '../utils-ts';
import useGetterRef from '../utils-ts/useGetterRef';
import { useOrderedUnmountContext } from '../utils-ts/useOrderedUnmountEffect';
import { usePrevious } from '../utils-ts/usePrevious';
import useUnmount from '../utils-ts/useUnmount';
import { DatasetContext, useDownstream, useRepresentation } from './contexts';

interface Props extends PropsWithChildren {
  /**
   * The ID used to identify this component.
   */
  id?: string;

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

export default forwardRef(function PolyData(props: Props, fwdRef) {
  const {
    port = 0,
    points = [],
    connectivity = 'manual',
    verts,
    lines,
    polys,
    strips,
  } = props;
  const prev = usePrevious(props);

  const [pdRef, getPolyData] = useGetterRef(() => vtkPolyData.newInstance());

  const OrderedUnmountContext = useOrderedUnmountContext();

  const representation = useRepresentation();
  const getDownstream = useDownstream();

  // dataset API
  const dataset = useMemo<IDataset<vtkPolyData>>(
    () => ({
      getDataSet: getPolyData,
      modified: () => {
        const pd = getPolyData();
        pd.modified();

        const downstream = getDownstream();
        downstream.setInputData(pd, port);

        // Let the representation know that we have data
        if (pd.getPoints().getData()) {
          representation.dataAvailable();
        }
      },
    }),
    [getPolyData, getDownstream, representation, port]
  );

  useImperativeHandle(fwdRef, () => dataset);

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

    if (modified) dataset.modified();
  });

  useUnmount(() => {
    if (pdRef.current) {
      pdRef.current.delete();
      pdRef.current = null;
    }
  });

  return (
    <OrderedUnmountContext.Provider>
      <DatasetContext.Provider value={dataset}>
        {props.children}
      </DatasetContext.Provider>
    </OrderedUnmountContext.Provider>
  );
});
