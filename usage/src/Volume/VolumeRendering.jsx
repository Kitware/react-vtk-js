import React from 'react';

import {
  View,
  VolumeRepresentation,
  VolumeController,
  Reader,
} from 'react-vtk-js/light';

function Example(props) {
  const array = [];
  while (array.length < 1000) {
    array.push(Math.random());
  }
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <View id='0'>
        <VolumeRepresentation>
          <VolumeController />
          <Reader
            vtkClass='vtkXMLImageDataReader'
            url='https://data.kitware.com/api/v1/item/59e12e988d777f31ac6455c5/download'
          />
        </VolumeRepresentation>
      </View>
    </div>
  );
}

export default Example;
