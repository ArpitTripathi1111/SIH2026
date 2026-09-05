/**
 * Team CODE TITANS - SIH26051
 * Problem Statement: Software Based Model Development for Design of Area-Specific Shelter for Thermal Comfort Maintenance
 * 
 * TypeScript Definitions for Climate Data, Shelter Geometry, Material Properties,
 * Simulation Results, and Optimization Models.
 * 
 * Future-Proofing Note:
 * Model attributes map 1:1 to Python / Django REST Framework serializers
 * (ShelterDesignModel, MaterialModel, ClimateRecordModel).
 */

export type ClimateZoneType = 'cold_arid' | 'hot_dry' | 'warm_humid' | 'composite' | 'temperate';

export type RegionId = 'mountain' | 'desert' | 'river';

export type ArchitecturalShape =
  | 'standard_cuboid'
  | 'a_frame_pitched'
  | 'gabled_cuboid'
  | 'dome_vaulted'
  | 'cylindrical_yurt'
  | 'hexagonal_pod'
  | 'lean_to_sloped'
  | 'butterfly_roof'
  // Legacy aliases
  | 'flat_box'
  | 'pitched_a_frame'
  | 'vaulted_dome'
  | 'lean_to';

export interface ArchitecturalShapeDef {
  id: ArchitecturalShape;
  name: string;
  tagline: string;
  description: string;
  bestFor: string; // e.g. "Best For: Desert"
  recommendedRegion: RegionId;
  roofTypeEquivalent: RoofType;
  defaultPitchDegrees: number;
  svRatioCharacteristic: 'baseline' | 'moderate' | 'minimal' | 'compact' | 'aerodynamic' | 'optimized';
  svRatioDescription: string;
  structuralAdvantage: string;
}

export interface ClimateData {
  regionId: RegionId;
  regionName: string;
  locationName: string;
  latitude: number;
  longitude: number;
  elevationMeters: number;
  climateZone: ClimateZoneType;
  outdoorTempC: number;
  minTempC: number;
  maxTempC: number;
  diurnalSwingC: number;
  relativeHumidityPercent: number;
  windSpeedMs: number;
  directNormalSolarRadiationWm2: number;
  diffuseSolarRadiationWm2: number;
  totalHorizontalSolarRadiationWm2: number;
  runningMeanOutdoorTempC: number; // T_om for IMAC
  hourlyOutdoorTemps: number[]; // 24-hour array (00:00 to 23:00)
  hourlySolarRadiationWm2: number[]; // 24-hour array
  conditionSummary: string;
  source: 'live_open_meteo' | 'offline_fallback_profile';
  fetchedAtIso: string;
}

export type RoofType = 'flat' | 'pitched' | 'vaulted' | 'ventilated_cavity';
export type ShadingType = 'none' | 'chhajja_overhang' | 'louvers' | 'deep_reveals';
export type GlazingType = 'single_clear' | 'double_standard' | 'double_low_e';

export interface ShelterGeometry {
  architecturalShape?: ArchitecturalShape; // 'flat_box' | 'pitched_a_frame' | 'vaulted_dome' | 'lean_to'
  lengthMeters: number; // East-West or North-South axis
  widthMeters: number;
  heightMeters: number;
  floorAreaM2: number; // Derived: length * width
  wallThicknessMm: number; // Structural wall thickness
  insulationThicknessMm: number; // Insulation layer thickness
  roofType: RoofType;
  roofPitchDegrees: number; // 0 for flat, 20-35 for pitched
  overhangDepthMeters: number; // Chhajja / Eaves projection
  windowToWallRatioPercent: number; // WWR (0% to 60%)
  windowOrientation: 'south' | 'north' | 'east' | 'west' | 'cross_distributed';
  shadingType: ShadingType;
  glazingType: GlazingType;
  airChangesPerHourACH: number; // Natural ventilation rate
  occupancyCount: number;
  internalLoadWatts: number;
}

export interface BOQItem {
  id: string;
  category: 'substructure' | 'walls' | 'roof' | 'insulation' | 'fenestration' | 'structural_framing';
  description: string;
  unit: string;
  quantity: number;
  rateINR: number;
  amountINR: number;
  carbonRateKgM2: number;
  totalCarbonKg: number;
}

export interface BillOfQuantities {
  items: BOQItem[];
  totalCostINR: number;
  costPerFloorAreaINR: number;
  totalEmbodiedCarbonKg: number;
  carbonPerFloorAreaKg: number;
  grossEnvelopeAreaM2: number;
  internalVolumeM3: number;
  surfaceAreaToVolumeRatio: number;
}

