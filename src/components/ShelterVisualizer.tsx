/**
 * Team CODE TITANS - SIH26051
 * 
 * ShelterVisualizer.tsx
 * Multi-View 2D Orthographic Projections (Front, Side, Top) & 3D Interactive Visualizer
 * 
 * Features:
 * - View Selector UI: Clean tab bar for Front View (2D), Side View (2D), Top View (2D), and 3D Interactive
 * - 2D Orthographic Projections (SVG):
 *     - Front View: South facade elevation with solar vectors, chhajja shading, dynamic window-to-wall ratio (WWR),
 *       wall thickness insulation layers, and natural cross-ventilation streamlines
 *     - Side View: Longitudinal depth cross-section showing roof pitch slope, side fenestrations, eaves overhang,
 *       and wall thickness hatch
 *     - Top View: NBC 2016 architectural plan & roof footprint with drip line, double-line wall perimeter,
 *       usable carpet area, fenestration cutouts, and True North compass orientation
 * - 3D Interactive View (React Three Fiber / Three.js):
 *     - Real-time untextured classic engineering schematic
 *     - OrbitControls with pan, zoom, and free orbit
 *     - Wireframe mode and X-Ray roof toggle
 *     - Camera presets (Isometric, Front Elevation, Side Elevation, Plan View)
 * - Strict Parametric Synchronization: Instantaneous bi-directional updates across all 2D views and 3D mesh
 */

export { InteractiveShelterVisualizer as ShelterVisualizer, InteractiveShelterVisualizer } from './InteractiveShelterVisualizer';
export type { InteractiveShelterVisualizerProps, VisualizerViewMode } from './InteractiveShelterVisualizer';
export { Shelter3D } from './Shelter3D';
export type { Shelter3DProps } from './Shelter3D';

import { InteractiveShelterVisualizer } from './InteractiveShelterVisualizer';
export default InteractiveShelterVisualizer;

