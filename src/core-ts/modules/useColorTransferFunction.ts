import vtkColorTransferFunction from '@kitware/vtk.js/Rendering/Core/ColorTransferFunction';
import vtkColorMaps from '@kitware/vtk.js/Rendering/Core/ColorTransferFunction/ColorMaps';
import { Vector2 } from '@kitware/vtk.js/types';
import { compareVector2 } from '../../utils-ts/comparators';
import { BooleanAccumulator } from '../../utils-ts/useBooleanAccumulator';
import useComparableEffect from '../../utils-ts/useComparableEffect';
import useGetterRef from '../../utils-ts/useGetterRef';
import useUnmount from '../../utils-ts/useUnmount';

export default function useColorTransferFunction(
  presetName: string,
  range: Vector2,
  trackModified: BooleanAccumulator
) {
  const [lutRef, getLUT] = useGetterRef(() =>
    vtkColorTransferFunction.newInstance()
  );

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
