import React, { Component } from 'react';

import { ViewContext, RepresentationContext, DownstreamContext } from './View';
import { smartEqualsShallow } from '../utils';

import vtkImageSlice from '@kitware/vtk.js/Rendering/Core/ImageSlice.js';
import vtkImageMapper from '@kitware/vtk.js/Rendering/Core/ImageMapper.js';
import vtkColorMaps from '@kitware/vtk.js/Rendering/Core/ColorTransferFunction/ColorMaps.js';
import vtkColorTransferFunction from '@kitware/vtk.js/Rendering/Core/ColorTransferFunction.js';
import vtkPiecewiseFunction from '@kitware/vtk.js/Common/DataModel/PiecewiseFunction.js';

interface SliceRepresentationProps {
  /**
   * The ID used to identify this component.
   */
  id?: string;
  /**
   * Properties to set to the mapper
   */
  mapper?: object;
  /**
   * Properties to set to the slice/actor
   */
  actor?: object;
  /**
   * Properties to set to the volume.property
   */
  property?: object;
  /**
   * Preset name for the lookup table color map
   */
  colorMapPreset?: string;
  /**
   * Data range use for the colorMap
   */
  colorDataRange?: number[] | string;
  /**
   * index of the slice along i
   */
  iSlice?: number;
  /**
   * index of the slice along j
   */
  jSlice?: number;
  /**
   * index of the slice along k
   */
  kSlice?: number;
  /**
   * index of the slice along x
   */
  xSlice?: number;
  /**
   * index of the slice along y
   */
  ySlice?: number;
  /**
   * index of the slice along z
   */
  zSlice?: number;
  children?: React.ReactNode[] | React.ReactNode;
}

/**
 * SliceRepresentation is responsible to convert a vtkPolyData into rendering
 * It takes the following set of properties:
 *   - colorBy: ['POINTS', ''],
 *   - pointSize: 1,
 *   - color: [1,1,1],
 */
export default class SliceRepresentation extends Component<SliceRepresentationProps> {
  static defaultProps = {
    colorMapPreset: 'Grayscale',
    colorDataRange: 'auto',
  };

  constructor(props) {
    super(props);

    // Guard to prevent rendering if no data
    this.validData = false;
    this.currentVisibility = true;

    // Create vtk.js objects
    this.lookupTable = vtkColorTransferFunction.newInstance();
    const preset = vtkColorMaps.getPresetByName(
      this.props.colorMapPreset ?? 'Grayscale'
    );
    this.lookupTable.applyColorMap(preset);
    this.piecewiseFunction = vtkPiecewiseFunction.newInstance();
    this.actor = vtkImageSlice.newInstance({ visibility: false });
    this.mapper = vtkImageMapper.newInstance();
    this.actor.setMapper(this.mapper);

    this.actor.getProperty().setRGBTransferFunction(0, this.lookupTable);
    // this.actor.getProperty().setScalarOpacity(0, this.piecewiseFunction);
    this.actor.getProperty().setInterpolationTypeToLinear();
  }

  render() {
    return (
      <ViewContext.Consumer>
        {(view) => {
          if (!this.view) {
            view.renderer.addActor(this.actor);
            this.view = view;
          }
          return (
            <RepresentationContext.Provider value={this}>
              <DownstreamContext.Provider value={this.mapper}>
                <div key={this.props.id} id={this.props.id}>
                  {this.props.children}
                </div>
              </DownstreamContext.Provider>
            </RepresentationContext.Provider>
          );
        }}
      </ViewContext.Consumer>
    );
  }

  componentDidMount() {
    this.update(this.props);
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    this.update(this.props, prevProps);
  }

  componentWillUnmount() {
    if (this.view && this.view.renderer) {
      this.view.renderer.removeActor(this.actor);
    }

    this.actor.delete();
    this.actor = null;

    this.mapper.delete();
    this.mapper = null;
  }

