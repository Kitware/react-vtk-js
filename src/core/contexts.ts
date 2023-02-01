import vtkDataSet from '@kitware/vtk.js/Common/DataModel/DataSet';
import vtkDataSetAttributes from '@kitware/vtk.js/Common/DataModel/DataSetAttributes';
import vtkFieldData from '@kitware/vtk.js/Common/DataModel/DataSetAttributes/FieldData';
import { Nullable } from '@kitware/vtk.js/types';
import { createContext, useContext } from 'react';
import {
  IDataset,
  IDownstream,
  IOpenGLRenderWindow,
  IRenderer,
  IRenderWindow,
  IRepresentation,
  IShareDataset,
  IView,
} from '../types';

export const OpenGLRenderWindowContext =
  createContext<IOpenGLRenderWindow | null>(null);

export const RenderWindowContext = createContext<Nullable<IRenderWindow>>(null);

export const RendererContext = createContext<IRenderer | null>(null);

export const FieldDataContext =
  createContext<Nullable<() => vtkDataSetAttributes | vtkFieldData>>(null);

export const DatasetContext = createContext<Nullable<IDataset<unknown>>>(null);

export const RepresentationContext =
  createContext<Nullable<IRepresentation>>(null);

export const DownstreamContext = createContext<Nullable<IDownstream>>(null);

export const ShareDataSetContext = createContext<Nullable<IShareDataset>>(null);

export const MultiViewRootContext = createContext<boolean>(false);

export const ViewContext = createContext<IView | null>(null);

export function useRenderWindowContext() {
  const rw = useContext(RenderWindowContext);
  if (!rw) throw new Error('No RenderWindow context!');
  return rw;
}

export function useRendererContext() {
  const r = useContext(RendererContext);
  if (!r) throw new Error('No Renderer context!');
  return r;
}

export function useFieldData<T = vtkFieldData>() {
  const fd = useContext(FieldDataContext);
  if (!fd) throw new Error('No FieldData context!');
  return fd as () => T;
}

export function useDataset<T = vtkDataSet>() {
  const ds = useContext(DatasetContext);
  if (!ds) throw new Error('No Dataset context!');
  return ds as IDataset<T>;
}

export function useRepresentation() {
  const rep = useContext(RepresentationContext);
  if (!rep) throw new Error('No Representation context!');
  return rep;
}

export function useDownstream() {
  const ds = useContext(DownstreamContext);
  if (!ds) throw new Error('No Downstream context!');
  return ds;
}

export function useShareDataSet() {
  const share = useContext(ShareDataSetContext);
  if (!share) throw new Error('No ShareDataSet context!');
  return share;
}
