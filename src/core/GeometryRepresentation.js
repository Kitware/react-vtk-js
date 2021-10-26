import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { ViewContext, RepresentationContext, DownstreamContext } from './View';

import vtkActor from '@kitware/vtk.js/Rendering/Core/Actor.js';
import vtkMapper from '@kitware/vtk.js/Rendering/Core/Mapper.js';
import vtkColorMaps from '@kitware/vtk.js/Rendering/Core/ColorTransferFunction/ColorMaps.js';
import vtkColorTransferFunction from '@kitware/vtk.js/Rendering/Core/ColorTransferFunction.js';

import vtkCubeAxesActor from '@kitware/vtk.js/Rendering/Core/CubeAxesActor.js';
import vtkScalarBarActor from '@kitware/vtk.js/Rendering/Core/ScalarBarActor.js';

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

    // Guard to prevent rendering if no data
    this.validData = false;
    this.currentVisibility = true;

    // Create vtk.js actor/mapper
    this.actor = vtkActor.newInstance({
      visibility: false,
      representationId: props.id,
    });
    this.lookupTable = vtkColorTransferFunction.newInstance();
    this.mapper = vtkMapper.newInstance({
      lookupTable: this.lookupTable,
      useLookupTableScalarRange: true,
    });
    this.actor.setMapper(this.mapper);

    // Scalar Bar
    this.scalarBar = vtkScalarBarActor.newInstance();
    this.scalarBar.setScalarsToColors(this.lookupTable);
    this.scalarBar.setVisibility(false);

    this.subscriptions = [];

    if (props.showCubeAxes) {
      this.initCubeAxes();
    }
  }

  initCubeAxes() {
    this.cubeAxes = vtkCubeAxesActor.newInstance({
      visibility: false,
      dataBounds: [-1, 1, -1, 1, -1, 1],
    });
    this.cubeAxes
      .getActors()
      .forEach(({ setVisibility }) => setVisibility(false));

    const updateCubeAxes = () => {
      if (this.mapper.getInputData()) {
        if (this.subscriptions.length === 1) {
          // add input data as well
          this.subscriptions.push(
            this.mapper.getInputData().onModified(updateCubeAxes)
          );
        }

        const bounds = this.mapper.getInputData().getBounds();
        if (bounds[0] < bounds[1]) {
          if (this.cubeAxes) {
            this.cubeAxes.setDataBounds(bounds);
          }
          if (this.view) {
            this.view.renderView();
          }
        }
      }
    };

    this.subscriptions.push(this.mapper.onModified(updateCubeAxes));
  }

  render() {
    return (
      <ViewContext.Consumer>
        {(view) => {
          if (!this.view) {
            if (this.cubeAxes) {
              this.cubeAxes.setCamera(view.renderer.getActiveCamera());
              view.renderer.addActor(this.cubeAxes);
            }

            view.renderer.addActor(this.scalarBar);
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
    while (this.subscriptions.length) {
      this.subscriptions.pop().unsubscribe();
    }

    if (this.view && this.view.renderer) {
      this.view.renderer.removeActor(this.scalarBar);
      this.view.renderer.removeActor(this.cubeAxes);
      this.view.renderer.removeActor(this.actor);
    }

    this.scalarBar.delete();
    this.scalarBar = null;

    if (this.cubeAxes) {
      this.cubeAxes.delete();
      this.cubeAxes = null;
    }

    this.actor.delete();
    this.actor = null;

    this.mapper.delete();
    this.mapper = null;

    this.lookupTable.delete();
    this.lookupTable = null;
  }

  update(props, previous) {
    const {
      cubeAxesStyle,
      showCubeAxes,
      actor,
      mapper,
      property,
      colorMapPreset,
      colorDataRange,
    } = props;
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

    if (showCubeAxes && this.cubeAxes == null) {
      this.initCubeAxes();

      if (
        cubeAxesStyle &&
        (!previous || cubeAxesStyle !== previous.cubeAxesStyle)
      ) {
        this.cubeAxes.set(cubeAxesStyle);
      }
    }

    if (
      this.cubeAxes != null &&
      showCubeAxes !== this.cubeAxes.getVisibility()
    ) {
      this.cubeAxes.setVisibility(showCubeAxes && this.validData);
      this.cubeAxes
        .getActors()
        .forEach(({ setVisibility }) =>
          setVisibility(showCubeAxes && this.validData)
        );
    }

    // scalar bars
    this.scalarBar.setVisibility(props.showScalarBar && this.validData);
    this.scalarBar.setAxisLabel(props.scalarBarTitle);
    this.scalarBar.set(props.scalarBarStyle || {});

    // actor visibility
    if (actor && actor.visibility !== undefined) {
      this.currentVisibility = actor.visibility;
      this.actor.setVisibility(this.currentVisibility && this.validData);
    }

    // trigger render
    this.dataChanged();
  }

  dataAvailable() {
    if (!this.validData) {
      this.validData = true;
      this.actor.setVisibility(this.currentVisibility);
      this.scalarBar.setVisibility(this.props.showScalarBar);
      if (this.cubeAxes) {
        this.cubeAxes.setVisibility(this.props.showCubeAxes);
        this.cubeAxes
          .getActors()
          .forEach(({ setVisibility }) =>
            setVisibility(this.props.showCubeAxes)
          );
      }
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
  showCubeAxes: false,
  showScalarBar: false,
  scalarBarTitle: '',
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

  /**
   * Show/Hide Cube Axes for the given representation
   */
  showCubeAxes: PropTypes.bool,

  /**
   * Configure cube Axes style by overriding the set of properties defined
   * https://github.com/Kitware/vtk-js/blob/HEAD/Sources/Rendering/Core/CubeAxesActor/index.js#L703-L719
   */
  cubeAxesStyle: PropTypes.object,

  /**
   * Show hide scalar bar for that representation
   */
  showScalarBar: PropTypes.bool,

  /**
   * Use given string as title for scalar bar. By default it is empty (no title).
   */
  scalarBarTitle: PropTypes.string,

  /**
   * Configure scalar bar style by overriding the set of properties defined
   * https://github.com/Kitware/vtk-js/blob/master/Sources/Rendering/Core/ScalarBarActor/index.js#L776-L796
   */
  scalarBarStyle: PropTypes.object,

  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
};
