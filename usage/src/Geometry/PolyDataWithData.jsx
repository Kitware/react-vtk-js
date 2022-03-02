import React from 'react';

import {
  View,
  GeometryRepresentation,
  PolyData,
  PointData,
  DataArray,
} from 'react-vtk-js';

// React complains about unique key prop but I don't see why
function Example(props) {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <View>
        <GeometryRepresentation
          mapper={{
            // colorByArrayName: 'Pressure',
            // scalarMode: 3,
            interpolateScalarsBeforeMapping: true,
          }}
          colorDataRange={[0, 0.7]}
          colorMapPreset='Black-Body Radiation'
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
      </View>
    </div>
  );
}

export default Example;
