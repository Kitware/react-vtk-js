import React, { Component } from 'react';
import PropTypes from 'prop-types';

import {
  RepresentationContext,
  DownstreamContext,
  DataSetContext,
} from './View';

/**
 * The Dataset component exposes any input data object to a downstream filter.
 * It allows you to set the input data instance directly through props.data,
 * or through the async/lazy loading mechanism using a callback function
 * props.fetchData().
 * It takes the following set of properties:
 *   - data: directly sets the input data instance.
 *   - fetchData: callback function to fetch input data asynchronously.
 */
export default class Dataset extends Component {
  componentDidMount() {
    if (this.dataset && !this.dataset.isDeleted()) {
      // data already available
      this.dataAvailable();
    } else {
      // update data from current props
      const prevProps = { data: null, fetchData: null };
      this.update(this.props, prevProps);
    }
  }

  componentWillUnmount() {}

  render() {
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
                <DataSetContext.Provider value={this}>
                  <div key={this.props.id} id={this.props.id}>
                    {this.props.children}
                  </div>
                </DataSetContext.Provider>
              );
            }}
          </DownstreamContext.Consumer>
        )}
      </RepresentationContext.Consumer>
    );
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    this.update(this.props, prevProps);
  }

  update(props, previous) {
    const { data, fetchData } = props;
    if (data && data !== previous.data) {
      // direct assignment of data object
      this.dataset = data;
      this.dataAvailable();
    } else if (fetchData && fetchData !== previous.fetchData) {
      // async fetch data
      fetchData().then((response) => {
        if (response) {
          this.dataset = response;
          this.dataAvailable();
        }
      });
    }
  }

  dataAvailable() {
    if (this.downstream && this.dataset) {
      this.downstream.setInputData(this.dataset);
    }

    if (this.representation) {
      this.representation.dataAvailable();
      this.representation.dataChanged();
    }
  }
}

Dataset.defaultProps = {
  data: null,
  fetchData: null,
};

Dataset.propTypes = {
  /**
   * The ID used to identify this component.
   */
  id: PropTypes.string,

  /**
   * Directly set the dataset object as a property value.
   */
  data: PropTypes.object,

  /**
   * Optional callback function for async loading of input data.
   */
  fetchData: PropTypes.func,

  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
};
