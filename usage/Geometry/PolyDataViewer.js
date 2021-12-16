import React from 'react';
import ReactDOM from 'react-dom';

import {
  View,
  GeometryRepresentation,
  Geometry2DRepresentation,
  PolyData,
} from 'react-vtk-js';

import { Representation } from '@kitware/vtk.js/Rendering/Core/Property/Constants';
import { DisplayLocation } from '@kitware/vtk.js/Rendering/Core/Property2D/Constants';
import { Coordinate } from '@kitware/vtk.js/Rendering/Core/Coordinate/Constants';

// React complains about unique key prop but I don't see why
function Example(props) {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <View id="0" background={[0.1, 0.5, 0.9]}>
        <GeometryRepresentation
          id="1"
          property={{
            opacity: 0.1,
            color: [0.7, 0, 0],
          }}
        >
          <PolyData
            id="2"
            points={[
              0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 1, 1, 0, 1, 1, 1, 1, 0,
              1, 1,
            ]}
            lines={
              [
                // 2, 0, 6,
                // 2, 1, 7,
                // 2, 2, 4,
                // 2, 3, 5,
              ]
            }
            polys={[4, 0, 3, 2, 1, 4, 4, 5, 6, 7, 4, 2, 3, 7, 6, 4, 0, 1, 5, 4]}
          />
        </GeometryRepresentation>
        <Geometry2DRepresentation
          id="3"
          property={{
            opacity: 1.0,
            pointSize: 4.0,
            color: [0.7, 1, 0],
            representation: Representation.WIREFRAME,
            displayLocation: DisplayLocation.BACKGROUND,
          }}
          transformCoordinate={{
            coordinateSystem: Coordinate.WORLD,
          }}
        >
          <PolyData
            id="4"
            points={[
              0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 1, 1, 0, 1, 1, 1, 1, 0,
              1, 1,
            ]}
            lines={[2, 0, 6, 2, 1, 7, 2, 2, 4, 2, 3, 5]}
            polys={[4, 0, 3, 2, 1, 4, 4, 5, 6, 7, 4, 2, 3, 7, 6, 4, 0, 1, 5, 4]}
          />
        </Geometry2DRepresentation>
        <Geometry2DRepresentation
          id="5"
          property={{
            opacity: 0.8,
            pointSize: 15,
            color: [0.7, 0, 0],
            representation: Representation.POINTS,
            displayLocation: DisplayLocation.FOREGROUND,
          }}
          transformCoordinate={{
            coordinateSystem: Coordinate.WORLD,
          }}
        >
          <PolyData
            id="6"
            points={[
              0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 1, 1, 0, 1, 1, 1, 1, 0,
              1, 1,
            ]}
            lines={[2, 0, 6, 2, 1, 7, 2, 2, 4, 2, 3, 5]}
            polys={[4, 0, 3, 2, 1, 4, 4, 5, 6, 7, 4, 2, 3, 7, 6, 4, 0, 1, 5, 4]}
          />
        </Geometry2DRepresentation>
      </View>
    </div>
  );
}

// Render React object
ReactDOM.render(<Example />, document.querySelector('.root'));
