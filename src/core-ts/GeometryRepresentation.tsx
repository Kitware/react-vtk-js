import vtkActor, {
  IActorInitialValues,
} from '@kitware/vtk.js/Rendering/Core/Actor';
import vtkColorTransferFunction from '@kitware/vtk.js/Rendering/Core/ColorTransferFunction';
import vtkColorMaps from '@kitware/vtk.js/Rendering/Core/ColorTransferFunction/ColorMaps';
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
import { IRepresentation, IView } from '../types';
import { compareShallowObject, compareVector2 } from '../utils-ts/comparators';
import useBooleanAccumulator, {
  BooleanAccumulator,
} from '../utils-ts/useBooleanAccumulator';
import useComparableEffect from '../utils-ts/useComparableEffect';
import useGetterRef from '../utils-ts/useGetterRef';
import {
  useOrderedUnmountContext,
  useOrderedUnmountEffect,
} from '../utils-ts/useOrderedUnmountEffect';
import useUnmount from '../utils-ts/useUnmount';
import { DownstreamContext, RepresentationContext, useView } from './contexts';

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

function useLookupTable(props: Props, trackModified: BooleanAccumulator) {
  const [lutRef, getLUT] = useGetterRef(() =>
    vtkColorTransferFunction.newInstance()
  );
  const {
    colorDataRange: range = DefaultProps.colorDataRange,
    colorMapPreset: presetName = DefaultProps.colorMapPreset,
  } = props;

  useComparableEffect(
    () => {
      if (!presetName || !range) return;
      const lut = getLUT();
      const preset = vtkColorMaps.getPresetByName(presetName);
      lut.applyColorMap(preset);
      lut.setMappingRange(range[0], range[1]);
      lut.updateRange();
      trackModified(true);
    },
    [presetName, range] as const,
    ([curPreset, curRange], [oldPreset, oldRange]) =>
      curPreset === oldPreset && compareVector2(curRange, oldRange)
  );

  useUnmount(() => {
    if (lutRef.current) {
      lutRef.current.delete();
      lutRef.current = null;
    }
  });

  return getLUT;
}

function useMapper(
  getLookupTable: () => vtkColorTransferFunction,
  props: Props,
  trackModified: BooleanAccumulator
) {
  const [mapperRef, getMapper] = useGetterRef(() =>
    vtkMapper.newInstance({
      lookupTable: getLookupTable(),
      useLookupTableScalarRange: true,
    } as IMapperInitialValues)
  );
  const { mapper: mapperProps } = props;

  useEffect(() => {
    getMapper().setLookupTable(getLookupTable());
  }, [getMapper, getLookupTable]);

  useComparableEffect(
    () => {
      if (!mapperProps) return;
      trackModified(getMapper().set(mapperProps));
    },
    [mapperProps],
    ([cur], [prev]) => compareShallowObject(cur, prev)
  );

  useUnmount(() => {
    if (mapperRef.current) {
      mapperRef.current.delete();
      mapperRef.current = null;
    }
  });

  return getMapper;
}

function useActor(
  view: IView,
  getMapper: () => vtkMapper,
  dataAvailable: boolean,
  props: Props,
  trackModified: BooleanAccumulator
) {
  const [actorRef, getActor] = useGetterRef(() =>
    vtkActor.newInstance({ visibility: false })
  );
  const { id, actor: actorProps, property: propertyProps } = props;

  useEffect(() => {
    getActor().set({ representationID: id });
  }, [id, getActor]);

  useEffect(() => {
    getActor().setMapper(getMapper());
  }, [getActor, getMapper]);

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
      if (!actorProps) return;
      trackModified(getActor().set(actorProps));
    },
    [actorProps],
    ([cur], [prev]) => compareShallowObject(cur, prev)
  );

  // handle visibility as a special case
  const { visibility = true } = actorProps ?? {};
  useEffect(() => {
    const visible = dataAvailable && visibility;
    trackModified(getActor().setVisibility(visible));
  }, [dataAvailable, visibility, getActor, trackModified]);

  // set actor property props
  useComparableEffect(
    () => {
      if (!propertyProps) return;
      trackModified(getActor().getProperty().set(propertyProps));
    },
    [propertyProps],
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

  const getLookupTable = useLookupTable(props, trackModified);
  const getMapper = useMapper(getLookupTable, props, trackModified);
  const getActor = useActor(
    view,
    getMapper,
    dataAvailable,
    props,
    trackModified
  );

  //   const scalarBarActor = useScalarBarActor(view, false, lookupTable);
  //   const cubeAxes = useCubeAxes(view, false, mapper);

  useEffect(() => {
    if (view && modifiedRef.current) {
      view.requestRender();
      resetModified();
    }
  });

  const representation = useMemo<IRepresentation<vtkActor, vtkMapper>>(
    () => ({
      getActor,
      getMapper,
      dataChanged: () => {
        // TODO when algorithm updates, need to update mapper?
        getMapper().modified();
        view.requestRender();
      },
      dataAvailable: () => {
        setDataAvailable(true);
        representation.dataChanged();
      },
    }),
    [view, getActor, getMapper]
  );

  useImperativeHandle(fwdRef, () => representation);

  return (
    <OrderedUnmountContext.Provider>
      <RepresentationContext.Provider value={representation}>
        <DownstreamContext.Provider value={getMapper}>
          {props.children}
        </DownstreamContext.Provider>
      </RepresentationContext.Provider>
    </OrderedUnmountContext.Provider>
  );
});
