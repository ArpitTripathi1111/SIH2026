/**
 * Team CODE TITANS - SIH26051
 * Problem Statement: Software Based Model Development for Design of Area-Specific Shelter for Thermal Comfort Maintenance
 * 
 * Interactive 2D Parametric Architectural CAD & Section Visualizer
 * 
 * Fully interactive, frontend-driven parametric design tool built with React 19, TypeScript, and Tailwind CSS.
 * Couples range sliders (Wall Thickness, Window-to-Wall Ratio, Roof Pitch/Height) in real-time
 * to vector-accurate SVG geometry. Snaps seamlessly to predefined fallback regional archetypes (Mountain, Desert, River).
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  ClimateData,
  RegionId,
  ShelterDesign,
  SimulationResults,
  ShelterGeometry,
  ArchitecturalShape
} from '../types';
import { DEFAULT_CLIMATES } from '../data/defaultClimates';
import { getMaterialById } from '../data/materials';
import { runThermalSimulation } from '../services/thermalEngine';
import { calculateShapeGeometry, resolveArchitecturalShape } from '../services/costCalculator';
import { ShapeSelector } from './ShapeSelector';
import {
  Sun,
  Wind,
  Maximize2,
  Sliders,
  RotateCcw,
  Mountain,
  SunMedium,
  Waves,
  CheckCircle2,
  AlertCircle,
  Eye,
  ShieldCheck,
  Zap,
  Info,
  Square,
  Triangle,
  Layers
} from 'lucide-react';

export interface InteractiveShelterVisualizerProps {
  design?: ShelterDesign;
  climate?: ClimateData;
  results?: SimulationResults;
  onDesignChange?: (updatedDesign: ShelterDesign) => void;
  initialRegion?: RegionId;
  readOnlyControls?: boolean;
}

export const InteractiveShelterVisualizer: React.FC<InteractiveShelterVisualizerProps> = ({
  design: externalDesign,
  climate: externalClimate,
  results: externalResults,
  onDesignChange,
  initialRegion = 'mountain',
  readOnlyControls = false
}) => {
  // Current active regional fallback archetype
  const [activeRegion, setActiveRegion] = useState<RegionId>(() => {
    const rId = externalDesign?.regionId || externalClimate?.regionId || initialRegion;
    return (rId === 'desert' || rId === 'river' || rId === 'mountain') ? rId : 'mountain';
  });

  // Predefined regional fallback baseline
  const activeFallbackProfile = DEFAULT_CLIMATES[activeRegion] || DEFAULT_CLIMATES.mountain;

  // Sync activeRegion if externalDesign or externalClimate has a recognized regional archetype
  useEffect(() => {
    const candidate = externalDesign?.regionId || externalClimate?.regionId;
    if (candidate === 'mountain' || candidate === 'desert' || candidate === 'river') {
      setActiveRegion(candidate);
    }
  }, [externalDesign?.regionId, externalClimate?.regionId]);

  // Effective Climate data (always prefer externalClimate if provided)
  const currentClimate: ClimateData = useMemo(() => {
    if (externalClimate) {
      return externalClimate;
    }
    return activeFallbackProfile.climate;
  }, [externalClimate, activeFallbackProfile]);

  // PARAMETRIC STATE: Tightly coupled to sliders and SVG geometry
  const [wallThicknessMm, setWallThicknessMm] = useState<number>(() => {
    return externalDesign?.geometry.wallThicknessMm ?? activeFallbackProfile.recommendedDefaults.wallThicknessMm;
  });

  const [wwrPercent, setWwrPercent] = useState<number>(() => {
    return externalDesign?.geometry.windowToWallRatioPercent ?? activeFallbackProfile.recommendedDefaults.windowToWallRatioPercent;
  });

  const [roofPitchDeg, setRoofPitchDeg] = useState<number>(() => {
    return externalDesign?.geometry.roofPitchDegrees ?? (activeFallbackProfile.recommendedDefaults.roofPitchDegrees || 22);
  });

  const [overhangDepthM, setOverhangDepthM] = useState<number>(() => {
    return externalDesign?.geometry.overhangDepthMeters ?? activeFallbackProfile.recommendedDefaults.overhangDepthMeters;
  });

  const [airChangesACH, setAirChangesACH] = useState<number>(() => {
    return externalDesign?.geometry.airChangesPerHourACH ?? activeFallbackProfile.recommendedDefaults.airChangesPerHourACH;
  });

  const [insulationThicknessMm, setInsulationThicknessMm] = useState<number>(() => {
    return externalDesign?.geometry.insulationThicknessMm ?? activeFallbackProfile.recommendedDefaults.insulationThicknessMm;
  });

  const [roofType, setRoofType] = useState<'pitched' | 'flat' | 'ventilated_cavity' | 'vaulted'>(() => {
    return externalDesign?.geometry.roofType ?? activeFallbackProfile.recommendedDefaults.roofType;
  });

  const [architecturalShape, setArchitecturalShape] = useState<ArchitecturalShape>(() => {
    return externalDesign?.geometry?.architecturalShape ?? resolveArchitecturalShape({
      ...(externalDesign?.geometry || activeFallbackProfile.recommendedDefaults as any),
      roofType: externalDesign?.geometry?.roofType ?? activeFallbackProfile.recommendedDefaults.roofType
    });
  });

  // Materials selection (inherits from external design or defaults)
  const [wallMaterialId, setWallMaterialId] = useState<string>(() => {
    return externalDesign?.wallMaterialId ?? activeFallbackProfile.recommendedDefaults.wallMaterialId;
  });

  const [roofMaterialId, setRoofMaterialId] = useState<string>(() => {
    return externalDesign?.roofMaterialId ?? activeFallbackProfile.recommendedDefaults.roofMaterialId;
  });

  const [insulationMaterialId, setInsulationMaterialId] = useState<string>(() => {
    return externalDesign?.insulationMaterialId ?? activeFallbackProfile.recommendedDefaults.insulationMaterialId;
  });

  const [glazingMaterialId, setGlazingMaterialId] = useState<string>(() => {
    return externalDesign?.glazingMaterialId ?? activeFallbackProfile.recommendedDefaults.glazingMaterialId;
  });

  // Display toggles
  const [showSolarRay, setShowSolarRay] = useState<boolean>(true);
  const [showAirflow, setShowAirflow] = useState<boolean>(true);
  const [showDimensions, setShowDimensions] = useState<boolean>(true);
  const [showThermalHud, setShowThermalHud] = useState<boolean>(true);

  // Sync with external design if provided and different
  useEffect(() => {
    if (externalDesign) {
      if (externalDesign.regionId !== activeRegion) {
        setActiveRegion(externalDesign.regionId);
      }
      if (externalDesign.geometry.architecturalShape) {
        setArchitecturalShape(externalDesign.geometry.architecturalShape);
      }
      setWallThicknessMm(externalDesign.geometry.wallThicknessMm);
      setWwrPercent(externalDesign.geometry.windowToWallRatioPercent);
      setRoofPitchDeg(externalDesign.geometry.roofPitchDegrees || (externalDesign.geometry.roofType === 'pitched' ? 22 : 0));
      setOverhangDepthM(externalDesign.geometry.overhangDepthMeters);
      setAirChangesACH(externalDesign.geometry.airChangesPerHourACH);
      setInsulationThicknessMm(externalDesign.geometry.insulationThicknessMm);
      setRoofType(externalDesign.geometry.roofType);
      setWallMaterialId(externalDesign.wallMaterialId);
      setRoofMaterialId(externalDesign.roofMaterialId);
      setInsulationMaterialId(externalDesign.insulationMaterialId);
      setGlazingMaterialId(externalDesign.glazingMaterialId);
    }
  }, [externalDesign]);

  // Construct active geometry object with all parameters guarded
  const activeGeometry: ShelterGeometry = useMemo(() => ({
    lengthMeters: externalDesign?.geometry?.lengthMeters ?? 6.0,
    widthMeters: externalDesign?.geometry?.widthMeters ?? 4.5,
    heightMeters: externalDesign?.geometry?.heightMeters ?? 3.0,
    floorAreaM2: (externalDesign?.geometry?.lengthMeters ?? 6.0) * (externalDesign?.geometry?.widthMeters ?? 4.5),
    wallThicknessMm,
    insulationThicknessMm,
    roofType,
    roofPitchDegrees: roofPitchDeg,
    overhangDepthMeters: overhangDepthM,
    windowToWallRatioPercent: wwrPercent,
    windowOrientation: externalDesign?.geometry?.windowOrientation ?? 'south',
    shadingType: externalDesign?.geometry?.shadingType ?? 'chhajja_overhang',
    glazingType: externalDesign?.geometry?.glazingType ?? 'double_low_e',
    airChangesPerHourACH: airChangesACH,
    occupancyCount: externalDesign?.geometry?.occupancyCount ?? 3,
    internalLoadWatts: externalDesign?.geometry?.internalLoadWatts ?? 180,
    architecturalShape
  }), [
    externalDesign?.geometry?.lengthMeters,
    externalDesign?.geometry?.widthMeters,
    externalDesign?.geometry?.heightMeters,
    externalDesign?.geometry?.windowOrientation,
    externalDesign?.geometry?.shadingType,
    externalDesign?.geometry?.glazingType,
    externalDesign?.geometry?.occupancyCount,
    externalDesign?.geometry?.internalLoadWatts,
    wallThicknessMm,
    insulationThicknessMm,
    roofType,
    roofPitchDeg,
    overhangDepthM,
    wwrPercent,
    airChangesACH,
    architecturalShape
  ]);

  // Deterministic live building physics simulation
  const computedResults: SimulationResults = useMemo(() => {
    return runThermalSimulation(
      activeGeometry,
      currentClimate,
      wallMaterialId,
      roofMaterialId,
      insulationMaterialId,
      glazingMaterialId
    );
  }, [
    activeGeometry,
    currentClimate,
    wallMaterialId,
    roofMaterialId,
    insulationMaterialId,
    glazingMaterialId
  ]);

  // Effective simulation results (prefer externalResults if provided, e.g. from ReportView)
  const effectiveResults: SimulationResults = useMemo(() => {
    if (externalResults) return externalResults;
    return computedResults;
  }, [externalResults, computedResults]);

  // Notify parent of updates
  const notifyParentTimeout = useRef<number | null>(null);
  const notifyParentOfChange = (geom: ShelterGeometry) => {
    if (!onDesignChange) return;
    if (notifyParentTimeout.current) {
      window.clearTimeout(notifyParentTimeout.current);
    }
    notifyParentTimeout.current = window.setTimeout(() => {
      const updated: ShelterDesign = {
        id: externalDesign?.id || `shelter_${activeRegion}_${Date.now()}`,
        name: externalDesign?.name || `${activeFallbackProfile.name} Shelter`,
        regionId: activeRegion,
        createdAtIso: externalDesign?.createdAtIso || new Date().toISOString(),
        geometry: {
          ...geom,
          lengthMeters: geom.lengthMeters || externalDesign?.geometry?.lengthMeters || 6.0,
          widthMeters: geom.widthMeters || externalDesign?.geometry?.widthMeters || 4.5,
          heightMeters: geom.heightMeters || externalDesign?.geometry?.heightMeters || 3.0,
          floorAreaM2: geom.floorAreaM2 || ((geom.lengthMeters || 6.0) * (geom.widthMeters || 4.5)),
          occupancyCount: externalDesign?.geometry?.occupancyCount ?? 3,
          internalLoadWatts: externalDesign?.geometry?.internalLoadWatts ?? 180,
          windowOrientation: externalDesign?.geometry?.windowOrientation ?? 'south',
          shadingType: externalDesign?.geometry?.shadingType ?? 'chhajja_overhang',
          glazingType: externalDesign?.geometry?.glazingType ?? 'double_low_e'
        },
        wallMaterialId,
        roofMaterialId,
        insulationMaterialId,
        glazingMaterialId,
        simulationResults: effectiveResults,
        updatedAtIso: new Date().toISOString()
      };
      onDesignChange(updated);
    }, 150);
  };

  // Switch to one of the 3 predefined fallback profiles
  const handleSnapToProfile = (region: RegionId) => {
    setActiveRegion(region);
    const profile = DEFAULT_CLIMATES[region];
    const defs = profile.recommendedDefaults;

    const targetShape: ArchitecturalShape = region === 'mountain'
      ? 'pitched_a_frame'
      : region === 'desert'
      ? 'vaulted_dome'
      : 'lean_to';

    setArchitecturalShape(targetShape);
    setWallThicknessMm(defs.wallThicknessMm);
    setWwrPercent(defs.windowToWallRatioPercent);
    setRoofPitchDeg(defs.roofPitchDegrees || (defs.roofType === 'pitched' ? 24 : 0));
    setOverhangDepthM(defs.overhangDepthMeters);
    setAirChangesACH(defs.airChangesPerHourACH);
    setInsulationThicknessMm(defs.insulationThicknessMm);
    setRoofType(defs.roofType);
    setWallMaterialId(defs.wallMaterialId);
    setRoofMaterialId(defs.roofMaterialId);
    setInsulationMaterialId(defs.insulationMaterialId);
    setGlazingMaterialId(defs.glazingMaterialId);

    const newGeom: ShelterGeometry = {
      ...activeGeometry,
      architecturalShape: targetShape,
      wallThicknessMm: defs.wallThicknessMm,
      windowToWallRatioPercent: defs.windowToWallRatioPercent,
      roofPitchDegrees: defs.roofPitchDegrees || 0,
      overhangDepthMeters: defs.overhangDepthMeters,
      airChangesPerHourACH: defs.airChangesPerHourACH,
      insulationThicknessMm: defs.insulationThicknessMm,
      roofType: defs.roofType
    };
    notifyParentOfChange(newGeom);
  };

  // Switch architectural base geometry shape
  const handleShapeChange = (shape: ArchitecturalShape) => {
    setArchitecturalShape(shape);
    let nextRoofType: typeof roofType = roofType;
    let nextPitch = roofPitchDeg;
    if (shape === 'flat_box') {
      nextRoofType = 'flat';
      nextPitch = 0;
    } else if (shape === 'pitched_a_frame') {
      nextRoofType = 'pitched';
      if (nextPitch < 18) nextPitch = 28;
    } else if (shape === 'vaulted_dome') {
      nextRoofType = 'vaulted';
      nextPitch = 35;
    } else if (shape === 'lean_to') {
      nextRoofType = 'pitched';
      nextPitch = 14;
    }
    setRoofType(nextRoofType);
    setRoofPitchDeg(nextPitch);
    notifyParentOfChange({
      ...activeGeometry,
      architecturalShape: shape,
      roofType: nextRoofType,
      roofPitchDegrees: nextPitch
    });
  };

  // Handle individual slider tweaks
  const handleWallThicknessChange = (val: number) => {
    setWallThicknessMm(val);
    notifyParentOfChange({ ...activeGeometry, wallThicknessMm: val });
  };

  const handleWwrChange = (val: number) => {
    setWwrPercent(val);
    notifyParentOfChange({ ...activeGeometry, windowToWallRatioPercent: val });
  };

  const handleRoofPitchChange = (val: number) => {
    setRoofPitchDeg(val);
    // If user sets pitch > 0 while roof is flat, automatically switch to pitched
    const nextRoofType = val === 0 ? 'flat' : (roofType === 'flat' ? 'pitched' : roofType);
    if (nextRoofType !== roofType) {
      setRoofType(nextRoofType);
    }
    notifyParentOfChange({ ...activeGeometry, roofPitchDegrees: val, roofType: nextRoofType });
  };

  const handleOverhangChange = (val: number) => {
    setOverhangDepthM(val);
    notifyParentOfChange({ ...activeGeometry, overhangDepthMeters: val });
  };

  // Materials lookups
  const wallMat = getMaterialById(wallMaterialId);
  const roofMat = getMaterialById(roofMaterialId);
  const insMat = getMaterialById(insulationMaterialId);

  // ==========================================
  // REAL-TIME SVG GEOMETRY CALCULATIONS
  // ==========================================
  const svgWidth = 900;
  const svgHeight = 520;
  const groundY = 410;
  const scale = 80; // 1 meter = 80 SVG units

  const buildingWidthUnits = Math.max(260, Math.min(480, activeGeometry.widthMeters * scale));
  const buildingHeightUnits = Math.max(160, Math.min(260, activeGeometry.heightMeters * (scale * 0.8)));

  const startX = (svgWidth - buildingWidthUnits) / 2;
  const endX = startX + buildingWidthUnits;
  const wallTopY = groundY - buildingHeightUnits;

  // Stilt Plinth for river terrain
  const isStiltPlinth = activeRegion === 'river';
  const stiltHeight = isStiltPlinth ? 36 : 0;
  const effectiveGroundY = groundY - stiltHeight;
  const effectiveWallTopY = wallTopY - stiltHeight;

  // 1. DYNAMIC WALL THICKNESS
  // Range 100mm to 500mm -> maps smoothly to 14px to 52px in SVG
  const wallThicknessUnits = Math.max(12, Math.min(54, (wallThicknessMm / 1000) * scale * 0.95));
  const insThicknessUnits = insulationThicknessMm > 0
    ? Math.max(6, Math.min(20, (insulationThicknessMm / 1000) * scale * 1.5))
    : 0;

  // 2. DYNAMIC WINDOW DIMENSIONS FROM WWR (10% to 60%)
  const wwrRatio = Math.max(0.10, Math.min(0.60, wwrPercent / 100));
  // Scale window width and height to visually represent the aperture ratio
  const windowWidthUnits = buildingWidthUnits * Math.min(0.72, Math.max(0.20, wwrRatio * 1.55));
  const windowHeightUnits = buildingHeightUnits * Math.min(0.70, Math.max(0.20, wwrRatio * 1.4));
  const windowX = startX + (buildingWidthUnits - windowWidthUnits) / 2;
  const effectiveWindowY = effectiveGroundY - (buildingHeightUnits * 0.28) - windowHeightUnits;

  // Overhang projection units
  const overhangUnits = overhangDepthM * scale * 0.75;

  // Shape-specific metrics from mathematical solver
  const shapeMetrics = useMemo(() => {
    return calculateShapeGeometry({
      ...activeGeometry,
      architecturalShape
    });
  }, [activeGeometry, architecturalShape]);

  // Shape classification flags
  const isLeanTo = architecturalShape === 'lean_to';
  const isVaulted = architecturalShape === 'vaulted_dome' || roofType === 'vaulted';
  const isPitched = architecturalShape === 'pitched_a_frame' || roofType === 'pitched' || roofType === 'ventilated_cavity';
  const isFlat = architecturalShape === 'flat_box' || (roofType === 'flat' && !isLeanTo && !isVaulted && !isPitched);

  // Lean-to mono-pitch: left wall is high (windward), right wall is low (leeward)
  const leanToOffset = isLeanTo ? 32 : 0;
  const leftWallTopY = isLeanTo ? effectiveWallTopY - leanToOffset : effectiveWallTopY;
  const rightWallTopY = isLeanTo ? effectiveWallTopY + leanToOffset : effectiveWallTopY;

  // Vaulted Dome knee wall and arch rise
  const kneeWallHeightUnits = isVaulted ? buildingHeightUnits * 0.42 : buildingHeightUnits;
  const kneeWallTopY = effectiveGroundY - kneeWallHeightUnits;
  const vaultArchRiseUnits = isVaulted ? buildingHeightUnits * 0.60 + 20 : 0;
  const vaultApexY = kneeWallTopY - vaultArchRiseUnits;

  // 3. DYNAMIC ROOF PITCH & HEIGHT
  // Pitch angle (0° to 45°) calculates apex height: h = tan(pitch) * (span / 2)
  const pitchRad = (roofPitchDeg * Math.PI) / 180;
  const calculatedRoofHeightUnits = isPitched
    ? Math.max(18, Math.min(130, Math.tan(pitchRad) * (buildingWidthUnits / 2)))
    : isVaulted ? vaultArchRiseUnits : 22;

  const effectiveRoofApexY = isPitched
    ? effectiveWallTopY - calculatedRoofHeightUnits
    : isVaulted
    ? vaultApexY
    : effectiveWallTopY;

  // Real-world apex rise in meters for display
  const apexRiseMeters = isPitched
    ? (calculatedRoofHeightUnits / scale).toFixed(2)
    : isVaulted
    ? (vaultArchRiseUnits / scale).toFixed(2)
    : isLeanTo
    ? ((leanToOffset * 2) / scale).toFixed(2)
    : '0.45';

  // Solar angle based on climate latitude/region
  const solarAngleDeg = activeRegion === 'mountain' ? 42 : activeRegion === 'desert' ? 68 : 62;
  const sunX = endX + 110;
  const sunY = 70;

  // Shading shadow calculation from chhajja
  const shadowLength = overhangUnits * Math.tan(((90 - solarAngleDeg) * Math.PI) / 180);
  const shadedWindowHeight = Math.min(windowHeightUnits, Math.max(0, shadowLength - (overhangUnits * 0.25)));
  const shadeCoveragePercent = Math.min(100, Math.round((shadedWindowHeight / windowHeightUnits) * 100));

  // Operative temperature display with full finite guards
  const outdoorDisplayTemp = Number.isFinite(currentClimate?.outdoorTempC)
    ? currentClimate.outdoorTempC
    : 28.0;

  const indoorDisplayTemp = Number.isFinite(effectiveResults?.averageIndoorTempC)
    ? effectiveResults.averageIndoorTempC
    : (Number.isFinite(outdoorDisplayTemp) ? outdoorDisplayTemp - 2.5 : 24.0);

  const compliancePercent = Number.isFinite(effectiveResults?.percentComfortCompliance80)
    ? effectiveResults.percentComfortCompliance80
    : 85.0;

  const isComfortable = compliancePercent >= 75;

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-lg overflow-hidden text-slate-100">
      {/* TOP HEADER: ARCHITECTURAL HUD & FALLBACK REGIONAL PRESET SELECTOR */}
      <div className="px-4 py-3 bg-slate-800/95 border-b border-slate-700 flex flex-wrap items-center justify-between gap-3">
        {/* Title and Status */}
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-sm shadow-cyan-400/50" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-cyan-300">
                2D Parametric CAD Visualizer
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-700">
                NBC 2016 Scale 1:50
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5 hidden sm:block">
              Real-time vector solver: walls, fenestration, and roof truss update continuously with slider state.
            </p>
          </div>
        </div>

        {/* PREDEFINED FALLBACK PROFILES SELECTOR & CAD TOGGLES (Hidden in ReadOnly / Print mode) */}
        {!readOnlyControls && (
          <div className="flex flex-wrap items-center gap-2 print:hidden">
            {/* PREDEFINED FALLBACK PROFILES SELECTOR (Mountain, Desert, River) */}
            <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-lg border border-slate-700 text-xs">
              <span className="text-[10px] font-mono text-slate-400 px-2 uppercase font-semibold">Archetypes:</span>
              
              <button
                type="button"
                onClick={() => handleSnapToProfile('mountain')}
                className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition-all ${
                  activeRegion === 'mountain'
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
                title="Snap to Ladakh Mountain baseline (Cold & Arid)"
              >
                <Mountain className="w-3.5 h-3.5 text-sky-200" />
                <span>Mountain</span>
              </button>

              <button
                type="button"
                onClick={() => handleSnapToProfile('desert')}
                className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition-all ${
                  activeRegion === 'desert'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
                title="Snap to Thar Desert baseline (Hot & Dry)"
              >
                <SunMedium className="w-3.5 h-3.5 text-amber-200" />
                <span>Desert</span>
              </button>

              <button
                type="button"
                onClick={() => handleSnapToProfile('river')}
                className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition-all ${
                  activeRegion === 'river'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
                title="Snap to Gangetic River Basin baseline (Warm & Humid)"
              >
                <Waves className="w-3.5 h-3.5 text-emerald-200" />
                <span>River</span>
              </button>
            </div>

            {/* CAD Toggles */}
            <div className="flex items-center gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => setShowSolarRay(!showSolarRay)}
                className={`px-2 py-1 rounded border flex items-center gap-1 transition-colors ${
                  showSolarRay
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
                title="Toggle Solar Vector & Chhajja Shadow Projection"
              >
                <Sun className="w-3 h-3" />
                <span className="hidden md:inline">Solar Ray</span>
              </button>

              <button
                type="button"
                onClick={() => setShowAirflow(!showAirflow)}
                className={`px-2 py-1 rounded border flex items-center gap-1 transition-colors ${
                  showAirflow
                    ? 'bg-sky-500/20 border-sky-500/50 text-sky-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
                title="Toggle Cross-Ventilation Streamline"
              >
                <Wind className="w-3 h-3" />
                <span className="hidden md:inline">Airflow</span>
              </button>

              <button
                type="button"
                onClick={() => setShowDimensions(!showDimensions)}
                className={`px-2 py-1 rounded border flex items-center gap-1 transition-colors ${
                  showDimensions
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
                title="Toggle CAD Dimension Annotations"
              >
                <Maximize2 className="w-3 h-3" />
                <span className="hidden md:inline">Dims</span>
              </button>

              <button
                type="button"
                onClick={() => handleSnapToProfile(activeRegion)}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded flex items-center gap-1 transition-colors"
                title="Reset sliders to this region's baseline"
              >
                <RotateCcw className="w-3 h-3" />
                <span className="hidden md:inline">Reset</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* BASE ARCHITECTURAL GEOMETRY SELECTOR (ShapeSelector) */}
      {!readOnlyControls && (
        <div className="p-3.5 bg-slate-950/80 border-b border-slate-800">
          <ShapeSelector
            selectedShape={architecturalShape}
            onSelectShape={handleShapeChange}
            currentGeometry={activeGeometry}
          />
        </div>
      )}

      {/* SVG CAD STAGE: REAL-TIME VECTOR DRAWING */}
      <div className="relative w-full aspect-[16/9] max-h-[480px] bg-[#0b1220] flex items-center justify-center p-2 overflow-hidden border-b border-slate-800">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-full select-none"
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          <defs>
            {/* Precision CAD Drafting Grid */}
            <pattern id="cadGrid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(56, 189, 248, 0.05)" strokeWidth="1" />
            </pattern>
            <pattern id="cadMajorGrid" width="100" height="100" patternUnits="userSpaceOnUse">
              <rect width="100" height="100" fill="url(#cadGrid)" />
              <path d="M 100 0 L 0 0 0 100" fill="none" stroke="rgba(56, 189, 248, 0.12)" strokeWidth="1" />
            </pattern>

            {/* Masonry Cross-Hatching */}
            <pattern id="masonryHatch" width="12" height="12" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="12" stroke="#64748b" strokeWidth="1.2" />
            </pattern>

            {/* Continuous Insulation Batt Hatching */}
            <pattern id="insulationPattern" width="10" height="8" patternUnits="userSpaceOnUse">
              <path d="M 0 4 Q 2.5 0, 5 4 T 10 4" fill="none" stroke="#f59e0b" strokeWidth="1.2" />
            </pattern>

            {/* Geological Sub-Grade Earth Hatching */}
            <pattern id="earthHatch" width="16" height="16" patternUnits="userSpaceOnUse">
              <line x1="0" y1="16" x2="16" y2="0" stroke="#334155" strokeWidth="1" />
              <line x1="8" y1="16" x2="16" y2="8" stroke="#334155" strokeWidth="0.75" />
            </pattern>

            {/* Shading Shadow Dot Screen */}
            <pattern id="shadowDots" width="6" height="6" patternUnits="userSpaceOnUse">
              <circle cx="3" cy="3" r="1.2" fill="#000000" opacity="0.45" />
            </pattern>

            {/* Airflow Direction Vector Arrow */}
            <marker id="airflowArrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 8 5 L 0 9 z" fill="#38bdf8" />
            </marker>
          </defs>

          {/* Background Drafting Grid */}
          <rect width={svgWidth} height={svgHeight} fill="url(#cadMajorGrid)" />

          {/* SOLAR RAY & SHADOW ANGLE */}
          {showSolarRay && (
            <g className="transition-all duration-200">
              {/* Sun Visualizer */}
              <circle cx={sunX} cy={sunY} r="22" fill="#fbbf24" opacity="0.9" />
              <circle cx={sunX} cy={sunY} r="32" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.6" />
              <text x={sunX} y={sunY + 44} textAnchor="middle" fill="#fbbf24" fontSize="11" fontFamily="monospace">
                SOLAR: {currentClimate.directNormalSolarRadiationWm2} W/m²
              </text>
              <text x={sunX} y={sunY + 58} textAnchor="middle" fill="#f59e0b" fontSize="10" fontFamily="monospace">
                Altitude: {solarAngleDeg}°
              </text>

              {/* Direct Solar Beam to Roof Apex */}
              <line
                x1={sunX - 25}
                y1={sunY + 20}
                x2={startX + overhangUnits + 20}
                y2={effectiveRoofApexY}
                stroke="#f59e0b"
                strokeWidth="1.5"
                strokeDasharray="6 4"
                opacity="0.65"
              />

              {/* Direct Solar Beam to Window Aperture */}
              <line
                x1={sunX - 35}
                y1={sunY + 30}
                x2={windowX + windowWidthUnits}
                y2={effectiveWindowY + 12}
                stroke="#f59e0b"
                strokeWidth="1.5"
                strokeDasharray="5 4"
                opacity="0.65"
              />
            </g>
          )}

          {/* GROUND PLANE & FOUNDATION DATUM */}
          <rect x="0" y={groundY} width={svgWidth} height={svgHeight - groundY} fill="url(#earthHatch)" />
          <line x1="0" y1={groundY} x2={svgWidth} y2={groundY} stroke="#475569" strokeWidth="2.5" />
          <text x="35" y={groundY + 22} fill="#94a3b8" fontSize="11" fontFamily="monospace">
            GL ±0.00m (Datum)
          </text>

          {/* RIVER STILT PLINTH (If River Region) */}
          {isStiltPlinth && (
            <g>
              <rect x={startX + 20} y={effectiveGroundY} width="16" height={stiltHeight} fill="#78350f" stroke="#451a03" strokeWidth="1.5" />
              <rect x={startX + buildingWidthUnits / 2 - 8} y={effectiveGroundY} width="16" height={stiltHeight} fill="#78350f" stroke="#451a03" strokeWidth="1.5" />
              <rect x={endX - 36} y={effectiveGroundY} width="16" height={stiltHeight} fill="#78350f" stroke="#451a03" strokeWidth="1.5" />
              <text x={startX - 10} y={effectiveGroundY + 20} fill="#f59e0b" fontSize="10" fontFamily="monospace">
                +0.45m Flood/Breeze Stilt
              </text>
            </g>
          )}

          {/* REINFORCED CONCRETE PLINTH SLAB */}
          <rect
            x={startX - 15}
            y={effectiveGroundY}
            width={buildingWidthUnits + 30}
            height="18"
            fill="#334155"
            stroke="#64748b"
            strokeWidth="1.5"
          />

          {/* INTERIOR HABITABLE VOID (Shape-Responsive Volume) */}
          {isVaulted ? (
            <path
              d={`
                M ${startX + wallThicknessUnits + insThicknessUnits} ${effectiveGroundY}
                L ${startX + wallThicknessUnits + insThicknessUnits} ${kneeWallTopY}
                Q ${startX + buildingWidthUnits / 2} ${vaultApexY + 22} ${endX - wallThicknessUnits - insThicknessUnits} ${kneeWallTopY}
                L ${endX - wallThicknessUnits - insThicknessUnits} ${effectiveGroundY}
                Z
              `}
              fill="#0f172a"
              stroke="#1e293b"
              strokeWidth="1"
            />
          ) : isLeanTo ? (
            <polygon
              points={`
                ${startX + wallThicknessUnits + insThicknessUnits},${effectiveGroundY}
                ${startX + wallThicknessUnits + insThicknessUnits},${leftWallTopY}
                ${endX - wallThicknessUnits - insThicknessUnits},${rightWallTopY}
                ${endX - wallThicknessUnits - insThicknessUnits},${effectiveGroundY}
              `}
              fill="#0f172a"
              stroke="#1e293b"
              strokeWidth="1"
            />
          ) : (
            <rect
              x={startX + wallThicknessUnits + insThicknessUnits}
              y={effectiveWallTopY}
              width={buildingWidthUnits - 2 * (wallThicknessUnits + insThicknessUnits)}
              height={effectiveGroundY - effectiveWallTopY}
              fill="#0f172a"
              stroke="#1e293b"
              strokeWidth="1"
            />
          )}

          {/* ========================================================= */}
          {/* 1. LEFT STRUCTURAL WALL (Dynamically expands with slider) */}
          {/* ========================================================= */}
          <rect
            x={startX}
            y={isVaulted ? kneeWallTopY : leftWallTopY}
            width={wallThicknessUnits}
            height={effectiveGroundY - (isVaulted ? kneeWallTopY : leftWallTopY)}
            fill="url(#masonryHatch)"
            stroke="#94a3b8"
            strokeWidth="1.5"
          />
          {/* Left Insulation Layer */}
          {insThicknessUnits > 0 && (
            <rect
              x={startX + wallThicknessUnits}
              y={isVaulted ? kneeWallTopY : leftWallTopY}
              width={insThicknessUnits}
              height={effectiveGroundY - (isVaulted ? kneeWallTopY : leftWallTopY)}
              fill="url(#insulationPattern)"
              stroke="#d97706"
              strokeWidth="1"
            />
          )}

          {/* ========================================================== */}
          {/* 2. RIGHT STRUCTURAL WALL (Dynamically expands with slider) */}
          {/* ========================================================== */}
          <rect
            x={endX - wallThicknessUnits}
            y={isVaulted ? kneeWallTopY : rightWallTopY}
            width={wallThicknessUnits}
            height={effectiveGroundY - (isVaulted ? kneeWallTopY : rightWallTopY)}
            fill="url(#masonryHatch)"
            stroke="#94a3b8"
            strokeWidth="1.5"
          />
          {/* Right Insulation Layer */}
          {insThicknessUnits > 0 && (
            <rect
              x={endX - wallThicknessUnits - insThicknessUnits}
              y={isVaulted ? kneeWallTopY : rightWallTopY}
              width={insThicknessUnits}
              height={effectiveGroundY - (isVaulted ? kneeWallTopY : rightWallTopY)}
              fill="url(#insulationPattern)"
              stroke="#d97706"
              strokeWidth="1"
            />
          )}

          {/* ======================================================== */}
          {/* 3. FENESTRATION / WINDOW ASSEMBLY (Scales with WWR)       */}
          {/* ======================================================== */}
          <g>
            {/* Window Glass Body */}
            <rect
              x={windowX}
              y={effectiveWindowY}
              width={windowWidthUnits}
              height={windowHeightUnits}
              fill="#0284c7"
              fillOpacity="0.25"
              stroke="#38bdf8"
              strokeWidth="2"
            />

            {/* Vertical Mullion */}
            <line
              x1={windowX + windowWidthUnits / 2}
              y1={effectiveWindowY}
              x2={windowX + windowWidthUnits / 2}
              y2={effectiveWindowY + windowHeightUnits}
              stroke="#38bdf8"
              strokeWidth="1.5"
            />

            {/* Horizontal Transom */}
            <line
              x1={windowX}
              y1={effectiveWindowY + windowHeightUnits / 2}
              x2={windowX + windowWidthUnits}
              y2={effectiveWindowY + windowHeightUnits / 2}
              stroke="#38bdf8"
              strokeWidth="1.5"
            />

            {/* Window Sill */}
            <rect
              x={windowX - 6}
              y={effectiveWindowY + windowHeightUnits}
              width={windowWidthUnits + 12}
              height="6"
              fill="#64748b"
              stroke="#94a3b8"
              strokeWidth="1"
            />

            {/* Solar Shading Shadow Polygon cast across the window */}
            {shadedWindowHeight > 0 && showSolarRay && (
              <polygon
                points={`
                  ${windowX},${effectiveWindowY}
                  ${windowX + windowWidthUnits},${effectiveWindowY}
                  ${windowX + windowWidthUnits},${effectiveWindowY + shadedWindowHeight}
                  ${windowX},${effectiveWindowY + shadedWindowHeight}
                `}
                fill="url(#shadowDots)"
              />
            )}

            {/* Chhajja / Overhang Projection (Scales with Window Width + Overhang) */}
            <g>
              <polygon
                points={`
                  ${windowX - 14},${effectiveWindowY - 4}
                  ${windowX + windowWidthUnits + 14},${effectiveWindowY - 4}
                  ${windowX + windowWidthUnits + 14 + overhangUnits},${effectiveWindowY + 14}
                  ${windowX - 14 - overhangUnits * 0.35},${effectiveWindowY + 14}
                `}
                fill="#475569"
                stroke="#cbd5e1"
                strokeWidth="1.5"
              />
              <text
                x={windowX + windowWidthUnits / 2}
                y={effectiveWindowY - 9}
                textAnchor="middle"
                fill="#e2e8f0"
                fontSize="10"
                fontFamily="monospace"
              >
                CHHAJJA: {overhangDepthM.toFixed(2)}m (Shade: {shadeCoveragePercent}%)
              </text>
            </g>

            {/* Live WWR Label inside window */}
            <text
              x={windowX + windowWidthUnits / 2}
              y={effectiveWindowY + windowHeightUnits / 2 + 4}
              textAnchor="middle"
              fill="#bae6fd"
              fontSize="12"
              fontWeight="bold"
              fontFamily="monospace"
            >
              WWR: {wwrPercent}%
            </text>
          </g>

          {/* ======================================================== */}
          {/* 4. ROOF GEOMETRY ASSEMBLY (Dynamic Architectural Shapes) */}
          {/* ======================================================== */}

          {/* (A) PITCHED / A-FRAME ROOF (Mountain / High Precipitation) */}
          {isPitched && roofType !== 'ventilated_cavity' && (
            <g>
              {/* Primary Rafter / Triangular Truss */}
              <polygon
                points={`
                  ${startX - overhangUnits},${effectiveWallTopY + 10}
                  ${startX + buildingWidthUnits / 2},${effectiveRoofApexY}
                  ${endX + overhangUnits},${effectiveWallTopY + 10}
                `}
                fill="#1e293b"
                stroke="#38bdf8"
                strokeWidth="3"
              />

              {/* Timber / Steel Collar Tie Beam */}
              <line
                x1={startX + wallThicknessUnits + 10}
                y1={effectiveWallTopY + 16}
                x2={endX - wallThicknessUnits - 10}
                y2={effectiveWallTopY + 16}
                stroke="#94a3b8"
                strokeWidth="2"
                strokeDasharray="6 3"
              />

              {/* Central King Post */}
              <line
                x1={startX + buildingWidthUnits / 2}
                y1={effectiveRoofApexY}
                x2={startX + buildingWidthUnits / 2}
                y2={effectiveWallTopY + 16}
                stroke="#94a3b8"
                strokeWidth="2"
              />

              {/* Ridge Cap at Apex */}
              <polygon
                points={`
                  ${startX + buildingWidthUnits / 2 - 14},${effectiveRoofApexY + 4}
                  ${startX + buildingWidthUnits / 2},${effectiveRoofApexY - 10}
                  ${startX + buildingWidthUnits / 2 + 14},${effectiveRoofApexY + 4}
                `}
                fill="#0284c7"
                stroke="#bae6fd"
                strokeWidth="1.5"
              />

              {/* Corrugated Roofing Tile Texture Lines */}
              <line
                x1={startX - overhangUnits + 24}
                y1={effectiveWallTopY + 8}
                x2={startX + buildingWidthUnits / 2}
                y2={effectiveRoofApexY + 2}
                stroke="#64748b"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              <line
                x1={endX + overhangUnits - 24}
                y1={effectiveWallTopY + 8}
                x2={startX + buildingWidthUnits / 2}
                y2={effectiveRoofApexY + 2}
                stroke="#64748b"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />

              {/* Snow / Rain Watershed Runoff Arrows */}
              <path
                d={`M ${startX + buildingWidthUnits / 4} ${effectiveRoofApexY + 20} L ${startX - overhangUnits + 10} ${effectiveWallTopY + 25}`}
                fill="none"
                stroke="#38bdf8"
                strokeWidth="1.5"
                markerEnd="url(#airflowArrow)"
              />
              <path
                d={`M ${endX - buildingWidthUnits / 4} ${effectiveRoofApexY + 20} L ${endX + overhangUnits - 10} ${effectiveWallTopY + 25}`}
                fill="none"
                stroke="#38bdf8"
                strokeWidth="1.5"
                markerEnd="url(#airflowArrow)"
              />

              {/* Live Roof Pitch & Apex Label */}
              <text
                x={startX + buildingWidthUnits / 2}
                y={effectiveRoofApexY - 16}
                textAnchor="middle"
                fill="#38bdf8"
                fontSize="11"
                fontWeight="bold"
                fontFamily="monospace"
              >
                PITCHED A-FRAME | PITCH: {roofPitchDeg}° | APEX RISE: {apexRiseMeters}m (Snow Shedding)
              </text>
            </g>
          )}

          {/* (B) FLAT-ROOF BOX (NBC 2016 Baseline) */}
          {isFlat && (
            <g>
              {/* Flat Concrete Slab */}
              <rect
                x={startX - overhangUnits}
                y={effectiveWallTopY - 18}
                width={buildingWidthUnits + 2 * overhangUnits}
                height="22"
                fill="#334155"
                stroke="#94a3b8"
                strokeWidth="2"
              />
              {/* Left & Right 450mm Parapet Walls */}
              <rect x={startX - overhangUnits} y={effectiveWallTopY - 38} width="16" height="20" fill="#475569" stroke="#94a3b8" strokeWidth="1" />
              <rect x={endX + overhangUnits - 16} y={effectiveWallTopY - 38} width="16" height="20" fill="#475569" stroke="#94a3b8" strokeWidth="1" />

              {/* Parapet Coping Stone Caps */}
              <rect x={startX - overhangUnits - 2} y={effectiveWallTopY - 42} width="20" height="4" fill="#64748b" />
              <rect x={endX + overhangUnits - 18} y={effectiveWallTopY - 42} width="20" height="4" fill="#64748b" />

              {/* Terrace Drainage Gargoyle Spigot */}
              <rect x={endX + overhangUnits} y={effectiveWallTopY - 20} width="14" height="6" fill="#0284c7" stroke="#38bdf8" strokeWidth="1" />

              <text
                x={startX + buildingWidthUnits / 2}
                y={effectiveWallTopY - 26}
                textAnchor="middle"
                fill="#cbd5e1"
                fontSize="10"
                fontFamily="monospace"
              >
                FLAT-ROOF BOX | 150mm RCC SLAB + 450mm PARAPET | PITCH: 0°
              </text>
            </g>
          )}

          {/* (C) VAULTED / CATENARY DOME (Desert / Minimal Solar Exposure) */}
          {isVaulted && (
            <g>
              {/* Thick Arched Catenary Shell */}
              <path
                d={`
                  M ${startX - overhangUnits} ${kneeWallTopY}
                  Q ${startX + buildingWidthUnits / 2} ${vaultApexY - 14} ${endX + overhangUnits} ${kneeWallTopY}
                  L ${endX + overhangUnits} ${kneeWallTopY + 14}
                  Q ${startX + buildingWidthUnits / 2} ${vaultApexY + 18} ${startX - overhangUnits} ${kneeWallTopY + 14}
                  Z
                `}
                fill="#1e293b"
                stroke="#f59e0b"
                strokeWidth="2.5"
              />

              {/* Compression Keystone at Vault Apex */}
              <polygon
                points={`
                  ${startX + buildingWidthUnits / 2 - 14},${vaultApexY - 18}
                  ${startX + buildingWidthUnits / 2 + 14},${vaultApexY - 18}
                  ${startX + buildingWidthUnits / 2 + 10},${vaultApexY + 14}
                  ${startX + buildingWidthUnits / 2 - 10},${vaultApexY + 14}
                `}
                fill="#d97706"
                stroke="#fef3c7"
                strokeWidth="1.5"
              />
              <text
                x={startX + buildingWidthUnits / 2}
                y={vaultApexY}
                textAnchor="middle"
                fill="#fef3c7"
                fontSize="8"
                fontFamily="monospace"
                fontWeight="bold"
              >
                KEY
              </text>

              {/* Radial Arch Voussoir Joints */}
              <line
                x1={startX + buildingWidthUnits * 0.25}
                y1={kneeWallTopY - 15}
                x2={startX + buildingWidthUnits * 0.25 - 6}
                y2={kneeWallTopY - 28}
                stroke="#f59e0b"
                strokeWidth="1.5"
                strokeDasharray="2 2"
              />
              <line
                x1={endX - buildingWidthUnits * 0.25}
                y1={kneeWallTopY - 15}
                x2={endX - buildingWidthUnits * 0.25 + 6}
                y2={kneeWallTopY - 28}
                stroke="#f59e0b"
                strokeWidth="1.5"
                strokeDasharray="2 2"
              />

              {/* Tangent Solar Reflection Vector demonstrating reduced heat gain */}
              <path
                d={`M ${sunX - 30} ${sunY + 40} L ${endX - buildingWidthUnits * 0.2} ${vaultApexY + 10}`}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />
              <path
                d={`M ${endX - buildingWidthUnits * 0.2} ${vaultApexY + 10} L ${endX + 30} ${vaultApexY - 20}`}
                fill="none"
                stroke="#fbbf24"
                strokeWidth="1.5"
                markerEnd="url(#airflowArrow)"
              />
              <text
                x={endX + 35}
                y={vaultApexY - 24}
                fill="#fbbf24"
                fontSize="9"
                fontFamily="monospace"
              >
                Reflected Irradiance
              </text>

              {/* Live Vault Dome Label */}
              <text
                x={startX + buildingWidthUnits / 2}
                y={vaultApexY - 24}
                textAnchor="middle"
                fill="#f59e0b"
                fontSize="11"
                fontWeight="bold"
                fontFamily="monospace"
              >
                VAULTED CATENARY DOME | S/V: {shapeMetrics.surfaceAreaToVolumeRatio} m⁻¹ | RISE: {apexRiseMeters}m
              </text>
            </g>
          )}

          {/* (D) LEAN-TO / SLOPED MONO-PITCH ROOF (Rapid Assembly & Direct Runoff) */}
          {isLeanTo && (
            <g>
              {/* Mono-Pitch Sloping Roof Deck */}
              <polygon
                points={`
                  ${startX - overhangUnits},${leftWallTopY - 14}
                  ${endX + overhangUnits + 14},${rightWallTopY - 14}
                  ${endX + overhangUnits + 14},${rightWallTopY + 10}
                  ${startX - overhangUnits},${leftWallTopY + 10}
                `}
                fill="#1e293b"
                stroke="#10b981"
                strokeWidth="3"
              />

              {/* High-Side Clerestory Transom Vent */}
              <rect
                x={startX + wallThicknessUnits + 14}
                y={leftWallTopY + 8}
                width="48"
                height="20"
                rx="2"
                fill="#0284c7"
                fillOpacity="0.3"
                stroke="#38bdf8"
                strokeWidth="1.2"
                strokeDasharray="3 2"
              />
              <text
                x={startX + wallThicknessUnits + 38}
                y={leftWallTopY + 22}
                textAnchor="middle"
                fill="#bae6fd"
                fontSize="9"
                fontFamily="monospace"
              >
                CLERESTORY
              </text>

              {/* Low-Side Rainwater Gutter & Downspout */}
              <circle
                cx={endX + overhangUnits + 14}
                cy={rightWallTopY + 8}
                r="6.5"
                fill="#0284c7"
                stroke="#38bdf8"
                strokeWidth="1.5"
              />
              <line
                x1={endX + overhangUnits + 14}
                y1={rightWallTopY + 14}
                x2={endX + overhangUnits + 14}
                y2={effectiveGroundY}
                stroke="#0284c7"
                strokeWidth="2.5"
                strokeDasharray="4 2"
              />
              <text
                x={endX + overhangUnits + 24}
                y={rightWallTopY + 32}
                fill="#38bdf8"
                fontSize="9"
                fontFamily="monospace"
              >
                RWH Gutter
              </text>

              {/* Sloped Mono-Pitch Rake Rafter Lines */}
              <line
                x1={startX - overhangUnits + 20}
                y1={leftWallTopY - 4}
                x2={endX + overhangUnits}
                y2={rightWallTopY - 4}
                stroke="#64748b"
                strokeWidth="1.5"
                strokeDasharray="5 3"
              />

              {/* Mono-pitch Slope Flow Indicator */}
              <path
                d={`M ${startX + buildingWidthUnits * 0.3} ${leftWallTopY - 20} L ${endX - buildingWidthUnits * 0.2} ${rightWallTopY - 20}`}
                fill="none"
                stroke="#10b981"
                strokeWidth="1.5"
                markerEnd="url(#airflowArrow)"
              />

              {/* Live Mono-Pitch Label */}
              <text
                x={startX + buildingWidthUnits / 2}
                y={Math.min(leftWallTopY, rightWallTopY) - 24}
                textAnchor="middle"
                fill="#10b981"
                fontSize="11"
                fontWeight="bold"
                fontFamily="monospace"
              >
                LEAN-TO MONO-PITCH | 14° SLOPE | RAPID ASSEMBLY & DIRECT RUNOFF
              </text>
            </g>
          )}

          {/* (E) VENTILATED DOUBLE-ROOF CAVITY (Optional Variant) */}
          {roofType === 'ventilated_cavity' && (
            <g>
              {/* Upper Weather Skin (Terracotta Mangalore tiles) */}
              <polygon
                points={`
                  ${startX - overhangUnits - 15},${effectiveWallTopY + 10}
                  ${startX + buildingWidthUnits / 2},${effectiveRoofApexY - 8}
                  ${endX + overhangUnits + 15},${effectiveWallTopY + 10}
                `}
                fill="none"
                stroke="#ea580c"
                strokeWidth="3.5"
              />
              {/* Lower Ceiling Deck */}
              <polygon
                points={`
                  ${startX - overhangUnits},${effectiveWallTopY + 22}
                  ${startX + buildingWidthUnits / 2},${effectiveRoofApexY + 14}
                  ${endX + overhangUnits},${effectiveWallTopY + 22}
                `}
                fill="#1e293b"
                stroke="#64748b"
                strokeWidth="2"
              />
              {/* Ventilated Cavity Label */}
              <text
                x={startX + buildingWidthUnits / 2}
                y={effectiveRoofApexY - 18}
                textAnchor="middle"
                fill="#fdba74"
                fontSize="11"
                fontWeight="bold"
                fontFamily="monospace"
              >
                VENTILATED DOUBLE CAVITY ({roofPitchDeg}° Pitch | Exhaust Air Gap)
              </text>
              {/* Buoyant thermal plume arrow */}
              <path
                d={`M ${startX + buildingWidthUnits / 2} ${effectiveRoofApexY + 8} Q ${startX + buildingWidthUnits / 2} ${effectiveRoofApexY - 16} ${startX + buildingWidthUnits / 2 + 18} ${effectiveRoofApexY - 22}`}
                fill="none"
                stroke="#ea580c"
                strokeWidth="2"
                strokeDasharray="3 2"
                markerEnd="url(#airflowArrow)"
              />
            </g>
          )}

          {/* AIRFLOW STREAMLINE (Cross-Ventilation Vector) */}
          {showAirflow && (
            <g className="transition-opacity duration-200">
              <path
                d={`M ${startX - 40} ${effectiveWindowY + windowHeightUnits / 2} Q ${startX + wallThicknessUnits + 30} ${effectiveWindowY + windowHeightUnits / 2 - 20} ${windowX + windowWidthUnits / 2} ${effectiveWindowY + windowHeightUnits / 2 + 10} T ${endX + 40} ${effectiveWindowY + windowHeightUnits / 2}`}
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2.5"
                strokeDasharray="7 4"
                markerEnd="url(#airflowArrow)"
              />
              <text x={startX - 50} y={effectiveWindowY + windowHeightUnits / 2 - 12} fill="#38bdf8" fontSize="10" fontFamily="monospace">
                Cool Breeze ({airChangesACH} ACH)
              </text>
            </g>
          )}

          {/* THERMAL HUD CARDS INSIDE & OUTSIDE SVG */}
          {showThermalHud && (
            <g>
              {/* Outdoor Weather Ambient Pill */}
              <g transform="translate(40, 40)">
                <rect width="180" height="66" rx="6" fill="#0f172a" fillOpacity="0.88" stroke="#334155" strokeWidth="1" />
                <text x="12" y="18" fill="#94a3b8" fontSize="10" fontFamily="monospace">OUTDOOR AMBIENT</text>
                <text x="12" y="44" fill="#f87171" fontSize="22" fontWeight="bold" fontFamily="monospace">
                  {outdoorDisplayTemp.toFixed(1)}°C
                </text>
                <text x="100" y="44" fill="#94a3b8" fontSize="11" fontFamily="monospace">
                  RH {currentClimate.relativeHumidityPercent}%
                </text>
                <text x="12" y="58" fill="#64748b" fontSize="9" fontFamily="monospace">
                  Zone: {activeRegion.toUpperCase()}
                </text>
              </g>

              {/* Indoor Operative Core Pill */}
              <g transform={`translate(${startX + buildingWidthUnits / 2 - 105}, ${effectiveGroundY - 70})`}>
                <rect width="210" height="56" rx="6" fill="#022c22" fillOpacity="0.88" stroke="#10b981" strokeWidth="1.2" />
                <text x="12" y="18" fill="#6ee7b7" fontSize="10" fontFamily="monospace">INDOOR OPERATIVE TEMP</text>
                <text x="12" y="44" fill="#34d399" fontSize="22" fontWeight="bold" fontFamily="monospace">
                  {indoorDisplayTemp.toFixed(1)}°C
                </text>
                <text x="110" y="44" fill="#a7f3d0" fontSize="11" fontFamily="monospace">
                  IMAC: {compliancePercent}%
                </text>
              </g>
            </g>
          )}

          {/* CAD DIMENSION LINES & ANNOTATIONS */}
          {showDimensions && (
            <g stroke="#94a3b8" strokeWidth="1" opacity="0.85">
              {/* Horizontal Width Dimension */}
              <line x1={startX} y1={effectiveGroundY + 36} x2={endX} y2={effectiveGroundY + 36} />
              <line x1={startX} y1={effectiveGroundY + 30} x2={startX} y2={effectiveGroundY + 42} />
              <line x1={endX} y1={effectiveGroundY + 30} x2={endX} y2={effectiveGroundY + 42} />
              <text
                x={startX + buildingWidthUnits / 2}
                y={effectiveGroundY + 50}
                textAnchor="middle"
                fill="#94a3b8"
                fontSize="11"
                fontFamily="monospace"
              >
                SPAN: {activeGeometry.widthMeters.toFixed(1)}m
              </text>

              {/* Vertical Wall Height Dimension */}
              <line x1={startX - 30} y1={effectiveGroundY} x2={startX - 30} y2={effectiveWallTopY} />
              <line x1={startX - 36} y1={effectiveGroundY} x2={startX - 24} y2={effectiveGroundY} />
              <line x1={startX - 36} y1={effectiveWallTopY} x2={startX - 24} y2={effectiveWallTopY} />
              <text
                x={startX - 38}
                y={(effectiveGroundY + effectiveWallTopY) / 2}
                textAnchor="end"
                dominantBaseline="middle"
                fill="#94a3b8"
                fontSize="11"
                fontFamily="monospace"
              >
                H: {activeGeometry.heightMeters.toFixed(1)}m
              </text>

              {/* Live Wall Thickness Indicator Label on Left Wall */}
              <text
                x={startX + wallThicknessUnits / 2}
                y={effectiveWallTopY - 8}
                textAnchor="middle"
                fill="#38bdf8"
                fontSize="10"
                fontWeight="bold"
                fontFamily="monospace"
              >
                {wallThicknessMm}mm
              </text>

              {/* Right Wall Thickness Indicator */}
              <text
                x={endX - wallThicknessUnits / 2}
                y={effectiveWallTopY - 8}
                textAnchor="middle"
                fill="#38bdf8"
                fontSize="10"
                fontWeight="bold"
                fontFamily="monospace"
              >
                {wallThicknessMm}mm
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* ========================================================================= */}
      {/* INTERACTIVE CONTROLS PANEL: 3 CORE PARAMETRIC RANGE SLIDERS + CONTROLS    */}
      {/* ========================================================================= */}
      {!readOnlyControls && (
        <div className="p-5 bg-slate-900/90 space-y-5 border-b border-slate-800">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                Interactive Parametric Architectural Controls
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Move sliders to observe instantaneous SVG geometric transformation & building physics response
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* =================================================================== */}
            {/* PARAMETER 1: WALL THICKNESS (100mm to 500mm)                       */}
            {/* =================================================================== */}
            <div className="bg-slate-800/70 p-4 rounded-lg border border-slate-700/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-200 uppercase tracking-wide">
                  1. Wall Thickness
                </span>
                <span className="px-2 py-0.5 rounded bg-blue-950/80 text-cyan-300 border border-blue-800 font-mono text-xs font-bold">
                  {wallThicknessMm} mm ({((wallThicknessMm / 1000)).toFixed(2)}m)
                </span>
              </div>

              <input
                type="range"
                min="100"
                max="500"
                step="10"
                value={wallThicknessMm}
                onChange={(e) => handleWallThicknessChange(Number(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />

              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>100mm (Thin/Light)</span>
                <span>300mm (Standard)</span>
                <span>500mm (High Mass)</span>
              </div>

              {/* Quick Presets */}
              <div className="flex gap-1.5 pt-1">
                {[
                  { label: '150mm', val: 150 },
                  { label: '230mm', val: 230 },
                  { label: '350mm', val: 350 },
                  { label: '450mm', val: 450 }
                ].map((p) => (
                  <button
                    key={p.val}
                    type="button"
                    onClick={() => handleWallThicknessChange(p.val)}
                    className={`flex-1 py-1 text-[10px] font-mono rounded border transition-colors ${
                      wallThicknessMm === p.val
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 font-bold'
                        : 'bg-slate-900/60 border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              <p className="text-[11px] text-slate-400 leading-tight">
                Controls thermal inertia, lag delay ({computedResults.thermalLagHours}h), and attenuation damping ({computedResults.diurnalDampingPercent}%).
              </p>
            </div>

            {/* =================================================================== */}
            {/* PARAMETER 2: WINDOW-TO-WALL RATIO (WWR) (10% to 60%)                */}
            {/* =================================================================== */}
            <div className="bg-slate-800/70 p-4 rounded-lg border border-slate-700/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-200 uppercase tracking-wide">
                  2. Window-to-Wall Ratio
                </span>
                <span className="px-2 py-0.5 rounded bg-blue-950/80 text-cyan-300 border border-blue-800 font-mono text-xs font-bold">
                  Current WWR: {wwrPercent}%
                </span>
              </div>

              <input
                type="range"
                min="10"
                max="60"
                step="1"
                value={wwrPercent}
                onChange={(e) => handleWwrChange(Number(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />

              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>10% (Min Aperture)</span>
                <span>25% (Balanced)</span>
                <span>60% (Max Glazing)</span>
              </div>

              {/* Quick Presets */}
              <div className="flex gap-1.5 pt-1">
                {[
                  { label: '12% (Desert)', val: 12 },
                  { label: '18% (Mtn)', val: 18 },
                  { label: '30% (Std)', val: 30 },
                  { label: '45% (River)', val: 45 }
                ].map((p) => (
                  <button
                    key={p.val}
                    type="button"
                    onClick={() => handleWwrChange(p.val)}
                    className={`flex-1 py-1 text-[10px] font-mono rounded border transition-colors ${
                      wwrPercent === p.val
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 font-bold'
                        : 'bg-slate-900/60 border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              <p className="text-[11px] text-slate-400 leading-tight">
                Controls solar radiation flux and daylight autonomy. NBC recommends &lt;20% in extreme climates.
              </p>
            </div>

            {/* =================================================================== */}
            {/* PARAMETER 3: ROOF PITCH / HEIGHT (0° to 45°)                        */}
            {/* =================================================================== */}
            <div className="bg-slate-800/70 p-4 rounded-lg border border-slate-700/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-200 uppercase tracking-wide">
                  3. Roof Pitch / Height
                </span>
                <span className="px-2 py-0.5 rounded bg-blue-950/80 text-cyan-300 border border-blue-800 font-mono text-xs font-bold">
                  {roofPitchDeg === 0 ? '0° (Flat)' : `${roofPitchDeg}° (Rise: ${apexRiseMeters}m)`}
                </span>
              </div>

              <input
                type="range"
                min="0"
                max="45"
                step="1"
                value={roofPitchDeg}
                onChange={(e) => handleRoofPitchChange(Number(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />

              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>0° (Flat Deck)</span>
                <span>22° (Standard)</span>
                <span>45° (Steep Shed)</span>
              </div>

              {/* Quick Presets */}
              <div className="flex gap-1.5 pt-1">
                {[
                  { label: '0° Flat', val: 0 },
                  { label: '15° Low', val: 15 },
                  { label: '25° Truss', val: 25 },
                  { label: '35° Monsoon', val: 35 }
                ].map((p) => (
                  <button
                    key={p.val}
                    type="button"
                    onClick={() => handleRoofPitchChange(p.val)}
                    className={`flex-1 py-1 text-[10px] font-mono rounded border transition-colors ${
                      roofPitchDeg === p.val
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 font-bold'
                        : 'bg-slate-900/60 border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              <p className="text-[11px] text-slate-400 leading-tight">
                Controls incident solar angle, attic buffer airspace, and rain/snow watershed velocity.
              </p>
            </div>
          </div>

          {/* SECONDARY ROW: ROOF TYPE & CHHAJJA OVERHANG */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            <div>
              <span className="text-[11px] font-semibold text-slate-300 block mb-1">Roof Profile System</span>
              <select
                value={roofType}
                onChange={(e) => {
                  const val = e.target.value as any;
                  setRoofType(val);
                  if (val === 'flat' && roofPitchDeg !== 0) setRoofPitchDeg(0);
                  if (val === 'pitched' && roofPitchDeg === 0) setRoofPitchDeg(22);
                  notifyParentOfChange({ ...activeGeometry, roofType: val });
                }}
                className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 font-mono"
              >
                <option value="pitched">Pitched Timber Rafters</option>
                <option value="flat">Flat Reinforced Slab (Lime Ter.)</option>
                <option value="ventilated_cavity">Ventilated Double-Roof Cavity</option>
                <option value="vaulted">Catenary Mud/Brick Vault</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-semibold text-slate-300 mb-1">
                <span>Chhajja Overhang</span>
                <span className="font-mono text-cyan-300">{overhangDepthM.toFixed(2)} m</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="1.5"
                step="0.05"
                value={overhangDepthM}
                onChange={(e) => handleOverhangChange(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded appearance-none cursor-pointer accent-cyan-400 mt-2"
              />
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-semibold text-slate-300 mb-1">
                <span>Ventilation Rate</span>
                <span className="font-mono text-cyan-300">{airChangesACH} ACH</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="8.0"
                step="0.5"
                value={airChangesACH}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setAirChangesACH(val);
                  notifyParentOfChange({ ...activeGeometry, airChangesPerHourACH: val });
                }}
                className="w-full h-1.5 bg-slate-700 rounded appearance-none cursor-pointer accent-cyan-400 mt-2"
              />
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-semibold text-slate-300 mb-1">
                <span>Insulation Layer</span>
                <span className="font-mono text-cyan-300">{insulationThicknessMm} mm</span>
              </div>
              <input
                type="range"
                min="0"
                max="150"
                step="5"
                value={insulationThicknessMm}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setInsulationThicknessMm(val);
                  notifyParentOfChange({ ...activeGeometry, insulationThicknessMm: val });
                }}
                className="w-full h-1.5 bg-slate-700 rounded appearance-none cursor-pointer accent-cyan-400 mt-2"
              />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ENGINEERING METRICS FOOTER CALLOUT                                        */}
      {/* ========================================================================= */}
      <div className="p-4 bg-slate-950 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 text-xs font-mono">
        <div className="bg-slate-900/90 p-2.5 rounded border border-slate-800">
          <div className="text-slate-400 text-[10px]">BASE GEOMETRY & FORM</div>
          <div className="text-sky-400 text-sm font-bold mt-0.5 truncate">
            {shapeMetrics.shapeName}
          </div>
          <div className="text-slate-500 text-[11px] mt-0.5">
            S/V: {shapeMetrics.surfaceAreaToVolumeRatio} m⁻¹ · Vol: {shapeMetrics.volumeM3} m³
          </div>
        </div>

        <div className="bg-slate-900/90 p-2.5 rounded border border-slate-800">
          <div className="text-slate-400 text-[10px]">WALL THERMAL TRANSMITTANCE</div>
          <div className="text-cyan-400 text-sm font-bold mt-0.5">
            U = {effectiveResults?.compositeWallUValue ?? 0.85} W/m²·K
          </div>
          <div className="text-slate-500 text-[11px] truncate mt-0.5">{wallMat?.name?.split('(')[0] || 'Wall Assembly'}</div>
        </div>

        <div className="bg-slate-900/90 p-2.5 rounded border border-slate-800">
          <div className="text-slate-400 text-[10px]">THERMAL MASS PHASE SHIFT</div>
          <div className="text-amber-300 text-sm font-bold mt-0.5">
            {effectiveResults?.thermalLagHours ?? 6} Hours Delay
          </div>
          <div className="text-slate-500 text-[11px] mt-0.5">
            Damping: {effectiveResults?.diurnalDampingPercent ?? 65}%
          </div>
        </div>

        <div className="bg-slate-900/90 p-2.5 rounded border border-slate-800">
          <div className="text-slate-400 text-[10px]">NBC 2016 IMAC COMPLIANCE</div>
          <div className={`text-sm font-bold mt-0.5 ${isComfortable ? 'text-emerald-400' : 'text-amber-400'}`}>
            {compliancePercent}% Compliant
          </div>
          <div className="text-slate-500 text-[11px] mt-0.5">
            Band: {effectiveResults?.imacComfortBand80?.min ?? 21.5}° - {effectiveResults?.imacComfortBand80?.max ?? 28.5}°C
          </div>
        </div>

        <div className="bg-slate-900/90 p-2.5 rounded border border-slate-800 col-span-2 md:col-span-1">
          <div className="text-slate-400 text-[10px]">ESTIMATED MATERIAL COST</div>
          <div className="text-slate-200 text-sm font-bold mt-0.5">
            ₹{(effectiveResults?.estimatedMaterialCostINR ?? 165000).toLocaleString('en-IN')}
          </div>
          <div className="text-slate-500 text-[11px] mt-0.5">
            Embodied CO₂: {effectiveResults?.embodiedCarbonTotalKg ?? 4200} kg
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveShelterVisualizer;
