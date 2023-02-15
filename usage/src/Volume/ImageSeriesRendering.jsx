import React, { useState, useContext, useEffect } from 'react';
import vtkColorMaps from '@kitware/vtk.js/Rendering/Core/ColorTransferFunction/ColorMaps.js';
import vtkCollection from '@kitware/vtk.js/Common/DataModel/Collection';
import vtkImageArrayMapper from '@kitware/vtk.js/Rendering/Core/ImageArrayMapper.js';
import vtkResourceLoader from '@kitware/vtk.js/IO/Core/ResourceLoader';
import vtkLiteHttpDataAccessHelper from '@kitware/vtk.js/IO/Core/DataAccessHelper/LiteHttpDataAccessHelper';
import { unzipSync } from 'fflate';
import vtkITKHelper from '@kitware/vtk.js/Common/DataModel/ITKHelper';

import {
  View,
  Dataset,
  ShareDataSet,
  SliceRepresentation,
  Contexts,
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
      {props.options.map((opt) => (
        <option key={opt}>{opt}</option>
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


const loadData = async () => {
  console.log('Loading itk module...');
  loadData.setStatusText('Loading itk module...');
  if(!window.itk) {
    await vtkResourceLoader
    .loadScript(
      'https://cdn.jsdelivr.net/npm/itk-wasm@1.0.0-b.8/dist/umd/itk-wasm.js'
    );
  }

  console.log('Fetching/downloading the input file, please wait...');
  loadData.setStatusText('Loading data, please wait...');
  const zipFileData = await vtkLiteHttpDataAccessHelper.fetchBinary(
    // data.kitware.com --> MixedImagesMultiFrameRGBGray.zip
    'https://data.kitware.com/api/v1/item/63c1c7f96d3fc641a02d7f27/download'
    // data.kitware.com --> MixedSizedXRayImages.zip
    // 'https://data.kitware.com/api/v1/item/63b5fbeb6d3fc641a02d78cb/download'
  );

  console.log('Fetching/downloading input file done!');
  loadData.setStatusText('Download complete!');

  const zipFileDataArray = new Uint8Array(zipFileData);
  const decompressedFiles = unzipSync(zipFileDataArray);
  const dcmFiles = [];
  Object.keys(decompressedFiles).forEach((relativePath) => {
    if (relativePath.endsWith('.dcm')) {
      dcmFiles.push(relativePath);
    }
  });

  // Read individual dcm files into an array of vtkImageData.
  const imageArray = [];
  if(window.itk) {
    await Promise.all(
      dcmFiles.map(async (filename, index) => {
        const { image: itkImage, webWorker } =
          await window.itk.readImageArrayBuffer(
            null,
            decompressedFiles[filename].buffer,
            filename
          );
        webWorker.terminate();

        const vtkImage = vtkITKHelper.convertItkToVtkImage(itkImage);
        imageArray[index] = vtkImage;
      })
    );
  }

  // Convert image array into a vtkCollection
  const collection = vtkCollection.newInstance();
  for (const img of imageArray) {
    collection.addItem(img);
  }
  const totalSlices = imageArray.reduce(
    (accumulator, currImage) => currImage.getDimensions()[2] + accumulator, 0
  );
  loadData.setMaxSlicingValue(totalSlices - 1);
  loadData.setStatusText('');
  return collection;
}

function Example(props) {
  const [statusText, setStatusText] = useState('Loading data, please wait ...');
  const [kSlice, setKSlice] = useState(47);
  const [colorWindow, setColorWindow] = useState(2095);
  const [colorLevel, setColorLevel] = useState(1000);
  const [colorPreset, setColorPreset] = useState('Grayscale');
  const [useLookupTableScalarRange, setUseLookupTableScalarRange] =
    useState(false);
  const [mapper] = useState(() => vtkImageArrayMapper.newInstance());
  const [maxKSlice, setMaxKSlice] = useState(54);
  loadData.setMaxSlicingValue = setMaxKSlice;
  loadData.setStatusText = setStatusText;

  useEffect(
    () => {
      const img = mapper.getImage(kSlice);
      const range = img?.getPointData()?.getScalars()?.getRange();
      if(range && range.length == 2) {
        const maxWidth = range[1] - range[0];
        setColorWindow(maxWidth);
        const center = Math.round((range[0] + range[1]) / 2);
        setColorLevel(center);
      }
    },
    [kSlice]
  );

  return (
    <div style={{ width: '100%', height: '100%' }}>
        <View
          id='0'
          cameraPosition={[0, 0, -1]}
          cameraViewUp={[0, -1, 0]}
          cameraParallelProjection={false}
          background={[65 / 255, 86 / 255, 122 / 255]}
        >
          <ShareDataSet
            name='mixedImages'
          >
            <Dataset fetchData={loadData} />
          </ShareDataSet>
          <label
            style={{
              position: 'absolute',
              zIndex: 100,
              left: '5px',
              top: '120px',
              fontSize: '50px',
            }}
          >
            {statusText}
          </label>
          <Slider
            label='kSlice'
            max={maxKSlice}
            value={kSlice}
            setValue={setKSlice}
            style={{ top: '30px', left: '5px' }}
          />
          <Slider
            label='colorLevel'
            max={4095}
            value={colorLevel}
            setValue={setColorLevel}
            style={{ top: '60px', left: '5px' }}
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
            style={{ top: '90px', left: '5px' }}
          />
          <SliceRepresentation
            mapperInstance={mapper}
            kSlice={kSlice}
            property={{
              colorWindow,
              colorLevel,
              useLookupTableScalarRange,
            }}
            colorMapPreset={colorPreset}
          >
            <ShareDataSet
              name='mixedImages'
             />
          </SliceRepresentation>
        </View>
    </div>
  );
}

export default Example;
