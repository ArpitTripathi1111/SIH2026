/**
 * Team CODE TITANS - SIH26051
 * ShapeSelector.tsx - Architectural Geometry Selector Component
 * 
 * Supports 8 distinct architectural geometries:
 * 1. Standard Cuboid: Flat roof, rectangular base (Baseline)
 * 2. A-Frame / Pitched: Steep triangular roof reaching the ground (Alpine/Snow)
 * 3. Gabled Roof Cuboid: Standard rectangular walls with pitched roof (Traditional)
 * 4. Dome / Vaulted: Hemispherical structure (Desert Heat Minimizer)
 * 5. Cylindrical / Yurt: Circular base with conical roof (High Wind Resistance)
 * 6. Hexagonal Pod: 6-sided base with faceted roof (Modular Clustering)
 * 7. Lean-to / Sloped: Single-pitch sloped roof (Rapid Assembly)
 * 8. Butterfly Roof: Inverted V-roof (Monsoon Rainwater Harvesting)
 */

import React, { useRef } from 'react';
import {
  Square,
  Triangle,
  Home,
  Sun,
  Wind,
  Hexagon,
  Layers,
  Droplets,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Info,
  Sliders
} from 'lucide-react';
import { ArchitecturalShape, ArchitecturalShapeDef, RegionId, ShelterGeometry } from '../types';
import { calculateShapeGeometry, resolveArchitecturalShape } from '../services/costCalculator';

export interface ShapeCardData extends ArchitecturalShapeDef {
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  bestForColor: string;
  svMultiplierLabel: string;
}