export interface MaterialProperty {
  id: string;
  name: string;
  category: 'wall' | 'roof' | 'insulation' | 'glazing' | 'floor';
  thermalConductivityK: number; // W/(m·K)
  densityKgM3: number; // kg/m³
  specificHeatCapacityJkgK: number; // J/(kg·K)
  volumetricHeatCapacityKjM3K: number; // kJ/(m³·K) -> Indicator of thermal mass
  solarAbsorptivityAlpha: number; // 0.0 to 1.0 (surface radiation absorption)
  thermalEmissivityEpsilon: number; // 0.0 to 1.0
  typicalThicknessMeters: number;
  uValuePerStandardThickness: number; // W/(m²·K)
  costPerSquareMeterINR: number; // Indian Rupees / m²
  embodiedCarbonKgCo2PerM2: number; // kg CO2e / m²
  durabilityYears: number;
  availabilityTier: 'hyper_local_indigenous' | 'widely_available' | 'manufactured_industrial';
  description: string;
  suitableRegions: RegionId[];
}

export interface HourlyThermalPoint {
  hour: number; // 0 - 23
  outdoorTempC: number;
  solAirTempC: number;
  indoorTempBaselineC: number;
  indoorTempOptimizedC: number;
  solarRadiationWm2: number;
  imacNeutralTempC: number;
  imacUpperLimit80C: number;
  imacLowerLimit80C: number;
  imacUpperLimit90C: number;
  imacLowerLimit90C: number;
}

export interface SimulationResults {
  compositeWallUValue: number; // W/(m²·K)
  compositeRoofUValue: number; // W/(m²·K)
  windowUValue: number; // W/(m²·K)
  averageIndoorTempC: number;
  peakIndoorTempC: number;
  minIndoorTempC: number;
  diurnalDampingPercent: number; // Thermal inertia damping ((T_out_range - T_in_range) / T_out_range * 100)
  thermalLagHours: number; // Phase shift delay in hours
  imacComfortNeutralTempC: number;
  imacComfortBand80: { min: number; max: number };
  imacComfortBand90: { min: number; max: number };
  hoursInComfortBand80: number; // Out of 24
  hoursInComfortBand90: number;
  percentComfortCompliance80: number; // %
  percentComfortCompliance90: number;
  estimatedMaterialCostINR: number;
  embodiedCarbonTotalKg: number;
  thermalPerformanceRating: 'Excellent' | 'Satisfactory' | 'Needs Passive Shading' | 'Under-insulated';
  hourlyProfiles: HourlyThermalPoint[];
  engineeringObservations: string[];
  internalVolumeM3?: number;
  surfaceAreaToVolumeRatio?: number;
  totalEnvelopeAreaM2?: number;
  grossWallAreaM2?: number;
  roofAreaM2?: number;
  billOfQuantities?: BillOfQuantities;
}

export interface ShelterDesign {
  id: string; // UUID format, Django PK compatible
  name: string;
  regionId: RegionId;
  notes?: string;
  geometry: ShelterGeometry;
  wallMaterialId: string;
  roofMaterialId: string;
  insulationMaterialId: string;
  glazingMaterialId: string;
  createdAtIso: string;
  updatedAtIso: string;
  simulationResults?: SimulationResults;
}

export interface OptimizationVariant {
  id: 'best_thermal' | 'balanced' | 'budget';
  title: string;
  tagline: string;
  description: string;
  design: ShelterDesign;
  results: SimulationResults;
  costDeltaPercentVsBaseline: number;
  comfortGainPercentVsBaseline: number;
  keyAdvantages: string[];
}

export interface RegionalFallbackProfile {
  id: RegionId;
  name: string;
  locationName: string;
  climateZone: ClimateZoneType;
  elevationMeters: number;
  description: string;
  vernacularStrategies: string[];
  climate: ClimateData;
  recommendedDefaults: {
    wallThicknessMm: number;
    insulationThicknessMm: number;
    roofType: RoofType;
    roofPitchDegrees: number;
    overhangDepthMeters: number;
    windowToWallRatioPercent: number;
    windowOrientation: 'south' | 'north' | 'east' | 'west' | 'cross_distributed';
    shadingType: ShadingType;
    glazingType: GlazingType;
    airChangesPerHourACH: number;
    wallMaterialId: string;
    roofMaterialId: string;
    insulationMaterialId: string;
    glazingMaterialId: string;
  };
}
