import React, { useState, useContext } from 'react';
import vtkColorMaps from '@kitware/vtk.js/Rendering/Core/ColorTransferFunction/ColorMaps.js';
import { SlabTypes } from '@kitware/vtk.js/Rendering/Core/ImageResliceMapper/Constants.js';
import { InterpolationType } from '@kitware/vtk.js/Rendering/Core/ImageProperty/Constants.js';
import vtkXMLImageDataReader from '@kitware/vtk.js/IO/XML/XMLImageDataReader.js';
import { newInstance as newVtkCylinderInstance } from '@kitware/vtk.js/Filters/Sources/CylinderSource.js';
import { newInstance as newVtkPlaneInstance } from '@kitware/vtk.js/Common/DataModel/Plane.js';

import {
  View,
  ShareDataSet,
  ShareDataSetRoot,
  RegisterDataSet,
  ResliceRepresentation,
  Reader,
  Contexts,
  VolumeController,
  VolumeRepresentation,
} from 'react-vtk-js';

// Per-orientation config: plane normal, default slice position, slider max,
// and the camera pose needed to view that plane face-on.
const ORIENTATION_CONFIGS = {
  Sagittal: {
    normal: [1, 0, 0],
    axis: 0,
    defaultPos: 127,
    max: 255,
    cameraPosition: [1, 0, 0],
    viewUp: [0, 0, -1],
  },
  Coronal: {
    normal: [0, 1, 0],
    axis: 1,
    defaultPos: 127,
    max: 255,
    cameraPosition: [0, 1, 0],
    viewUp: [0, 0, -1],
  },
  Axial: {
    normal: [0, 0, 1],
    axis: 2,
    defaultPos: 94,
    max: 188,
    cameraPosition: [0, 0, 1],
    viewUp: [0, -1, 0],
  },
};

const VOLUME_CENTER = [127, 127, 94];

const plane = newVtkPlaneInstance({
  origin: [127, 0, 0],
  normal: [1, 0, 0],
});
const cyl = newVtkCylinderInstance({
  height: 255,
  radius: 50,
  resolution: 20,
  capping: 1,
  center: [127, 127, 94],
});

