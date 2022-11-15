import React from 'react';

import {
  View,
  GeometryRepresentation,
  GlyphRepresentation,
  Algorithm,
  ShareDataSet,
} from 'react-vtk-js/light';

// React complains about unique key prop but I don't see why
function Example(props) {
  return (
    <div style={{ width: '100%', height: '100%' }}>
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
            port={1}
          />
        </GlyphRepresentation>
        <GeometryRepresentation>
          <ShareDataSet />
        </GeometryRepresentation>
      </View>
    </div>
  );
}

export default Example;
