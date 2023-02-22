import { newInstance as newVtkPlaneInstance } from '@kitware/vtk.js/Common/DataModel/Plane.js';

// vtkCutter
import '@kitware/vtk.js/Filters/Core/Cutter';
// vtkOBJReader
import '@kitware/vtk.js/IO/Misc/OBJReader';
import { Algorithm, GeometryRepresentation, Reader, View } from 'react-vtk-js';

function Example(props) {
  const plane = newVtkPlaneInstance({
    origin: [0, 0, 0],
    normal: [0, 0, 1],
  });

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <View background={[0.0, 0.0, 0.0]}>
        <GeometryRepresentation
          property={{
            color: [0.7, 0, 0],
          }}
        >
          <Algorithm vtkClass='vtkCutter' state={{ cutFunction: plane }}>
            <Reader
              vtkClass='vtkOBJReader'
              url='https://kitware.github.io/vtk-js-datasets/data/obj-mtl/star-wars-vader-tie-fighter.obj'
            />
          </Algorithm>
        </GeometryRepresentation>
      </View>
    </div>
  );
}

export default Example;
