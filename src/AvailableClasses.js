// List classes that we want to have available
// => this is required because of tree shacking

import '@kitware/vtk.js/Rendering/OpenGL/Profiles/Volume';
import '@kitware/vtk.js/Rendering/OpenGL/Profiles/Geometry';
import '@kitware/vtk.js/Rendering/OpenGL/Profiles/Glyph';

// Data access helper
import '@kitware/vtk.js/IO/Core/DataAccessHelper/HttpDataAccessHelper';
import '@kitware/vtk.js/IO/Core/DataAccessHelper/JSZipDataAccessHelper';

// Sources
import '@kitware/vtk.js/Filters/Sources/ConcentricCylinderSource.js';
import '@kitware/vtk.js/Filters/Sources/ConeSource.js';
import '@kitware/vtk.js/Filters/Sources/CubeSource.js';
import '@kitware/vtk.js/Filters/Sources/CylinderSource.js';
import '@kitware/vtk.js/Filters/Sources/LineSource.js';
import '@kitware/vtk.js/Filters/Sources/PlaneSource.js';
import '@kitware/vtk.js/Filters/Sources/PointSource.js';
import '@kitware/vtk.js/Filters/Sources/SphereSource.js';

// Filters
import '@kitware/vtk.js/Filters/Core/Cutter.js';
import '@kitware/vtk.js/Filters/General/WarpScalar.js';
import '@kitware/vtk.js/Filters/General/TubeFilter.js';

// Readers
import '@kitware/vtk.js/IO/Geometry/PLYReader.js';
import '@kitware/vtk.js/IO/Geometry/STLReader.js';
import '@kitware/vtk.js/IO/Misc/ElevationReader.js';
import '@kitware/vtk.js/IO/Misc/OBJReader.js';
// bring pdb definition (big)
import '@kitware/vtk.js/IO/Misc/PDBReader.js';
// bring zip (big++)
import '@kitware/vtk.js/IO/XML/XMLImageDataReader.js';
import '@kitware/vtk.js/IO/XML/XMLPolyDataReader.js';
