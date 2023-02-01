import '@kitware/vtk.js/Rendering/Misc/RenderingAPIs';
import '@kitware/vtk.js/Rendering/OpenGL/Profiles/Geometry';
import '@kitware/vtk.js/Rendering/OpenGL/Profiles/Glyph';
import '@kitware/vtk.js/Rendering/OpenGL/Profiles/Volume';

export { default as Algorithm } from './core/Algorithm';
export * as Contexts from './core/contexts';
export { default as DataArray } from './core/DataArray';
export { default as Geometry2DRepresentation } from './core/Geometry2DRepresentation';
export { default as GeometryRepresentation } from './core/GeometryRepresentation';
export { default as ImageData } from './core/ImageData';
export { default as MultiViewRoot } from './core/MultiViewRoot';
export * from './core/Picking';
export { default as Picking } from './core/Picking';
export { default as PointData } from './core/PointData';
export { default as PolyData } from './core/PolyData';
export {
  RegisterDataSet,
  ShareDataSetRoot,
  UseDataSet,
} from './core/ShareDataSet';
export { default as SliceRepresentation } from './core/SliceRepresentation';
export { default as View } from './core/View';

// TODO should we expose these?
// export { default as OpenGLRenderWindow } from './core/OpenGLRenderWindow';
// export { default as Renderer } from './core/Renderer';
// export { default as RenderWindow } from './core/RenderWindow';
