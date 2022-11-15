import vtkActor2D, {
  IActor2DInitialValues,
} from '@kitware/vtk.js/Rendering/Core/Actor2D';
import { ICoordinateInitialValues } from '@kitware/vtk.js/Rendering/Core/Coordinate';
import { Coordinate } from '@kitware/vtk.js/Rendering/Core/Coordinate/Constants';
import vtkMapper2D, {
  IMapper2DInitialValues,
} from '@kitware/vtk.js/Rendering/Core/Mapper2D';
import { IProperty2DInitialValues } from '@kitware/vtk.js/Rendering/Core/Property2D';
import { Vector2 } from '@kitware/vtk.js/types';
import {
  forwardRef,
  PropsWithChildren,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react';
import { IDownstream, IRepresentation } from '../types';
import { compareShallowObject } from '../utils-ts/comparators';
import useBooleanAccumulator from '../utils-ts/useBooleanAccumulator';
import useComparableEffect from '../utils-ts/useComparableEffect';
import { useOrderedUnmountContext } from '../utils-ts/useOrderedUnmountEffect';
import { DownstreamContext, RepresentationContext, useView } from './contexts';
import useColorTransferFunction from './modules/useColorTransferFunction';
import useCoordinate from './modules/useCoordinate';
import useMapper from './modules/useMapper';
import useProp from './modules/useProp';

interface Props extends PropsWithChildren {
  /**
   * The ID used to identify this component.
   */
  id?: string;

  /**
   * Properties to set to the actor
   */
  actor?: IActor2DInitialValues;

  /**
   * Properties to set to the actor
   */
  mapper?: IMapper2DInitialValues;

  /**
   * Properties to set to the actor.property
   */
  property?: IProperty2DInitialValues;

  /**
   * Preset name for the lookup table color map
   */
  colorMapPreset?: string;

  /**
   * Data range use for the colorMap
   */
  colorDataRange?: [number, number];

  /**
   * The coordinate system in which the input dataset resides.
   */
  transformCoordinate?: ICoordinateInitialValues;
}

const DefaultProps = {
  colorMapPreset: 'erdc_rainbow_bright',
  colorDataRange: [0, 1] as Vector2,
  transformCoordinate: {
    coordinateSystem: Coordinate.DISPLAY,
  },
};

export default forwardRef(function Geometry2DRepresentation(
  props: Props,
  fwdRef
) {
  const OrderedUnmountContext = useOrderedUnmountContext();

  const view = useView();
  const [modifiedRef, trackModified, resetModified] = useBooleanAccumulator();
  const [dataAvailable, setDataAvailable] = useState(false);

  // --- LUT --- //

  const getLookupTable = useColorTransferFunction(
    props.colorMapPreset ?? DefaultProps.colorMapPreset,
    props.colorDataRange ?? DefaultProps.colorDataRange,
    trackModified
  );

  // --- coordinate --- //

  const { transformCoordinate = DefaultProps.transformCoordinate } = props;
  const getCoordinate = useCoordinate(transformCoordinate, trackModified);

  // --- mapper --- //

  const getMapper = useMapper<vtkMapper2D, IMapper2DInitialValues>(
    () =>
      vtkMapper2D.newInstance({
        lookupTable: getLookupTable(),
        useLookupTableScalarRange: false,
        scalarVisibility: false,
        transformCoordinate: getCoordinate(),
      } as IMapper2DInitialValues),
    props.mapper,
    trackModified
  );

  // --- actor --- //

  const actorProps = {
    ...props.actor,
    visibility: dataAvailable && (props.actor?.visibility ?? true),
  };
  const getActor = useProp<vtkActor2D, IActor2DInitialValues>({
    constructor: () => vtkActor2D.newInstance({ visibility: false }),
    view,
    id: props.id,
    props: actorProps,
    trackModified,
  });

  useEffect(() => {
    // TODO type hack; upgrade vtk.js
    const actor = getActor() as vtkActor2D & {
      setMapper(mapper: vtkMapper2D): boolean;
    };
    actor.setMapper(getMapper());
  }, [getActor, getMapper]);

  // set actor property props
  const { property: propertyProps } = props;
  useComparableEffect(
    () => {
      if (!propertyProps) return;
      trackModified(getActor().getProperty().set(propertyProps));
    },
    [propertyProps],
    ([cur], [prev]) => compareShallowObject(cur, prev)
  );

  // --- //

  useEffect(() => {
    if (view && modifiedRef.current) {
      view.requestRender();
      resetModified();
    }
  });

  const representation = useMemo<IRepresentation>(
    () => ({
      dataChanged: () => {
        view.requestRender();
      },
      dataAvailable: () => {
        setDataAvailable(true);
        representation.dataChanged();
      },
    }),
    [view]
  );

  const downstream = useMemo<IDownstream>(
    () => ({
      setInputData: (...args) => getMapper().setInputData(...args),
      setInputConnection: (...args) => getMapper().setInputConnection(...args),
    }),
    [getMapper]
  );

  useImperativeHandle(fwdRef, () => representation);

  return (
    <OrderedUnmountContext.Provider>
      <RepresentationContext.Provider value={representation}>
        <DownstreamContext.Provider value={downstream}>
          {props.children}
        </DownstreamContext.Provider>
      </RepresentationContext.Provider>
    </OrderedUnmountContext.Provider>
  );
});