export const ARCHITECTURAL_SHAPES: ShapeCardData[] = [
  {
    id: 'standard_cuboid',
    name: 'Standard Cuboid',
    tagline: 'Baseline Orthogonal Prism',
    description: 'Flat roof with 450mm perimeter parapet. Maximizes cubic usable floor plan with conventional rapid masonry/slab assembly.',
    bestFor: 'Best For: Baseline Plains',
    recommendedRegion: 'river' as RegionId,
    roofTypeEquivalent: 'flat',
    defaultPitchDegrees: 0,
    svRatioCharacteristic: 'baseline',
    svRatioDescription: 'Standard 1.00× S/V baseline with orthogonal surface exposure.',
    structuralAdvantage: 'Zero-waste precast slabs, perimeter parapet rooftop utility, and simple formwork.',
    icon: Square,
    accentColor: 'text-slate-700',
    badgeBg: 'bg-slate-100',
    badgeBorder: 'border-slate-300',
    badgeText: 'text-slate-800',
    bestForColor: 'bg-slate-800 text-slate-100',
    svMultiplierLabel: '1.00× Baseline S/V'
  },
  {
    id: 'a_frame_pitched',
    name: 'A-Frame / Pitched',
    tagline: 'Ground-to-Ridge Steep Rafters',
    description: 'Steep dual-sloping roof reaching directly to the ground plinth. Eliminates vertical side walls and sheds heavy Himalayan snow immediately.',
    bestFor: 'Best For: High Snow / Mountain',
    recommendedRegion: 'mountain' as RegionId,
    roofTypeEquivalent: 'pitched',
    defaultPitchDegrees: 45,
    svRatioCharacteristic: 'aerodynamic',
    svRatioDescription: 'Zero longitudinal side walls. Maximum roof-to-envelope ratio.',
    structuralAdvantage: 'High triangular rigidity, direct ground load paths, and zero snow/ice accumulation.',
    icon: Triangle,
    accentColor: 'text-indigo-600',
    badgeBg: 'bg-indigo-50',
    badgeBorder: 'border-indigo-200',
    badgeText: 'text-indigo-800',
    bestForColor: 'bg-indigo-700 text-white',
    svMultiplierLabel: 'Snow Shedding (0 Walls)'
  },
  {
    id: 'gabled_cuboid',
    name: 'Gabled Roof Cuboid',
    tagline: 'Traditional Dual-Pitch Attic',
    description: 'Standard rectangular vertical walls topped with a symmetrical pitched roof. Provides a ventilated attic buffer for moderate temperate climates.',
    bestFor: 'Best For: Temperate Rain',
    recommendedRegion: 'mountain' as RegionId,
    roofTypeEquivalent: 'pitched',
    defaultPitchDegrees: 26,
    svRatioCharacteristic: 'moderate',
    svRatioDescription: 'Attic volume buffers living zone from direct solar thermal load.',
    structuralAdvantage: 'Timber/steel king-post trusses with balanced dual-pitch rainwater drainage.',
    icon: Home,
    accentColor: 'text-blue-600',
    badgeBg: 'bg-blue-50',
    badgeBorder: 'border-blue-200',
    badgeText: 'text-blue-800',
    bestForColor: 'bg-blue-700 text-white',
    svMultiplierLabel: 'Dual-Pitch Attic'
  },
  {
    id: 'dome_vaulted',
    name: 'Dome / Vaulted',
    tagline: 'Hemispherical Solar Minimizer',
    description: 'Continuous curved catenary dome shell. Minimizes solar gain at peak solar altitude by diffusing rays obliquely, ideal for hyper-arid deserts.',
    bestFor: 'Best For: Desert Heat',
    recommendedRegion: 'desert' as RegionId,
    roofTypeEquivalent: 'vaulted',
    defaultPitchDegrees: 35,
    svRatioCharacteristic: 'minimal',
    svRatioDescription: 'Lowest mathematical S/V ratio (~0.80×) for minimal envelope gain.',
    structuralAdvantage: 'Self-supporting compressive masonry arches requiring minimal tensile reinforcement.',
    icon: Sun,
    accentColor: 'text-amber-600',
    badgeBg: 'bg-amber-50',
    badgeBorder: 'border-amber-200',
    badgeText: 'text-amber-800',
    bestForColor: 'bg-amber-600 text-white',
    svMultiplierLabel: 'Lowest S/V (-20% Sun)'
  },
  {
    id: 'cylindrical_yurt',
    name: 'Cylindrical / Yurt',
    tagline: 'Radial Aerodynamic Shell',
    description: 'Circular perimeter wall capped with a conical roof. Delivers 360° laminar wind deflection and uniform aerodynamic stability under cyclone gusts.',
    bestFor: 'Best For: High Wind / Cyclone',
    recommendedRegion: 'river' as RegionId,
    roofTypeEquivalent: 'pitched',
    defaultPitchDegrees: 22,
    svRatioCharacteristic: 'compact',
    svRatioDescription: 'Reduced wind drag coefficient (Cd ~0.50 vs 1.10 for boxes).',
    structuralAdvantage: 'Continuous tension ring at eaves, self-centering radial rafters, and lightweight trellis.',
    icon: Wind,
    accentColor: 'text-teal-600',
    badgeBg: 'bg-teal-50',
    badgeBorder: 'border-teal-200',
    badgeText: 'text-teal-800',
    bestForColor: 'bg-teal-700 text-white',
    svMultiplierLabel: 'Aerodynamic Drag -55%'
  },
  {
    id: 'hexagonal_pod',
    name: 'Hexagonal Pod',
    tagline: 'Modular Cluster Geometry',
    description: '6-sided faceted base with a multi-faceted pyramid roof. Allows seamless zero-gap honeycomb clustering for rapid community field hospitals.',
    bestFor: 'Best For: Modular Clustering',
    recommendedRegion: 'river' as RegionId,
    roofTypeEquivalent: 'pitched',
    defaultPitchDegrees: 24,
    svRatioCharacteristic: 'optimized',
    svRatioDescription: 'Tessellating hexagonal geometry with compact perimeter ratio.',
    structuralAdvantage: 'Triangulated perimeter joints with standardized interchangeable prefabricated panels.',
    icon: Hexagon,
    accentColor: 'text-purple-600',
    badgeBg: 'bg-purple-50',
    badgeBorder: 'border-purple-200',
    badgeText: 'text-purple-800',
    bestForColor: 'bg-purple-700 text-white',
    svMultiplierLabel: 'Zero-Gap Tessellation'
  },
  {
    id: 'lean_to_sloped',
    name: 'Lean-to / Sloped',
    tagline: 'Mono-Pitch Rapid Assembly',
    description: 'Single continuous rafter rake sloping from high windward wall to low leeward eaves. Engineered for fastest single-plane rapid deployment.',
    bestFor: 'Best For: Rapid Recovery',
    recommendedRegion: 'river' as RegionId,
    roofTypeEquivalent: 'pitched',
    defaultPitchDegrees: 14,
    svRatioCharacteristic: 'compact',
    svRatioDescription: 'Compact single-plane pitch with unidirectional watershed.',
    structuralAdvantage: 'Fastest single-plane erection; leeward low eaves deflecting prevailing squalls.',
    icon: Layers,
    accentColor: 'text-emerald-600',
    badgeBg: 'bg-emerald-50',
    badgeBorder: 'border-emerald-200',
    badgeText: 'text-emerald-800',
    bestForColor: 'bg-emerald-700 text-white',
    svMultiplierLabel: 'Rapid Single Pitch'
  },
  {
    id: 'butterfly_roof',
    name: 'Butterfly Roof',
    tagline: 'Inverted-V Monsoon Catchment',
    description: 'Inverted pitch sloping down toward a central valley gutter. Captures 100% of monsoon precipitation for gravity-fed filtration cisterns.',
    bestFor: 'Best For: Monsoon Harvest',
    recommendedRegion: 'warm_humid' as unknown as RegionId,
    roofTypeEquivalent: 'pitched',
    defaultPitchDegrees: 18,
    svRatioCharacteristic: 'optimized',
    svRatioDescription: 'High perimeter clerestory permits passive stack-effect ventilation.',
    structuralAdvantage: 'Directs all rainfall directly to central collection trough without external gutters.',
    icon: Droplets,
    accentColor: 'text-cyan-600',
    badgeBg: 'bg-cyan-50',
    badgeBorder: 'border-cyan-200',
    badgeText: 'text-cyan-800',
    bestForColor: 'bg-cyan-700 text-white',
    svMultiplierLabel: '100% Rain Harvesting'
  }
];

