export {};

declare global {
  interface IvtkObject {
    vtkClass: string;
    [attrName: string]: unknown;
  }
}
