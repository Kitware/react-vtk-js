import { lazy, StrictMode, Suspense } from 'react';

import './styles.css';

import useQueryString from './useQueryString';

const Picking = lazy(() => import('./Geometry/Picking'));
// const OBJViewer = lazy(() => import('./Geometry/OBJViewer'));
// const PointCloud = lazy(() => import('./Geometry/PointCloud'));
const PolyDataViewer = lazy(() => import('./Geometry/PolyDataViewer'));
const PolyDataWithData = lazy(() => import('./Geometry/PolyDataWithData'));
// const ProcessingPipeline = lazy(() => import('./Geometry/ProcessingPipeline'));
const SourceViewer = lazy(() => import('./Geometry/SourceViewer'));
const TubeExample = lazy(() => import('./Geometry/TubeExample'));
// const Glyph = lazy(() => import('./Geometry/Glyph'));
// const CutterExample = lazy(() => import('./Geometry/CutterExample'));
// const SliceRendering = lazy(() => import('./Volume/SliceRendering'));
// const ImageSeriesRendering = lazy(() => import('./Volume/ImageSeriesRendering'));
// const SyntheticVolumeRendering = lazy(() =>
//   import('./Volume/SyntheticVolumeRendering')
// );
// const VolumeRendering = lazy(() => import('./Volume/VolumeRendering'));
// const DynamicUpdate = lazy(() => import('./Volume/DynamicUpdate'));
const MultiView = lazy(() => import('./MultiView'));
const PropertyUpdate = lazy(() => import('./Tests/PropertyUpdate'));
const CameraTest = lazy(() => import('./Tests/CameraTest'));
const ShareGeometry = lazy(() => import('./Tests/ShareGeometry'));
const SimpleSliceRendering = lazy(() => import('./Tests/SimpleSliceRendering'));
const ChangeInteractorStyle = lazy(() =>
  import('./Tests/ChangeInteractorStyle')
);

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
  'Geometry/TubeExample',
  'Volume/SliceRendering',
  'Volume/ImageSeriesRendering',
  'Volume/SyntheticVolumeRendering',
  'Volume/VolumeRendering',
  'Volume/DynamicUpdate',
  'Tests/PropertyUpdate',
  'Tests/CameraTest',
  'Tests/ShareGeometry',
  'Tests/SimpleSliceRendering',
  'Tests/ChangeInteractorStyle',
  'MultiView',
];

function App() {
  const [example, setExample] = useQueryString('demo', 'Tests/PropertyUpdate');

  return (
    <StrictMode>
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
          width: example === 'MultiView' ? 'unset' : '100vw',
          height: example === 'MultiView' ? 'unset' : '100vh',
        }}
      >
        <Suspense fallback={<div>Loading</div>}>
          {example === 'MultiView' && <MultiView />}
          {example === 'Geometry/Picking' && <Picking />}
          {example === 'Geometry/PolyDataViewer' && <PolyDataViewer />}
          {example === 'Geometry/PolyDataWithData' && <PolyDataWithData />}
          {/* {example === 'Geometry/OBJViewer' && <OBJViewer />} */}
          {/* {example === 'Geometry/PointCloud' && <PointCloud />} */}
          {/* example === 'Geometry/ProcessingPipeline' && <ProcessingPipeline /> */}
          {example === 'Geometry/SourceViewer' && <SourceViewer />}
          {example === 'Geometry/TubeExample' && <TubeExample />}
          {/* {example === 'Geometry/Glyph' && <Glyph />} */}
          {/* {example === 'Geometry/CutterExample' && <CutterExample />} */}
          {/* {example === 'Volume/SliceRendering' && <SliceRendering />} */}
          {/* example === 'Volume/ImageSeriesRendering' && <ImageSeriesRendering /> */}
          {/* example === 'Volume/SyntheticVolumeRendering' && (
            <SyntheticVolumeRendering />
          ) */}
          {/* {example === 'Volume/VolumeRendering' && <VolumeRendering />} */}
          {/* {example === 'Volume/DynamicUpdate' && <DynamicUpdate />} */}
          {example === 'Tests/PropertyUpdate' && <PropertyUpdate />}
          {example === 'Tests/CameraTest' && <CameraTest />}
          {example === 'Tests/ShareGeometry' && <ShareGeometry />}
          {example === 'Tests/SimpleSliceRendering' && <SimpleSliceRendering />}
          {example === 'Tests/ChangeInteractorStyle' && (
            <ChangeInteractorStyle />
          )}
        </Suspense>
      </div>
    </StrictMode>
  );
}

export default App;
