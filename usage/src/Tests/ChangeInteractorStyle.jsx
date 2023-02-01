import { Algorithm, GeometryRepresentation, View } from 'react-vtk-js';

import vtkConeSource from '@kitware/vtk.js/Filters/Sources/ConeSource';
import vtkInteractorStyleTrackballCamera from '@kitware/vtk.js/Interaction/Style/InteractorStyleTrackballCamera';

import { useRef, useState } from 'react';

function Example() {
  const view = useRef(null);

  const [disabled, setDisabled] = useState(false);

  const settrackball = () => {
    view.current.setInteractorStyle(
      vtkInteractorStyleTrackballCamera.newInstance()
    );
    setDisabled(true);
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <View ref={view}>
        <GeometryRepresentation>
          <Algorithm vtkClass={vtkConeSource} />
        </GeometryRepresentation>
      </View>
      <div style={{ position: 'absolute', top: 0 }}>
        <button disabled={disabled} onClick={settrackball}>
          Switch to using the trackball camera controls
        </button>
      </div>
    </div>
  );
}

export default Example;
