import vtkCoordinate, {
  ICoordinateInitialValues,
} from '@kitware/vtk.js/Rendering/Core/Coordinate';
import { compareShallowObject } from '../../utils/comparators';
import deletionRegistry from '../../utils/DeletionRegistry';
import { BooleanAccumulator } from '../../utils/useBooleanAccumulator';
import useComparableEffect from '../../utils/useComparableEffect';
import useGetterRef from '../../utils/useGetterRef';
import useUnmount from '../../utils/useUnmount';

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
