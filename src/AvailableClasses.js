// List classes that we want to have available
// => this is required because of tree shacking

// Sources
import 'vtk.js/Filters/Sources/ConeSource/index.js';
import 'vtk.js/Filters/Sources/ConcentricCylinderSource/index.js';
import 'vtk.js/Filters/Sources/SphereSource/index.js';
import 'vtk.js/Filters/Sources/PlaneSource/index.js';

// Filters
import 'vtk.js/Filters/General/WarpScalar/index.js';

// Readers
import 'vtk.js/IO/Geometry/PLYReader/index.js';
import 'vtk.js/IO/Geometry/STLReader/index.js';
import 'vtk.js/IO/Misc/ElevationReader/index.js';
import 'vtk.js/IO/Misc/OBJReader/index.js';
import 'vtk.js/IO/Misc/PDBReader/index.js';
import 'vtk.js/IO/XML/XMLImageDataReader/index.js';
import 'vtk.js/IO/XML/XMLPolyDataReader/index.js';
