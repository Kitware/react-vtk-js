import React, { useState, useContext } from 'react';

import {
  View,
  GeometryRepresentation,
  Algorithm,
  Contexts,
} from 'react-vtk-js/light';

function Slider(props) {
  const view = useContext(Contexts.ViewContext);
  const onChange = (e) => {
    const value = Number(e.currentTarget.value);
    props.setValue(value);
    setTimeout(view.renderView, 0);
  };
  return (
    <input
      type='range'
      min='3'
      max='100'
      value={props.value}
      onChange={onChange}
      style={{ position: 'absolute', zIndex: 100, left: '20px', top: '20px' }}
    />
  );
}

function Example(props) {
  const [resolution, setResolution] = useState(24);
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <View cameraViewUp={[0, 0, -1]} cameraPosition={[1, 1, 0]}>
        <Slider value={resolution} setValue={setResolution} />
        <GeometryRepresentation property={{ color: [0.3, 0.3, 1] }}>
          <Algorithm
            vtkClass='vtkConeSource'
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

export default Example;
