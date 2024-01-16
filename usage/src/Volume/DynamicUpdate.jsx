import { useContext, useState } from 'react';

import {
  Contexts,
  DataArray,
  ImageData,
  PointData,
  RegisterDataSet,
  ShareDataSetRoot,
  SliceRepresentation,
  UseDataSet,
  View,
  VolumeController,
  VolumeRepresentation,
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

function generateComponentVolumeField(iMax, jMax, kMax, component = 0) {
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
  const onChange = (e) => {
    const value = Number(e.currentTarget.value);
    props.setValue(value);
    setTimeout(view.renderView, 0);
  };
  return (
    <input
      type='range'
      min='0'
      step='1'
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

function Example() {
  const [fieldIdx, setFieldIdx] = useState(0);
  const colorWindow = fieldIdx ? 10 : 1;
  const colorLevel = fieldIdx ? 5 : 0.5;

  return (
    <ShareDataSetRoot>
      <RegisterDataSet id='image'>
        <ImageData
          spacing={[1, 1, 1]}
          dimensions={[10, 10, 10]}
          origin={[0, 0, 0]}
        >
          <PointData>
            <DataArray
              registration='setScalars'
              type='Float32Array'
              values={FIELDS[fieldIdx]}
            />
          </PointData>
        </ImageData>
      </RegisterDataSet>
      <div style={{ width: '100%', height: '100%' }}>
        <View id='0'>
          <Slider
            max={FIELDS.length - 1}
            value={fieldIdx}
            setValue={setFieldIdx}
          />
          <VolumeRepresentation>
            <VolumeController rescaleColorMap={false} />
            <UseDataSet id='image' />
          </VolumeRepresentation>
        </View>

        <div
          style={{
            position: 'absolute',
            width: '20%',
            height: '20%',
            bottom: 0,
            right: 0,
          }}
        >
          <View background={[1, 1, 1]}>
            <SliceRepresentation
              kSlice={5}
              property={{ colorWindow, colorLevel }}
            >
              <UseDataSet id='image' />
            </SliceRepresentation>
          </View>
        </div>
      </div>
    </ShareDataSetRoot>
  );
}

export default Example;
