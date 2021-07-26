import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { ViewContext, RepresentationContext, DownstreamContext } from './View';

import vtk from '@kitware/vtk.js/vtk.js';
import Base64 from '@kitware/vtk.js/Common/Core/Base64.js';

/**
 * Reader is exposing a reader to a downstream filter
 * It takes the following set of properties:
 *   - vtkClass: vtk.js reader class name
 *   - url: string
 *   - parseAsText: string
 *   - parseAsArrayBuffer: base64String
 */
export default class Reader extends Component {
  constructor(props) {
    super(props);

    // Create vtk.js algorithm
    this.reader = null;
  }

  render() {
    return (
      <ViewContext.Consumer>
        {(view) => (
          <RepresentationContext.Consumer>
            {(representation) => {
              this.representation = representation;
              return (
                <DownstreamContext.Consumer>
                  {(downstream) => {
                    if (!this.reader) {
                      this.reader = this.createReader(this.props);
                    }
                    if (!this.downstream) {
                      downstream.setInputConnection(
                        this.reader.getOutputPort(),
                        this.props.port
                      );
                      this.downstream = downstream;
                    }
                    this.view = view;
                    return (
                      <DownstreamContext.Provider value={this.reader}>
                        <div key={this.props.id} id={this.props.id}>
                          {this.props.children}
                        </div>
                      </DownstreamContext.Provider>
                    );
                  }}
                </DownstreamContext.Consumer>
              );
            }}
          </RepresentationContext.Consumer>
        )}
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
    this.reader.delete();
    this.reader = null;
  }

  createReader(props) {
    const { vtkClass, options } = props;
    return vtk({
      vtkClass,
      progressCallback: options.progressCallback,
    });
  }

  update(props, previous) {
    const { vtkClass, url, parseAsText, parseAsArrayBuffer, options } = props;

    if (vtkClass && (!previous || vtkClass !== previous.vtkClass)) {
      this.reader = this.createReader(props);
      this.downstream.setInputConnection(
        this.reader.getOutputPort(),
        this.props.port
      );
    }

    if (url && (!previous || url !== previous.url)) {
      this.reader.setUrl(url, options).then(() => {
        if (!this.reader) {
          return;
        }
        if (this.representation) {
          this.representation.dataAvailable();
        }
        if (this.view) {
          if (this.props.resetCameraOnUpdate) {
            this.view.resetCamera();
          }
          if (this.props.renderOnUpdate) {
            this.view.renderView();
          }
        }
      });
    }

    if (parseAsText && (!previous || parseAsText !== previous.parseAsText)) {
      this.reader.parseAsText(parseAsText);
      if (this.representation) {
        this.representation.dataAvailable();
      }
    }

    if (
      parseAsArrayBuffer &&
      (!previous || parseAsArrayBuffer !== previous.parseAsArrayBuffer)
    ) {
      this.reader.parseAsArrayBuffer(Base64.toArrayBuffer(parseAsArrayBuffer));
      if (this.representation) {
        this.representation.dataAvailable();
      }
    }

    if (this.view) {
      if (this.props.resetCameraOnUpdate) {
        this.view.resetCamera();
      }
      if (this.props.renderOnUpdate) {
        this.view.renderView();
      }
    }
  }
}

Reader.defaultProps = {
  port: 0,
  vtkClass: '',
  renderOnUpdate: true,
  resetCameraOnUpdate: true,
  options: { binary: true },
};

Reader.propTypes = {
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
   * set of url to fetch data from
   */
  url: PropTypes.string,

  /**
   * set text data to process
   */
  parseAsText: PropTypes.string,

  /**
   * set binary data to process from base64 string
   */
  parseAsArrayBuffer: PropTypes.string,

  /**
   * Automatically render on data loaded
   */
  renderOnUpdate: PropTypes.bool,

  /**
   * Automatically reset camera on data loaded
   */
  resetCameraOnUpdate: PropTypes.bool,

  /**
   * Reader options
   */
  options: PropTypes.object,

  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
};
