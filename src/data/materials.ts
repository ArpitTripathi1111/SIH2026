/**
 * Team CODE TITANS - SIH26051
 * Materials Database with authentic physical & thermodynamic properties.
 * Sources: Bureau of Indian Standards (SP 41 & NBC 2016 Part 8), ECBC India,
 * and CEPT University Centre for Advanced Research in Building Science.
 */

import { MaterialProperty } from '../types';

export const MATERIALS_DATABASE: MaterialProperty[] = [
  // --- WALL MATERIALS ---
  {
    id: 'mat_brick_standard',
    name: 'Kiln-Burnt Clay Brick (230mm)',
    category: 'wall',
    thermalConductivityK: 0.81, // W/(m·K)
    densityKgM3: 1820,
    specificHeatCapacityJkgK: 880,
    volumetricHeatCapacityKjM3K: 1601.6,
    solarAbsorptivityAlpha: 0.70,
    thermalEmissivityEpsilon: 0.90,
    typicalThicknessMeters: 0.23,
    uValuePerStandardThickness: 2.15, // W/(m²·K)
    costPerSquareMeterINR: 850,
    embodiedCarbonKgCo2PerM2: 52.4,
    durabilityYears: 70,
    availabilityTier: 'widely_available',
    description: 'Traditional standard modular masonry in Indian plains; high thermal mass but moderate thermal conductivity.',
    suitableRegions: ['river', 'desert']
  },
  {
    id: 'mat_mud_rammed_earth',
    name: 'Rammed Earth / Stabilized Adobe (350mm)',
    category: 'wall',
    thermalConductivityK: 0.65,
    densityKgM3: 1900,
    specificHeatCapacityJkgK: 1260,
    volumetricHeatCapacityKjM3K: 2394.0, // High thermal inertia!
    solarAbsorptivityAlpha: 0.65,
    thermalEmissivityEpsilon: 0.92,
    typicalThicknessMeters: 0.35,
    uValuePerStandardThickness: 1.42,
    costPerSquareMeterINR: 420,
    embodiedCarbonKgCo2PerM2: 8.2, // Ultra low carbon
    durabilityYears: 50,
    availabilityTier: 'hyper_local_indigenous',
    description: 'Indigenous high-inertia soil-gravel walling. Excellent thermal damping and phase delay for desert and high-altitude extremes.',
    suitableRegions: ['mountain', 'desert']
  },
  {
    id: 'mat_stone_masonry',
    name: 'Dressed Stone Masonry (Granite/Sandstone 300mm)',
    category: 'wall',
    thermalConductivityK: 1.80,
    densityKgM3: 2400,
    specificHeatCapacityJkgK: 840,
    volumetricHeatCapacityKjM3K: 2016.0,
    solarAbsorptivityAlpha: 0.60,
    thermalEmissivityEpsilon: 0.88,
    typicalThicknessMeters: 0.30,
    uValuePerStandardThickness: 2.85,
    costPerSquareMeterINR: 1100,
    embodiedCarbonKgCo2PerM2: 24.5,
    durabilityYears: 100,
    availabilityTier: 'hyper_local_indigenous',
    description: 'Rugged regional stone construction with extreme structural longevity and significant volumetric heat capacity.',
    suitableRegions: ['mountain', 'desert']
  },
  {
    id: 'mat_aac_blocks',
    name: 'Autoclaved Aerated Concrete (AAC 200mm)',
    category: 'wall',
    thermalConductivityK: 0.16, // Very low conductivity
    densityKgM3: 550,
    specificHeatCapacityJkgK: 1000,
    volumetricHeatCapacityKjM3K: 550.0,
    solarAbsorptivityAlpha: 0.45,
    thermalEmissivityEpsilon: 0.88,
    typicalThicknessMeters: 0.20,
    uValuePerStandardThickness: 0.72,
    costPerSquareMeterINR: 980,
    embodiedCarbonKgCo2PerM2: 28.0,
    durabilityYears: 50,
    availabilityTier: 'widely_available',
    description: 'Micro-cellular precast blocks offering superior inherent thermal resistance (low U-value) and lightweight structural load.',
    suitableRegions: ['river', 'desert', 'mountain']
  },
  {
    id: 'mat_bamboo_composite',
    name: 'Treated Bamboo Wattle & Daub (120mm)',
    category: 'wall',
    thermalConductivityK: 0.25,
    densityKgM3: 650,
    specificHeatCapacityJkgK: 1400,
    volumetricHeatCapacityKjM3K: 910.0,
    solarAbsorptivityAlpha: 0.50,
    thermalEmissivityEpsilon: 0.85,
    typicalThicknessMeters: 0.12,
    uValuePerStandardThickness: 1.65,
    costPerSquareMeterINR: 350,
    embodiedCarbonKgCo2PerM2: -6.5, // Carbon-negative bio-composite
    durabilityYears: 25,
    availabilityTier: 'hyper_local_indigenous',
    description: 'Low-cost bio-composite wall paneling; rapid cooling rate, highly breathable and resilient for humid river basins.',
    suitableRegions: ['river']
  },
  {
    id: 'mat_concrete_rcc',
    name: 'Reinforced Concrete (RCC 150mm)',
    category: 'wall',
    thermalConductivityK: 1.58,
    densityKgM3: 2400,
    specificHeatCapacityJkgK: 960,
    volumetricHeatCapacityKjM3K: 2304.0,
    solarAbsorptivityAlpha: 0.65,
    thermalEmissivityEpsilon: 0.90,
    typicalThicknessMeters: 0.15,
    uValuePerStandardThickness: 3.40,
    costPerSquareMeterINR: 1250,
    embodiedCarbonKgCo2PerM2: 85.0,
    durabilityYears: 80,
    availabilityTier: 'manufactured_industrial',
    description: 'Heavy standard concrete cast in-situ. Requires supplemental insulation to prevent severe solar overheating.',
    suitableRegions: ['river', 'desert', 'mountain']
  },
  {
    id: 'mat_eps_sandwich_panel',
    name: 'EPS Insulated Sandwich Panel (100mm)',
    category: 'wall',
    thermalConductivityK: 0.038,
    densityKgM3: 35,
    specificHeatCapacityJkgK: 1450,
    volumetricHeatCapacityKjM3K: 50.7,
    solarAbsorptivityAlpha: 0.35,
    thermalEmissivityEpsilon: 0.90,
    typicalThicknessMeters: 0.10,
    uValuePerStandardThickness: 0.34,
    costPerSquareMeterINR: 1400,
    embodiedCarbonKgCo2PerM2: 44.0,
    durabilityYears: 30,
    availabilityTier: 'manufactured_industrial',
    description: 'Prefabricated insulated panel with high thermal resistance; ideal for rapid deployment in high-altitude cold frontiers.',
    suitableRegions: ['mountain']
  },

  // --- ROOF MATERIALS ---
  {
    id: 'mat_roof_rcc_slab',
    name: 'RCC Flat Slab with Screed (150mm)',
    category: 'roof',
    thermalConductivityK: 1.58,
    densityKgM3: 2400,
    specificHeatCapacityJkgK: 960,
    volumetricHeatCapacityKjM3K: 2304.0,
    solarAbsorptivityAlpha: 0.65,
    thermalEmissivityEpsilon: 0.90,
    typicalThicknessMeters: 0.15,
    uValuePerStandardThickness: 3.10,
    costPerSquareMeterINR: 1300,
    embodiedCarbonKgCo2PerM2: 78.0,
    durabilityYears: 60,
    availabilityTier: 'widely_available',
    description: 'Conventional flat roof slab common across urban and semi-urban India; high solar gain without insulation.',
    suitableRegions: ['desert', 'river']
  },
  {
    id: 'mat_roof_mud_timber',
    name: 'Mud-Straw Earth & Timber Rafters (220mm)',
    category: 'roof',
    thermalConductivityK: 0.52,
    densityKgM3: 1600,
    specificHeatCapacityJkgK: 1350,
    volumetricHeatCapacityKjM3K: 2160.0,
    solarAbsorptivityAlpha: 0.60,
    thermalEmissivityEpsilon: 0.90,
    typicalThicknessMeters: 0.22,
    uValuePerStandardThickness: 1.45,
    costPerSquareMeterINR: 520,
    embodiedCarbonKgCo2PerM2: 12.0,
    durabilityYears: 40,
    availabilityTier: 'hyper_local_indigenous',
    description: 'Traditional Himalayan flat roof construction; thick mud layer acting as a thermal buffer over willow/poplar rafters.',
    suitableRegions: ['mountain']
  },
  {
    id: 'mat_roof_ventilated_mangalore',
    name: 'Mangalore Clay Tiles with Air Cavity (Pitched)',
    category: 'roof',
    thermalConductivityK: 0.85,
    densityKgM3: 1900,
    specificHeatCapacityJkgK: 900,
    volumetricHeatCapacityKjM3K: 1710.0,
    solarAbsorptivityAlpha: 0.55,
    thermalEmissivityEpsilon: 0.88,
    typicalThicknessMeters: 0.08,
    uValuePerStandardThickness: 1.85,
    costPerSquareMeterINR: 650,
    embodiedCarbonKgCo2PerM2: 18.5,
    durabilityYears: 45,
    availabilityTier: 'widely_available',
    description: 'Pitched sloping roof with natural convective under-tile ventilation; expels warm humid buoyancy air efficiently.',
    suitableRegions: ['river']
  },
  {
    id: 'mat_roof_corrugated_gi_insulated',
    name: 'Corrugated GI Sheet + 50mm Underdeck Insulation',
    category: 'roof',
    thermalConductivityK: 0.045,
    densityKgM3: 85,
    specificHeatCapacityJkgK: 900,
    volumetricHeatCapacityKjM3K: 76.5,
    solarAbsorptivityAlpha: 0.40,
    thermalEmissivityEpsilon: 0.85,
    typicalThicknessMeters: 0.05,
    uValuePerStandardThickness: 0.68,
    costPerSquareMeterINR: 880,
    embodiedCarbonKgCo2PerM2: 32.0,
    durabilityYears: 25,
    availabilityTier: 'widely_available',
    description: 'Steep pitch roof assembly for snow shedding with dense mineral wool / polyurethane underdeck barrier.',
    suitableRegions: ['mountain', 'river']
  },
  {
    id: 'mat_roof_lime_surkhi_terracing',
    name: 'Lime Concrete & Surkhi Weathering Layer (100mm)',
    category: 'roof',
    thermalConductivityK: 0.70,
    densityKgM3: 1750,
    specificHeatCapacityJkgK: 920,
    volumetricHeatCapacityKjM3K: 1610.0,
    solarAbsorptivityAlpha: 0.30, // High solar reflectance / cool roof
    thermalEmissivityEpsilon: 0.91,
    typicalThicknessMeters: 0.10,
    uValuePerStandardThickness: 1.90,
    costPerSquareMeterINR: 580,
    embodiedCarbonKgCo2PerM2: 15.0,
    durabilityYears: 50,
    availabilityTier: 'hyper_local_indigenous',
    description: 'Traditional Indian cool roof technique with lime and broken brick aggregate; reflects up to 70% incident solar heat.',
    suitableRegions: ['desert', 'river']
  },

  // --- INSULATION MATERIALS ---
  {
    id: 'mat_ins_none',
    name: 'No Additional Insulation (Uninsulated Envelope)',
    category: 'insulation',
    thermalConductivityK: 1.0,
    densityKgM3: 0,
    specificHeatCapacityJkgK: 0,
    volumetricHeatCapacityKjM3K: 0,
    solarAbsorptivityAlpha: 0,
    thermalEmissivityEpsilon: 0,
    typicalThicknessMeters: 0.0,
    uValuePerStandardThickness: 99.0,
    costPerSquareMeterINR: 0,
    embodiedCarbonKgCo2PerM2: 0,
    durabilityYears: 100,
    availabilityTier: 'widely_available',
    description: 'Raw single wall/roof layer without secondary thermal barrier.',
    suitableRegions: ['river', 'desert', 'mountain']
  },
  {
    id: 'mat_ins_expanded_polystyrene',
    name: 'Expanded Polystyrene (EPS Board 50mm)',
    category: 'insulation',
    thermalConductivityK: 0.036,
    densityKgM3: 20,
    specificHeatCapacityJkgK: 1400,
    volumetricHeatCapacityKjM3K: 28.0,
    solarAbsorptivityAlpha: 0.20,
    thermalEmissivityEpsilon: 0.90,
    typicalThicknessMeters: 0.05,
    uValuePerStandardThickness: 0.65,
    costPerSquareMeterINR: 280,
    embodiedCarbonKgCo2PerM2: 7.5,
    durabilityYears: 30,
    availabilityTier: 'widely_available',
    description: 'Rigid closed-cell foam providing economical continuous thermal boundary resisting cold-bridge heat loss.',
    suitableRegions: ['mountain', 'desert']
  },
  {
    id: 'mat_ins_rockwool',
    name: 'Rock Mineral Wool Batts (50mm)',
    category: 'insulation',
    thermalConductivityK: 0.034,
    densityKgM3: 64,
    specificHeatCapacityJkgK: 1000,
    volumetricHeatCapacityKjM3K: 64.0,
    solarAbsorptivityAlpha: 0.30,
    thermalEmissivityEpsilon: 0.90,
    typicalThicknessMeters: 0.05,
    uValuePerStandardThickness: 0.62,
    costPerSquareMeterINR: 390,
    embodiedCarbonKgCo2PerM2: 9.8,
    durabilityYears: 40,
    availabilityTier: 'widely_available',
    description: 'Non-combustible basalt stone fiber batts; superior acoustic dampening and high fire resistance.',
    suitableRegions: ['mountain', 'desert', 'river']
  },
  {
    id: 'mat_ins_straw_bale',
    name: 'Compressed Agricultural Straw / Husk (80mm)',
    category: 'insulation',
    thermalConductivityK: 0.065,
    densityKgM3: 110,
    specificHeatCapacityJkgK: 1800,
    volumetricHeatCapacityKjM3K: 198.0,
    solarAbsorptivityAlpha: 0.40,
    thermalEmissivityEpsilon: 0.85,
    typicalThicknessMeters: 0.08,
    uValuePerStandardThickness: 0.74,
    costPerSquareMeterINR: 140,
    embodiedCarbonKgCo2PerM2: -12.0, // Carbon negative
    durabilityYears: 20,
    availabilityTier: 'hyper_local_indigenous',
    description: 'Agri-waste bio-insulation avoiding crop stubble burning; highly insulating and breathable.',
    suitableRegions: ['river', 'desert']
  },

  // --- GLAZING OPTIONS ---
  {
    id: 'mat_glaze_single_clear',
    name: 'Single Clear Float Glass (4mm)',
    category: 'glazing',
    thermalConductivityK: 1.0,
    densityKgM3: 2500,
    specificHeatCapacityJkgK: 750,
    volumetricHeatCapacityKjM3K: 1875.0,
    solarAbsorptivityAlpha: 0.15,
    thermalEmissivityEpsilon: 0.84,
    typicalThicknessMeters: 0.004,
    uValuePerStandardThickness: 5.70, // W/(m²·K)
    costPerSquareMeterINR: 450,
    embodiedCarbonKgCo2PerM2: 12.0,
    durabilityYears: 30,
    availabilityTier: 'widely_available',
    description: 'Standard single pane; high heat transmission, susceptible to rapid winter heat drain and summer greenhouse trap.',
    suitableRegions: ['river', 'desert', 'mountain']
  },
  {
    id: 'mat_glaze_double_standard',
    name: 'Double Glazed Unit (6mm + 12mm Air + 6mm)',
    category: 'glazing',
    thermalConductivityK: 0.28,
    densityKgM3: 2500,
    specificHeatCapacityJkgK: 750,
    volumetricHeatCapacityKjM3K: 1875.0,
    solarAbsorptivityAlpha: 0.18,
    thermalEmissivityEpsilon: 0.84,
    typicalThicknessMeters: 0.024,
    uValuePerStandardThickness: 2.80,
    costPerSquareMeterINR: 1400,
    embodiedCarbonKgCo2PerM2: 24.0,
    durabilityYears: 25,
    availabilityTier: 'widely_available',
    description: 'Insulated glass unit with dehydrated sealed air cavity; cuts conduction loss in half.',
    suitableRegions: ['mountain', 'desert']
  },
  {
    id: 'mat_glaze_double_low_e',
    name: 'Double Glazed Low-E Glass with Argon Cavity',
    category: 'glazing',
    thermalConductivityK: 0.16,
    densityKgM3: 2500,
    specificHeatCapacityJkgK: 750,
    volumetricHeatCapacityKjM3K: 1875.0,
    solarAbsorptivityAlpha: 0.25,
    thermalEmissivityEpsilon: 0.10, // Low emissivity coating
    typicalThicknessMeters: 0.024,
    uValuePerStandardThickness: 1.60,
    costPerSquareMeterINR: 2200,
    embodiedCarbonKgCo2PerM2: 32.0,
    durabilityYears: 25,
    availabilityTier: 'manufactured_industrial',
    description: 'Spectrally selective glass reflecting long-wave infrared heat back into the interior in winter or outside in summer.',
    suitableRegions: ['mountain', 'desert']
  }
];

export function getMaterialById(id: string): MaterialProperty {
  const found = MATERIALS_DATABASE.find((m) => m.id === id);
  if (!found) {
    return MATERIALS_DATABASE[0]; // fallback to standard brick
  }
  return found;
}

export function getMaterialsByCategory(category: MaterialProperty['category']): MaterialProperty[] {
  return MATERIALS_DATABASE.filter((m) => m.category === category);
}
