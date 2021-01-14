import React from 'react';
import ReactDOM from 'react-dom';

import { View, GeometryRepresentation, PolyData } from 'react-vtk-js';

function Example(props) {
  return (
    <View background={[0.1, 0.5, 0.9]}>
      <GeometryRepresentation color={[0.7, 0, 0]}>
        <PolyData
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
  );
}

ReactDOM.render(
  <Example />,
  document.getElementById('body')
);
