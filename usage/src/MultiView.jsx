import Picking from './Geometry/Picking';
import PolyDataViewer from './Geometry/PolyDataViewer';
import PolyDataWithData from './Geometry/PolyDataWithData';
import CameraTest from './Tests/CameraTest';
import ChangeInteractorStyle from './Tests/ChangeInteractorStyle';
import ShareGeometry from './Tests/ShareGeometry';
import SliceRendering from './Tests/SimpleSliceRendering';

import { MultiViewRoot } from 'react-vtk-js';

const points = [];
const scalars = [];
for (let i = 0; i < 1000; i++) {
  scalars.push(Math.random());
  points.push(Math.random());
  points.push(Math.random());
  points.push(Math.random());
}

function Example() {
  return (
    <MultiViewRoot>
      <div
        style={{
          display: 'flex',
          flexFlow: 'row',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ margin: '4px', width: '350px', height: '350px' }}>
          <Picking />
        </div>
        <div style={{ margin: '4px', width: '350px', height: '350px' }}>
          <PolyDataWithData />
        </div>
        <div style={{ margin: '4px', width: '350px', height: '350px' }}>
          <CameraTest />
        </div>
        <div style={{ margin: '4px', width: '350px', height: '350px' }}>
          <ShareGeometry />
        </div>
        <div style={{ margin: '4px', width: '350px', height: '350px' }}>
          <SliceRendering />
        </div>
        <div style={{ margin: '4px', width: '350px', height: '350px' }}>
          <PolyDataViewer />
        </div>
        <div style={{ margin: '4px', width: '350px', height: '350px' }}>
          <PolyDataWithData />
        </div>
        <div style={{ margin: '4px', width: '350px', height: '350px' }}>
          <ChangeInteractorStyle />
        </div>
      </div>
    </MultiViewRoot>
  );
}

export default Example;
