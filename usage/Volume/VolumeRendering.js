import React from 'react';
import ReactDOM from 'react-dom';

// Do not work...
// import { View, GeometryRepresentation, PolyData } from 'react-vtk-js';

// Works...
import 'react-vtk-js';
const { View, VolumeRepresentation, VolumeController, Reader } = ReactVtkJs;

function Example(props) {
  const array = [];
  while (array.length < 1000) {
    array.push(Math.random());
  }
  return (
    <div style={{width: '100vw', height: '100vh'}}>
      <View id="0">
        <VolumeRepresentation>
          <VolumeController />
          <Reader
            vtkClass="vtkXMLImageDataReader"
            url="https://data.kitware.com/api/v1/item/59e12e988d777f31ac6455c5/download"
          />
        </VolumeRepresentation>
      </View>
    </div>
  );
}

// Render React object
ReactDOM.render(<Example />, document.querySelector('.root'));
