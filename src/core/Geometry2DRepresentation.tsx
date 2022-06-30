import React, { Component } from 'react';

import { ViewContext, RepresentationContext, DownstreamContext } from './View';
import { vec2Equals } from '../utils';

import vtkActor2D from '@kitware/vtk.js/Rendering/Core/Actor2D.js';
import vtkMapper2D from '@kitware/vtk.js/Rendering/Core/Mapper2D.js';
import vtkColorMaps from '@kitware/vtk.js/Rendering/Core/ColorTransferFunction/ColorMaps.js';
import vtkColorTransferFunction from '@kitware/vtk.js/Rendering/Core/ColorTransferFunction.js';
import vtkCoordinate from '@kitware/vtk.js/Rendering/Core/Coordinate.js';
import { Coordinate } from '@kitware/vtk.js/Rendering/Core/Coordinate/Constants.js';

interface Geometry2DRepresentationProps {
  /**
   * The ID used to identify this component.
   */
  id?: string;
  /**
   * Properties to set to the actor
   */
  actor?: object;
  /**
   * Properties to set to the actor
   */
  mapper?: object;
  /**
   * Properties to set to the actor.property
   */
  property?: object;
  /**
   * Preset name for the lookup table color map
   */
  colorMapPreset?: string;
  /**
   * Data range use for the colorMap
   */
  colorDataRange?: number[];
  /**
   * Coordinate system that the input dataset is in.
   */
  transformCoordinate?: object;
  children?: React.ReactNode[] | React.ReactNode;
}

/**
 * Geometry2DRepresentation is useful for rendering polydata in 2D screen space.
 * It takes the following set of properties:
 *   - representation: ['POINTS', 'WIREFRAME', 'SURFACE'],
 *   - pointSize: 1,
 *   - color: [1,1,1],
 *   - opacity: 1,
 */
export default class Geometry2DRepresentation extends Component<Geometry2DRepresentationProps> {
  static defaultProps = {
    colorMapPreset: 'erdc_rainbow_bright',
    colorDataRange: [0, 1],
  };

  constructor(props) {
    super(props);

    // Guard to prevent rendering if no data
    this.validData = false;
    this.currentVisibility = true;

    // Create vtk.js actor/mapper
    this.actor = vtkActor2D.newInstance({
      visibility: false,
      representationId: props.id,
    });
    this.lookupTable = vtkColorTransferFunction.newInstance();
    this.transformCoordinate = vtkCoordinate.newInstance({
      coordinateSystem:
        this.props.transformCoordinate?.coordinateSystem ?? Coordinate.DISPLAY,
    });
    this.mapper = vtkMapper2D.newInstance({
      lookupTable: this.lookupTable,
      useLookupTableScalarRange: false,
      scalarVisibility: false,
      transformCoordinate: this.transformCoordinate,
    });
    this.actor.setMapper(this.mapper);

    this.subscriptions = [];
  }

  render() {
    return (
      <ViewContext.Consumer>
        {(view) => {
          if (!this.view) {
            view.renderer.addActor2D(this.actor);
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
    while (this.subscriptions.length) {
      this.subscriptions.pop().unsubscribe();
    }

    if (this.view && this.view.renderer) {
      this.view.renderer.removeActor(this.actor);
    }

    this.actor.delete();
    this.actor = null;

    this.mapper.delete();
    this.mapper = null;

    this.lookupTable.delete();
    this.lookupTable = null;

    this.transformCoordinate.delete();
    this.transformCoordinate = null;
  }

  update(props, previous) {
    const {
      actor,
      mapper,
      property,
      colorMapPreset,
      colorDataRange,
      transformCoordinate,
    } = props;
    let changed = false;

    if (actor && (!previous || actor !== previous.actor)) {
      changed = this.actor.set(actor) || changed;
    }
    if (mapper && (!previous || mapper !== previous.mapper)) {
      changed = this.mapper.set(mapper) || changed;
    }
    if (property && (!previous || property !== previous.property)) {
      changed = this.actor.getProperty().set(property) || changed;
    }

    if (
      colorMapPreset &&
      this.lookupTable &&
      (!previous || colorMapPreset !== previous.colorMapPreset)
    ) {
      changed = true;
      const preset = vtkColorMaps.getPresetByName(colorMapPreset);
      this.lookupTable.applyColorMap(preset);
      this.lookupTable.setMappingRange(...colorDataRange);
      this.lookupTable.updateRange();
    }

    if (
      colorDataRange &&
      this.lookupTable &&
      (!previous || !vec2Equals(colorDataRange, previous.colorDataRange))
    ) {
      changed = true;
      this.lookupTable.setMappingRange(...colorDataRange);
      this.lookupTable.updateRange();
    }

    if (
      transformCoordinate &&
      this.transformCoordinate &&
      (!previous || transformCoordinate !== previous.transformCoordinate)
    ) {
      changed = true;
      this.transformCoordinate.set(transformCoordinate);
    }

    // actor visibility
    if (actor && actor.visibility !== undefined) {
      this.currentVisibility = actor.visibility;
      changed =
        this.actor.setVisibility(this.currentVisibility && this.validData) ||
        changed;
    }

    if (changed) {
      // trigger render
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
    if (this.view) {
      this.view.renderView();
    }
  }
}
