import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { ViewContext, RepresentationContext, DownstreamContext } from './View';
import { smartEqualsShallow } from '../utils';

import vtkActor from '@kitware/vtk.js/Rendering/Core/Actor.js';
import vtkGlyph3DMapper from '@kitware/vtk.js/Rendering/Core/Glyph3DMapper.js';
import vtkColorMaps from '@kitware/vtk.js/Rendering/Core/ColorTransferFunction/ColorMaps.js';
import vtkColorTransferFunction from '@kitware/vtk.js/Rendering/Core/ColorTransferFunction.js';

/**
 * GlyphRepresentation using a source on port=1 as Glyph and the points of the source on port=0 to position the given glyphs
 * It takes the following set of properties:
 *    - actor: Properties to assign to the vtkActor
 *    - mapper: Properties to assign to the vtkGlyph3DMapper
 *    - property: Properties to assign to the vtkProperty (actor.getProperty())
 *    - colorMapPreset: Name of the preset to use for controlling the color mapping
 *    - colorDataRange: Range to use for the color scale
 */
export default class GeometryRepresentation extends Component {
  constructor(props) {
    super(props);

    // Guard to prevent rendering if no data
    this.validData = false;
    this.currentVisibility = true;

    // Create vtk.js actor/mapper
    this.actor = vtkActor.newInstance({ visibility: false });
    this.lookupTable = vtkColorTransferFunction.newInstance();
    this.mapper = vtkGlyph3DMapper.newInstance({
      lookupTable: this.lookupTable,
      useLookupTableScalarRange: true,
    });
    this.actor.setMapper(this.mapper);
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

    this.lookupTable.delete();
    this.lookupTable = null;
  }

  update(props, previous) {
    const { actor, mapper, property, colorMapPreset, colorDataRange } = props;
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
      (!previous ||
        !smartEqualsShallow(colorDataRange, previous.colorDataRange))
    ) {
      changed = true;
      this.lookupTable.setMappingRange(...colorDataRange);
      this.lookupTable.updateRange();
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
    if (this.view) {
      this.view.renderView();
    }
  }
}

GeometryRepresentation.defaultProps = {
  colorMapPreset: 'erdc_rainbow_bright',
  colorDataRange: [0, 1],
};

GeometryRepresentation.propTypes = {
  /**
   * The ID used to identify this component.
   */
  id: PropTypes.string,

  /**
   * Properties to set to the actor
   */
  actor: PropTypes.object,

  /**
   * Properties to set to the vtkGlyph3DMapper
   */
  mapper: PropTypes.object,

  /**
   * Properties to set to the actor.property
   */
  property: PropTypes.object,

  /**
   * Preset name for the lookup table color map
   */
  colorMapPreset: PropTypes.string,

  /**
   * Data range use for the colorMap
   */
  colorDataRange: PropTypes.arrayOf(PropTypes.number),

  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
};
