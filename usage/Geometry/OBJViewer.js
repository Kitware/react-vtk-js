import React from 'react';
import ReactDOM from 'react-dom';

import { View, GeometryRepresentation, Reader } from 'react-vtk-js';

// React complains about unique key prop but I don't see why
function Example(props) {
  return (
    <div style={{width: '100vw', height: '100vh'}}>
      <View>
        <GeometryRepresentation
          property={{ color: [0.3, 0.3, 0.3] }}
        >
          <Reader
            vtkClass="vtkOBJReader"
            url="https://kitware.github.io/vtk-js-datasets/data/obj-mtl/star-wars-vader-tie-fighter.obj"
          />
        </GeometryRepresentation>
      </View>
    </div>
  );
}

// Render React object
ReactDOM.render(<Example />, document.querySelector('.root'));
