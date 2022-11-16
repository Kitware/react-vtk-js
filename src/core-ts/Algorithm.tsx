import { vtkAlgorithm, vtkObject } from '@kitware/vtk.js/interfaces';
import vtk from '@kitware/vtk.js/vtk';
import { PropsWithChildren, useCallback, useEffect, useMemo } from 'react';
import { IDownstream, VtkConstructor } from '../types';
import deletionRegistry from '../utils-ts/DeletionRegistry';
import useGetterRef from '../utils-ts/useGetterRef';
import { usePrevious } from '../utils-ts/usePrevious';
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
  const prev = usePrevious(props);
  const { vtkClass, state, port = 0 } = props;

  const createAlgo = useCallback(() => {
    if (typeof vtkClass === 'string') {
      return vtk({ vtkClass, ...state }) as vtkAlgorithm & vtkObject;
    }
    return vtkClass.newInstance(state) as vtkAlgorithm & vtkObject;
  }, [vtkClass, state]);

  const [algoRef, getAlgorithm] = useGetterRef(() => {
    const algo = createAlgo();
    deletionRegistry.register(algo, () => algo.delete());
    return algo;
  });

  const representation = useRepresentation();
  const downstream = useDownstream();

  useEffect(() => {
    let algoChanged = false;

    if (!algoRef.current) {
      algoRef.current = createAlgo();
      algoChanged = true;
    } else if (vtkClass !== prev?.vtkClass) {
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
      deletionRegistry.markForDeletion(curAlgo);
      algoChanged = true;
    } else if (state) {
      const modified = algoRef.current.set(state);
      if (modified) {
        representation.dataChanged();
      }
    }

    if (algoChanged) {
      downstream.setInputConnection(algoRef.current.getOutputPort(), port);
      // if a source algo, then it already produces data
      if (algoRef.current.getNumberOfInputPorts() === 0) {
        representation.dataAvailable();
      }
    }
  }, [
    prev,
    vtkClass,
    state,
    port,
    createAlgo,
    algoRef,
    representation,
    downstream,
  ]);

  useUnmount(() => {
    if (algoRef.current) {
      deletionRegistry.markForDeletion(algoRef.current);
      algoRef.current = null;
    }
  });

  const fwdDownstream = useMemo<IDownstream>(
    () => ({
      setInputData: (...args) => getAlgorithm().setInputData(...args),
      setInputConnection: (...args) =>
        getAlgorithm().setInputConnection(...args),
    }),
    [getAlgorithm]
  );

  return (
    <DownstreamContext.Provider value={fwdDownstream}>
      {props.children}
    </DownstreamContext.Provider>
  );
}
