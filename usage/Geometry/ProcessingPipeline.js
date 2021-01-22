import React, { useState, useContext } from 'react';
import ReactDOM from 'react-dom';

import { View, GeometryRepresentation, Algorithm, Calculator, Contexts } from 'react-vtk-js';

function Slider(props) {
  const view = useContext(Contexts.ViewContext);
  function onChange(e) {
    const value = Number(e.currentTarget.value);
    props.setValue(value);
    setTimeout(view.renderView, 0);
  }
  return (
    <input
      type="range"
      min="-0.25"
      max="0.25"
      step="0.01"
      value={props.value}
      onChange={onChange}
      style={{ position: 'absolute', zIndex: 100, left: '20px', top: '20px' }}
    />
  );
}

function Example(props) {
  const [scaleFactor, setScaleFactor] =  useState(0);
  return (
    <div style={{width: '100vw', height: '100vh'}}>
      <View>
        <Slider value={scaleFactor} setValue={setScaleFactor} />
        <GeometryRepresentation
          mapper={{
            colorByArrayName: 'calc',
            scalarMode: 3,
            interpolateScalarsBeforeMapping: true,

            }}
          property={{
            edgeVisibility: true,
          }}
          colorDataRange={[0, 0.5]}
        >
          <Algorithm
            vtkClass="vtkWarpScalar"
            state={{
              scaleFactor,
              inputArrayToProcess: [0, 'calc', 'PointData', 'Scalars'],
            }}
          >
            <Calculator
              name="calc"
              formula={(xyz) => 0.25 * Math.sin(Math.sqrt(((xyz[0] - 0.5) * (xyz[0] - 0.5)) + ((xyz[1] - 0.5) * (xyz[1] - 0.5)))*50)}
            >
              <Algorithm
                vtkClass="vtkPlaneSource"
                state={{
                  xResolution: 100,
                  yResolution: 100,
                }}
              />
            </Calculator>
          </Algorithm>
        </GeometryRepresentation>
      </View>
    </div>
  );
}

// Render React object
ReactDOM.render(<Example />, document.querySelector('.root'));
