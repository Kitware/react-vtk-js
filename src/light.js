// Get React pieces
import Core from './core/index';
import Representations from './representations/index';

import {
  ViewContext,
  RepresentationContext,
  DataSetContext,
  FieldsContext,
  DownstreamContext,
} from './core/View';

// Core
export const VolumeRepresentation = Core.VolumeRepresentation;
export const SliceRepresentation = Core.SliceRepresentation;
export const ResliceRepresentation = Core.ResliceRepresentation;
export const VolumeController = Core.VolumeController;
export const PointData = Core.PointData;
export const PolyData = Core.PolyData;
export const Reader = Core.Reader;
export const ShareDataSet = Core.ShareDataSet;
export const Dataset = Core.Dataset;
export const View = Core.View;
export const GeometryRepresentation = Core.GeometryRepresentation;
export const Geometry2DRepresentation = Core.Geometry2DRepresentation;
export const GlyphRepresentation = Core.GlyphRepresentation;
export const ImageData = Core.ImageData;
export const DataArray = Core.DataArray;
export const FieldData = Core.FieldData;
export const Algorithm = Core.Algorithm;
export const Calculator = Core.Calculator;
export const CellData = Core.CellData;
export const MultiViewRoot = Core.MultiViewRoot;

// Representations
export const PointCloudRepresentation =
  Representations.PointCloudRepresentation;
export const VolumeDataRepresentation =
  Representations.VolumeDataRepresentation;

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
