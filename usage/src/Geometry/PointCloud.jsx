import React from 'react';

import { View, PointCloudRepresentation } from 'react-vtk-js/light';

const points = [];
const scalars = [];
for (let i = 0; i < 1000; i++) {
  scalars.push(Math.random());
  points.push(Math.random());
  points.push(Math.random());
  points.push(Math.random());
}

// React complains about unique key prop but I don't see why
function Example(props) {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <View>
        <PointCloudRepresentation
          property={{ pointSize: 10 }}
          xyz={points}
          scalars={scalars}
          showScalarBar
        />
      </View>
    </div>
  );
}

export default Example;
