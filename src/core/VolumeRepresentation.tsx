import vtkDataArray from '@kitware/vtk.js/Common/Core/DataArray';
import vtkImageData from '@kitware/vtk.js/Common/DataModel/ImageData';
import vtkVolume, {
  IVolumeInitialValues,
} from '@kitware/vtk.js/Rendering/Core/Volume';
import vtkVolumeMapper, {
  IVolumeMapperInitialValues,
} from '@kitware/vtk.js/Rendering/Core/VolumeMapper';
import { IVolumePropertyInitialValues } from '@kitware/vtk.js/Rendering/Core/VolumeProperty';
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
import useDataRange from './modules/useDataRange';
import useMapper from './modules/useMapper';
import usePiecewiseFunction from './modules/usePiecewiseFunction';
import useProp from './modules/useProp';

export interface VolumeRepresentationProps extends PropsWithChildren {
  /**
   * The ID used to identify this component.
   */
  id?: string;

  /**
   * Properties to set to the mapper
   */
  mapper?: IVolumeMapperInitialValues;

  /**
   * An opational mapper instanc
   */
  mapperInstance?: vtkVolumeMapper;

  /**
   * Properties to set to the volume actor
   */
  actor?: IVolumeInitialValues;

  /**
   * Properties to set to the volume.property
   */
  property?: IVolumePropertyInitialValues;

  /**
   * Preset name for the lookup table color map
   */
  colorMapPreset?: string;

  /**
   * Data range use for the colorMap
   */
  colorDataRange?: 'auto' | Vector2;

  /**
   * Event callback for when data is made available.
   *
   * By the time this callback is invoked, you can be sure that:
   * - the mapper has the input data
   * - the actor is visible (unless explicitly marked as not visible)
   * - initial properties are set
   */
  onDataAvailable?: (obj?: vtkImageData) => void;

  /**
   * Event callback for when data has changed.
   *
   * When called:
   * - Mapper has input data
   */
  onDataChanged?: (obj?: vtkImageData) => void;
}

const DefaultProps = {
  colorMapPreset: 'erdc_rainbow_bright',
  colorDataRange: 'auto' as const,
};

export default forwardRef(function VolumeRepresentation(
  props: VolumeRepresentationProps,
  fwdRef
) {
  const [modifiedRef, trackModified, resetModified] = useBooleanAccumulator();
  const [dataAvailable, setDataAvailable] = useState(false);

  // --- mapper --- //

  const getInternalMapper = useMapper(
    () => vtkVolumeMapper.newInstance(),
    props.mapper,
    trackModified
  );

  const { mapperInstance } = props;
  const getMapper = useCallback(() => {
    if (mapperInstance) {
      return mapperInstance;
    }
    return getInternalMapper();
  }, [mapperInstance, getInternalMapper]);

  const getInputData = useCallback(
    () => getMapper().getInputData(),
    [getMapper]
  );

  // --- data range --- //

  const getDataArray = useCallback(
    () =>
      getMapper()?.getInputData()?.getPointData().getScalars() as
        | vtkDataArray
        | undefined,
    [getMapper]
  );

  const { dataRange, updateDataRange } = useDataRange(getDataArray);

  const rangeFromProps = props.colorDataRange ?? DefaultProps.colorDataRange;
  const colorDataRange = rangeFromProps === 'auto' ? dataRange : rangeFromProps;

  // --- LUT --- //

  const getLookupTable = useColorTransferFunction(
    props.colorMapPreset ?? DefaultProps.colorMapPreset,
    colorDataRange,
    trackModified
  );

  // --- PWF --- //

  const getPiecewiseFunction = usePiecewiseFunction(
    colorDataRange,
    trackModified
  );

  // --- actor --- //

  const actorProps = {
    ...props.actor,
    visibility: dataAvailable && (props.actor?.visibility ?? true),
  };
  const getActor = useProp({
    constructor: () => vtkVolume.newInstance(),
    id: props.id,
    props: actorProps,
    trackModified,
  });

  useEffect(() => {
    getActor().setMapper(getMapper());
  }, [getActor, getMapper]);

  useEffect(() => {
    getActor().getProperty().setRGBTransferFunction(0, getLookupTable());
    getActor().getProperty().setScalarOpacity(0, getPiecewiseFunction());
    getActor().getProperty().setInterpolationTypeToLinear();
  }, [getActor, getLookupTable, getPiecewiseFunction]);

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
    useDataEvents<vtkImageData>(props);

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
        updateDataRange();
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
      updateDataRange,
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
