import React from 'react';
import ReactDOM from 'react-dom';

// Do not work...
// import { View, GeometryRepresentation, PolyData } from 'react-vtk-js';

// Works...
import 'react-vtk-js';
const { View, GeometryRepresentation, PolyData } = ReactVtkJs;

// React complains about unique key prop but I don't see why

function Example(props) {
  return (
    <div style={{width: '100vw', height: '100vh'}}>
      <View id="0" background={[0.1, 0.5, 0.9]}>
        <GeometryRepresentation id="1" color={[0.7, 0, 0]}>
          <PolyData
            id="2"
            points={[
              0, 0, 0,
              1, 0, 0,
              1, 1, 0,
              0, 1, 0,
              0, 0, 1,
              1, 0, 1,
              1, 1, 1,
              0, 1, 1,
            ]}
            lines={[
              2, 0, 6,
              2, 1, 7,
              2, 2, 4,
              2, 3, 5,
            ]}
            polys={[
              4, 0, 3, 2, 1,
              4, 4, 5, 6, 7,
              4, 2, 3, 7, 6,
              4, 0, 1, 5, 4,
            ]}
          />
        </GeometryRepresentation>
      </View>
    </div>
  );
}

// Render React object
ReactDOM.render(<Example />, document.querySelector('.root'));
