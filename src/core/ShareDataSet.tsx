/**
 * <ShareDataSetRoot>
 *   <RegisterDataSet id="something">
 *   </RegisterDataSet>
 *   <Representation>
 *     <UseDataSet id="something">
 *   </Rep>
 * </ShareDataSetRoot>
 */

import { vtkObject } from '@kitware/vtk.js/interfaces';
import {
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import {
  DataCallback,
  IDownstream,
  IRepresentation,
  IShareDataset,
} from '../types';
import useUnmount from '../utils/useUnmount';
import {
  DownstreamContext,
  RepresentationContext,
  ShareDataSetContext,
  useDownstream,
  useRepresentation,
  useShareDataSet,
} from './contexts';

const DATA_AVAILABLE_EVENT = 'dataAvailable';
const DATA_CHANGED_EVENT = 'dataChanged';

interface DataEventDetails {
  name: string;
}

export function ShareDataSetRoot(props: PropsWithChildren) {
  const datasets = useRef<Map<string, unknown>>(new Map());
  const eventTarget = useRef(new EventTarget());
  // Used to notify UseDataSet components that register
  // after the DATA_AVAILABLE_EVENT occurs.
  const dataAvailable = useRef(new Set<string>());

  useUnmount(() => {
    datasets.current.clear();
    dataAvailable.current.clear();
  });

  type RegistrarOptions = {
    immediate: boolean | ((name: string) => boolean);
  };

  const createDataEventRegistrar = useCallback(
    (event: string, options?: RegistrarOptions) => {
      return function addListener(name: string, callback: DataCallback) {
        const invoke = () => {
          callback(datasets.current.get(name) ?? null);
        };

        const handler = (ev: Event) => {
          if (!(ev instanceof CustomEvent<DataEventDetails>)) return;
          if (name === ev.detail?.name) {
            invoke();
          }
        };

        let immediate = false;
        if (typeof options?.immediate === 'boolean') {
          immediate = options.immediate;
        } else if (options?.immediate instanceof Function) {
          immediate = options?.immediate(name);
        }

        if (immediate) {
          invoke();
        }

        eventTarget.current.addEventListener(event, handler);
        return () => {
          eventTarget.current.removeEventListener(event, handler);
        };
      };
    },
    []
  );

  const share = useMemo<IShareDataset>(
    () => ({
      register(name: string, dataset: unknown) {
        datasets.current.set(name, dataset);
      },
      unregister(name: string) {
        datasets.current.delete(name);
        dataAvailable.current.delete(name);
      },

      dispatchDataAvailable(name: string) {
        dataAvailable.current.add(name);
        eventTarget.current.dispatchEvent(
          new CustomEvent<DataEventDetails>(DATA_AVAILABLE_EVENT, {
            detail: { name },
          })
        );
      },
      dispatchDataChanged(name: string) {
        eventTarget.current.dispatchEvent(
          new CustomEvent<DataEventDetails>(DATA_CHANGED_EVENT, {
            detail: { name },
          })
        );
      },

      onDataChanged: createDataEventRegistrar(DATA_CHANGED_EVENT),
      onDataAvailable: createDataEventRegistrar(DATA_AVAILABLE_EVENT, {
        immediate(name) {
          return dataAvailable.current.has(name);
        },
      }),
    }),
    [createDataEventRegistrar]
  );

  return (
    <ShareDataSetContext.Provider value={share}>
      {props.children}
    </ShareDataSetContext.Provider>
  );
}

export interface RegisterDataSetProps extends PropsWithChildren {
  id: string;
}

export function RegisterDataSet(props: RegisterDataSetProps) {
  const share = useShareDataSet();
  const { id } = props;

  // --- handle registrations --- //

  useEffect(
    () => () => {
      share.unregister(id);
    },
    [id, share]
  );

  useUnmount(() => {
    share.unregister(id);
  });

  // --- //

  const downstream = useMemo<IDownstream>(
    () => ({
      setInputData(obj) {
        share.register(id, obj);
      },
      setInputConnection(conn) {
        downstream.setInputData(conn());
      },
    }),
    [id, share]
  );

  const mockRepresentation = useMemo<IRepresentation>(
    () => ({
      dataChanged() {
        share.dispatchDataChanged(id);
      },
      dataAvailable() {
        share.dispatchDataAvailable(id);
      },
      getActor: () => null,
      getMapper: () => null,
    }),
    [id, share]
  );

  return (
    <RepresentationContext.Provider value={mockRepresentation}>
      <DownstreamContext.Provider value={downstream}>
        {props.children}
      </DownstreamContext.Provider>
    </RepresentationContext.Provider>
  );
}

export interface UseDataSetProps extends PropsWithChildren {
  id: string;
  port?: number;
}

export function UseDataSet(props: UseDataSetProps) {
  const { id, port = 0 } = props;
  const share = useShareDataSet();
  // TODO if useDataSet is input to an algorithm, should representation be null?
  const representation = useRepresentation();
  const downstream = useDownstream();

  useEffect(() => {
    return share.onDataAvailable(id, (ds) => {
      downstream.setInputData(ds as vtkObject, port);
      representation.dataAvailable(!!ds);
    });
  }, [id, port, representation, downstream, share]);

  useEffect(() => {
    return share.onDataChanged(id, () => {
      representation.dataChanged();
    });
  }, [id, representation, share]);

  return null;
}
