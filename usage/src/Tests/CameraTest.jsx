import { Algorithm, GeometryRepresentation, View } from 'react-vtk-js';

import vtkConeSource from '@kitware/vtk.js/Filters/Sources/ConeSource';
import { useRef, useState } from 'react';

function Example() {
  const [dop, setDOP] = useState([0, 0, -1]);
  const [pos, setPosition] = useState([0, 0, 5]);
  const [vup, setVUP] = useState([0, 1, 0]);

  const randomize = () => {
    const flip = Math.random() < 0.5;
    setDOP([0, 0, flip ? 1 : -1]);
    const posOffset = Math.random() * 10 + 5;
    setPosition([0, 0, flip ? -posOffset : posOffset]);
    setVUP(Math.random() < 0.5 ? [1, 0, 0] : [0, 1, 0]);
  };

  const view = useRef(null);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <View
        ref={view}
        autoResetCamera={false}
        camera={{
          focalPoint: [0, 0, 0],
          directionOfProjection: dop,
          position: pos,
          viewUp: vup,
          clippingRange: [0.01, 1000.01],
        }}
      >
        <GeometryRepresentation>
          <Algorithm vtkClass={vtkConeSource} />
        </GeometryRepresentation>
      </View>
      <div style={{ position: 'absolute', top: 0 }}>
        <button onClick={randomize}>Randomize Camera</button>
      </div>
    </div>
  );
}

export default Example;
