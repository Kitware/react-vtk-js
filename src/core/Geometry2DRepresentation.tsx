import vtkPolyData from '@kitware/vtk.js/Common/DataModel/PolyData';
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
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react';
import { IDownstream, IRepresentation } from '../types';
import { compareShallowObject } from '../utils/comparators';
import useBooleanAccumulator from '../utils/useBooleanAccumulator';
import useComparableEffect from '../utils/useComparableEffect';
import {
  DownstreamContext,
  RepresentationContext,
  useRendererContext,
} from './contexts';
import useColorTransferFunction from './modules/useColorTransferFunction';
import useCoordinate from './modules/useCoordinate';
import useDataEvents from './modules/useDataEvents';
import useMapper from './modules/useMapper';
import useProp from './modules/useProp';

export interface Geometry2DRepresentationProps extends PropsWithChildren {
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

  /**
   * Event callback for when data is made available.
   *
   * By the time this callback is invoked, you can be sure that:
   * - the mapper has the input data
   * - the actor is visible (unless explicitly marked as not visible)
   * - initial properties are set
   */
  onDataAvailable?: () => void;
}

const DefaultProps = {
  colorMapPreset: 'erdc_rainbow_bright',
  colorDataRange: [0, 1] as Vector2,
  transformCoordinate: {
    coordinateSystem: Coordinate.DISPLAY,
  },
};

export default forwardRef(function Geometry2DRepresentation(
  props: Geometry2DRepresentationProps,
  fwdRef
) {
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

  const getInputData = useCallback(
    () => getMapper().getInputData(),
    [getMapper]
  );

  // --- actor --- //

  const actorProps = {
    ...props.actor,
    visibility: dataAvailable && (props.actor?.visibility ?? true),
  };
  const getActor = useProp<vtkActor2D, IActor2DInitialValues>({
    constructor: () => vtkActor2D.newInstance({ visibility: false }),
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

  // --- events --- //

  const { dataChangedEvent, dataAvailableEvent } =
    useDataEvents<vtkPolyData>(props);

  // trigger data available event
  useEffect(() => {
    if (dataAvailable) {
      dataAvailableEvent.current.dispatchEvent(getInputData());
    }
  }, [dataAvailable, dataAvailableEvent, getInputData]);

  // --- //

  const renderer = useRendererContext();

  useEffect(() => {
    if (modifiedRef.current) {
      renderer.requestRender();
      resetModified();
    }
  });

  const representation = useMemo<IRepresentation>(
    () => ({
      dataChanged: () => {
        dataChangedEvent.current.dispatchEvent(getInputData());
        renderer.requestRender();
      },
      dataAvailable: (available = true) => {
        setDataAvailable(available);
        representation.dataChanged();
      },
      getActor,
      getMapper,
      onDataAvailable: (cb) => dataAvailableEvent.current.addEventListener(cb),
      onDataChanged: (cb) => dataChangedEvent.current.addEventListener(cb),
    }),
    [
      renderer,
      getActor,
      getMapper,
      getInputData,
      dataAvailableEvent,
      dataChangedEvent,
    ]
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
    <RepresentationContext.Provider value={representation}>
      <DownstreamContext.Provider value={downstream}>
        {props.children}
      </DownstreamContext.Provider>
    </RepresentationContext.Provider>
  );
});
