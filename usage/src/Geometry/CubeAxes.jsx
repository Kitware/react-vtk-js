import React, { useState } from 'react';

import {
  View,
  GeometryRepresentation,
  PolyData,
  PointData,
  DataArray,
} from 'react-vtk-js';

const points = [];
const scalars = [];
for (let i = 0; i < 1000; i++) {
  scalars.push(Math.random());
  points.push(Math.random());
  points.push(Math.random());
  points.push(Math.random() - 0.5);
}

// React complains about unique key prop but I don't see why
function Example(props) {
  const [planAxes, setPlanAxes] = useState(false);
  const [cloudAxes, setCloudAxes] = useState(false);
  const togglePlan = () => setPlanAxes(!planAxes);
  const toggleCloud = () => setCloudAxes(!cloudAxes);
  const buttonStyle = {
    position: 'absolute',
    left: '5px',
    top: '5px',
    zIndex: 1,
  };
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <button style={buttonStyle} onClick={togglePlan}>
        Toggle Cube 1
      </button>
      <button style={{ ...buttonStyle, top: '30px' }} onClick={toggleCloud}>
        Toggle Cube 2
      </button>
      <View>
        <GeometryRepresentation
          id='plan'
          mapper={{
            // colorByArrayName: 'Pressure',
            // scalarMode: 3,
            interpolateScalarsBeforeMapping: true,
          }}
          colorDataRange={[0, 0.7]}
          colorMapPreset='Black-Body Radiation'
          showCubeAxes={planAxes}
          cubeAxesStyle={{ gridLines: false, axisLabels: ['', '', ''] }}
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
              <DataArray name='Pressure' values={[1, 0.3, 0.7, 0]} />
            </PointData>
          </PolyData>
        </GeometryRepresentation>

        <GeometryRepresentation
          id='cloud'
          colorDataRange={[0, 1]}
          property={{ pointSize: 5 }}
          showCubeAxes={cloudAxes}
          cubeAxesStyle={{ axisLabels: ['', '', ''] }}
        >
          <PolyData points={points} connectivity='points'>
            <PointData>
              <DataArray registration='setScalars' values={scalars} />
            </PointData>
          </PolyData>
        </GeometryRepresentation>
      </View>
    </div>
  );
}

export default Example;
