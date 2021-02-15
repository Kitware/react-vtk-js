import React from 'react';
import ReactDOM from 'react-dom';

import { View, GlyphRepresentation, Algorithm } from 'react-vtk-js';

// React complains about unique key prop but I don't see why
function Example(props) {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <View>
        <GlyphRepresentation
          mapper={{
            orientationArray: 'Normals',
          }}
        >
          <Algorithm vtkClass='vtkSphereSource' port='0' />
          <Algorithm
            vtkClass='vtkConeSource'
            state={{
              resolution: 20,
              height: 0.3,
              radius: 0.1,
            }}
            port='1'
          />
        </GlyphRepresentation>
      </View>
    </div>
  );
}

// Render React object
ReactDOM.render(<Example />, document.querySelector('.root'));
