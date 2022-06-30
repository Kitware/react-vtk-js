import React from 'react';

import GeometryRepresentation from '../core/GeometryRepresentation';
import PolyData from '../core/PolyData';
import PointData from '../core/PointData';
import DataArray from '../core/DataArray';

interface PointCloudRepresentationProps {
  /**
   * The ID used to identify this component.
   */
  id?: string;
  /**
   * Points coordinates
   */
  xyz?: number[];
  /**
   * Use RGB values to attach to the points/vertex
   */
  rgb?: number[];
  /**
   * Use RGBA values to attach to the points/vertex
   */
  rgba?: number[];
  /**
   * Field values to attach to the points
   */
  scalars?: number[];
  /**
   * Preset name for the lookup table color map
   */
  colorMapPreset?: string;
  /**
   * Data range use for the colorMap
   */
  colorDataRange?: number[];
  /**
   * Properties to set to the actor.property
   */
  property?: object;
  /**
   * Show/Hide Cube Axes for the given representation
   */
  showCubeAxes?: boolean;
  /**
   * Configure cube Axes style by overriding the set of properties defined
   * https://github.com/Kitware/vtk-js/blob/HEAD/Sources/Rendering/Core/CubeAxesActor/index.js#L703-L719
   */
  cubeAxesStyle?: object;
  /**
   * Show hide scalar bar for that representation
   */
  showScalarBar?: boolean;
  /**
   * Use given string as title for scalar bar. By default it is empty (no title).
   */
  scalarBarTitle?: string;
  /**
   * Configure scalar bar style by overriding the set of properties defined
   * https://github.com/Kitware/vtk-js/blob/master/Sources/Rendering/Core/ScalarBarActor/index.js#L776-L796
   */
  scalarBarStyle?: object;
}

/**
 * PointCloudRepresentation expect the following set of properties
 *   - xyz: [x0, y0, z0, x1, ..., zn]
 *   - rgb: [...]
 *   - rgba: [...]
 *   - scalars: [...]
 */
export default function PointCloudRepresentation(
  props: PointCloudRepresentationProps
) {
  let nbComponents = 0;
  let values = null;
  let type = null;
  if (props.rgb) {
    values = props.rgb;
    nbComponents = 3;
    type = 'Uint8Array';
  }
  if (props.rgba) {
    values = props.rgb;
    nbComponents = 4;
    type = 'Uint8Array';
  }
  if (props.scalars) {
    values = props.scalars;
    nbComponents = 1;
    type = 'Float32Array';
  }
  console.log('nbComponents', nbComponents);
  return (
    <GeometryRepresentation
      id={props.id}
      colorMapPreset={props.colorMapPreset}
      colorDataRange={props.colorDataRange}
      property={props.property}
      showCubeAxes={props.showCubeAxes}
      cubeAxesStyle={props.cubeAxesStyle}
      showScalarBar={props.showScalarBar}
      scalarBarTitle={props.scalarBarTitle}
      scalarBarStyle={props.scalarBarStyle}
    >
      <PolyData points={props.xyz} connectivity='points'>
        {nbComponents && (
          <PointData>
            <DataArray
              registration='setScalars'
              numberOfComponents={nbComponents}
              values={values}
              type={type}
            />
          </PointData>
        )}
      </PolyData>
    </GeometryRepresentation>
  );
}

PointCloudRepresentation.defaultProps = {
  xyz: [0, 0, 0],
  colorMapPreset: 'erdc_rainbow_bright',
  colorDataRange: [0, 1],
  showCubeAxes: false,
  showScalarBar: false,
  scalarBarTitle: '',
};
