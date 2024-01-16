import vtkPolyData from '@kitware/vtk.js/Common/DataModel/PolyData';
import vtkActor, {
  IActorInitialValues,
} from '@kitware/vtk.js/Rendering/Core/Actor';
import vtkMapper, {
  IMapperInitialValues,
} from '@kitware/vtk.js/Rendering/Core/Mapper';
import { IPropertyInitialValues } from '@kitware/vtk.js/Rendering/Core/Property';
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
import useDataEvents from './modules/useDataEvents';
import useMapper from './modules/useMapper';
import useProp from './modules/useProp';

export interface GeometryRepresentationProps extends PropsWithChildren {
  /**
   * The ID used to identify this component.
   */
  id?: string;

  /**
   * Properties to set to the actor
   */
  actor?: IActorInitialValues;

  /**
   * Properties to set to the actor
   */
  mapper?: IMapperInitialValues;

  /**
   * Properties to set to the actor.property
   */
  property?: IPropertyInitialValues;

  /**
   * Preset name for the lookup table color map
   */
  colorMapPreset?: string;

  /**
   * Data range use for the colorMap
   */
  colorDataRange?: [number, number];

  /**
   * Show/Hide Cube Axes for the given representation
   */
  showCubeAxes?: boolean;

  /**
   * Configure cube Axes style by overriding the set of properties defined
   * https://github.com/Kitware/vtk-js/blob/HEAD/Sources/Rendering/Core/CubeAxesActor/index.js#L703-L719
   *
   * TODO fix type
   */
  cubeAxesStyle?: Record<string, unknown>;

  /**
   * Show hide scalar bar for that representation
   */
  showScalarBar?: boolean;

  /**
   * Use given string as title for scalar bar. By default it is empty (no title).
   */
  scalarBarTitle?: boolean;

  /**
   * Configure scalar bar style by overriding the set of properties defined
   * https://github.com/Kitware/vtk-js/blob/master/Sources/Rendering/Core/ScalarBarActor/index.js#L776-L796
   *
   * TODO fix type
   */
  scalarBarStyle?: Record<string, unknown>;

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
};

export default forwardRef(function GeometryRepresentation(
  props: GeometryRepresentationProps,
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

  // --- mapper --- //

  const getMapper = useMapper<vtkMapper, IMapperInitialValues>(
    () =>
      vtkMapper.newInstance({
        lookupTable: getLookupTable(),
        useLookupTableScalarRange: true,
      } as IMapperInitialValues),
    props.mapper,
    trackModified
  );

  useEffect(() => {
    getMapper().setLookupTable(getLookupTable());
  }, [getMapper, getLookupTable]);

  const getInputData = useCallback(
    () => getMapper().getInputData(),
    [getMapper]
  );

  // --- actor --- //

  const actorProps = {
    ...props.actor,
    visibility: dataAvailable && (props.actor?.visibility ?? true),
  };
  const getActor = useProp<vtkActor, IActorInitialValues>({
    constructor: () => vtkActor.newInstance({ visibility: false }),
    id: props.id,
    props: actorProps,
    trackModified,
  });

  useEffect(() => {
    getActor().setMapper(getMapper());
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
      dataAvailable: () => {
        setDataAvailable(true);
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