  update(props, previous) {
    const {
      actor,
      property,
      mapper,
      colorMapPreset,
      colorDataRange,
      iSlice,
      jSlice,
      kSlice,
      xSlice,
      ySlice,
      zSlice,
    } = props;
    let changed = false;

    if (actor && (!previous || actor !== previous.actor)) {
      changed = this.actor.set(actor) || changed;
    }
    if (property && (!previous || property !== previous.property)) {
      changed = this.actor.getProperty().set(property) || changed;
    }
    if (mapper && (!previous || mapper !== previous.mapper)) {
      changed = this.mapper.set(mapper) || changed;
    }
    if (
      colorMapPreset &&
      (!previous || colorMapPreset !== previous.colorMapPreset)
    ) {
      changed = true;
      const preset = vtkColorMaps.getPresetByName(colorMapPreset);
      this.lookupTable.applyColorMap(preset);
    }

    if (
      colorDataRange &&
      (!previous ||
        !smartEqualsShallow(colorDataRange, previous.colorDataRange))
    ) {
      changed = true;
      if (typeof colorDataRange === 'string') {
        if (previous) {
          this.dataChanged();
        } else {
          this.lookupTable.setMappingRange(0, 1);
          this.lookupTable.updateRange();

          this.piecewiseFunction.setNodes([
            { x: 0, y: 0, midpoint: 0.5, sharpness: 0 },
            { x: 1, y: 1, midpoint: 0.5, sharpness: 0 },
          ]);
        }
      } else {
        this.lookupTable.setMappingRange(...colorDataRange);
        this.lookupTable.updateRange();

        this.piecewiseFunction.setNodes([
          { x: colorDataRange[0], y: 0, midpoint: 0.5, sharpness: 0 },
          { x: colorDataRange[1], y: 1, midpoint: 0.5, sharpness: 0 },
        ]);
      }
    }

    // ijk
    if (iSlice != null && (!previous || iSlice !== previous.iSlice)) {
      changed = this.mapper.setISlice(iSlice) || changed;
    }
    if (jSlice != null && (!previous || jSlice !== previous.jSlice)) {
      changed = this.mapper.setJSlice(jSlice) || changed;
    }
    if (kSlice != null && (!previous || kSlice !== previous.kSlice)) {
      changed = this.mapper.setKSlice(kSlice) || changed;
    }
    // xyz
    if (xSlice != null && (!previous || xSlice !== previous.xSlice)) {
      changed = this.mapper.setXSlice(xSlice) || changed;
    }
    if (ySlice != null && (!previous || ySlice !== previous.ySlice)) {
      changed = this.mapper.setYSlice(ySlice) || changed;
    }
    if (zSlice != null && (!previous || zSlice !== previous.zSlice)) {
      changed = this.mapper.setZSlice(zSlice) || changed;
    }

    // actor visibility
    if (actor && actor.visibility !== undefined) {
      this.currentVisibility = actor.visibility;
      changed =
        this.actor.setVisibility(this.currentVisibility && this.validData) ||
        changed;
    }

    // trigger render
    if (changed) {
      this.dataChanged();
    }
  }

  dataAvailable() {
    if (!this.validData) {
      this.validData = true;
      this.actor.setVisibility(this.currentVisibility);

      // trigger render
      this.dataChanged();
    }
  }

  dataChanged() {
    if (this.props.colorDataRange === 'auto') {
      this.mapper.update();
      const input = this.mapper.getInputData();
      const array = input && input.getPointData()?.getScalars();
      const dataRange = array && array.getRange();
      if (dataRange) {
        this.lookupTable.setMappingRange(...dataRange);
        this.lookupTable.updateRange();
        this.piecewiseFunction.setNodes([
          { x: dataRange[0], y: 0, midpoint: 0.5, sharpness: 0 },
          { x: dataRange[1], y: 1, midpoint: 0.5, sharpness: 0 },
        ]);
      }

      if (this.view) {
        this.view.renderView();
      }
    }
  }
}
