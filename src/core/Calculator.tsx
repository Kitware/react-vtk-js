import React, { Component } from 'react';

import { DownstreamContext } from './View';

import vtkCalculator from '@kitware/vtk.js/Filters/General/Calculator.js';
import vtkDataSet from '@kitware/vtk.js/Common/DataModel/DataSet.js';

const { FieldDataTypes } = vtkDataSet;

interface CalculatorProps {
  /**
   * The ID used to identify this component.
   */
  id?: string;
  /**
   * downstream connection port
   */
  port?: number;
  /**
   * Field name
   */
  name?: string;
  /**
   * Field location [POINT, CELL, COORDINATE, SCALARS, ]
   */
  location?: string;
  /**
   * List of fields you want available for your formula
   */
  arrays?: string[];
  /**
   * Field formula
   */
  formula?(...args: unknown[]): unknown;
  children?: React.ReactNode[] | React.ReactNode;
}

/**
 * Calculator is exposing a source or filter to a downstream filter
 * It takes the following set of properties:
 *   - name: 'scalars'    // name of the generated field
 *   - location: 'POINT'  // POINT/CELL
 *   - arrays: []         // Name of array to have access in formula
 *   - formula: fn
 */
export default class Calculator extends Component<CalculatorProps> {
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
      formula
    );
    return (
      <DownstreamContext.Consumer>
        {(downstream) => {
          if (!this.downstream) {
            downstream.setInputConnection(
              this.calculator.getOutputPort(),
              this.props.port
            );
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
