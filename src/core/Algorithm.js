import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { DownstreamContext } from './View';

import vtk from 'vtk.js/vtk.js';

/**
 * Algorithm is exposing a source or filter to a downstream filter
 * It takes the following set of properties:
 *   - vtkClass: vtkClassName
 *   - state: {}
 */
export default class Algorithm extends Component {
  constructor(props) {
    super(props);

    // Create vtk.js algorithm
    this.algo = null;
  }

  render() {
    return (
      <DownstreamContext.Consumer>
        {(downstream) => {
          if (!this.algo) {
            const { vtkClass, state } = this.props;
            this.algo = vtk({ vtkClass, ...state });
          }
          if (!this.downstream) {
            downstream.setInputConnection(
              this.algo.getOutputPort(),
              this.props.port
            );
            this.downstream = downstream;
          }
          return (
            <DownstreamContext.Provider value={this.algo}>
              <div key={this.props.id} id={this.props.id}>
                {this.props.children}
              </div>
            </DownstreamContext.Provider>
          );
        }}
      </DownstreamContext.Consumer>
    );
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    this.update(this.props, prevProps);
  }

  componentWillUnmount() {
    this.algo.delete();
    this.algo = null;
  }

  update(props, previous) {
    const { vtkClass, state } = props;

    if (vtkClass && (!previous || vtkClass !== previous.vtkClass)) {
      this.algo = vtk({ vtkClass, ...state });
      this.downstream.setInputConnection(
        this.algo.getOutputPort(),
        this.props.port
      );
    }

    if (state && (!previous || state !== previous.state)) {
      this.algo.set(state);
    }
  }
}

Algorithm.defaultProps = {
  port: 0,
  vtkClass: 'vtkConeSource',
  state: {},
};

Algorithm.propTypes = {
  /**
   * The ID used to identify this component.
   */
  id: PropTypes.string,

  /**
   * downstream connection port
   */
  port: PropTypes.number,

  /**
   * vtkClass name
   */
  vtkClass: PropTypes.string,

  /**
   * set of property values for vtkClass
   */
  state: PropTypes.object,

  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
};
