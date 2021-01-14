import vtkVolumeRepresentation from './VolumeRepresentation';
import vtkPointData from './PointData';
import vtkPolyData from './PolyData';
import vtkReader from './Reader';
import vtkView from './View';
import vtkGeometryRepresentation from './GeometryRepresentation';
import vtkImageData from './ImageData';
import vtkDataArray from './DataArray';
import vtkFieldData from './FieldData';
import vtkAlgorithm from './Algorithm';
import vtkCellData from './CellData';

export const VolumeRepresentation = vtkVolumeRepresentation;
export const PointData = vtkPointData;
export const PolyData = vtkPolyData;
export const Reader = vtkReader;
export const View = vtkView;
export const GeometryRepresentation = vtkGeometryRepresentation;
export const ImageData = vtkImageData;
export const DataArray = vtkDataArray;
export const FieldData = vtkFieldData;
export const Algorithm = vtkAlgorithm;
export const CellData = vtkCellData;

export default {
  VolumeRepresentation: vtkVolumeRepresentation,
  PointData: vtkPointData,
  PolyData: vtkPolyData,
  Reader: vtkReader,
  View: vtkView,
  GeometryRepresentation: vtkGeometryRepresentation,
  ImageData: vtkImageData,
  DataArray: vtkDataArray,
  FieldData: vtkFieldData,
  Algorithm: vtkAlgorithm,
  CellData: vtkCellData,
};
