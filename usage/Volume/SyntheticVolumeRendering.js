import React from 'react';
import ReactDOM from 'react-dom';

// Do not work...
// import { View, GeometryRepresentation, PolyData } from 'react-vtk-js';

// Works...
import 'react-vtk-js';
const { View, VolumeDataRepresentation } = ReactVtkJs;

function Example(props) {
  const array = [];
  while (array.length < 1000) {
    array.push(Math.random());
  }
  return (
    <div style={{width: '100vw', height: '100vh'}}>
      <View id="0">
        <VolumeDataRepresentation
          spacing={[1,1,1]}
          dimensions={[10,10,10]}
          origin={[0,0,0]}
          scalars={array}
          rescaleColorMap={false}
        />
      </View>
    </div>
  );
}

// Render React object
ReactDOM.render(<Example />, document.querySelector('.root'));
