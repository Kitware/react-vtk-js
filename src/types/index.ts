import { vtkObject } from '@kitware/vtk.js/interfaces';
import vtkAbstractMapper from '@kitware/vtk.js/Rendering/Core/AbstractMapper';
import vtkActor from '@kitware/vtk.js/Rendering/Core/Actor';
import vtkCamera from '@kitware/vtk.js/Rendering/Core/Camera';
import vtkRenderer from '@kitware/vtk.js/Rendering/Core/Renderer';
import vtkRenderWindow from '@kitware/vtk.js/Rendering/Core/RenderWindow';
import vtkRenderWindowInteractor from '@kitware/vtk.js/Rendering/Core/RenderWindowInteractor';
import vtkOpenGLRenderWindow from '@kitware/vtk.js/Rendering/OpenGL/RenderWindow';
import {
  Bounds,
  TypedArray,
  vtkPipelineConnection,
} from '@kitware/vtk.js/types';
import { NUMPY_DTYPES } from '../utils-ts/numpy';

export type NumpyEncodedArray = {
  bvals: string;
  dtype: keyof typeof NUMPY_DTYPES;
  shape: number[];
};

export type DataArrayValues = TypedArray | number[] | NumpyEncodedArray;

export type TypedArrayConstructor =
  | Uint8ArrayConstructor
  | Uint16ArrayConstructor
  | Uint32ArrayConstructor
  | Int8ArrayConstructor
  | Int16ArrayConstructor
  | Int32ArrayConstructor
  | Uint8ClampedArrayConstructor
  | Float32ArrayConstructor
  | Float64ArrayConstructor;

export type VtkConstructor<T = unknown, P = Record<string, unknown>> = {
  newInstance(initalValues?: P): T;
};

export interface IView {
  getRenderer(): vtkRenderer;
  getRenderWindow(): vtkRenderWindow;
  getAPISpecificRenderWindow(): vtkOpenGLRenderWindow;
  getInteractor(): vtkRenderWindowInteractor;
  getCamera(): vtkCamera;
  requestRender(): void;
  resetCamera(boundsToUse?: Bounds): void;
}

export interface IRepresentation<
  A extends vtkActor = vtkActor,
  M extends vtkAbstractMapper = vtkAbstractMapper
> {
  dataAvailable(): void;
  dataChanged(): void;
  getActor(): A;
  getMapper(): M;
}

// There is no sufficient type that overlaps classes like
// vtkMapper and vtkAlgorithm. vtkMapper is technically a vtkAlgorithm...
export interface IDownstream {
  setInputData<T extends vtkObject>(obj: T, port?: number): void;
  setInputConnection(conn: vtkPipelineConnection, port?: number): void;
}

export interface IDataset<T> {
  getDataSet(): T;
  modified(): void;
}
