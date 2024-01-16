import vtkXMLImageDataReader from '@kitware/vtk.js/IO/XML/XMLImageDataReader';
import {
  Reader,
  View,
  VolumeController,
  VolumeRepresentation,
} from 'react-vtk-js';

function Example() {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <View id='0'>
        <VolumeRepresentation>
          <VolumeController />
          <Reader
            vtkClass={vtkXMLImageDataReader}
            url='https://data.kitware.com/api/v1/item/59e12e988d777f31ac6455c5/download'
          />
        </VolumeRepresentation>
      </View>
    </div>
  );
}

export default Example;
