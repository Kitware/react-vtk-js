import vtkProp, {
  IPropInitialValues,
} from '@kitware/vtk.js/Rendering/Core/Prop';
import { useEffect } from 'react';
import { IView } from '../../types';
import { compareShallowObject } from '../../utils-ts/comparators';
import { BooleanAccumulator } from '../../utils-ts/useBooleanAccumulator';
import useComparableEffect from '../../utils-ts/useComparableEffect';
import useGetterRef from '../../utils-ts/useGetterRef';
import { useOrderedUnmountEffect } from '../../utils-ts/useOrderedUnmountEffect';
import useUnmount from '../../utils-ts/useUnmount';

/**
 * Params to useProp.
 */
type Params<T, A> = {
  constructor: () => T;
  view: IView;
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
>({ constructor, view, id, props, trackModified }: Params<T, A>) {
  const [actorRef, getActor] = useGetterRef(constructor);

  useEffect(() => {
    getActor().set({ representationID: id }, true /* noWarning */);
  }, [id, getActor]);

  // add to renderer
  useOrderedUnmountEffect(() => {
    const actor = getActor();
    const renderer = view.getRenderer();
    renderer.addActor(actor);
    return () => {
      renderer.removeActor(actor);
    };
  }, [view, getActor]);

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
      actorRef.current.delete();
      actorRef.current = null;
    }
  });

  return getActor;
}
