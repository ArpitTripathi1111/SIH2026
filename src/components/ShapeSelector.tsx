/**
 * Team CODE TITANS - SIH26051
 * ShapeSelector.tsx - Architectural Geometry Selector Component
 * 
 * Defines standard shelter architectural forms:
 * 1. Flat-Roof Box (Baseline)
 * 2. Pitched / A-Frame (High rainfall/snow in mountain regions)
 * 3. Vaulted / Dome (Desert regions to minimize solar envelope gain)
 * 4. Lean-to / Sloped (Rapid-assembly directional structure)
 */

import React from 'react';
import {
  Square,
  Triangle,
  Sun,
  Layers,
  CheckCircle2,
  HelpCircle,
  TrendingDown,
  Info
} from 'lucide-react';
import { ArchitecturalShape, ArchitecturalShapeDef, RegionId, ShelterGeometry } from '../types';
import { calculateShapeGeometry, resolveArchitecturalShape } from '../services/costCalculator';

export interface ShapeCardData extends ArchitecturalShapeDef {
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  svMultiplierLabel: string;
}

export const ARCHITECTURAL_SHAPES: ShapeCardData[] = [
  {
    id: 'flat_box',
    name: 'Flat-Roof Box',
    tagline: 'Standard Baseline Prism',
    description: 'Orthogonal rectangular geometry with 450mm parapet. Maximizes cubic usable floor plan with standard construction methods.',
    recommendedRegion: 'river' as RegionId,
    roofTypeEquivalent: 'flat',
    defaultPitchDegrees: 0,
    svRatioCharacteristic: 'baseline',
    svRatioDescription: 'Baseline 1.0× S/V ratio. Standard envelope exposure across all four walls and flat deck.',
    structuralAdvantage: 'Low formwork complexity, uniform modular precasting, and horizontal roof terrace utilization.',
    icon: Square,
    accentColor: 'text-slate-700',
    badgeBg: 'bg-slate-100',
    badgeBorder: 'border-slate-300',
    badgeText: 'text-slate-800',
    svMultiplierLabel: '1.00× (Baseline)'
  },
  {
    id: 'pitched_a_frame',
    name: 'Pitched / A-Frame',
    tagline: 'Alpine Watershed & Snow Shedding',
    description: 'Dual-sloping rafters with triangular gable ends. Rapidly sheds severe Himalayan snow/rain while attic air pocket insulates the interior.',
    recommendedRegion: 'mountain' as RegionId,
    roofTypeEquivalent: 'pitched',
    defaultPitchDegrees: 28,
    svRatioCharacteristic: 'moderate',
    svRatioDescription: 'S/V ratio ~1.12×. Elevated attic volume acts as a non-habitable thermal buffer zone.',
    structuralAdvantage: 'Direct gravity load transfer, eliminates snow build-up, and protects perimeter eaves from ice damming.',
    icon: Triangle,
    accentColor: 'text-indigo-600',
    badgeBg: 'bg-indigo-50',
    badgeBorder: 'border-indigo-200',
    badgeText: 'text-indigo-800',
    svMultiplierLabel: 'Attic Buffer (+18% Vol)'
  },
  {
    id: 'vaulted_dome',
    name: 'Vaulted / Dome',
    tagline: 'Solar Gain Minimizer (Low S/V)',
    description: 'Self-supporting compressive arch or parabolic vault. Curvature reduces perpendicular solar incidence and minimizes total surface area.',
    recommendedRegion: 'desert' as RegionId,
    roofTypeEquivalent: 'vaulted',
    defaultPitchDegrees: 35,
    svRatioCharacteristic: 'minimal',
    svRatioDescription: 'Lowest S/V ratio (~0.82×). Up to 18-22% less exterior envelope area exposed to desert solar radiation.',
    structuralAdvantage: 'Zero tensile timber/steel required in arch; internal thermal stratification vents rising heat.',
    icon: Sun,
    accentColor: 'text-amber-600',
    badgeBg: 'bg-amber-50',
    badgeBorder: 'border-amber-200',
    badgeText: 'text-amber-800',
    svMultiplierLabel: 'Lowest S/V (-18% Sun Area)'
  },
  {
    id: 'lean_to',
    name: 'Lean-to / Sloped',
    tagline: 'Mono-Pitch Rapid Assembly',
    description: 'Single continuous rafter rake from high windward wall to low leeward eaves. Aerodynamic profile engineered for rapid disaster recovery.',
    recommendedRegion: 'river' as RegionId,
    roofTypeEquivalent: 'pitched',
    defaultPitchDegrees: 14,
    svRatioCharacteristic: 'compact',
    svRatioDescription: 'Compact S/V ratio (~0.94×). Unidirectional roof slope directs drainage to single rainwater gutter.',
    structuralAdvantage: 'Fastest single-plane erection; leeward low profile deflects prevailing wind and monsoon squalls.',
    icon: Layers,
    accentColor: 'text-emerald-600',
    badgeBg: 'bg-emerald-50',
    badgeBorder: 'border-emerald-200',
    badgeText: 'text-emerald-800',
    svMultiplierLabel: 'Fast Field Assembly'
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

  return (
    <div
      id="shape-selector-container"
      className={`bg-white border border-slate-200 rounded-lg p-3 sm:p-4 shadow-xs ${className}`}
    >
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
            <Square className="w-4 h-4 rotate-45" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              Base Architectural Geometry
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                SIH26051 Engine
              </span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Select structural envelope form to adjust volume, roof pitch, solar exposure, and Bill of Quantities (BOQ).
            </p>
          </div>
        </div>

        {activeMetrics && (
          <div className="flex items-center gap-2 text-[11px] font-mono bg-slate-50 border border-slate-200 rounded px-2.5 py-1 text-slate-700">
            <span className="text-slate-500">Active S/V:</span>
            <span className="font-bold text-blue-700">{activeMetrics.surfaceAreaToVolumeRatio} m⁻¹</span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-500">Vol:</span>
            <span className="font-bold text-slate-800">{activeMetrics.internalVolumeM3} m³</span>
          </div>
        )}
      </div>

      {/* Grid of standard architectural forms */}
      <div className={`grid ${compact ? 'grid-cols-2 gap-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3'}`}>
        {ARCHITECTURAL_SHAPES.map((shape) => {
          const isSelected = activeShape === shape.id;
          const Icon = shape.icon;

          // Estimate metrics for comparison card
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
              className={`relative text-left p-3 rounded-lg border transition-all flex flex-col justify-between ${
                isSelected
                  ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-600/20 shadow-xs'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
              } ${readOnly ? 'cursor-default opacity-80' : 'cursor-pointer'}`}
            >
              {/* Top Row: Radio indicator, Icon & Title */}
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'border-blue-600 bg-blue-600'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <span className="text-xs font-bold text-slate-900 leading-tight">
                      {shape.name}
                    </span>
                  </div>

                  <div
                    className={`w-6 h-6 rounded flex items-center justify-center ${
                      isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Subtitle / Tagline */}
                <div className="text-[11px] font-medium text-slate-600 mb-1.5">
                  {shape.tagline}
                </div>

                {/* Description (hidden on ultra compact) */}
                {!compact && (
                  <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed mb-2">
                    {shape.description}
                  </p>
                )}
              </div>

              {/* Bottom engineering tags */}
              <div className="pt-2 border-t border-slate-100 mt-1 flex flex-col gap-1.5">
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

                {!compact && (
                  <div className="text-[9px] text-slate-500 font-mono flex items-center gap-1">
                    <span className="text-slate-400">Pitch:</span>
                    <span className="font-semibold text-slate-700">
                      {shape.defaultPitchDegrees}° {shape.defaultPitchDegrees > 0 ? 'rake' : 'level'}
                    </span>
                    {comparisonMetrics && (
                      <>
                        <span className="text-slate-300">•</span>
                        <span className="text-slate-400">Vol:</span>
                        <span className="font-semibold text-slate-700">
                          {comparisonMetrics.internalVolumeM3}m³
                        </span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Selected subtle tick */}
              {isSelected && (
                <div className="absolute top-2 right-9 text-blue-600">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Engineering Diagnostic Footer Bar */}
      {showComparisonDetails && activeMetrics && (
        <div className="mt-3 p-2.5 bg-slate-50 border border-slate-200 rounded-md flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="text-slate-700 font-medium text-[11px]">
              {activeShape === 'vaulted_dome' && (
                <>
                  <strong>Desert Vault Optimization:</strong> Curved catenary arch minimizes perpendicular noon sun rays and provides{' '}
                  <span className="font-mono text-emerald-700 font-bold">{activeMetrics.surfaceAreaToVolumeRatio} S/V</span> (lowest envelope exposure).
                </>
              )}
              {activeShape === 'pitched_a_frame' && (
                <>
                  <strong>Alpine Rafter Optimization:</strong> High pitch sheds snow loads cleanly and creates an attic thermal buffer of{' '}
                  <span className="font-mono text-indigo-700 font-bold">+{activeMetrics.apexRiseMeters}m</span> rise above eaves.
                </>
              )}
              {activeShape === 'lean_to' && (
                <>
                  <strong>Rapid Response Mono-Pitch:</strong> Directs runoff to leeward gutter and provides streamlined wind resistance with{' '}
                  <span className="font-mono text-emerald-700 font-bold">{activeMetrics.roofAreaM2}m²</span> roof area.
                </>
              )}
              {activeShape === 'flat_box' && (
                <>
                  <strong>Baseline Orthogonal Box:</strong> Standard orthogonal geometry provides full rectangular head-height with{' '}
                  <span className="font-mono text-slate-800 font-bold">{activeMetrics.internalVolumeM3}m³</span> usable room volume.
                </>
              )}
            </span>
          </div>

          <div className="flex items-center gap-3 text-[10px] font-mono text-slate-600">
            <span>Roof Area: <strong>{activeMetrics.roofAreaM2}m²</strong></span>
            <span>Wall Area: <strong>{activeMetrics.netWallAreaM2}m²</strong></span>
            <span>Total Env: <strong>{activeMetrics.totalEnvelopeAreaM2}m²</strong></span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShapeSelector;
