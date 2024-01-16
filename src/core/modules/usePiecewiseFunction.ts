import vtkPiecewiseFunction from '@kitware/vtk.js/Common/DataModel/PiecewiseFunction';
import { Vector2 } from '@kitware/vtk.js/types';
import { compareVector2 } from '../../utils/comparators';
import deletionRegistry from '../../utils/DeletionRegistry';
import { BooleanAccumulator } from '../../utils/useBooleanAccumulator';
import useComparableEffect from '../../utils/useComparableEffect';
import useGetterRef from '../../utils/useGetterRef';
import useUnmount from '../../utils/useUnmount';

export default function usePiecewiseFunction(
  range: Vector2,
  trackModified: BooleanAccumulator
) {
  const [pwfRef, getPWF] = useGetterRef(() => {
    const func = vtkPiecewiseFunction.newInstance();
    deletionRegistry.register(func, () => func.delete());
    return func;
  });

  useComparableEffect(
    () => {
      if (!range) return;
      const pwf = getPWF();
      pwf.setNodes([
        { x: range[0], y: 0, midpoint: 0.5, sharpness: 0 },
        { x: range[1], y: 1, midpoint: 0.5, sharpness: 0 },
      ]);
      trackModified(true);
    },
    [range] as const,
    ([curRange], [oldRange]) => compareVector2(curRange, oldRange)
  );

  useUnmount(() => {
    if (pwfRef.current) {
      deletionRegistry.markForDeletion(pwfRef.current);
      pwfRef.current = null;
    }
  });

  return getPWF;
}
