// Ensure vtk.js classes available for Algorithm and Reader
import 'react-vtk-js/src/AvailableClasses';

// Get React pieces
import Core from 'react-vtk-js/src/core';
import Representations from 'react-vtk-js/src/representations';

import {
  ViewContext,
  RepresentationContext,
  DataSetContext,
  FieldsContext,
  DownstreamContext,
} from 'react-vtk-js/src/core/View';

// Core
export const VolumeRepresentation = Core.VolumeRepresentation;
export const VolumeController = Core.VolumeController;
export const PointData = Core.PointData;
export const PolyData = Core.PolyData;
export const Reader = Core.Reader;
export const View = Core.View;
export const GeometryRepresentation = Core.GeometryRepresentation;
export const ImageData = Core.ImageData;
export const DataArray = Core.DataArray;
export const FieldData = Core.FieldData;
export const Algorithm = Core.Algorithm;
export const Calculator = Core.Calculator;
export const CellData = Core.CellData;

// Representations
export const PointCloudRepresentation = Representations.PointCloudRepresentation;
export const VolumeDataRepresentation = Representations.VolumeDataRepresentation

// Context
export const Contexts = {
  ViewContext,
  RepresentationContext,
  DataSetContext,
  FieldsContext,
  DownstreamContext,
};

export default {
  Core,
  Representations,
  Contexts,
};