function Slider(props) {
  const view = useContext(Contexts.ViewContext);
  const onChange = (e) => {
    const value = Number(e.currentTarget.value);
    props.setValue(value);
    setTimeout(view.requestRender, 0);
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
    setTimeout(view.requestRender, 0);
  }
  return (
    <label
      style={{
        position: 'absolute',
        zIndex: 100,
        left: '5px',
        top: '5px',
        ...props.style,
      }}
    >
      {props.label}
      <select
        value={props.value}
        onChange={onChange}
        style={{
          position: 'sticky',
          zIndex: 100,
          ...props.style,
        }}
      >
        {props.options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </label>
  );
}

function EnumDropDown(props) {
  const view = useContext(Contexts.ViewContext);
  function onChange(e) {
    const value = parseInt(e.currentTarget.value);
    props.setValue(value);
    setTimeout(view.requestRender, 0);
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
    setTimeout(view.requestRender, 0);
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

function SliceFunction(props) {
  const view = useContext(Contexts.ViewContext);
  function onChange(e) {
    const value = e.currentTarget.checked;
    if (value) {
      // Using a slice polydata
      cyl.update();
      props.setSlicePolyData(cyl.getOutputData());
    } else {
      props.setSlicePolyData(null);
      props.setSlicePlane(plane);
    }
    props.setValue(value);
    setTimeout(view.requestRender, 0);
    setTimeout(view.resetCamera, 0);
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

function OrientationDropDown(props) {
  const view = useContext(Contexts.ViewContext);
  function onChange(e) {
    const newOrientation = e.currentTarget.value;
    const cfg = ORIENTATION_CONFIGS[newOrientation];
    // Mutate the shared plane in-place so ResliceRepresentation picks it up.
    plane.setNormal(...cfg.normal);
    const origin = [...VOLUME_CENTER];
    origin[cfg.axis] = cfg.defaultPos;
    plane.setOrigin(...origin);
    props.setOrientation(newOrientation);
    props.setSlicePos(cfg.defaultPos);
    props.setCamera({ position: cfg.cameraPosition, viewUp: cfg.viewUp });
    setTimeout(view.requestRender, 0);
    setTimeout(view.resetCamera, 0);
  }
  return (
    <label
      style={{
        position: 'absolute',
        zIndex: 100,
        ...props.style,
      }}
    >
      {props.label}
      <select
        value={props.orientation}
        onChange={onChange}
        style={{ position: 'sticky', zIndex: 100 }}
      >
        {Object.keys(ORIENTATION_CONFIGS).map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

function PosSlider(props) {
  const cfg = ORIENTATION_CONFIGS[props.orientation];
  const origin = [...VOLUME_CENTER];
  origin[cfg.axis] = props.value;
  plane.setOrigin(...origin);
  return Slider(props);
}

function Example(props) {
  const [slabThickness, setSlabThickness] = useState(0);
  const [slabType, setSlabType] = useState(SlabTypes.MAX);
  const [interpolationType, setInterpolationType] = useState(
    InterpolationType.LINEAR
  );
  const [slabTrapezoidIntegration, setSlabTrapezoidIntegration] =
    useState(false);
  const [colorWindow, setColorWindow] = useState(2095);
  const [colorLevel, setColorLevel] = useState(1000);
  const [colorPreset, setColorPreset] = useState('Grayscale');
  const [useLookupTableScalarRange, setUseLookupTableScalarRange] =
    useState(false);
  const [usePolyData, setUsePolyData] = useState(false);
  const [slicePolyData, setSlicePolyData] = useState(null);
  const [slicePlane, setSlicePlane] = useState(plane);
  const [slicePos, setSlicePos] = useState(127);
  const [orientation, setOrientation] = useState('Sagittal');
  const [camera, setCamera] = useState(ORIENTATION_CONFIGS['Sagittal']);
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ShareDataSetRoot>
        <RegisterDataSet id='mainDataset'>
          <Reader
            vtkClass={vtkXMLImageDataReader}
            url='https://data.kitware.com/api/v1/item/59e12e988d777f31ac6455c5/download'
          />
        </RegisterDataSet>
        <div style={{ width: '50vw', height: '100%', display: 'inline-block' }}>
          <View
            id='0'
            camera={{ position: camera.cameraPosition, viewUp: camera.viewUp, parallelProjection: false }}
            background={[0.34, 0.35, 0.34]}
          >
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
              style={{ top: '30px', left: '255px' }}
            />
            <EnumDropDown
              options={{
                Linear: InterpolationType.LINEAR,
                Nearest: InterpolationType.NEAREST,
              }}
              label='interpolationType'
              value={interpolationType}
              setValue={setInterpolationType}
              style={{ top: '30px', left: '505px' }}
            />
            <DropDown
              label='lookupTable'
              options={vtkColorMaps.rgbPresetNames}
              value={colorPreset}
              setValue={setColorPreset}
              style={{ top: '60px', left: '5px' }}
            />
            <CheckBox
              label='useLookupTableScalarRange'
              value={useLookupTableScalarRange}
              setValue={setUseLookupTableScalarRange}
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
              style={{ top: '90px', left: '505px' }}
            />
            <SliceFunction
              label='SliceFunction'
              value={usePolyData}
              setValue={setUsePolyData}
              setSlicePolyData={setSlicePolyData}
              setSlicePlane={setSlicePlane}
              style={{ top: '5px', left: '5px' }}
            />
            <OrientationDropDown
              label='Orientation: '
              orientation={orientation}
              setOrientation={setOrientation}
              setSlicePos={setSlicePos}
              setCamera={setCamera}
              style={{ top: '5px', left: '255px' }}
            />
            <PosSlider
              label='slicePosition'
              max={ORIENTATION_CONFIGS[orientation].max}
              value={slicePos}
              setValue={setSlicePos}
              orientation={orientation}
              style={{ top: '5px', left: '455px' }}
            />
            <ResliceRepresentation
              slabThickness={slabThickness}
              slabType={slabType}
              slabTrapezoidIntegration={slabTrapezoidIntegration}
              slicePolyData={slicePolyData}
              slicePlane={slicePlane}
              property={{
                colorWindow,
                colorLevel,
                useLookupTableScalarRange,
                interpolationType,
              }}
              colorMapPreset={colorPreset}
            >
              <ShareDataSet id='mainDataset' />
            </ResliceRepresentation>
          </View>
        </div>
        <div style={{ width: '50vw', height: '100%', display: 'inline-block' }}>
          <View
            id='0'
            background={[0, 0, 0]}
            camera={{ position: [1, 0, 0], viewUp: [0, 0, -1], parallelProjection: false }}
          >
            <VolumeRepresentation>
              <div style={{ display: 'none' }}>
                <VolumeController />
              </div>
              <ShareDataSet id='mainDataset' />
            </VolumeRepresentation>
          </View>
        </div>
      </ShareDataSetRoot>
    </div>
  );
}

export default Example;
