import React, { useState, useContext } from 'react';
import ReactDOM from 'react-dom';

import { Contexts, View, VolumeDataRepresentation } from 'react-vtk-js';

function generateRandomVolumeField(iMax, jMax, kMax) {
  const array = [];
  for (let k = 0; k < kMax; k++) {
    for (let j = 0; j < jMax; j++) {
      for (let i = 0; i < iMax; i++) {
        array.push(Math.random());
      }
    }
  }
  return array;
}

function generateComponentVolumeField(iMax, jMax, kMax, component=0) {
  const array = [];
  for (let k = 0; k < kMax; k++) {
    for (let j = 0; j < jMax; j++) {
      for (let i = 0; i < iMax; i++) {
        const ijk = [i, j, k];
        array.push(ijk[component]);
      }
    }
  }
  return array;
}

const FIELDS = [
  generateRandomVolumeField(10, 10, 10),
  generateComponentVolumeField(10, 10, 10, 0),
  generateComponentVolumeField(10, 10, 10, 1),
  generateComponentVolumeField(10, 10, 10, 2),
];

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
      min="0"
      step="1"
      max={props.max}
      value={props.value}
      onChange={onChange}
      style={{
        position: 'absolute',
        zIndex: 100,
        right: '5px',
        top: '25px',
        ...props.style,
      }}
    />
  );
}

function Example(props) {
  const [fieldIdx, setFieldIdx] =  useState(0);
  return (
    <div style={{width: '100vw', height: '100vh'}}>
      <View id="0">
        <Slider max={FIELDS.length - 1} value={fieldIdx} setValue={setFieldIdx} />
        <VolumeDataRepresentation
          spacing={[1,1,1]}
          dimensions={[10,10,10]}
          origin={[0,0,0]}
          scalars={FIELDS[fieldIdx]}
          rescaleColorMap={false}
        />
      </View>
    </div>
  );
}

// Render React object
ReactDOM.render(<Example />, document.querySelector('.root'));
