import React from 'react';
import ReactDOM from 'react-dom';

import { View, PointCloudRepresentation } from 'react-vtk-js';

// React complains about unique key prop but I don't see why
function Example(props) {
  return (
    <div style={{width: '100vw', height: '100vh'}}>
      <View>
        <PointCloudRepresentation
          property={{ pointSize: 10 }}
          xyz={props.xyz}
          scalars={props.scalars}
          showScalarBar={true}
        />
      </View>
    </div>
  );
}

const points = [];
const scalars = []
for (let i = 0; i < 1000; i++) {
  scalars.push(Math.random());
  points.push(Math.random());
  points.push(Math.random());
  points.push(Math.random());
}

// Render React object
ReactDOM.render(
  <Example xyz={points} scalars={scalars}/>,
  document.querySelector('.root')
);
