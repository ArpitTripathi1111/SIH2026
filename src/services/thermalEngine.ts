/**
 * Team CODE TITANS - SIH26051
 * Problem Statement: Software Based Model Development for Design of Area-Specific Shelter for Thermal Comfort Maintenance
 * 
 * Thermal Engineering Calculation Engine
 * 
 * Core Equations:
 * 1. Indian Model for Adaptive Comfort (IMAC) for naturally ventilated buildings (NBC 2016 Part 8 / CEPT).
 * 2. Composite multi-layer wall and roof U-Value calculations.
 * 3. Dynamic Sol-Air Temperature accounting for solar absorptance and sky radiative cooling.
 * 4. Thermal mass decrement factor & phase lag.
 * 5. Dynamic 24-hour indoor temperature heat-balance solver accounting for WWR, ventilation, and internal loads.
 */

import {
  ClimateData,
  HourlyThermalPoint,
  MaterialProperty,
  ShelterGeometry,
  SimulationResults
} from '../types';
import { getMaterialById } from '../data/materials';
import { calculateBillOfQuantities, calculateShapeGeometry } from './costCalculator';

export interface IMACComfortBand {
  neutralTempC: number;
  band80: { min: number; max: number };
  band90: { min: number; max: number };
}

/**
 * Calculates IMAC (Indian Model for Adaptive Comfort) for naturally ventilated spaces.
 * NBC 2016 & CEPT University standard equation:
 * T_comf = 0.54 * T_om + 12.83
 * Acceptability limits:
 * 90% comfort: T_comf ± 2.38°C
 * 80% comfort: T_comf ± 3.46°C
 * T_om is bounded within 12.5°C to 34.5°C per empirical standard.
 */
export function calculateIMACComfort(runningMeanOutdoorTempC?: number | null): IMACComfortBand {
  const safeTom = typeof runningMeanOutdoorTempC === 'number' && Number.isFinite(runningMeanOutdoorTempC)
    ? runningMeanOutdoorTempC
    : 24.0;
  const clampedTom = Math.max(12.5, Math.min(34.5, safeTom));
  const neutralTemp = Number((0.54 * clampedTom + 12.83).toFixed(2));

  return {
    neutralTempC: neutralTemp,
    band80: {
      min: Number((neutralTemp - 3.46).toFixed(2)),
      max: Number((neutralTemp + 3.46).toFixed(2))
    },
    band90: {
      min: Number((neutralTemp - 2.38).toFixed(2)),
      max: Number((neutralTemp + 2.38).toFixed(2))
    }
  };
}

/**
 * Calculates Sol-Air Temperature for an exterior surface:
 * T_sol_air = T_out + (alpha * I_total) / h_o - (epsilon * delta_R) / h_o
 * 
 * @param outdoorTempC Ambient outdoor dry bulb temp (°C)
 * @param solarRadiationWm2 Incident solar irradiance (W/m²)
 * @param absorptivityAlpha Surface solar absorptance (0.2 for white, 0.7 for brick)
 * @param isHorizontalSurface True for roofs, false for vertical walls
 * @param emissivityEpsilon Thermal long-wave emissivity (default 0.9)
 */
export function calculateSolAirTemp(
  outdoorTempC: number,
  solarRadiationWm2: number,
  absorptivityAlpha: number,
  isHorizontalSurface: boolean = false,
  emissivityEpsilon: number = 0.9
): number {
  const h_o = 17.0; // External surface heat transfer coefficient W/(m²·K)
  const delta_R = isHorizontalSurface ? 63.0 : 0.0; // Radiation to sky parameter (W/m²)

  const solarTerm = (absorptivityAlpha * solarRadiationWm2) / h_o;
  const longwaveTerm = (emissivityEpsilon * delta_R) / h_o;

  return outdoorTempC + solarTerm - longwaveTerm;
}

