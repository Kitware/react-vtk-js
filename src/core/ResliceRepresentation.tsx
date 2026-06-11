import vtkImageResliceMapper, {
  vtkImageResliceMapper as IvtkImageResliceMapper,
} from '@kitware/vtk.js/Rendering/Core/ImageResliceMapper';
import { SlabTypes } from '@kitware/vtk.js/Rendering/Core/ImageResliceMapper/Constants';
import { forwardRef, PropsWithChildren, useRef } from 'react';
import useComparableEffect from '../utils/useComparableEffect';
import SliceRepresentation, {
  SliceRepresentationProps,
} from './SliceRepresentation';

export interface ResliceRepresentationProps extends SliceRepresentationProps {
  /**
   * Slice plane
   */
  slicePlane?: any;

  /**
   * Optional slice polydata
   */
  slicePolyData?: any;

  /**
   * Slab type
   */
  slabType?: number;

  /**
   * Slab thickness
   */
  slabThickness?: number;

  /**
   * Slab trapezoid integration
   */
  slabTrapezoidIntegration?: boolean;
}

export default forwardRef(function ResliceRepresentation(
  props: PropsWithChildren<ResliceRepresentationProps>,
  fwdRef
) {
  const {
    slicePlane,
    slicePolyData,
    slabType = SlabTypes.MEAN,
    slabThickness = 0.0,
    slabTrapezoidIntegration = false,
    mapperInstance: providedMapper,
    ...sliceProps
  } = props;

  // Create reslice mapper once and reuse it across renders.
  const internalMapperRef = useRef<IvtkImageResliceMapper | null>(null);
  if (!internalMapperRef.current) {
    internalMapperRef.current = vtkImageResliceMapper.newInstance();
  }
  const mapperInstance = (providedMapper ||
    internalMapperRef.current) as IvtkImageResliceMapper;

  // Handle reslice-specific mapper updates
  useComparableEffect(
    () => {
      if (!providedMapper && mapperInstance) {
        trackModified(true);
        mapperInstance.setSlicePlane(slicePlane);
      }
    },
    [slicePlane, providedMapper],
    ([cur, prevMapped], [prev, prevProvided]) =>
      cur === prev && prevMapped === prevProvided
  );

  useComparableEffect(
    () => {
      if (!providedMapper && mapperInstance) {
        trackModified(true);
        mapperInstance.setSlicePolyData(slicePolyData);
      }
    },
    [slicePolyData, providedMapper],
    ([cur, prevMapped], [prev, prevProvided]) =>
      cur === prev && prevMapped === prevProvided
  );

  useComparableEffect(
    () => {
      if (!providedMapper && mapperInstance) {
        trackModified(true);
        if (
          slabType != null &&
          slabType >= SlabTypes.MIN &&
          slabType <= SlabTypes.SUM
        ) {
          mapperInstance.setSlabType(slabType);
        }
      }
    },
    [slabType, providedMapper],
    ([cur, prevMapped], [prev, prevProvided]) =>
      cur === prev && prevMapped === prevProvided
  );

  useComparableEffect(
    () => {
      if (!providedMapper && mapperInstance) {
        trackModified(true);
        if (slabThickness != null) {
          mapperInstance.setSlabThickness(slabThickness);
        }
      }
    },
    [slabThickness, providedMapper],
    ([cur, prevMapped], [prev, prevProvided]) =>
      cur === prev && prevMapped === prevProvided
  );

  useComparableEffect(
    () => {
      if (!providedMapper && mapperInstance) {
        trackModified(true);
        if (slabTrapezoidIntegration != null) {
          mapperInstance.setSlabTrapezoidIntegration(
            slabTrapezoidIntegration ? 1 : 0
          );
        }
      }
    },
    [slabTrapezoidIntegration, providedMapper],
    ([cur, prevMapped], [prev, prevProvided]) =>
      cur === prev && prevMapped === prevProvided
  );

  function trackModified(changed: boolean) {
    if (changed) {
      // Trigger render
    }
  }

  return (
    <SliceRepresentation
      {...sliceProps}
      mapperInstance={mapperInstance as any}
      ref={fwdRef}
    >
      {props.children}
    </SliceRepresentation>
  );
});