export interface ShapeSelectorProps {
  selectedShape: ArchitecturalShape;
  onSelectShape: (shape: ArchitecturalShape) => void;
  currentGeometry?: ShelterGeometry;
  compact?: boolean;
  readOnly?: boolean;
  className?: string;
  showComparisonDetails?: boolean;
}

export const ShapeSelector: React.FC<ShapeSelectorProps> = ({
  selectedShape,
  onSelectShape,
  currentGeometry,
  compact = false,
  readOnly = false,
  className = '',
  showComparisonDetails = true
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeShape = resolveArchitecturalShape({
    ...(currentGeometry || {
      lengthMeters: 6.0,
      widthMeters: 4.5,
      heightMeters: 3.0,
      floorAreaM2: 27.0,
      wallThicknessMm: 230,
      insulationThicknessMm: 50,
      roofType: 'flat',
      roofPitchDegrees: 0,
      overhangDepthMeters: 0.6,
      windowToWallRatioPercent: 15,
      windowOrientation: 'south',
      shadingType: 'chhajja_overhang',
      glazingType: 'single_clear',
      airChangesPerHourACH: 2.5,
      occupancyCount: 3,
      internalLoadWatts: 180
    }),
    architecturalShape: selectedShape
  });

  // Calculate live geometric metrics if geometry is available
  const activeMetrics = currentGeometry
    ? calculateShapeGeometry({ ...currentGeometry, architecturalShape: activeShape })
    : null;

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div
      id="shape-selector-container"
      className={`bg-white border border-slate-200 rounded-xl p-3 sm:p-4 shadow-xs ${className}`}
    >
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 shadow-xs">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              8 Architectural Forms
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
                SIH26051 Computational Engine
              </span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Select geometry to synchronize SA/V ratio, solar irradiance angle, indoor comfort, and itemized BOQ quantities.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeMetrics && (
            <div className="flex items-center gap-2 text-[11px] font-mono bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700">
              <span className="text-slate-500">SA/V:</span>
              <span className="font-bold text-blue-700">{activeMetrics.surfaceAreaToVolumeRatio} m⁻¹</span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-500">Vol:</span>
              <span className="font-bold text-slate-800">{activeMetrics.internalVolumeM3} m³</span>
            </div>
          )}

          {/* Horizontal scroll arrows */}
          <div className="hidden sm:flex items-center gap-1">
            <button
              type="button"
              onClick={() => handleScroll('left')}
              className="p-1 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              title="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => handleScroll('right')}
              className="p-1 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              title="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Scrolling Array of 8 Toggle Cards */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-2 scroll-smooth scrollbar-thin scrollbar-thumb-slate-200 snap-x snap-mandatory"
        style={{ scrollbarGutter: 'stable' }}
      >
        {ARCHITECTURAL_SHAPES.map((shape) => {
          const isSelected = activeShape === shape.id;
          const Icon = shape.icon;

          // Compute individual shape metrics
          const comparisonMetrics = currentGeometry
            ? calculateShapeGeometry({ ...currentGeometry, architecturalShape: shape.id })
            : null;

          return (
            <button
              key={shape.id}
              id={`shape-btn-${shape.id}`}
              type="button"
              disabled={readOnly}
              onClick={() => onSelectShape(shape.id)}
              className={`relative flex-none w-[260px] sm:w-[280px] snap-start text-left p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                isSelected
                  ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-600/20 shadow-sm'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
              } ${readOnly ? 'cursor-default opacity-80' : 'cursor-pointer'}`}
            >
              {/* Card Header: Radio indicator, Title, Best For Badge */}
              <div>
                <div className="flex items-center justify-between gap-1.5 mb-2">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-tight shadow-xs ${shape.bestForColor}`}
                  >
                    {shape.bestFor}
                  </span>

                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                      isSelected ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                <div className="flex items-start gap-2 mb-1">
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center mt-0.5 shrink-0 transition-colors ${
                      isSelected
                        ? 'border-blue-600 bg-blue-600'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 leading-snug">
                      {shape.name}
                    </h4>
                    <div className="text-[11px] font-medium text-slate-600">
                      {shape.tagline}
                    </div>
                  </div>
                </div>

                <p className="text-[10px] text-slate-500 leading-relaxed mb-2.5 line-clamp-2">
                  {shape.description}
                </p>
              </div>

              {/* Bottom Engineering Tags & Metrics */}
              <div className="pt-2 border-t border-slate-100/90 flex flex-col gap-1.5">
                <div className="flex items-center justify-between gap-1 text-[10px]">
                  <span
                    className={`px-1.5 py-0.5 rounded font-medium border ${shape.badgeBg} ${shape.badgeBorder} ${shape.badgeText}`}
                  >
                    {shape.svMultiplierLabel}
                  </span>
                  {comparisonMetrics && (
                    <span className="font-mono font-bold text-slate-700">
                      {comparisonMetrics.surfaceAreaToVolumeRatio} S/V
                    </span>
                  )}
                </div>

                <div className="text-[9px] text-slate-500 font-mono flex items-center justify-between pt-0.5">
                  <span>Pitch: <strong className="text-slate-700">{shape.defaultPitchDegrees}°</strong></span>
                  {comparisonMetrics && (
                    <>
                      <span>Roof: <strong className="text-slate-700">{comparisonMetrics.roofAreaM2}m²</strong></span>
                      <span>Vol: <strong className="text-slate-700">{comparisonMetrics.internalVolumeM3}m³</strong></span>
                    </>
                  )}
                </div>
              </div>

              {/* Selected subtle tick */}
              {isSelected && (
                <div className="absolute top-2.5 right-11 text-blue-600">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Engineering Diagnostic Footer Bar */}
      {showComparisonDetails && activeMetrics && (
        <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-lg flex flex-wrap items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="text-slate-700 font-medium text-[11px]">
              {activeShape === 'dome_vaulted' && (
                <>
                  <strong>Desert Vault Optimization:</strong> Hemispherical arch minimizes perpendicular noon solar exposure, achieving{' '}
                  <span className="font-mono text-emerald-700 font-bold">{activeMetrics.surfaceAreaToVolumeRatio} S/V</span> with{' '}
                  <span className="font-mono text-emerald-700 font-bold">{activeMetrics.roofAreaM2}m²</span> shell area.
                </>
              )}
              {activeShape === 'a_frame_pitched' && (
                <>
                  <strong>Alpine A-Frame Optimization:</strong> Ground-to-ridge steep rafters eliminate exposed side walls, creating high snow runoff and{' '}
                  <span className="font-mono text-indigo-700 font-bold">+{activeMetrics.apexRiseMeters}m</span> attic cushion.
                </>
              )}
              {activeShape === 'gabled_cuboid' && (
                <>
                  <strong>Traditional Gabled Rafters:</strong> Standard walls with pitched attic prism buffering{' '}
                  <span className="font-mono text-blue-700 font-bold">{activeMetrics.internalVolumeM3}m³</span> volume for temperate conditions.
                </>
              )}
              {activeShape === 'cylindrical_yurt' && (
                <>
                  <strong>Aerodynamic Yurt Optimization:</strong> Continuous circular perimeter wall and conical roof reduce lateral wind drag by ~50%.
                </>
              )}
              {activeShape === 'hexagonal_pod' && (
                <>
                  <strong>Modular Hexagonal Pod:</strong> 6-faceted planar symmetry with pyramid roof rise of{' '}
                  <span className="font-mono text-purple-700 font-bold">+{activeMetrics.apexRiseMeters}m</span> for clustered emergency stations.
                </>
              )}
              {activeShape === 'lean_to_sloped' && (
                <>
                  <strong>Rapid Mono-Pitch Assembly:</strong> Unidirectional slope ({activeMetrics.eavesHeightMeters}m to {activeMetrics.peakHeightMeters}m) enables immediate single-plane field erection.
                </>
              )}
              {activeShape === 'butterfly_roof' && (
                <>
                  <strong>Monsoon Butterfly Catchment:</strong> Inverted V-roof funnels 100% of rainwater toward central drainage trough for storage and enables clerestory ventilation.
                </>
              )}
              {activeShape === 'standard_cuboid' && (
                <>
                  <strong>Standard Cuboid Baseline:</strong> Standard orthogonal geometry provides full rectangular head-height with{' '}
                  <span className="font-mono text-slate-800 font-bold">{activeMetrics.internalVolumeM3}m³</span> usable room volume.
                </>
              )}
            </span>
          </div>

          <div className="flex items-center gap-3 text-[10px] font-mono text-slate-600">
            <span>Roof Area: <strong>{activeMetrics.roofAreaM2}m²</strong></span>
            <span>Wall Area: <strong>{activeMetrics.netWallAreaM2}m²</strong></span>
            <span>Total Env: <strong>{activeMetrics.totalEnvelopeAreaM2}m²</strong></span>
            <span>Peak H: <strong>{activeMetrics.peakHeightMeters}m</strong></span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShapeSelector;
