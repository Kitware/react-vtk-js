import vtkProp, {
  IPropInitialValues,
} from '@kitware/vtk.js/Rendering/Core/Prop';
import { useEffect } from 'react';
import { compareShallowObject } from '../../utils/comparators';
import deletionRegistry from '../../utils/DeletionRegistry';
import { BooleanAccumulator } from '../../utils/useBooleanAccumulator';
import useComparableEffect from '../../utils/useComparableEffect';
import useGetterRef from '../../utils/useGetterRef';
import useUnmount from '../../utils/useUnmount';
import { useRendererContext } from '../contexts';

/**
 * Params to useProp.
 */
type Params<T, A> = {
  constructor: () => T;
  id: string | undefined;
  props: A | undefined;
  trackModified: BooleanAccumulator;
};

/**
 * Returns a vtkProp getter.
 *
 * Must be used in an ordered unmount context for
 * proper unmount order.
 */
export default function useProp<
  T extends vtkProp,
  A extends IPropInitialValues
>({ constructor, id, props, trackModified }: Params<T, A>) {
  const renderer = useRendererContext();
  const [actorRef, getActor] = useGetterRef(() => {
    const a = constructor();
    deletionRegistry.register(a, () => a.delete());
    return a;
  });

  useEffect(() => {
    getActor().set({ representationId: id }, true /* noWarning */);
  }, [id, getActor]);

  // add to renderer
  useEffect(() => {
    const actor = getActor();
    const ren = renderer.get();
    deletionRegistry.incRefCount(ren);
    ren.addActor(actor);
    return () => {
      ren.removeActor(actor);
      deletionRegistry.decRefCount(ren);
    };
  }, [renderer, getActor]);

  // set actor props
  useComparableEffect(
    () => {
      if (!props) return;
      trackModified(getActor().set(props));
    },
    [props],
    ([cur], [prev]) => compareShallowObject(cur, prev)
  );

  // cleanup on unmount
  useUnmount(() => {
    if (actorRef.current) {
      deletionRegistry.markForDeletion(actorRef.current);
      actorRef.current = null;
    }
  });

  return getActor;
}
