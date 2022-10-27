import vtkRenderer from '@kitware/vtk.js/Rendering/Core/Renderer';
import { Vector3, Vector4 } from '@kitware/vtk.js/types';
import { useEffect } from 'react';
import useGetterRef from '../../utils-ts/useGetterRef';
import useUnmount from '../../utils-ts/useUnmount';

export default function useRenderer(background: Vector3 | Vector4) {
  const [renRef, getRenderer] = useGetterRef(() => vtkRenderer.newInstance());

  useEffect(() => {
    const renderer = getRenderer();
    renderer.setBackground(background);
  }, [background, getRenderer]);

  useUnmount(() => {
    if (renRef.current) {
      renRef.current.delete();
      renRef.current = null;
    }
  });

  return getRenderer;
}
