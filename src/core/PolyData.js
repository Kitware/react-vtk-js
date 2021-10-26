import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { toTypedArray, smartEqualsShallow } from '../utils';

import {
  RepresentationContext,
  DownstreamContext,
  DataSetContext,
} from './View';

import vtkPolyData from '@kitware/vtk.js/Common/DataModel/PolyData.js';

/**
 * PolyData is exposing a vtkPolyData to a downstream filter
 * It takes the following set of properties:
 *   - points: [x, y, z, x, y, z, ...],
 *   - verts: [cellSize, pointId0, pointId1, ..., cellSize, pointId0, ...]
 *   - lines: [cellSize, pointId0, pointId1, ..., cellSize, pointId0, ...]
 *   - polys: [cellSize, pointId0, pointId1, ..., cellSize, pointId0, ...]
 *   - strips: [cellSize, pointId0, pointId1, ..., cellSize, pointId0, ...]
 * Cell connectivity helper property:
 *   - connectivity: 'manual', // [manual, points, triangles, strips]
 */
export default class PolyData extends Component {
  constructor(props) {
    super(props);

    // Create vtk.js polydata
    this.polydata = vtkPolyData.newInstance();
  }

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

  componentDidMount() {
    this.update(this.props);
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    this.update(this.props, prevProps);
  }

  componentWillUnmount() {
    this.polydata.delete();
    this.polydata = null;
  }

  update(props, previous) {
    const { connectivity, points, verts, lines, polys, strips } = props;
    let changeDetected = false;
    let typedArray = Uint32Array;

    if (points && (!previous || !smartEqualsShallow(points, previous.points))) {
      const array = toTypedArray(points, Float64Array);
      this.polydata.getPoints().setData(array, 3);
      changeDetected = true;

      // Adapt cell size
      // Max cell size for uint16 is 655356*3=196608.
      // switch to uint32array if this is the case.
      typedArray = array.length > 196608 ? Uint32Array : Uint16Array;
    }

    if (verts && (!previous || !smartEqualsShallow(verts, previous.verts))) {
      this.polydata.getVerts().setData(toTypedArray(verts, typedArray));
      changeDetected = true;
    }

    if (lines && (!previous || !smartEqualsShallow(lines, previous.lines))) {
      this.polydata.getLines().setData(toTypedArray(lines, typedArray));
      changeDetected = true;
    }

    if (polys && (!previous || !smartEqualsShallow(polys, previous.polys))) {
      this.polydata.getPolys().setData(toTypedArray(polys, typedArray));
      changeDetected = true;
    }

    if (strips && (!previous || !smartEqualsShallow(strips, previous.strips))) {
      this.polydata.getStrips().setData(toTypedArray(strips, typedArray));
      changeDetected = true;
    }

    if (
      connectivity &&
      (!previous ||
        points?.length !== previous.points?.length ||
        connectivity !== previous.connectivity)
    ) {
      const nbPoints = points.length / 3;
      switch (connectivity) {
        case 'points':
          {
            const values = new Uint32Array(nbPoints + 1);
            values[0] = nbPoints;
            for (let i = 0; i < nbPoints; i++) {
              values[i + 1] = i;
            }
            this.polydata.getVerts().setData(values);
            changeDetected = true;
          }
          break;
        case 'triangles':
          {
            const values = new Uint32Array(nbPoints + nbPoints / 3);
            let offset = 0;
            for (let i = 0; i < nbPoints; i += 3) {
              values[offset++] = 3;
              values[offset++] = i + 0;
              values[offset++] = i + 1;
              values[offset++] = i + 2;
            }
            this.polydata.getPolys().setData(values);
            changeDetected = true;
          }
          break;
        case 'strips':
          {
            const values = new Uint32Array(nbPoints + 1);
            values[0] = nbPoints;
            for (let i = 0; i < nbPoints; i++) {
              values[i + 1] = i;
            }
            this.polydata.getStrips().setData(values);
            changeDetected = true;
          }
          break;
        default:
        // do nothing for manual or anything else...
      }
    }

    if (changeDetected) {
      this.modified();
    }
  }

  getDataSet() {
    return this.polydata;
  }

  modified() {
    this.polydata.modified();
    this.downstream.setInputData(this.polydata, this.props.port);

    // Let the representation know that we have data
    if (this.representation && this.polydata.getPoints().getData().length) {
      this.representation.dataAvailable();
      this.representation.dataChanged();
    }
  }
}

PolyData.defaultProps = {
  port: 0,
  points: [],
  connectivity: 'manual',
};

PolyData.propTypes = {
  /**
   * The ID used to identify this component.
   */
  id: PropTypes.string,

  /**
   * downstream connection port
   */
  port: PropTypes.number,

  /**
   * xyz coordinates ([] | TypedArray | { bvals, dtype, shape })
   */
  points: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.number),
    PropTypes.object,
    PropTypes.instanceOf(Float64Array),
    PropTypes.instanceOf(Float32Array),
  ]),

  /**
   * verts cells
   */
  verts: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.number),
    PropTypes.object,
    PropTypes.instanceOf(Uint8Array),
    PropTypes.instanceOf(Uint16Array),
    PropTypes.instanceOf(Uint32Array),
  ]),

  /**
   * lines cells
   */
  lines: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.number),
    PropTypes.object,
    PropTypes.instanceOf(Uint8Array),
    PropTypes.instanceOf(Uint16Array),
    PropTypes.instanceOf(Uint32Array),
  ]),

  /**
   * polys cells
   */
  polys: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.number),
    PropTypes.object,
    PropTypes.instanceOf(Uint8Array),
    PropTypes.instanceOf(Uint16Array),
    PropTypes.instanceOf(Uint32Array),
  ]),

  /**
   * strips cells
   */
  strips: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.number),
    PropTypes.object,
    PropTypes.instanceOf(Uint8Array),
    PropTypes.instanceOf(Uint16Array),
    PropTypes.instanceOf(Uint32Array),
  ]),

  /**
   * Type of connectivity `manual` or implicit such as `points`, `triangles`, `strips`
   */
  connectivity: PropTypes.string,

  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
};
