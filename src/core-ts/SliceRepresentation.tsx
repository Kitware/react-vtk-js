import vtkImageMapper, {
  IImageMapperInitialValues,
} from '@kitware/vtk.js/Rendering/Core/ImageMapper';
import { IImagePropertyInitialValues } from '@kitware/vtk.js/Rendering/Core/ImageProperty';
import vtkImageSlice, {
  IImageSliceInitialValues,
} from '@kitware/vtk.js/Rendering/Core/ImageSlice';
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
import {
  DownstreamContext,
  RepresentationContext,
  useRendererContext,
} from './contexts';
import useColorTransferFunction from './modules/useColorTransferFunction';
import useMapper from './modules/useMapper';
import useProp from './modules/useProp';

interface Props extends PropsWithChildren {
  /**
   * The ID used to identify this component.
   */
  id?: string;

  /**
   * Properties to set to the mapper
   */
  mapper?: IImageMapperInitialValues;

  /**
   * Properties to set to the slice/actor
   */
  actor?: IImageSliceInitialValues;

  /**
   * Properties to set to the volume.property
   */
  property?: IImagePropertyInitialValues;

  /**
   * Preset name for the lookup table color map
   */
  colorMapPreset?: string;

  /**
   * Data range use for the colorMap
   */
  colorDataRange?: 'auto' | Vector2;

  /**
   * index of the slice along i
   */
  iSlice?: number;

  /**
   * index of the slice along j
   */
  jSlice?: number;

  /**
   * index of the slice along k
   */
  kSlice?: number;

  /**
   * index of the slice along x
   */
  xSlice?: number;

  /**
   * index of the slice along y
   */
  ySlice?: number;

  /**
   * index of the slice along z
   */
  zSlice?: number;
}

const DefaultProps = {
  colorMapPreset: 'Grayscale',
  colorDataRange: 'auto' as const,
};

export default forwardRef(function SliceRepresentation(props: Props, fwdRef) {
  const [modifiedRef, trackModified, resetModified] = useBooleanAccumulator();
  const [dataAvailable, setDataAvailable] = useState(false);

  const rangeFromProps = props.colorDataRange ?? DefaultProps.colorDataRange;
  const colorDataRange =
    rangeFromProps === 'auto' ? ([0, 1] as Vector2) : rangeFromProps;

  // --- LUT --- //

  const getLookupTable = useColorTransferFunction(
    props.colorMapPreset ?? DefaultProps.colorMapPreset,
    colorDataRange,
    trackModified
  );

  // --- PWF --- //

  // --- mapper --- //

  const getMapper = useMapper(
    () => vtkImageMapper.newInstance(),
    props.mapper,
    trackModified
  );

  // --- actor --- //

  const actorProps = {
    ...props.actor,
    visibility: dataAvailable && (props.actor?.visibility ?? true),
  };
  const getActor = useProp({
    constructor: () => vtkImageSlice.newInstance(),
    id: props.id,
    props: actorProps,
    trackModified,
  });

  useEffect(() => {
    getActor().setMapper(getMapper());
  }, [getActor, getMapper]);

  useEffect(() => {
    getActor().getProperty().setRGBTransferFunction(0, getLookupTable());
    getActor().getProperty().setInterpolationTypeToLinear();
  }, [getActor, getLookupTable]);

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

  // --- Slice changes --- //

  const { iSlice, jSlice, kSlice, xSlice, ySlice, zSlice } = props;

  useEffect(() => {
    if (iSlice != null) trackModified(getMapper().setISlice(iSlice));
  }, [iSlice, getMapper, trackModified]);

  useEffect(() => {
    if (jSlice != null) trackModified(getMapper().setISlice(jSlice));
  }, [jSlice, getMapper, trackModified]);

  useEffect(() => {
    if (kSlice != null) trackModified(getMapper().setISlice(kSlice));
  }, [kSlice, getMapper, trackModified]);

  useEffect(() => {
    if (xSlice != null) trackModified(getMapper().setISlice(xSlice));
  }, [xSlice, getMapper, trackModified]);

  useEffect(() => {
    if (ySlice != null) trackModified(getMapper().setISlice(ySlice));
  }, [ySlice, getMapper, trackModified]);

  useEffect(() => {
    if (zSlice != null) trackModified(getMapper().setISlice(zSlice));
  }, [zSlice, getMapper, trackModified]);

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
        renderer.requestRender();
      },
      dataAvailable: () => {
        setDataAvailable(true);
        representation.dataChanged();
      },
    }),
    [renderer]
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
