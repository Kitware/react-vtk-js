import React from 'react';
import ReactDOM from 'react-dom';

import {
  View,
  GeometryRepresentation,
  GlyphRepresentation,
  Algorithm,
  ShareDataSet,
} from 'react-vtk-js';

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
          <ShareDataSet>
            <Algorithm 
              vtkClass='vtkSphereSource' 
              state={{
                phiResolution: 10,
                thetaResolution: 20,
              }}
            />
          </ShareDataSet>
          <Algorithm
            vtkClass='vtkConeSource'
            state={{
              resolution: 30,
              height: 0.25,
              radius: 0.08,
            }}
            port='1'
          />
        </GlyphRepresentation>
        <GeometryRepresentation>
          <ShareDataSet />
        </GeometryRepresentation>
      </View>
    </div>
  );
}

// Render React object
ReactDOM.render(<Example />, document.querySelector('.root'));