/**
 * Calculates U-value for composite wall assembly:
 * 1 / U = R_si + (d_wall / k_wall) + (d_ins / k_ins) + R_plaster + R_se
 */
export function calculateCompositeWallUValue(
  wallMaterial: MaterialProperty,
  wallThicknessMm: number,
  insulationMaterial: MaterialProperty,
  insulationThicknessMm: number
): number {
  const R_si = 0.13; // Interior surface film resistance (m²·K/W)
  const R_se = 0.04; // Exterior surface film resistance (m²·K/W)
  const R_plaster = 0.03; // Internal lime/cement render (15mm)

  const d_wall_m = wallThicknessMm / 1000;
  const R_wall = d_wall_m / Math.max(0.01, wallMaterial.thermalConductivityK);

  const d_ins_m = insulationThicknessMm / 1000;
  const R_ins = d_ins_m > 0 ? d_ins_m / Math.max(0.01, insulationMaterial.thermalConductivityK) : 0;

  const totalR = R_si + R_wall + R_ins + R_plaster + R_se;
  return Number((1 / totalR).toFixed(3));
}

/**
 * Calculates U-value for composite roof assembly:
 * 1 / U = R_si + (d_roof / k_roof) + (d_ins / k_ins) + R_cavity + R_se
 */
export function calculateCompositeRoofUValue(
  roofMaterial: MaterialProperty,
  insulationMaterial: MaterialProperty,
  insulationThicknessMm: number,
  roofType: ShelterGeometry['roofType']
): number {
  const R_si = 0.10; // Upward heat flow interior resistance (m²·K/W)
  const R_se = 0.04;
  const R_cavity = roofType === 'ventilated_cavity' ? 0.28 : 0.0;

  const d_roof_m = roofMaterial.typicalThicknessMeters;
  const R_roof = d_roof_m / Math.max(0.01, roofMaterial.thermalConductivityK);

  const d_ins_m = insulationThicknessMm / 1000;
  const R_ins = d_ins_m > 0 ? d_ins_m / Math.max(0.01, insulationMaterial.thermalConductivityK) : 0;

  const totalR = R_si + R_roof + R_ins + R_cavity + R_se;
  return Number((1 / totalR).toFixed(3));
}

/**
 * Calculates the thermal decrement factor (damping) and thermal lag in hours.
 * Based on thermal diffusivity and penetration depth across harmonic 24h cycle:
 * alpha_diff = k / (rho * c)
 * delta_depth = sqrt( (24 * 3600 * alpha_diff) / pi )
 */
export function calculateThermalMassDynamics(
  wallMaterial: MaterialProperty,
  wallThicknessMm: number
): { decrementFactor: number; lagHours: number } {
  const k = wallMaterial.thermalConductivityK;
  const rho = wallMaterial.densityKgM3;
  const c = wallMaterial.specificHeatCapacityJkgK;

  if (rho <= 0 || c <= 0 || k <= 0) {
    return { decrementFactor: 0.95, lagHours: 0.5 };
  }

  const alphaDiff = k / (rho * c);
  const periodSeconds = 24 * 3600;
  const penetrationDepth = Math.sqrt((periodSeconds * alphaDiff) / Math.PI); // Characteristic depth

  const d_m = wallThicknessMm / 1000;
  const xi = d_m / penetrationDepth;

  // Damping decrement factor mu approx e^(-xi)
  const decrementFactor = Math.max(0.05, Math.min(1.0, Math.exp(-xi)));

  // Phase shift lag in hours = (xi / (2*pi)) * 24 hours
  const lagHours = Number(((xi / (2 * Math.PI)) * 24).toFixed(1));

  return {
    decrementFactor: Number(decrementFactor.toFixed(3)),
    lagHours: Math.min(14, Math.max(1, lagHours))
  };
}

/**
 * Executes a full 24-hour dynamic heat-balance simulation.
 * Computes both the Baseline configuration and the Current/Optimized configuration.
 */
