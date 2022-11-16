import vtkCoordinate, {
  ICoordinateInitialValues,
} from '@kitware/vtk.js/Rendering/Core/Coordinate';
import { compareShallowObject } from '../../utils-ts/comparators';
import deletionRegistry from '../../utils-ts/DeletionRegistry';
import { BooleanAccumulator } from '../../utils-ts/useBooleanAccumulator';
import useComparableEffect from '../../utils-ts/useComparableEffect';
import useGetterRef from '../../utils-ts/useGetterRef';
import useUnmount from '../../utils-ts/useUnmount';

export default function useCoordinate(
  props: ICoordinateInitialValues,
  trackModified: BooleanAccumulator
) {
  const [ref, getCoordinate] = useGetterRef(() => {
    const coord = vtkCoordinate.newInstance(props);
    deletionRegistry.register(coord, () => coord.delete());
    return coord;
  });

  useComparableEffect(
    () => {
      if (!props) return;
      getCoordinate().set(props);
      trackModified(true);
    },
    [props],
    ([cur], [prev]) => compareShallowObject(cur, prev)
  );

  useUnmount(() => {
    if (ref.current) {
      deletionRegistry.markForDeletion(ref.current);
      ref.current = null;
    }
  });

  return getCoordinate;
}
