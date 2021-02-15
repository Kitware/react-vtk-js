// List classes that we want to have available
// => this is required because of tree shacking

// Sources
import 'vtk.js/Filters/Sources/ConcentricCylinderSource.js';
import 'vtk.js/Filters/Sources/ConeSource.js';
import 'vtk.js/Filters/Sources/CubeSource.js';
import 'vtk.js/Filters/Sources/CylinderSource.js';
import 'vtk.js/Filters/Sources/LineSource.js';
import 'vtk.js/Filters/Sources/PlaneSource.js';
import 'vtk.js/Filters/Sources/PointSource.js';
import 'vtk.js/Filters/Sources/SphereSource.js';

// Filters
import 'vtk.js/Filters/General/WarpScalar.js';

// Readers
import 'vtk.js/IO/Geometry/PLYReader.js';
import 'vtk.js/IO/Geometry/STLReader.js';
import 'vtk.js/IO/Misc/ElevationReader.js';
import 'vtk.js/IO/Misc/OBJReader.js';
import 'vtk.js/IO/Misc/PDBReader.js';
import 'vtk.js/IO/XML/XMLImageDataReader.js';
import 'vtk.js/IO/XML/XMLPolyDataReader.js';
