import {
  DataArray,
  ImageData,
  PointData,
  SliceRepresentation,
  View,
} from 'react-vtk-js';

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

const VALUES = generateRandomVolumeField(10, 10, 10);

function Example() {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <View>
        <SliceRepresentation
          iSlice={8}
          property={{ colorWindow: 1, colorLevel: 0.5 }}
        >
          <ImageData
            spacing={[1, 1, 1]}
            dimensions={[10, 10, 10]}
            origin={[0, 0, 0]}
          >
            <PointData>
              <DataArray
                registration='setScalars'
                type='Float32Array'
                values={VALUES}
              />
            </PointData>
          </ImageData>
        </SliceRepresentation>
      </View>
    </div>
  );
}

export default Example;
