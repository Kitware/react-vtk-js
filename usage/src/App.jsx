import { lazy, StrictMode, Suspense } from 'react';

import './styles.css';

import useQueryString from './useQueryString';

const demos = new Map([
  ['Geometry/Picking', lazy(() => import('./Geometry/Picking'))],
  ['Geometry/OBJViewer', lazy(() => import('./Geometry/OBJViewer'))],
  // ['Geometry/PointCloud', lazy(() => import('./Geometry/PointCloud'))],
  ['Geometry/PolyDataViewer', lazy(() => import('./Geometry/PolyDataViewer'))],
  [
    'Geometry/PolyDataWithData',
    lazy(() => import('./Geometry/PolyDataWithData')),
  ],
  // [
  //   'Geometry/ProcessingPipeline',
  //   lazy(() => import('./Geometry/ProcessingPipeline')),
  // ],
  ['Geometry/SourceViewer', lazy(() => import('./Geometry/SourceViewer'))],
  // ['Geometry/Glyph', lazy(() => import('./Geometry/Glyph'))],
  ['Geometry/CutterExample', lazy(() => import('./Geometry/CutterExample'))],
  ['Geometry/TubeExample', lazy(() => import('./Geometry/TubeExample'))],
  // ['Volume/SliceRendering', lazy(() => import('./Volume/SliceRendering'))],
  // ['Volume/ImageSeriesRendering', lazy(() => import('./Volume/ImageSeriesRendering'))],
  // [
  //   'Volume/SyntheticVolumeRendering',
  //   lazy(() => import('./Volume/SyntheticVolumeRendering')),
  // ],
  // ['Volume/VolumeRendering', lazy(() => import('./Volume/VolumeRendering'))],
  // ['Volume/DynamicUpdate', lazy(() => import('./Volume/DynamicUpdate'))],
  ['Tests/PropertyUpdate', lazy(() => import('./Tests/PropertyUpdate'))],
  ['Tests/CameraTest', lazy(() => import('./Tests/CameraTest'))],
  ['Tests/ShareGeometry', lazy(() => import('./Tests/ShareGeometry'))],
  [
    'Tests/SimpleSliceRendering',
    lazy(() => import('./Tests/SimpleSliceRendering')),
  ],
  [
    'Tests/ChangeInteractorStyle',
    lazy(() => import('./Tests/ChangeInteractorStyle')),
  ],
  ['MultiView', lazy(() => import('./MultiView'))],
]);

function App() {
  const [example, setExample] = useQueryString('demo', 'Tests/PropertyUpdate');
  const ExampleComponent = demos.get(example);

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
          {[...demos.keys()].map((option) => (
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
          <ExampleComponent />
        </Suspense>
      </div>
    </StrictMode>
  );
}

export default App;
