import React from 'react';
import PointCloud from './Geometry/PointCloud';
import Picking from './Geometry/Picking';
import PolyDataWithData from './Geometry/PolyDataWithData';
import ProcessingPipeline from './Geometry/ProcessingPipeline';
import Cutter from './Geometry/CutterExample';
import Glyph from './Geometry/Glyph';

import { MultiViewRoot } from 'react-vtk-js/light';

const points = [];
const scalars = [];
for (let i = 0; i < 1000; i++) {
  scalars.push(Math.random());
  points.push(Math.random());
  points.push(Math.random());
  points.push(Math.random());
}

function Example(props) {
  return (
    <MultiViewRoot>
      <div
        style={{
          display: 'flex',
          flexFlow: 'row',
          flexWrap: 'wrap',
          height: '100vh',
          width: '100vw',
        }}
      >
        <div style={{ margin: '4px', width: '350px', height: '350px' }}>
          <Picking />
        </div>
        <div style={{ margin: '4px', width: '350px', height: '350px' }}>
          <PointCloud />
        </div>
        <div style={{ margin: '4px', width: '350px', height: '350px' }}>
          <PolyDataWithData />
        </div>
        <div style={{ margin: '4px', width: '350px', height: '350px' }}>
          <ProcessingPipeline />
        </div>
        <div style={{ margin: '4px', width: '350px', height: '350px' }}>
          <Cutter />
        </div>
        <div style={{ margin: '4px', width: '350px', height: '350px' }}>
          <Glyph />
        </div>
      </div>
    </MultiViewRoot>
  );
}

export default Example;
