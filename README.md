# react-vtk-js

React based declarative vtk.js visualization pipeline.
In other words this project allow you to leverage vtk.js using React/XML syntax to describe your 3D scene. Kind of like X3dom with the X3D format except that here we leverage React components that could be extended to build your own tools.

## Usage

Simple example of a geometric dataset render into a view.

```
<View>
  <GeometryRepresentation>
    <PolyData
      points={[0,0,0,0,1,0,1,0,0]}
      polys={[3,0,1,2]}
    >
      <PointData>
        <DataArray
          registration="setScalars"
          name="temperature"
          values={[0, 0.5, 1]}
        />
      </PointData>
    </PolyData>
  </GeometryRepresentation>
</View>
```

## Building library

`npm run build:debug` for development package or `npm run build` for optimized bundle.

## Using library inside your React application

```
import { View, GeometryRepresentation, Reader } from 'react-vtk-js';

function ObjViewer(props) {
  return (
    <View>
      <GeometryRepresentation>
        <Reader vtkClass="vtkOBJReader" url={props.url} />
      </GeometryRepresentation>
    </View>
  );
}
```
