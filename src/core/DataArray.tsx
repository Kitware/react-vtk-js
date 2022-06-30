import React, { Component } from 'react';

import { toTypedArray } from '../utils';

import { DataSetContext, FieldsContext } from './View';
import vtkDataArray from '@kitware/vtk.js/Common/Core/DataArray.js';
import { TYPED_ARRAYS } from '@kitware/vtk.js/macros.js';

interface DataArrayProps {
  /**
   * The ID used to identify this component.
   */
  id?: string;
  /**
   * Typed array name
   */
  type?: string;
  /**
   * Field name
   */
  name?: string;
  /**
   * Actual values to use inside our array ([] | TypedArray | { bvals, dtype, shape })
   */
  values?:
    | number[]
    | object
    | Float64Array
    | Float32Array
    | Int32Array
    | Int16Array
    | Int8Array
    | Uint32Array
    | Uint16Array
    | Uint8Array;
  /**
   * Number of components / Tuple size
   */
  numberOfComponents?: number;
  /**
   * Name of the method to call on the fieldData (addArray, setScalars, setVectors...)
   */
  registration?: string;
}

/**
 * DataArray is creating a vtkDataArray for the container fields
 * It takes the following set of properties:
 *   - type: 'Float32Array', 'Float64Array', 'Uint16Array', ...
 *   - values: [number, number, ...]
 *   - numberOfComponents: 1,
 *   - registration: 'addArray', 'setScalars', ...
 */
export default class DataArray extends Component<DataArrayProps> {
  static defaultProps = {
    name: 'scalars',
    type: 'Float32Array',
    values: [],
    numberOfComponents: 1,
    registration: 'addArray',
  };

  constructor(props) {
    super(props);

    // Create vtk.js data array
    this.array = vtkDataArray.newInstance({ name: 'scalars', empty: true });
    this.arrayAttached = false;
  }

  render() {
    return (
      <DataSetContext.Consumer>
        {(dataset) => {
          this.dataset = dataset;
          return (
            <FieldsContext.Consumer>
              {(fields) => {
                if (!this.fields) {
                  this.fields = fields;
                }
                return <div key={this.props.id} name={this.props.name} />;
              }}
            </FieldsContext.Consumer>
          );
        }}
      </DataSetContext.Consumer>
    );
  }

  componentDidMount() {
    this.update(this.props);
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    this.update(this.props, prevProps);
  }

  componentWillUnmount() {
    this.fields.removeArray(this.array);
    this.array.delete();
    this.array = null;
  }

  update(props, previous) {
    const { name, type, values, numberOfComponents } = props;
    const klass = TYPED_ARRAYS[type];
    let changeDetected = false;

    // NoOp if same...
    this.array.setName(name);

    if (type && (!previous || type !== previous.type)) {
      changeDetected = true;
    }

    if (
      numberOfComponents &&
      (!previous || numberOfComponents !== previous.numberOfComponents)
    ) {
      changeDetected = true;
    }

    if (values && (changeDetected || !previous || values !== previous.values)) {
      this.array.setData(toTypedArray(values, klass), numberOfComponents);
      changeDetected = true;
    }

    if (!this.arrayAttached) {
      this.fields[this.props.registration](this.array);
      this.arrayAttached = true;
      changeDetected = true;
    }

    if (changeDetected) {
      if (this.dataset) {
        this.dataset.modified();
      }
    }
  }
}
