import vtkColorMaps from '@kitware/vtk.js/Rendering/Core/ColorTransferFunction/ColorMaps.js';
import { useContext, useState } from 'react';

import {
  Contexts,
  Reader,
  RegisterDataSet,
  ShareDataSetRoot,
  SliceRepresentation,
  UseDataSet,
  View,
  VolumeController,
  VolumeRepresentation,
} from 'react-vtk-js';

function Slider(props) {
  const view = useContext(Contexts.ViewContext);
  const onChange = (e) => {
    const value = Number(e.currentTarget.value);
    props.setValue(value);
    setTimeout(view.renderView, 0);
  };
  return (
    <label
      style={{
        position: 'absolute',
        zIndex: 100,
        left: '5px',
        top: '0px',
        ...props.style,
      }}
    >
      {props.label}
      <input
        type='range'
        min='0'
        max={props.max}
        value={props.value}
        onChange={onChange}
        style={{
          position: 'sticky',
          zIndex: 100,
          left: '5px',
          top: '5px',
          ...props.style,
        }}
      />
    </label>
  );
}

function DropDown(props) {
  const view = useContext(Contexts.ViewContext);
  function onChange(e) {
    const value = e.currentTarget.value;
    props.setValue(value);
    setTimeout(view.renderView, 0);
  }
  return (
    <select
      value={props.value}
      onChange={onChange}
      style={{
        position: 'absolute',
        zIndex: 100,
        left: '5px',
        top: '5px',
        ...props.style,
      }}
    >
      {props.options.map((opt, idx) => (
        <option key={idx} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
}

function CheckBox(props) {
  const view = useContext(Contexts.ViewContext);
  function onChange(e) {
    const value = e.currentTarget.checked;
    props.setValue(value);
    setTimeout(view.renderView, 0);
  }
  return (
    <label
      style={{
        position: 'absolute',
        zIndex: 100,
        left: '5px',
        top: '55px',
        ...props.style,
      }}
    >
      {props.label}
      <input
        type='checkbox'
        checked={props.value}
        onChange={onChange}
        style={{
          position: 'sticky',
          zIndex: 100,
          left: '105px',
          ...props.style,
        }}
      />
    </label>
  );
}

function Example() {
  const [iSlice, setISlice] = useState(128);
  const [jSlice, setJSlice] = useState(128);
  const [kSlice, setKSlice] = useState(47);
  const [colorWindow, setColorWindow] = useState(2095);
  const [colorLevel, setColorLevel] = useState(1000);
  const [colorPreset, setColorPreset] = useState('Grayscale');
  const [useLookupTableScalarRange, setUseLookupTableScalarRange] =
    useState(false);
  return (
    <ShareDataSetRoot>
      <RegisterDataSet id='image'>
        <Reader
          vtkClass='vtkXMLImageDataReader'
          url='https://data.kitware.com/api/v1/item/59e12e988d777f31ac6455c5/download'
        />
      </RegisterDataSet>
      <div style={{ width: '100%', height: '100%' }}>
        <div style={{ width: '50vw', height: '100%', display: 'inline-block' }}>
          <View
            id='0'
            cameraPosition={[1, 0, 0]}
            cameraViewUp={[0, 0, -1]}
            cameraParallelProjection={false}
            background={[1, 1, 1]}
          >
            <Slider
              label='iSlice'
              max={256}
              value={iSlice}
              setValue={setISlice}
              style={{ left: '5px' }}
            />
            <Slider
              label='jSlice'
              max={256}
              value={jSlice}
              setValue={setJSlice}
              style={{ left: '255px' }}
            />
            <Slider
              label='kSlice'
              max={95}
              value={kSlice}
              setValue={setKSlice}
              style={{ left: '505px' }}
            />
            <Slider
              label='colorLevel'
              max={4095}
              value={colorLevel}
              setValue={setColorLevel}
              style={{ top: '30px', left: '5px' }}
            />
            <Slider
              label='colorWindow'
              max={4095}
              value={colorWindow}
              setValue={setColorWindow}
              style={{ top: '30px', left: '505px' }}
            />
            <DropDown
              options={vtkColorMaps.rgbPresetNames}
              value={colorPreset}
              setValue={setColorPreset}
              style={{ top: '60px', left: '505px' }}
            />
            <CheckBox
              label='useLookupTableScalarRange'
              value={useLookupTableScalarRange}
              setValue={setUseLookupTableScalarRange}
              style={{ top: '60px', left: '5px' }}
            />
            <SliceRepresentation
              iSlice={iSlice}
              property={{
                colorWindow,
                colorLevel,
                useLookupTableScalarRange,
              }}
              colorMapPreset={colorPreset}
            >
              <UseDataSet id='image' />
            </SliceRepresentation>
            <SliceRepresentation
              jSlice={jSlice}
              property={{
                colorWindow,
                colorLevel,
                useLookupTableScalarRange,
              }}
              colorMapPreset={colorPreset}
            >
              <UseDataSet id='image' />
            </SliceRepresentation>
            <SliceRepresentation
              kSlice={kSlice}
              property={{
                colorWindow,
                colorLevel,
                useLookupTableScalarRange,
              }}
              colorMapPreset={colorPreset}
            >
              <UseDataSet id='image' />
            </SliceRepresentation>
          </View>
        </div>
        <div style={{ width: '50vw', height: '100%', display: 'inline-block' }}>
          <View
            id='0'
            background={[0, 0, 0]}
            cameraPosition={[1, 0, 0]}
            cameraViewUp={[0, 0, -1]}
            cameraParallelProjection={false}
          >
            <VolumeRepresentation>
              <div style={{ display: 'none' }}>
                <VolumeController />
              </div>
              <UseDataSet id='image' />
            </VolumeRepresentation>
          </View>
        </div>
      </div>
    </ShareDataSetRoot>
  );
}

export default Example;
