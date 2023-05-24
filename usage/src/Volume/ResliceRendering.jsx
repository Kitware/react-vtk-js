import React, { useState, useContext } from 'react';
import vtkColorMaps from '@kitware/vtk.js/Rendering/Core/ColorTransferFunction/ColorMaps.js';
import { SlabTypes } from '@kitware/vtk.js/Rendering/Core/ImageResliceMapper/Constants.js';

import {
  View,
  ShareDataSet,
  ResliceRepresentation,
  Reader,
  Contexts,
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
  console.log(props.options);
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
      {props.options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
}

function EnumDropDown(props) {
  const view = useContext(Contexts.ViewContext);
  function onChange(e) {
    const value = e.currentTarget.value;
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
      <select
        value={props.value}
        label={props.label}
        id={props.label}
        onChange={onChange}
        style={{
          position: 'sticky',
          zIndex: 100,
          // left: '15px',
          // top: '5px',
          ...props.style,
        }}
      >
        {Object.entries(props.options).map((opt) => {
          return (
            <option key={opt[0]} value={opt[1]}>
              {opt[0]}
            </option>
          );
        })}
      </select>
    </label>
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

function Example(props) {
  const [iSlice, setISlice] = useState(128);
  const [jSlice, setJSlice] = useState(128);
  const [kSlice, setKSlice] = useState(47);
  const [slabThickness, setSlabThickness] = useState(0);
  const [slabType, setSlabType] = useState(SlabTypes.MAX);
  const [slabTrapezoidIntegration, setSlabTrapezoidIntegration] = useState(false);
  const [colorWindow, setColorWindow] = useState(2095);
  const [colorLevel, setColorLevel] = useState(1000);
  const [colorPreset, setColorPreset] = useState('Grayscale');
  const [useLookupTableScalarRange, setUseLookupTableScalarRange] =
    useState(false);
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <div style={{ width: '50vw', height: '100%', display: 'inline-block' }}>
        <View
          id='0'
          cameraPosition={[1, 0, 0]}
          cameraViewUp={[0, 0, -1]}
          cameraParallelProjection={false}
          background={[1, 1, 1]}
        >
          <ShareDataSet>
            <Reader
              vtkClass='vtkXMLImageDataReader'
              url='https://data.kitware.com/api/v1/item/59e12e988d777f31ac6455c5/download'
            />
          </ShareDataSet>
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
          <Slider
            label='slabThickness'
            max={10}
            value={slabThickness}
            setValue={setSlabThickness}
            style={{ top: '90px', left: '5px' }}
          />
          <EnumDropDown
            options={{
              MIN: SlabTypes.MIN,
              MAX: SlabTypes.MAX,
              MEAN: SlabTypes.MEAN,
              SUM: SlabTypes.SUM,
            }}
            label='slabMode'
            value={slabType}
            setValue={setSlabType}
            style={{ top: '90px', left: '255px' }}
          />
          <CheckBox
            label='slabTrapezoidIntegration'
            value={slabTrapezoidIntegration}
            setValue={setSlabTrapezoidIntegration}
            style={{ top: '60px', left: '5px' }}
          />
          <CheckBox
            label='useLookupTableScalarRange'
            value={useLookupTableScalarRange}
            setValue={setUseLookupTableScalarRange}
            style={{ top: '60px', left: '5px' }}
          />
          <ResliceRepresentation
            slabThickness={slabThickness}
            slabType={slabType}
            slabTrapezoidIntegration={slabTrapezoidIntegration}
            jSlice={jSlice}
            property={{
              colorWindow,
              colorLevel,
              useLookupTableScalarRange,
            }}
            colorMapPreset={colorPreset}
          >
            <ShareDataSet />
          </ResliceRepresentation>
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
            <ShareDataSet />
          </VolumeRepresentation>
        </View>
      </div>
    </div>
  );
}

export default Example;
