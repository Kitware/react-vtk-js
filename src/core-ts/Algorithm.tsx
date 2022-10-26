import { vtkAlgorithm, vtkObject } from '@kitware/vtk.js/interfaces';
import vtk from '@kitware/vtk.js/vtk';
import { PropsWithChildren, useCallback, useEffect } from 'react';
import { VtkConstructor } from '../types';
import useGetterRef from '../utils-ts/useGetterRef';
import useUnmount from '../utils-ts/useUnmount';
import {
  DownstreamContext,
  useDownstream,
  useRepresentation,
} from './contexts';

interface Props extends PropsWithChildren {
  /**
   * Can either be a string containing the name of the vtkClass or a vtk object constructor.
   *
   * If a string, then that vtk class must be registered (i.e. by import).
   */
  vtkClass: string | VtkConstructor;
  /**
   * The properties and state object to pass to the algorithm.
   */
  state?: Record<string, unknown>;
  /**
   * An optional port number for connections.
   */
  port?: number;
}

export default function Algorithm(props: Props) {
  const { vtkClass, state, port = 0 } = props;

  const createAlgo = useCallback(() => {
    if (typeof vtkClass === 'string') {
      return vtk({ vtkClass, ...state }) as vtkAlgorithm & vtkObject;
    }
    return vtkClass.newInstance(state) as vtkAlgorithm & vtkObject;
  }, [vtkClass, state]);

  const [algoRef, getAlgorithm] = useGetterRef(() => createAlgo());

  const representation = useRepresentation();
  const getDownstream = useDownstream();

  useEffect(() => {
    let algoChanged = false;

    if (!algoRef.current) {
      algoRef.current = createAlgo();
      algoChanged = true;
    } else if (algoRef.current.getClassName() !== vtkClass) {
      const curAlgo = algoRef.current;
      const newAlgo = createAlgo();

      // copy connections over from current algorithm
      const nbInputs = curAlgo.getNumberOfInputPorts();
      for (let i = 0; i < nbInputs; i++) {
        const connection = curAlgo.getInputConnection(i);
        if (connection) {
          newAlgo.setInputConnection(connection, i);
        } else {
          newAlgo.setInputData(curAlgo.getInputData(i), i);
        }
      }

      algoRef.current = newAlgo;
      curAlgo.delete();
      algoChanged = true;
    } else if (state) {
      const modified = algoRef.current.set(state);
      if (modified) {
        representation.dataChanged();
      }
    }

    if (algoChanged) {
      getDownstream().setInputConnection(algoRef.current.getOutputPort(), port);
      // if a source algo, then it already produces data
      if (algoRef.current.getNumberOfInputPorts() === 0) {
        representation.dataAvailable();
      }
    }
  }, [
    vtkClass,
    state,
    port,
    createAlgo,
    algoRef,
    representation,
    getDownstream,
  ]);

  useUnmount(() => {
    if (algoRef.current) {
      algoRef.current.delete();
      algoRef.current = null;
    }
  });

  return (
    <DownstreamContext.Provider value={getAlgorithm}>
      {props.children}
    </DownstreamContext.Provider>
  );
}
