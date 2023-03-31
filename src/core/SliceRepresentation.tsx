import AbstractImageMapper, {
  vtkAbstractImageMapper,
} from '@kitware/vtk.js/Rendering/Core/AbstractImageMapper';
import vtkImageArrayMapper from '@kitware/vtk.js/Rendering/Core/ImageArrayMapper';
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
import useMapper from './modules/useMapper';
import useProp from './modules/useProp';

export interface SliceRepresentationProps extends PropsWithChildren {
  /**
   * The ID used to identify this component.
   */
  id?: string;

  /**
   * Properties to set to the mapper
   */
  mapper?: IImageMapperInitialValues;

  /**
   * An opational mapper instanc
   */
  mapperInstance?: AbstractImageMapper;

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

function isVtkImageMapper(
  mapper: vtkAbstractImageMapper
): mapper is vtkImageMapper {
  return mapper.isA('vtkImageMapper');
}

function isVtkImageArrayMapper(
  mapper: vtkAbstractImageMapper
): mapper is vtkImageArrayMapper {
  return mapper.isA('vtkImageArrayMapper');
}

export default forwardRef(function SliceRepresentation(
  props: SliceRepresentationProps,
  fwdRef
) {
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

  const getInternalMapper = useMapper(
    () => vtkImageMapper.newInstance(),
    props.mapper,
    trackModified
  );

  const { mapperInstance } = props;
  const getMapper = useCallback<() => vtkAbstractImageMapper>(() => {
    if (mapperInstance) {
      return mapperInstance;
    }
    return getInternalMapper();
  }, [mapperInstance, getInternalMapper]);

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
    // workaround for vtkImageSlice.setMapper only taking vtkImageMapper
    getActor().setMapper(getMapper() as vtkImageMapper);
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

  // --- vtkImageMapper setSlice --- //

  useEffect(() => {
    const mapper = getMapper();
    if (isVtkImageMapper(mapper) && iSlice != null)
      trackModified(mapper.setISlice(iSlice));
  }, [iSlice, getMapper, trackModified]);

  useEffect(() => {
    const mapper = getMapper();
    if (isVtkImageMapper(mapper) && jSlice != null)
      trackModified(mapper.setJSlice(jSlice));
  }, [jSlice, getMapper, trackModified]);

  useEffect(() => {
    const mapper = getMapper();
    if (isVtkImageMapper(mapper) && kSlice != null)
      trackModified(mapper.setKSlice(kSlice));
  }, [kSlice, getMapper, trackModified]);

  useEffect(() => {
    const mapper = getMapper();
    if (isVtkImageMapper(mapper) && xSlice != null)
      trackModified(mapper.setXSlice(xSlice));
  }, [xSlice, getMapper, trackModified]);

  useEffect(() => {
    const mapper = getMapper();
    if (isVtkImageMapper(mapper) && ySlice != null)
      trackModified(mapper.setYSlice(ySlice));
  }, [ySlice, getMapper, trackModified]);

  useEffect(() => {
    const mapper = getMapper();
    if (isVtkImageMapper(mapper) && zSlice != null)
      trackModified(mapper.setZSlice(zSlice));
  }, [zSlice, getMapper, trackModified]);

  // --- vtkImageArrayMapper setSlice --- //

  useEffect(() => {
    const mapper = getMapper();
    if (
      isVtkImageArrayMapper(mapper) &&
      kSlice != null &&
      kSlice !== mapper.getSlice()
    ) {
      trackModified(true);
      mapper.setSlice(kSlice);
    }
  }, [kSlice, getMapper, trackModified]);

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
      getActor,
      getMapper,
    }),
    [renderer, getActor, getMapper]
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
