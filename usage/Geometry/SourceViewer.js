import React, { useState, useContext } from 'react';
import ReactDOM from 'react-dom';

// Do not work...
// import { View, GeometryRepresentation, Reader } from 'react-vtk-js';

// Works...
import 'react-vtk-js';
const { View, GeometryRepresentation, Algorithm, Contexts } = ReactVtkJs;

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
      min="3"
      max="100"
      value={props.value}
      onChange={onChange}
      style={{ position: 'absolute', zIndex: 100, left: '20px', top: '20px' }}
    />
  );
}

function Example(props) {
  const [resolution, setResolution] =  useState(24);
  return (
    <div style={{width: '100vw', height: '100vh'}}>
      <View>
        <Slider value={resolution} setValue={setResolution} />
        <GeometryRepresentation property={{ color: [0.3, 0.3, 1] }}>
          <Algorithm
            vtkClass="vtkConeSource"
            state={{
              height: 2,
              radius: 0.75,
              resolution,
            }}
          />
        </GeometryRepresentation>
      </View>
    </div>
  );
}

// Render React object
ReactDOM.render(<Example />, document.querySelector('.root'));
