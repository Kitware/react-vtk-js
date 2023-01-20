import React, { lazy, Suspense } from 'react';

import useQueryString from './useQueryString';

const Picking = lazy(() => import('./Geometry/Picking'));
const OBJViewer = lazy(() => import('./Geometry/OBJViewer'));
const PointCloud = lazy(() => import('./Geometry/PointCloud'));
const PolyDataViewer = lazy(() => import('./Geometry/PolyDataViewer'));
const PolyDataWithData = lazy(() => import('./Geometry/PolyDataWithData'));
const ProcessingPipeline = lazy(() => import('./Geometry/ProcessingPipeline'));
const SourceViewer = lazy(() => import('./Geometry/SourceViewer'));
const Glyph = lazy(() => import('./Geometry/Glyph'));
const CutterExample = lazy(() => import('./Geometry/CutterExample'));
const SliceRendering = lazy(() => import('./Volume/SliceRendering'));
const ImageSeriesRendering = lazy(() => import('./Volume/ImageSeriesRendering'));
const SyntheticVolumeRendering = lazy(() =>
  import('./Volume/SyntheticVolumeRendering')
);
const VolumeRendering = lazy(() => import('./Volume/VolumeRendering'));
const DynamicUpdate = lazy(() => import('./Volume/DynamicUpdate'));
const MultiView = lazy(() => import('./MultiView'));

const demos = [
  'Geometry/Picking',
  'Geometry/OBJViewer',
  'Geometry/PointCloud',
  'Geometry/PolyDataViewer',
  'Geometry/PolyDataWithData',
  'Geometry/ProcessingPipeline',
  'Geometry/SourceViewer',
  'Geometry/Glyph',
  'Geometry/CutterExample',
  'Volume/SliceRendering',
  'Volume/ImageSeriesRendering',
  'Volume/SyntheticVolumeRendering',
  'Volume/VolumeRendering',
  'Volume/DynamicUpdate',
  'MultiView',
];

function App() {
  const [example, setExample] = useQueryString('demo', 'Geometry/Picking');

  return (
    <>
      <div
        style={{ position: 'absolute', top: '5px', right: '5px', zIndex: 2 }}
      >
        <select
          value={example}
          onChange={(e) => {
            setExample(e.target.value);
          }}
        >
          {demos.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
        <a
          href={`https://github.com/Kitware/react-vtk-js/blob/master/usage/${example}.jsx`}
          target='_blank'
          rel='noreferrer noopener'
          style={{
            padding: '0 5px',
            background: 'white',
            borderRadius: '5px',
            border: 'solid 1px #333',
            color: '#333',
            textDecoration: 'none',
          }}
        >
          View source
        </a>
      </div>
      <div
        style={{
          border: 0,
          margin: 0,
          padding: 0,
          width: '100vw',
          height: '100vh',
        }}
      >
        <Suspense fallback={<div>Loading</div>}>
          {example === 'Geometry/Picking' && <Picking />}
          {example === 'Geometry/OBJViewer' && <OBJViewer />}
          {example === 'Geometry/PointCloud' && <PointCloud />}
          {example === 'Geometry/PolyDataViewer' && <PolyDataViewer />}
          {example === 'Geometry/PolyDataWithData' && <PolyDataWithData />}
          {example === 'Geometry/ProcessingPipeline' && <ProcessingPipeline />}
          {example === 'Geometry/SourceViewer' && <SourceViewer />}
          {example === 'Geometry/Glyph' && <Glyph />}
          {example === 'Geometry/CutterExample' && <CutterExample />}
          {example === 'Volume/SliceRendering' && <SliceRendering />}
          {example === 'Volume/ImageSeriesRendering' && <ImageSeriesRendering />}
          {example === 'Volume/SyntheticVolumeRendering' && (
            <SyntheticVolumeRendering />
          )}
          {example === 'Volume/VolumeRendering' && <VolumeRendering />}
          {example === 'Volume/DynamicUpdate' && <DynamicUpdate />}
          {example === 'MultiView' && <MultiView />}
        </Suspense>
      </div>
    </>
  );
}

export default App;
