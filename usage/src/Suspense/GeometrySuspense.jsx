import { Suspense, useRef } from 'react';

import {
  Algorithm,
  GeometryRepresentation,
  useViewContext,
  useViewReadySuspense,
  View,
} from 'react-vtk-js';

import vtkConeSource from '@kitware/vtk.js/Filters/Sources/ConeSource';

const styles = {
  position: 'relative',
  zIndex: 10,
  textAlign: 'center',
  color: 'white',
};

function Inner() {
  const view = useViewContext();
  const renderer = view.getRenderer();
  return (
    <div style={styles}>
      Without Suspense: has renderer = {String(!!renderer)}
    </div>
  );
}

function InnerSuspense() {
  const useRenderer = () => useViewContext().getRenderer();
  const renderer = useViewReadySuspense(useRenderer);
  return (
    <div style={styles}>With Suspense: has renderer = {String(!!renderer)}</div>
  );
}

// React complains about unique key prop but I don't see why
function Example() {
  const view = useRef();
  const rep = useRef();

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <View ref={view}>
        <Inner />
        <Suspense>
          <InnerSuspense />
        </Suspense>
        <GeometryRepresentation ref={rep}>
          <Algorithm
            vtkClass={vtkConeSource}
            state={{
              height: 1,
            }}
          />
        </GeometryRepresentation>
      </View>
    </div>
  );
}

export default Example;
