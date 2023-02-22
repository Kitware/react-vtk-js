import vtkColorTransferFunction from '@kitware/vtk.js/Rendering/Core/ColorTransferFunction';
import vtkColorMaps from '@kitware/vtk.js/Rendering/Core/ColorTransferFunction/ColorMaps';
import { Vector2 } from '@kitware/vtk.js/types';
import { compareVector2 } from '../../utils/comparators';
import deletionRegistry from '../../utils/DeletionRegistry';
import { BooleanAccumulator } from '../../utils/useBooleanAccumulator';
import useComparableEffect from '../../utils/useComparableEffect';
import useGetterRef from '../../utils/useGetterRef';
import useUnmount from '../../utils/useUnmount';

export default function useColorTransferFunction(
  presetName: string,
  range: Vector2,
  trackModified: BooleanAccumulator
) {
  const [lutRef, getLUT] = useGetterRef(() => {
    const func = vtkColorTransferFunction.newInstance();
    deletionRegistry.register(func, () => func.delete());
    return func;
  });

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
      deletionRegistry.markForDeletion(lutRef.current);
      lutRef.current = null;
    }
  });

  return getLUT;
}
