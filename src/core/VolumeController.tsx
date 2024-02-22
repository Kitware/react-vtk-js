import vtkImageData from '@kitware/vtk.js/Common/DataModel/ImageData';
import vtkVolumeController from '@kitware/vtk.js/Interaction/UI/VolumeController';
import { useCallback, useContext, useEffect, useRef } from 'react';
import { Contexts } from '..';
import deletionRegistry from '../utils/DeletionRegistry';
import useGetterRef from '../utils/useGetterRef';
import useUnmount from '../utils/useUnmount';
import { useRepresentationContext } from './contexts';

export interface VolumeControllerProps {
  /**
   * The size of the widget (width, height)
   */
  size?: [number, number];

  /**
   * Flag for rescaling the colormap.
   */
  rescaleColorMap?: boolean;
}

const DefaultProps = {
  size: [400, 150],
  rescaleColorMap: true,
};

export default function VolumeController(props: VolumeControllerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [controllerRef, getController] = useGetterRef(() => {
    const ctrlr = vtkVolumeController.newInstance();
    deletionRegistry.markForDeletion(() => ctrlr.delete());
    return ctrlr;
  });

  const view = useContext(Contexts.ViewContext);
  if (!view) throw new Error('Need view context');

  const volumeRep = useRepresentationContext();

  const updateWidget = useCallback(() => {
    const volume = volumeRep.getMapper()?.getInputData() as
      | vtkImageData
      | undefined;
    if (!volume) return;

    const widget = getController().getWidget();
    const dataArray =
      volume.getPointData().getScalars() ||
      volume.getPointData().getArrays()[0];
    widget.setDataArray(dataArray.getData());
  }, [volumeRep, getController]);

  // --- set actor --- //

  const updateActor = useCallback(() => {
    // set the actor prior to setting props, since
    // setRescaleColorMap depends on the actor
    getController().setActor(volumeRep.getActor());
  }, [getController, volumeRep]);

  useEffect(() => {
    return volumeRep.onDataAvailable(updateActor);
  }, [volumeRep, updateActor]);

  // --- prop handling --- //

  const { size = DefaultProps.size } = props;

  useEffect(() => {
    if (!size) return;
    getController().setSize(size[0], size[1]);
  }, [size, getController]);

  const { rescaleColorMap = DefaultProps.rescaleColorMap } = props;

  useEffect(() => {
    if (rescaleColorMap === undefined || !getController().getActor()) return;

    getController().setRescaleColorMap(rescaleColorMap);
  }, [rescaleColorMap, getController]);

  // --- initialization --- //

  const init = useCallback(
    (volume?: vtkImageData) => {
      const container = containerRef.current;
      const rw = view.getRenderWindow()?.get();

      if (!volume || !rw) return;

      const controller = getController();

      controller.setContainer(container);
      controller.setupContent(rw, volumeRep.getActor(), false);
      controller.render();
      view.requestRender();

      const sub = volume.onModified(() => {
        updateWidget();
      });

      return () => {
        controller.setContainer(null);
        sub.unsubscribe();
      };
    },
    [view, volumeRep, updateWidget, getController]
  );

  useEffect(() => {
    return volumeRep.onDataAvailable(init);
  }, [volumeRep, init]);

  useUnmount(() => {
    if (controllerRef.current) {
      deletionRegistry.markForDeletion(controllerRef.current);
      controllerRef.current = null;
    }
  });

  return <div ref={containerRef} />;
}
