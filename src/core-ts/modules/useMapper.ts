import vtkAbstractMapper from '@kitware/vtk.js/Rendering/Core/AbstractMapper';
import { compareShallowObject } from '../../utils-ts/comparators';
import deletionRegistry from '../../utils-ts/DeletionRegistry';
import { BooleanAccumulator } from '../../utils-ts/useBooleanAccumulator';
import useComparableEffect from '../../utils-ts/useComparableEffect';
import useGetterRef from '../../utils-ts/useGetterRef';
import useUnmount from '../../utils-ts/useUnmount';

/**
 * Returns a mapper getter.
 */
export default function useMapper<M extends vtkAbstractMapper, I>(
  constructor: () => M,
  props: I | undefined,
  trackModified: BooleanAccumulator
) {
  const [mapperRef, getMapper] = useGetterRef(() => {
    const m = constructor();
    deletionRegistry.register(m, () => m.delete());
    return m;
  });

  useComparableEffect(
    () => {
      if (!props) return;
      trackModified(getMapper().set(props));
    },
    [props],
    ([cur], [prev]) => compareShallowObject(cur, prev)
  );

  useUnmount(() => {
    if (mapperRef.current) {
      deletionRegistry.markForDeletion(mapperRef.current);
      mapperRef.current = null;
    }
  });

  return getMapper;
}
