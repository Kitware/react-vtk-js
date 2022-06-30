import React, { Component } from 'react';

import { RepresentationContext, DownstreamContext } from './View';
import { smartEqualsShallow } from '../utils';

import vtk from '@kitware/vtk.js/vtk.js';

interface AlgorithmProps {
  /**
   * The ID used to identify this component.
   */
  id?: string;
  /**
   * downstream connection port
   */
  port?: number;
  /**
   * vtkClass name
   */
  vtkClass?: string;
  /**
   * set of property values for vtkClass
   */
  state?: object;
  children?: React.ReactNode[] | React.ReactNode;
}

/**
 * Algorithm is exposing a source or filter to a downstream filter
 * It takes the following set of properties:
 *   - vtkClass: vtkClassName
 *   - state: {}
 */
export default class Algorithm extends Component<AlgorithmProps> {
  algo: IvtkObject | null;
  downstream: IvtkObject | undefined;
  representation: IvtkObject | undefined;

  static defaultProps = {
    port: 0,
    vtkClass: 'vtkConeSource',
    state: {},
  };

  constructor(props: AlgorithmProps) {
    super(props);

    // Create vtk.js algorithm
    this.algo = null;
  }

  render() {
    return (
      <RepresentationContext.Consumer>
        {(representation) => (
          <DownstreamContext.Consumer>
            {(downstream) => {
              if (representation == null) return null;

              this.representation = representation;
              if (!this.algo) {
                const { vtkClass, state } = this.props;
                this.algo = vtk({ vtkClass, ...state });
              }
              if (!this.downstream && downstream != null) {
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
        )}
      </RepresentationContext.Consumer>
    );
  }

  componentDidMount() {
    this.update(this.props);
  }

  componentDidUpdate(prevProps: AlgorithmProps) {
    this.update(this.props, prevProps);
  }

  componentWillUnmount() {
    this.algo.delete();
    this.algo = null;
  }

  update(props: AlgorithmProps, previous: AlgorithmProps | void) {
    const { vtkClass, state } = props;

    if (vtkClass && (!previous || vtkClass !== previous.vtkClass)) {
      if (!this.algo) {
        this.algo = vtk({ vtkClass, ...state });
      } else if (this.algo.getClassName() !== vtkClass) {
        const prevAlgo = this.algo;
        this.algo = vtk({ vtkClass, ...state });
        const nbInputs = prevAlgo.getNumberOfInputPorts();
        for (let i = 0; i < nbInputs; i++) {
          const connnection = prevAlgo.getInputConnection(i);
          if (connnection) {
            this.algo.setInputConnection(connnection, i);
          } else {
            this.algo.setInputData(prevAlgo.getInputData(i), i);
          }
        }
      }

      this.downstream.setInputConnection(
        this.algo.getOutputPort(),
        this.props.port
      );
    }

    if (state && (!previous || !smartEqualsShallow(state, previous.state))) {
      this.algo.set(state);
      if (this.representation) {
        this.representation.dataChanged();
      }
    }

    if (this.algo.getNumberOfInputPorts() === 0) {
      if (this.representation) {
        this.representation.dataAvailable();
      }
    }
  }
}
