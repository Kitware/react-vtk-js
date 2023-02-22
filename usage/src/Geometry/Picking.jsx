import { useCallback, useEffect, useRef } from 'react';

import {
  DataArray,
  GeometryRepresentation,
  Picking,
  PointData,
  PolyData,
  View,
} from 'react-vtk-js';

const points = [];
const scalars = [];
for (let i = 0; i < 1000; i++) {
  scalars.push(Math.random());
  points.push(Math.random());
  points.push(Math.random());
  points.push(Math.random() - 0.5);
}

// React complains about unique key prop but I don't see why
function Example() {
  const tooltip = useRef(null);
  const viewRef = useRef(null);
  const pickRef = useRef(null);
  const isSelecting = useRef(0);

  const toTooltip = (txt) => {
    tooltip.current.innerHTML = txt;
  };

  const onHover = useCallback(
    (e) => {
      if (isSelecting.current) return;
      toTooltip(`Hover: ${JSON.stringify(e, null, 2)}`);
    },
    [isSelecting]
  );

  const onClick = useCallback(
    (e) => {
      if (isSelecting.current) {
        isSelecting.current--;
      } else {
        toTooltip(`Click: ${JSON.stringify(e, null, 2)}`);
      }
    },
    [isSelecting]
  );

  const onSelect = useCallback((e) => {
    // releasing the selection box triggers onClick
    isSelecting.current = 2;
    toTooltip(`Select: ${JSON.stringify(e, null, 2)}`);
  }, []);

  // This is the alternative to onSelect from older versions of react-vtk-js.
  useEffect(() => {
    const style = viewRef.current.getInteractorStyle();
    // assumption: style is a vtkInteractorStyleManipulator
    const mouseSelect = style
      .getMouseManipulators()
      .find((m) => m.isA('vtkMouseBoxSelectionManipulator'));

    if (mouseSelect) {
      const sub = mouseSelect.onBoxSelectChange((ev) => {
        const [x1, x2, y1, y2] = ev.selection;
        onSelect(pickRef.current.pickWithFrustum(x1, y1, x2, y2));
      });
      return () => {
        sub.unsubscribe();
      };
    }
  });

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <pre
        style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          zIndex: 1,
          margin: 0,
        }}
        ref={tooltip}
      />
      <View ref={viewRef}>
        <Picking ref={pickRef} onHover={onHover} onClick={onClick} />
        <GeometryRepresentation
          id='plan'
          mapper={{
            // colorByArrayName: 'Pressure',
            // scalarMode: 3,
            interpolateScalarsBeforeMapping: true,
          }}
          colorDataRange={[0, 0.7]}
          colorMapPreset='Black-Body Radiation'
          showScalarBar
          scalarBarTitle='Plan'
        >
          <PolyData
            points={[0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0]}
            polys={[4, 0, 3, 2, 1]}
          >
            <PointData>
              <DataArray
                registration='setScalars'
                name='Temperature'
                values={[0, 0.7, 0.3, 1]}
              />
              <DataArray name='Pressure' values={[1, 0.3, 0.7, 0]} />
            </PointData>
          </PolyData>
        </GeometryRepresentation>

        <GeometryRepresentation
          id='cloud'
          colorDataRange={[0, 1]}
          property={{ pointSize: 5 }}
          showScalarBar
          scalarBarTitle='Cloud'
          scalarBarStyle={{
            automated: false,
            boxPosition: [-0.9, -0.95],
            boxSize: [1.7, 0.25],
          }}
        >
          <PolyData points={points} connectivity='points'>
            <PointData>
              <DataArray registration='setScalars' values={scalars} />
            </PointData>
          </PolyData>
        </GeometryRepresentation>
      </View>
    </div>
  );
}

export default Example;
