import React, { Component } from 'react';
import PropTypes from 'prop-types';

import macro from '@kitware/vtk.js/macro.js';

import { RepresentationContext, DownstreamContext } from './View';

function vtkTrivialProducer(publicAPI, model) {
  // Set our className
  model.classHierarchy.push('vtkTrivialProducer');

  publicAPI.requestData = (inputs, outputs) => {
    outputs.length = inputs.length;
    for (let i = 0; i < inputs.length; i++) {
      outputs[i] = inputs[i];
    }
  };
}

function extend(publicAPI, model, initialValues = {}) {
  Object.assign(model, initialValues);

  // Inheritance
  macro.obj(publicAPI, model);
  macro.algo(publicAPI, model, 1, 1);
  macro.event(publicAPI, model, 'DataAvailable');
  vtkTrivialProducer(publicAPI, model);
}

// ----------------------------------------------------------------------------

const newInstance = macro.newInstance(extend, 'vtkTrivialProducer');

const SHARED_INSTANCES = {};

/**

 */
export default class ShareDataSet extends Component {
  getTrivialProducer() {
    let trivialProducer = SHARED_INSTANCES[this.props.name];
    if (!trivialProducer) {
      trivialProducer = newInstance();
      SHARED_INSTANCES[this.props.name] = trivialProducer;
    }
    return trivialProducer;
  }

  componentWillUnmount() {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
  }

  render() {
    this.update();
    return (
      <RepresentationContext.Consumer>
        {(representation) => (
          <DownstreamContext.Consumer>
            {(downstream) => {
              this.representation = representation;
              if (!this.downstream) {
                this.downstream = downstream;
              }
              return (
                <RepresentationContext.Provider value={this}>
                  <DownstreamContext.Provider value={this.getTrivialProducer()}>
                    <div key={this.props.id} id={this.props.id}>
                      {this.props.children}
                    </div>
                  </DownstreamContext.Provider>
                </RepresentationContext.Provider>
              );
            }}
          </DownstreamContext.Consumer>
        )}
      </RepresentationContext.Consumer>
    );
  }

  update() {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }

    this.subscription = this.getTrivialProducer().onDataAvailable(() => {
      this.dataAvailable();
    });
  }

  dataAvailable() {
    if (this.downstream) {
      this.downstream.setInputConnection(
        this.getTrivialProducer().getOutputPort(),
        this.props.port
      );
    }

    if (!this.validData) {
      this.validData = true;
      this.getTrivialProducer().invokeDataAvailable();
    }

    if (this.representation) {
      this.representation.dataAvailable();
    }
  }

  dataChanged() {
    if (this.representation) {
      this.representation.dataChanged();
    }
  }
}

ShareDataSet.defaultProps = {
  port: 0,
  name: 'shared',
};

ShareDataSet.propTypes = {
  /**
   * The ID used to identify this component.
   */
  id: PropTypes.string,

  /**
   * downstream connection port
   */
  port: PropTypes.number,

  /**
   * Unique dataset name to cross reference
   */
  name: PropTypes.string,

  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
};
