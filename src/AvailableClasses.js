// List classes that we want to have available
// => this is required because of tree shacking

// Sources
import 'vtk.js/Filters/Sources/ConeSource';
import 'vtk.js/Filters/Sources/ConcentricCylinderSource';
import 'vtk.js/Filters/Sources/SphereSource';
import 'vtk.js/Filters/Sources/PlaneSource';

// Filters
import 'vtk.js/Filters/General/WarpScalar';

// Readers
import 'vtk.js/IO/Geometry/PLYReader';
import 'vtk.js/IO/Geometry/STLReader';
import 'vtk.js/IO/Misc/ElevationReader';
import 'vtk.js/IO/Misc/OBJReader';
import 'vtk.js/IO/Misc/PDBReader';
import 'vtk.js/IO/XML/XMLImageDataReader';
import 'vtk.js/IO/XML/XMLPolyDataReader';
