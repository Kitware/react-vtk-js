import vtkActor, {
  IActorInitialValues,
} from '@kitware/vtk.js/Rendering/Core/Actor';
import vtkMapper, {
  IMapperInitialValues,
} from '@kitware/vtk.js/Rendering/Core/Mapper';
import { IPropertyInitialValues } from '@kitware/vtk.js/Rendering/Core/Property';
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
import { useOrderedUnmountContext } from '../utils-ts/useOrderedUnmountEffect';
import { DownstreamContext, RepresentationContext, useView } from './contexts';
import useColorTransferFunction from './modules/useColorTransferFunction';
import useMapper from './modules/useMapper';
import useProp from './modules/useProp';

interface Props extends PropsWithChildren {
  /**
   * The ID used to identify this component.
   */
  id?: string;

  /**
   * Properties to set to the actor
   */
  actor?: IActorInitialValues;

  /**
   * Properties to set to the actor
   */
  mapper?: IMapperInitialValues;

  /**
   * Properties to set to the actor.property
   */
  property?: IPropertyInitialValues;

  /**
   * Preset name for the lookup table color map
   */
  colorMapPreset?: string;

  /**
   * Data range use for the colorMap
   */
  colorDataRange?: [number, number];

  /**
   * Show/Hide Cube Axes for the given representation
   */
  showCubeAxes?: boolean;

  /**
   * Configure cube Axes style by overriding the set of properties defined
   * https://github.com/Kitware/vtk-js/blob/HEAD/Sources/Rendering/Core/CubeAxesActor/index.js#L703-L719
   *
   * TODO fix type
   */
  cubeAxesStyle?: Record<string, unknown>;

  /**
   * Show hide scalar bar for that representation
   */
  showScalarBar?: boolean;

  /**
   * Use given string as title for scalar bar. By default it is empty (no title).
   */
  scalarBarTitle?: boolean;

  /**
   * Configure scalar bar style by overriding the set of properties defined
   * https://github.com/Kitware/vtk-js/blob/master/Sources/Rendering/Core/ScalarBarActor/index.js#L776-L796
   *
   * TODO fix type
   */
  scalarBarStyle?: Record<string, unknown>;
}

const DefaultProps = {
  colorMapPreset: 'erdc_rainbow_bright',
  colorDataRange: [0, 1] as Vector2,
};

/*
function useScalarBarActor(
  view: IView,
  visible: boolean,
  lookupTable: Nullable<vtkColorTransferFunction>
) {
  const scalarBarActor = useRef<Nullable<vtkScalarBarActor>>(null);

  useEffect(() => {
    if (!lookupTable) return;

    scalarBarActor.current = vtkScalarBarActor.newInstance();
    // TODO fixable?
    scalarBarActor.current.setScalarsToColors(
      lookupTable as unknown as vtkScalarsToColors
    );
    scalarBarActor.current.setVisibility(false);

    view.getRenderer().addActor(scalarBarActor.current);

    return () => {
      if (scalarBarActor.current) {
        view.getRenderer().removeActor(scalarBarActor.current);
        scalarBarActor.current.delete();
        scalarBarActor.current = null;
      }
    };
  }, [view, visible, lookupTable]);

  return scalarBarActor.current;
}

/*
function useCubeAxes(
  view: View,
  visible: boolean,
  mapper: Nullable<vtkMapper>
) {
  const axes = useRef<Nullable<vtkCubeAxesActor>>(null);

  useEffect(() => {
    axes.current = vtkCubeAxesActor.newInstance({
      visibility: false,
      dataBounds: [-1, 1, -1, 1, -1, 1],
    });

    axes.current
      .getActors()
      .forEach(({ setVisibility }) => setVisibility(false));

    view.getRenderer().addActor(axes.current);

    return () => {
      if (axes.current) {
        view.getRenderer().removeActor(axes.current);
        axes.current.delete();
        axes.current = null;
      }
    };
  }, []);

  const updateCubeAxes = useCallback(() => {
    if (!axes.current || !mapper) return;

    if (mapper.getInputData()) {
      const bounds = mapper.getInputData().getBounds();
      if (bounds[0] < bounds[1]) {
        axes.current.setDataBounds(bounds);
        view.requestRender();
      }
    }
  }, [mapper, view]);

  useVTKModifiedEffect(mapper, updateCubeAxes);
  useVTKModifiedEffect(mapper?.getInputData(), updateCubeAxes);

  return axes.current;
}
*/

export default forwardRef(function GeometryRepresentation(
  props: Props,
  fwdRef
) {
  const OrderedUnmountContext = useOrderedUnmountContext();

  /*
  const {
    // showCubeAxes = false,
    // showScalarBar = false,
    // scalarBarTitle = '',
  } = props;
  */
  const view = useView();
  const [modifiedRef, trackModified, resetModified] = useBooleanAccumulator();
  const [dataAvailable, setDataAvailable] = useState(false);

  // --- LUT --- //

  const getLookupTable = useColorTransferFunction(
    props.colorMapPreset ?? DefaultProps.colorMapPreset,
    props.colorDataRange ?? DefaultProps.colorDataRange,
    trackModified
  );

  // --- mapper --- //

  const getMapper = useMapper<vtkMapper, IMapperInitialValues>(
    () =>
      vtkMapper.newInstance({
        lookupTable: getLookupTable(),
        useLookupTableScalarRange: true,
      } as IMapperInitialValues),
    props.mapper,
    trackModified
  );

  useEffect(() => {
    getMapper().setLookupTable(getLookupTable());
  }, [getMapper, getLookupTable]);

  // --- actor --- //

  const actorProps = {
    ...props.actor,
    visibility: dataAvailable && (props.actor?.visibility ?? true),
  };
  const getActor = useProp<vtkActor, IActorInitialValues>({
    constructor: () => vtkActor.newInstance({ visibility: false }),
    view,
    id: props.id,
    props: actorProps,
    trackModified,
  });

  useEffect(() => {
    getActor().setMapper(getMapper());
  }, [getActor, getMapper]);

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

  //   const scalarBarActor = useScalarBarActor(view, false, lookupTable);
  //   const cubeAxes = useCubeAxes(view, false, mapper);

  // --- //

  useEffect(() => {
    if (view && modifiedRef.current) {
      view.requestRender();
      resetModified();
    }
  });

  const representation = useMemo<IRepresentation>(
    () => ({
      dataChanged: () => {
        view.requestRender();
      },
      dataAvailable: () => {
        setDataAvailable(true);
        representation.dataChanged();
      },
    }),
    [view]
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
    <OrderedUnmountContext.Provider>
      <RepresentationContext.Provider value={representation}>
        <DownstreamContext.Provider value={downstream}>
          {props.children}
        </DownstreamContext.Provider>
      </RepresentationContext.Provider>
    </OrderedUnmountContext.Provider>
  );
});
