import vtkDataSet from '@kitware/vtk.js/Common/DataModel/DataSet';
import vtkDataSetAttributes from '@kitware/vtk.js/Common/DataModel/DataSetAttributes';
import vtkFieldData from '@kitware/vtk.js/Common/DataModel/DataSetAttributes/FieldData';
import { Nullable } from '@kitware/vtk.js/types';
import { createContext, useContext } from 'react';
import {
  IDataset,
  IDownstream,
  IRepresentation,
  IShareDataset,
  IView,
} from '../types';

export const FieldDataContext =
  createContext<Nullable<() => vtkDataSetAttributes | vtkFieldData>>(null);

export function useFieldData<T = vtkFieldData>() {
  const fd = useContext(FieldDataContext);
  if (!fd) throw new Error('No field data context!');
  return fd as () => T;
}

export const DatasetContext = createContext<Nullable<IDataset<unknown>>>(null);

export function useDataset<T = vtkDataSet>() {
  const ds = useContext(DatasetContext);
  if (!ds) throw new Error('No dataset context!');
  return ds as IDataset<T>;
}

export const ViewContext = createContext<Nullable<IView>>(null);

export function useView() {
  const view = useContext(ViewContext);
  if (!view) throw new Error('No view context!');
  return view;
}

export const RepresentationContext =
  createContext<Nullable<IRepresentation>>(null);

export function useRepresentation() {
  const rep = useContext(RepresentationContext);
  if (!rep) throw new Error('No representation context!');
  return rep;
}
export const DownstreamContext =
  createContext<Nullable<() => IDownstream>>(null);

export function useDownstream() {
  const ds = useContext(DownstreamContext);
  if (!ds) throw new Error('No downstream context!');
  return ds;
}

export const ShareDataSetContext = createContext<Nullable<IShareDataset>>(null);

export function useShareDataSet() {
  const share = useContext(ShareDataSetContext);
  if (!share) throw new Error('No ShareDataSet context!');
  return share;
}