export function runThermalSimulation(
  geometry: ShelterGeometry,
  climate: ClimateData,
  wallMaterialId: string,
  roofMaterialId: string,
  insulationMaterialId: string,
  glazingMaterialId: string
): SimulationResults {
  const wallMat = getMaterialById(wallMaterialId);
  const roofMat = getMaterialById(roofMaterialId);
  const insMat = getMaterialById(insulationMaterialId);
  const glazeMat = getMaterialById(glazingMaterialId);

  // Geometric Envelopes with shape geometry solver
  const shapeMetrics = calculateShapeGeometry(geometry);
  const floorArea = shapeMetrics.floorAreaM2;
  const grossWallArea = shapeMetrics.grossWallAreaM2;
  const windowArea = shapeMetrics.windowAreaM2;
  const netWallArea = shapeMetrics.netWallAreaM2;
  const roofArea = shapeMetrics.roofAreaM2;
  const roomVolume = shapeMetrics.internalVolumeM3;
  const shapeSolarFactor = shapeMetrics.shapeEffectiveSolarFactor;

  const wallThicknessMm = Number.isFinite(geometry?.wallThicknessMm) && geometry.wallThicknessMm > 0 ? geometry.wallThicknessMm : 230;
  const insulationThicknessMm = Number.isFinite(geometry?.insulationThicknessMm) && geometry.insulationThicknessMm >= 0 ? geometry.insulationThicknessMm : 50;

  // Thermal conductances
  const wallU = calculateCompositeWallUValue(
    wallMat,
    wallThicknessMm,
    insMat,
    insulationThicknessMm
  );
  const roofU = calculateCompositeRoofUValue(
    roofMat,
    insMat,
    insulationThicknessMm,
    geometry?.roofType || 'pitched'
  );
  const windowU = glazeMat?.uValuePerStandardThickness || 2.8;

  // Effective Solar Heat Gain Coefficient (SHGC)
  let baseSHGC = 0.82;
  if (geometry?.glazingType === 'double_standard') baseSHGC = 0.70;
  if (geometry?.glazingType === 'double_low_e') baseSHGC = 0.42;

  // Shading factor reduction
  let shadingMultiplier = 1.0;
  const overhangDepth = Number.isFinite(geometry?.overhangDepthMeters) ? geometry.overhangDepthMeters : 0.6;
  if (geometry?.shadingType === 'chhajja_overhang') {
    shadingMultiplier = Math.max(0.35, 1.0 - (overhangDepth / 1.5) * 0.55);
  } else if (geometry?.shadingType === 'louvers') {
    shadingMultiplier = 0.40;
  } else if (geometry?.shadingType === 'deep_reveals') {
    shadingMultiplier = 0.60;
  }
  const effectiveSHGC = baseSHGC * shadingMultiplier;

  // Ventilation heat capacitance: rho * Cp = ~1200 J/(m³·K)
  const ACH = Number.isFinite(geometry?.airChangesPerHourACH) && geometry.airChangesPerHourACH > 0 ? geometry.airChangesPerHourACH : 2.5;
  const ventConductance = (1200 * (ACH * roomVolume)) / 3600; // W/K

  // Building thermal capacitance (effective active thermal mass)
  const density = wallMat?.densityKgM3 || 1800;
  const specificHeat = wallMat?.specificHeatCapacityJkgK || 900;
  const activeMassKg = netWallArea * (wallThicknessMm / 1000) * density * 0.5;
  const buildingHeatCapacityJ = Math.max(5e6, activeMassKg * specificHeat);

  const { decrementFactor, lagHours } = calculateThermalMassDynamics(
    wallMat,
    wallThicknessMm
  );

  // Climate inputs sanitation
  const fallbackOutdoorTemp = Number.isFinite(climate?.outdoorTempC) ? climate.outdoorTempC : 25.0;
  const safeRunningMean = Number.isFinite(climate?.runningMeanOutdoorTempC)
    ? climate.runningMeanOutdoorTempC
    : fallbackOutdoorTemp;

  // IMAC Comfort Range
  const imac = calculateIMACComfort(safeRunningMean);

  // 24-Hour Simulation Array
  const hourlyOutdoor = (climate?.hourlyOutdoorTemps && climate.hourlyOutdoorTemps.length >= 24)
    ? climate.hourlyOutdoorTemps.map((t) => (Number.isFinite(t) ? t : fallbackOutdoorTemp))
    : Array.from({ length: 24 }, (_, i) => {
        const rad = ((i - 5) / 24) * 2 * Math.PI;
        const normalized = (1 - Math.cos(rad)) / 2;
        return Number((fallbackOutdoorTemp - 5 + normalized * 10).toFixed(1));
      });

  const hourlySolar = (climate?.hourlySolarRadiationWm2 && climate.hourlySolarRadiationWm2.length >= 24)
    ? climate.hourlySolarRadiationWm2.map((s) => (Number.isFinite(s) ? s : 0))
    : Array.from({ length: 24 }, (_, i) =>
        i >= 6 && i <= 18 ? Math.round(700 * Math.sin(((i - 6) / 12) * Math.PI)) : 0
      );

  const hourlyPoints: HourlyThermalPoint[] = [];

  // Baseline properties for comparison (Standard single brick 230mm, raw concrete slab, single glazing, no shading)
  const baselineWallU = 2.15;
  const baselineRoofU = 3.10;
  const baselineWindowU = 5.70;
  const baselineSHGC = 0.82; // No shading

  // Internal heat gains (Crucial: safely defaulted to prevent NaN)
  const occupancy = Number.isFinite(geometry?.occupancyCount) ? geometry.occupancyCount : 3;
  const internalWatts = Number.isFinite(geometry?.internalLoadWatts) ? geometry.internalLoadWatts : 180;
  const qInternal = occupancy * 75 + internalWatts;

  // Solve multi-hour cyclical profile (run 2 cycles to reach steady-periodic convergence)
  let currentIndoorOptimized = hourlyOutdoor[0];
  let currentIndoorBaseline = hourlyOutdoor[0];
  const dtSeconds = 3600;

  for (let cycle = 0; cycle < 2; cycle++) {
    for (let h = 0; h < 24; h++) {
      const tOut = hourlyOutdoor[h];
      const solRad = hourlySolar[h];

      // Sol-Air temps (curved/sloped roofs apply architectural shape solar attenuation)
      const solAirWall = calculateSolAirTemp(tOut, solRad * 0.45, wallMat.solarAbsorptivityAlpha || 0.7, false);
      const solAirRoof = calculateSolAirTemp(tOut, solRad * shapeSolarFactor, roofMat.solarAbsorptivityAlpha || 0.7, true);

      // Lagged outdoor temperature index for delayed thermal conduction through heavy walls
      const lagStep = Math.round(lagHours) % 24;
      const laggedHour = (h - lagStep + 24) % 24;
      const laggedSolAirWall = calculateSolAirTemp(
        hourlyOutdoor[laggedHour],
        hourlySolar[laggedHour] * 0.45,
        wallMat.solarAbsorptivityAlpha || 0.7,
        false
      );

      // Conduction through envelope (Optimized)
      const qWall = netWallArea * wallU * (laggedSolAirWall - currentIndoorOptimized);
      const qRoof = roofArea * roofU * (solAirRoof - currentIndoorOptimized);
      const qWinCond = windowArea * windowU * (tOut - currentIndoorOptimized);
      const qWinSolar = windowArea * effectiveSHGC * solRad * 0.5; // Average directional exposure
      const qVent = ventConductance * (tOut - currentIndoorOptimized);

      const qTotalOptimized = qWall + qRoof + qWinCond + qWinSolar + qVent + qInternal;
      currentIndoorOptimized += (qTotalOptimized * dtSeconds) / buildingHeatCapacityJ;

      // Baseline Simulation
      const qWallBase = netWallArea * baselineWallU * (solAirWall - currentIndoorBaseline);
      const qRoofBase = roofArea * baselineRoofU * (solAirRoof - currentIndoorBaseline);
      const qWinBase = windowArea * baselineWindowU * (tOut - currentIndoorBaseline);
      const qWinSolarBase = windowArea * baselineSHGC * solRad * 0.5;
      const qVentBase = ((1200 * (1.5 * roomVolume)) / 3600) * (tOut - currentIndoorBaseline);
      const qTotalBase = qWallBase + qRoofBase + qWinBase + qWinSolarBase + qVentBase + qInternal;
      currentIndoorBaseline += (qTotalBase * dtSeconds) / (buildingHeatCapacityJ * 0.6);

      if (cycle === 1) {
        const safeBaseline = Number.isFinite(currentIndoorBaseline)
          ? Number(currentIndoorBaseline.toFixed(1))
          : Number(tOut.toFixed(1));
        const safeOptimized = Number.isFinite(currentIndoorOptimized)
          ? Number(currentIndoorOptimized.toFixed(1))
          : Number(tOut.toFixed(1));

        hourlyPoints.push({
          hour: h,
          outdoorTempC: Number(tOut.toFixed(1)),
          solAirTempC: Number(solAirRoof.toFixed(1)),
          indoorTempBaselineC: safeBaseline,
          indoorTempOptimizedC: safeOptimized,
          solarRadiationWm2: solRad,
          imacNeutralTempC: imac.neutralTempC,
          imacUpperLimit80C: imac.band80.max,
          imacLowerLimit80C: imac.band80.min,
          imacUpperLimit90C: imac.band90.max,
          imacLowerLimit90C: imac.band90.min
        });
      }
    }
  }

  const indoorTemps = hourlyPoints.map((p) => p.indoorTempOptimizedC).filter((t) => Number.isFinite(t));
  const avgIndoor = indoorTemps.length > 0
    ? Number((indoorTemps.reduce((a, b) => a + b, 0) / indoorTemps.length).toFixed(1))
    : Number(fallbackOutdoorTemp.toFixed(1));
  const peakIndoor = indoorTemps.length > 0
    ? Number(Math.max(...indoorTemps).toFixed(1))
    : Number((fallbackOutdoorTemp + 3).toFixed(1));
  const minIndoor = indoorTemps.length > 0
    ? Number(Math.min(...indoorTemps).toFixed(1))
    : Number((fallbackOutdoorTemp - 3).toFixed(1));

  const maxOutdoor = Number.isFinite(climate?.maxTempC) ? climate.maxTempC : Math.max(...hourlyOutdoor);
  const minOutdoor = Number.isFinite(climate?.minTempC) ? climate.minTempC : Math.min(...hourlyOutdoor);
  const outdoorRange = Math.max(1, maxOutdoor - minOutdoor);
  const indoorRange = Math.max(0, peakIndoor - minIndoor);
  const dampingPercent = Number(
    Math.max(0, Math.min(100, ((outdoorRange - indoorRange) / outdoorRange) * 100)).toFixed(1)
  );

  // Comfort hours computation
  let hoursIn80 = 0;
  let hoursIn90 = 0;
  hourlyPoints.forEach((p) => {
    if (p.indoorTempOptimizedC >= imac.band80.min && p.indoorTempOptimizedC <= imac.band80.max) {
      hoursIn80++;
    }
    if (p.indoorTempOptimizedC >= imac.band90.min && p.indoorTempOptimizedC <= imac.band90.max) {
      hoursIn90++;
    }
  });

  const percent80 = Number(((hoursIn80 / 24) * 100).toFixed(1));
  const percent90 = Number(((hoursIn90 / 24) * 100).toFixed(1));

  // Dynamic Bill of Quantities (BOQ) & Embodied Carbon derived from exact shape geometry
  const boq = calculateBillOfQuantities(geometry, wallMat, roofMat, insMat, glazeMat);
  const totalCostINR = boq.totalCostINR;
  const totalCarbonKg = boq.totalEmbodiedCarbonKg;

  // Performance classification
  let rating: SimulationResults['thermalPerformanceRating'] = 'Satisfactory';
  if (percent90 >= 75 || percent80 >= 90) {
    rating = 'Excellent';
  } else if (effectiveSHGC > 0.6 && geometry.windowToWallRatioPercent > 20) {
    rating = 'Needs Passive Shading';
  } else if (wallU > 1.8 && roofU > 2.0) {
    rating = 'Under-insulated';
  }

  // Engineering Observations with Architectural Form Diagnostics
  const observations: string[] = [];
  observations.push(`Composite Envelope U-Value: Walls = ${wallU} W/(m²·K), Roof = ${roofU} W/(m²·K).`);
  observations.push(
    `Thermal Mass Damping: Diurnal swing dampened by ${dampingPercent}% with a ${lagHours}-hour thermal phase lag.`
  );

  if (shapeMetrics.shape === 'pitched_a_frame') {
    observations.push(
      `Pitched A-Frame form (+${shapeMetrics.apexRiseMeters}m apex attic rise) enhances rapid precipitation/snow runoff and provides an attic thermal cushion.`
    );
  } else if (shapeMetrics.shape === 'vaulted_dome') {
    observations.push(
      `Vaulted Dome arch optimizes thermal envelope efficiency (S/V ratio: ${shapeMetrics.surfaceAreaToVolumeRatio}, solar attenuation factor: ${shapeSolarFactor}), minimizing radiant peak gain in arid climates.`
    );
  } else if (shapeMetrics.shape === 'lean_to') {
    observations.push(
      `Lean-to mono-pitch profile (${shapeMetrics.eavesHeightMeters}m to ${shapeMetrics.peakHeightMeters}m) streamlines natural wind shedding and enables rapid modular assembly.`
    );
  } else {
    observations.push(
      `Flat-Roof Box baseline provides maximum cubic volume (${roomVolume}m³) with a surface-area-to-volume ratio of ${shapeMetrics.surfaceAreaToVolumeRatio}.`
    );
  }

  if (percent80 >= 80) {
    observations.push(`Compliant with NBC 2016 IMAC standard for ${hoursIn80} of 24 diurnal hours (80% acceptability limit).`);
  } else {
    observations.push(`Exceeds IMAC comfort threshold during peak hours; consider deeper shading or nocturnal ventilation purge.`);
  }

  return {
    compositeWallUValue: wallU,
    compositeRoofUValue: roofU,
    windowUValue: windowU,
    averageIndoorTempC: avgIndoor,
    peakIndoorTempC: peakIndoor,
    minIndoorTempC: minIndoor,
    diurnalDampingPercent: dampingPercent,
    thermalLagHours: lagHours,
    imacComfortNeutralTempC: imac.neutralTempC,
    imacComfortBand80: imac.band80,
    imacComfortBand90: imac.band90,
    hoursInComfortBand80: hoursIn80,
    hoursInComfortBand90: hoursIn90,
    percentComfortCompliance80: percent80,
    percentComfortCompliance90: percent90,
    estimatedMaterialCostINR: totalCostINR,
    embodiedCarbonTotalKg: totalCarbonKg,
    thermalPerformanceRating: rating,
    hourlyProfiles: hourlyPoints,
    engineeringObservations: observations,
    internalVolumeM3: roomVolume,
    surfaceAreaToVolumeRatio: shapeMetrics.surfaceAreaToVolumeRatio,
    totalEnvelopeAreaM2: shapeMetrics.totalEnvelopeAreaM2,
    grossWallAreaM2: grossWallArea,
    roofAreaM2: roofArea,
    billOfQuantities: boq
  };
}
