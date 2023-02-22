import { useRef, useState } from 'react';

import {
  Algorithm,
  DataArray,
  GeometryRepresentation,
  PointData,
  PolyData,
  View,
} from 'react-vtk-js';

import vtkConeSource from '@kitware/vtk.js/Filters/Sources/ConeSource';

// React complains about unique key prop but I don't see why
function Example() {
  const view = useRef();
  const rep = useRef();

  const [height, setHeight] = useState(1);
  const [colorByName, setColorByName] = useState('Temperature');
  const [preset, setPreset] = useState('Black-Body Radiation');
  const [range, setRange] = useState([0, 0.7]);

  const randomize = () => {
    setHeight(Math.random() * 3);
    setColorByName(Math.random() < 0.5 ? 'Temperature' : 'Pressure');
    setPreset(Math.random() < 0.5 ? 'Black-Body Radiation' : 'Cool to Warm');
    setRange([0, Math.random()]);
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <View ref={view}>
        <GeometryRepresentation ref={rep}>
          <Algorithm
            vtkClass={vtkConeSource}
            state={{
              height,
            }}
          />
        </GeometryRepresentation>
        <GeometryRepresentation
          ref={rep}
          mapper={{
            colorByArrayName: colorByName,
            scalarMode: colorByName === 'Temperature' ? 0 : 3,
            interpolateScalarsBeforeMapping: true,
          }}
          colorDataRange={range}
          colorMapPreset={preset}
          showScalarBar
        >
          <PolyData
            points={[0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0]}
            polys={[4, 0, 3, 2, 1]}
          >
            <PointData>
              <DataArray
                registration='setScalars'
                name='Temperature'
                values={[0, 0.7, 0.3, 1]}
              />
              <DataArray name='Pressure' values={[0.5, 0.3, 0.7, 0]} />
            </PointData>
          </PolyData>
        </GeometryRepresentation>
      </View>
      <div style={{ position: 'absolute', top: 0 }}>
        <button onClick={randomize}>Randomize</button>
      </div>
    </div>
  );
}

export default Example;
