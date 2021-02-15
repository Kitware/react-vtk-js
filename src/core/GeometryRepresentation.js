import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { ViewContext, RepresentationContext, DownstreamContext } from './View';

import vtkActor from 'vtk.js/Rendering/Core/Actor.js';
import vtkMapper from 'vtk.js/Rendering/Core/Mapper.js';
import vtkColorMaps from 'vtk.js/Rendering/Core/ColorTransferFunction/ColorMaps.js';
import vtkColorTransferFunction from 'vtk.js/Rendering/Core/ColorTransferFunction.js';

/**
 * GeometryRepresentation is responsible to convert a vtkPolyData into rendering
 * It takes the following set of properties:
 *   - colorBy: ['POINTS', ''],
 *   - pointSize: 1,
 *   - color: [1,1,1],
 */
export default class GeometryRepresentation extends Component {
  constructor(props) {
    super(props);

    // Create vtk.js actor/mapper
    this.actor = vtkActor.newInstance();
    this.lookupTable = vtkColorTransferFunction.newInstance();
    this.mapper = vtkMapper.newInstance({
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
    if (this.view) {
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
    if (actor && (!previous || actor !== previous.actor)) {
      this.actor.set(actor);
    }
    if (mapper && (!previous || mapper !== previous.mapper)) {
      this.mapper.set(mapper);
    }
    if (property && (!previous || property !== previous.property)) {
      this.actor.getProperty().set(property);
    }

    if (
      colorMapPreset &&
      (!previous || colorMapPreset !== previous.colorMapPreset)
    ) {
      const preset = vtkColorMaps.getPresetByName(colorMapPreset);
      this.lookupTable.applyColorMap(preset);
      this.lookupTable.setMappingRange(...colorDataRange);
      this.lookupTable.updateRange();
    }

    if (
      colorDataRange &&
      (!previous || colorDataRange !== previous.colorDataRange)
    ) {
      this.lookupTable.setMappingRange(...colorDataRange);
      this.lookupTable.updateRange();
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
   * Properties to set to the actor
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
