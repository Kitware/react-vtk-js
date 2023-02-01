import {
  Algorithm,
  GeometryRepresentation,
  RegisterDataSet,
  ShareDataSetRoot,
  UseDataSet,
  View,
} from 'react-vtk-js';

import vtkConeSource from '@kitware/vtk.js/Filters/Sources/ConeSource';

function Example() {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <ShareDataSetRoot>
        <RegisterDataSet id='cone'>
          <Algorithm vtkClass={vtkConeSource} />
        </RegisterDataSet>
        <View>
          <GeometryRepresentation
            property={{
              representation: 1,
              color: [1, 1, 0],
              lineWidth: 10,
            }}
          >
            <UseDataSet id='cone' />
          </GeometryRepresentation>
          <GeometryRepresentation>
            <UseDataSet id='cone' />
          </GeometryRepresentation>
        </View>
      </ShareDataSetRoot>
      <div style={{ position: 'absolute', top: 0 }}></div>
    </div>
  );
}

export default Example;
