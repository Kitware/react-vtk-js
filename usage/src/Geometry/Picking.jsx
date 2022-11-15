import React, { useRef } from 'react';

import {
  View,
  GeometryRepresentation,
  PolyData,
  PointData,
  DataArray,
} from 'react-vtk-js/light';

const points = [];
const scalars = [];
for (let i = 0; i < 1000; i++) {
  scalars.push(Math.random());
  points.push(Math.random());
  points.push(Math.random());
  points.push(Math.random() - 0.5);
}

let isSelecting = 0;

// React complains about unique key prop but I don't see why
function Example(props) {
  const tooltip = useRef(null);
  const toTooltip = (txt) => {
    tooltip.current.innerHTML = txt;
  };
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <pre
        style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          zIndex: 1,
          margin: 0,
        }}
        ref={tooltip}
      />
      <View
        pickingModes={['hover', 'click', 'select']}
        onClick={(e) => {
          if (isSelecting) {
            isSelecting--;
            return;
          }
          toTooltip(`Click: ${JSON.stringify(e, null, 2)}`);
        }}
        onHover={(e) => {
          if (isSelecting) {
            return;
          }
          toTooltip(`Hover: ${JSON.stringify(e, null, 2)}`);
        }}
        onSelect={(e) => {
          isSelecting = 2;
          toTooltip(`Select: ${JSON.stringify(e, null, 2)}`);
        }}
      >
        <GeometryRepresentation
          id='plan'
          mapper={{
            // colorByArrayName: 'Pressure',
            // scalarMode: 3,
            interpolateScalarsBeforeMapping: true,
          }}
          colorDataRange={[0, 0.7]}
          colorMapPreset='Black-Body Radiation'
          showScalarBar
          scalarBarTitle='Plan'
        >
          <PolyData
            points={[0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0]}
            polys={[4, 0, 3, 2, 1]}
          >
            <PointData>
              <DataArray
                registration='setScalars'
                name='Temperature'
                values={[0, 0.7, 0.3, 1]}
              />
              <DataArray name='Pressure' values={[1, 0.3, 0.7, 0]} />
            </PointData>
          </PolyData>
        </GeometryRepresentation>

        <GeometryRepresentation
          id='cloud'
          colorDataRange={[0, 1]}
          property={{ pointSize: 5 }}
          showScalarBar
          scalarBarTitle='Cloud'
          scalarBarStyle={{
            automated: false,
            boxPosition: [-0.9, -0.95],
            boxSize: [1.7, 0.25],
          }}
        >
          <PolyData points={points} connectivity='points'>
            <PointData>
              <DataArray registration='setScalars' values={scalars} />
            </PointData>
          </PolyData>
        </GeometryRepresentation>
      </View>
    </div>
  );
}

export default Example;
