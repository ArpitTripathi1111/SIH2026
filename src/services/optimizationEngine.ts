/**
 * Team CODE TITANS - SIH26051
 * Multi-Criteria Optimization Engine
 * 
 * Generates and ranks 3 engineering shelter variations:
 * 1. Best Thermal Comfort (Max IMAC hours, minimal peak delta)
 * 2. Balanced (Techno-Economic optimum: comfort per rupee)
 * 3. Budget / Indigenous (Lowest capital cost, hyper-local materials, passive geometry)
 */

import {
  ClimateData,
  OptimizationVariant,
  RegionId,
  ShelterDesign,
  ShelterGeometry
} from '../types';
import { runThermalSimulation } from './thermalEngine';

export function generateOptimizedVariants(
  baseDesign: ShelterDesign,
  climate: ClimateData
): OptimizationVariant[] {
  const region = climate.regionId;
  const baseResults = baseDesign.simulationResults || runThermalSimulation(
    baseDesign.geometry,
    climate,
    baseDesign.wallMaterialId,
    baseDesign.roofMaterialId,
    baseDesign.insulationMaterialId,
    baseDesign.glazingMaterialId
  );

  // 1. BEST THERMAL COMFORT VARIANT
  const bestThermalGeometry: ShelterGeometry = {
    ...baseDesign.geometry,
    wallThicknessMm: region === 'river' ? 160 : 380,
    insulationThicknessMm: region === 'river' ? 0 : 80,
    roofType: region === 'river' ? 'ventilated_cavity' : region === 'mountain' ? 'pitched' : 'flat',
    overhangDepthMeters: region === 'desert' ? 0.95 : region === 'river' ? 1.20 : 0.40,
    windowToWallRatioPercent: region === 'desert' ? 10 : region === 'mountain' ? 16 : 28,
    shadingType: region === 'desert' ? 'louvers' : 'chhajja_overhang',
    glazingType: region === 'mountain' ? 'double_low_e' : region === 'desert' ? 'double_standard' : 'single_clear',
    airChangesPerHourACH: region === 'river' ? 6.5 : region === 'desert' ? 1.0 : 0.7
  };

  const bestThermalWallMat =
    region === 'mountain' ? 'mat_mud_rammed_earth' : region === 'desert' ? 'mat_stone_masonry' : 'mat_aac_blocks';
  const bestThermalRoofMat =
    region === 'mountain' ? 'mat_roof_mud_timber' : region === 'desert' ? 'mat_roof_lime_surkhi_terracing' : 'mat_roof_ventilated_mangalore';
  const bestThermalInsMat = region === 'river' ? 'mat_ins_none' : 'mat_ins_rockwool';
  const bestThermalGlazeMat =
    region === 'mountain' ? 'mat_glaze_double_low_e' : region === 'desert' ? 'mat_glaze_double_standard' : 'mat_glaze_single_clear';

  const bestThermalDesign: ShelterDesign = {
    ...baseDesign,
    id: 'opt_best_thermal',
    name: 'Best Thermal Comfort Design',
    geometry: bestThermalGeometry,
    wallMaterialId: bestThermalWallMat,
    roofMaterialId: bestThermalRoofMat,
    insulationMaterialId: bestThermalInsMat,
    glazingMaterialId: bestThermalGlazeMat,
    updatedAtIso: new Date().toISOString()
  };

  const bestThermalResults = runThermalSimulation(
    bestThermalGeometry,
    climate,
    bestThermalWallMat,
    bestThermalRoofMat,
    bestThermalInsMat,
    bestThermalGlazeMat
  );

  // 2. BALANCED (TECHNO-ECONOMIC) VARIANT
  const balancedGeometry: ShelterGeometry = {
    ...baseDesign.geometry,
    wallThicknessMm: region === 'mountain' ? 300 : region === 'desert' ? 280 : 180,
    insulationThicknessMm: region === 'river' ? 0 : 50,
    roofType: region === 'river' ? 'ventilated_cavity' : region === 'mountain' ? 'pitched' : 'flat',
    overhangDepthMeters: 0.75,
    windowToWallRatioPercent: region === 'desert' ? 14 : region === 'mountain' ? 18 : 25,
    shadingType: 'chhajja_overhang',
    glazingType: region === 'mountain' ? 'double_standard' : 'single_clear',
    airChangesPerHourACH: region === 'river' ? 4.5 : 1.5
  };

  const balancedWallMat = region === 'river' ? 'mat_aac_blocks' : 'mat_brick_standard';
  const balancedRoofMat = region === 'river' ? 'mat_roof_ventilated_mangalore' : 'mat_roof_lime_surkhi_terracing';
  const balancedInsMat = region === 'river' ? 'mat_ins_none' : 'mat_ins_expanded_polystyrene';
  const balancedGlazeMat = region === 'mountain' ? 'mat_glaze_double_standard' : 'mat_glaze_single_clear';

  const balancedDesign: ShelterDesign = {
    ...baseDesign,
    id: 'opt_balanced',
    name: 'Techno-Economic Balanced Design',
    geometry: balancedGeometry,
    wallMaterialId: balancedWallMat,
    roofMaterialId: balancedRoofMat,
    insulationMaterialId: balancedInsMat,
    glazingMaterialId: balancedGlazeMat,
    updatedAtIso: new Date().toISOString()
  };

  const balancedResults = runThermalSimulation(
    balancedGeometry,
    climate,
    balancedWallMat,
    balancedRoofMat,
    balancedInsMat,
    balancedGlazeMat
  );

  // 3. BUDGET / INDIGENOUS LOW-COST VARIANT
  const budgetGeometry: ShelterGeometry = {
    ...baseDesign.geometry,
    wallThicknessMm: region === 'mountain' ? 350 : region === 'desert' ? 350 : 120,
    insulationThicknessMm: 0, // Uninsulated / natural thatch/straw
    roofType: region === 'river' ? 'ventilated_cavity' : region === 'mountain' ? 'pitched' : 'flat',
    overhangDepthMeters: region === 'river' ? 1.10 : 0.60,
    windowToWallRatioPercent: region === 'desert' ? 10 : region === 'mountain' ? 15 : 30,
    shadingType: 'chhajja_overhang',
    glazingType: 'single_clear',
    airChangesPerHourACH: region === 'river' ? 5.5 : 1.2
  };

  const budgetWallMat =
    region === 'river' ? 'mat_bamboo_composite' : region === 'desert' ? 'mat_mud_rammed_earth' : 'mat_mud_rammed_earth';
  const budgetRoofMat =
    region === 'river' ? 'mat_roof_ventilated_mangalore' : region === 'mountain' ? 'mat_roof_mud_timber' : 'mat_roof_lime_surkhi_terracing';
  const budgetInsMat = 'mat_ins_none';
  const budgetGlazeMat = 'mat_glaze_single_clear';

  const budgetDesign: ShelterDesign = {
    ...baseDesign,
    id: 'opt_budget',
    name: 'Budget & Indigenous Vernacular Design',
    geometry: budgetGeometry,
    wallMaterialId: budgetWallMat,
    roofMaterialId: budgetRoofMat,
    insulationMaterialId: budgetInsMat,
    glazingMaterialId: budgetGlazeMat,
    updatedAtIso: new Date().toISOString()
  };

  const budgetResults = runThermalSimulation(
    budgetGeometry,
    climate,
    budgetWallMat,
    budgetRoofMat,
    budgetInsMat,
    budgetGlazeMat
  );

  // Compute Delts vs Baseline
  const calcCostDelta = (cost: number) => {
    return Number((((cost - baseResults.estimatedMaterialCostINR) / Math.max(1, baseResults.estimatedMaterialCostINR)) * 100).toFixed(1));
  };

  const calcComfortGain = (compliance80: number) => {
    return Number((compliance80 - baseResults.percentComfortCompliance80).toFixed(1));
  };

  return [
    {
      id: 'best_thermal',
      title: 'Optimum Thermal Comfort',
      tagline: 'Engineered for Maximum IMAC Compliance & Minimum HVAC Need',
      description: 'Maximizes indoor thermal retention in cold zones or heat rejection in hot zones using high-grade composite envelopes, optimized WWR, and solar chhajjas.',
      design: bestThermalDesign,
      results: bestThermalResults,
      costDeltaPercentVsBaseline: calcCostDelta(bestThermalResults.estimatedMaterialCostINR),
      comfortGainPercentVsBaseline: calcComfortGain(bestThermalResults.percentComfortCompliance80),
      keyAdvantages: [
        `${bestThermalResults.percentComfortCompliance80}% of day within IMAC 80% natural comfort band`,
        `Wall U-Value: ${bestThermalResults.compositeWallUValue} W/(m²·K)`,
        `Thermal mass damping: ${bestThermalResults.diurnalDampingPercent}% amplitude reduction`
      ]
    },
    {
      id: 'balanced',
      title: 'Techno-Economic Balanced',
      tagline: 'Optimal Comfort per Indian Rupee Invested',
      description: 'Strikes the ideal compromise between commercial material accessibility, contractor familiarity, and passive thermodynamic performance.',
      design: balancedDesign,
      results: balancedResults,
      costDeltaPercentVsBaseline: calcCostDelta(balancedResults.estimatedMaterialCostINR),
      comfortGainPercentVsBaseline: calcComfortGain(balancedResults.percentComfortCompliance80),
      keyAdvantages: [
        `${balancedResults.percentComfortCompliance80}% IMAC comfort compliance`,
        `Commercial standard materials with reliable regional supply chains`,
        `Moderate capital outlay: ₹${balancedResults.estimatedMaterialCostINR.toLocaleString('en-IN')}`
      ]
    },
    {
      id: 'budget',
      title: 'Indigenous Vernacular & Low-Cost',
      tagline: 'Lowest Capital Outlay & Zero Embodied Carbon Footprint',
      description: 'Capitalizes on traditional local building wisdom using raw soil, stone, or bamboo bio-composites. Relies purely on geometric passive shading and ventilation.',
      design: budgetDesign,
      results: budgetResults,
      costDeltaPercentVsBaseline: calcCostDelta(budgetResults.estimatedMaterialCostINR),
      comfortGainPercentVsBaseline: calcComfortGain(budgetResults.percentComfortCompliance80),
      keyAdvantages: [
        `Lowest estimated cost: ₹${budgetResults.estimatedMaterialCostINR.toLocaleString('en-IN')}`,
        `Near zero/negative embodied carbon: ${budgetResults.embodiedCarbonTotalKg} kg CO₂e`,
        `${budgetResults.percentComfortCompliance80}% IMAC compliance achieved via passive form`
      ]
    }
  ];
}
