import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { DownstreamContext } from './View';

import vtkCalculator from 'vtk.js/Sources/Filters/General/Calculator';
import vtkDataSet from 'vtk.js/Sources/Common/DataModel/DataSet';

const { FieldDataTypes } = vtkDataSet;
/**
 * Calculator is exposing a source or filter to a downstream filter
 * It takes the following set of properties:
 *   - name: 'scalars'    // name of the generated field
 *   - location: 'POINT'  // POINT/CELL
 *   - arrays: []         // Name of array to have access in formula
 *   - formula: fn
 */
export default class Calculator extends Component {
  constructor(props) {
    super(props);

    // Create vtk.js Calculator
    this.calculator = vtkCalculator.newInstance();
  }

  render() {
    const { name, arrays, location, formula } = this.props;
    this.calculator.setFormulaSimple(
      FieldDataTypes[location],
      arrays,
      name,
      formula,
    );
    return (
      <DownstreamContext.Consumer>
        {(downstream) => {
          if (!this.downstream) {
            downstream.setInputConnection(this.calculator.getOutputPort(), this.props.port);
            this.downstream = downstream;
          }
          return (
            <DownstreamContext.Provider value={this.calculator}>
              <div key={this.props.id} id={this.props.id}>
                {this.props.children}
              </div>
            </DownstreamContext.Provider>
          );
        }}
      </DownstreamContext.Consumer>
    );
  }

  componentWillUnmount() {
    this.calculator.delete();
    this.calculator = null;
  }
}

Calculator.defaultProps = {
  port: 0,
  name: 'scalars',
  location: 'POINT',
  arrays: [],
  formula: (xyz) => xyz[0],
};

Calculator.propTypes = {
  /**
   * The ID used to identify this component.
   */
  id: PropTypes.string,

  /**
   * downstream connection port
   */
  port: PropTypes.number,

  /**
   * Field name
   */
  name: PropTypes.string,

  /**
   * Field location [POINT, CELL, COORDINATE, SCALARS, ]
   */
  location: PropTypes.string,

  /**
   * List of fields you want available for your formula
   */
  arrays: PropTypes.arrayOf(PropTypes.string),

  /**
   * Field formula
   */
  formula: PropTypes.func,

  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node
  ]),
};
