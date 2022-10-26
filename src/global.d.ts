declare module '@kitware/vtk.js/Rendering/Core/CubeAxesActor' {
  import vtkActor from '@kitware/vtk.js/Rendering/Core/Actor';
  export interface vtkCubeAxesActor extends vtkActor {
    // TODO fill
    getGridLines(): boolean;
  }
  export function newInstance(): vtkCubeAxesActor;
  export const vtkCubeAxesActor: {
    newInstance: typeof newInstance;
  };
  export default vtkCubeAxesActor;
}
