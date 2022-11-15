import vtkImageData from '@kitware/vtk.js/Common/DataModel/ImageData';
import { Matrix3x3, Vector3 } from '@kitware/vtk.js/types';
import {
  forwardRef,
  PropsWithChildren,
  useEffect,
  useImperativeHandle,
  useMemo,
} from 'react';
import { IDataset } from '../types';
import useGetterRef from '../utils-ts/useGetterRef';
import { useOrderedUnmountContext } from '../utils-ts/useOrderedUnmountEffect';
import useUnmount from '../utils-ts/useUnmount';
import { DatasetContext, useDownstream, useRepresentation } from './contexts';

interface Props extends PropsWithChildren {
  /**
   * downstream connection port
   */
  port?: number;

  /**
   * Image dimensions along x, y, z
   */
  dimensions?: Vector3;

  /**
   * Image spacing
   */
  spacing?: Vector3;

  /**
   * Image origin
   */
  origin?: Vector3;

  /**
   * Image orientation. Matrix is a 6-tuple, column-major ordering.
   */
  direction?: Matrix3x3;
}

const DefaultProps = {
  port: 0,
  dimensions: [1, 1, 1] as Vector3,
  spacing: [1, 1, 1] as Vector3,
  origin: [0, 0, 0] as Vector3,
  direction: [1, 0, 0, 0, 1, 0, 0, 0, 1] as Matrix3x3,
};

export default forwardRef(function PolyData(props: Props, fwdRef) {
  const {
    port = DefaultProps.port,
    dimensions = DefaultProps.dimensions,
    spacing = DefaultProps.spacing,
    origin = DefaultProps.origin,
    direction = DefaultProps.direction,
  } = props;

  const [imRef, getImageData] = useGetterRef(() => vtkImageData.newInstance());

  const OrderedUnmountContext = useOrderedUnmountContext();

  const representation = useRepresentation();
  const downstream = useDownstream();

  // dataset API
  const dataset = useMemo<IDataset<vtkImageData>>(
    () => ({
      getDataSet: getImageData,
      modified: () => {
        const im = getImageData();
        im.modified();

        downstream.setInputData(im, port);

        // Let the representation know that we have data
        if (im.getPointData().getScalars().getData()) {
          representation.dataAvailable();
        }
      },
    }),
    [port, representation, downstream, getImageData]
  );

  useImperativeHandle(fwdRef, () => dataset);

  // --- update image data model --- //

  useEffect(() => {
    const imageData = getImageData();
    if (imageData.set({ dimensions, spacing, origin, direction })) {
      dataset.modified();
    }
  }, [dimensions, spacing, origin, direction, dataset, getImageData]);

  useUnmount(() => {
    if (imRef.current) {
      imRef.current.delete();
      imRef.current = null;
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
