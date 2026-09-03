/**
 * Team CODE TITANS - SIH26051
 * Hardcoded Fallback Climate & Regional Archetype Profiles
 * 
 * Crucial Hackathon Offline Assurance:
 * Guarantees that even with zero internet or Open-Meteo downtime,
 * the 2D architectural visualizer and IMAC thermal engines render flawlessly.
 * 
 * Regions:
 * 1. Mountainous: Cold & Arid (Leh, Ladakh - 3500m)
 * 2. Desert: Hot & Dry (Jaisalmer, Thar Desert, Rajasthan)
 * 3. River-near: Warm & Humid / Composite (Varanasi / Sunderbans Gangetic Basin)
 */

import { RegionalFallbackProfile } from '../types';

export const DEFAULT_CLIMATES: Record<'mountain' | 'desert' | 'river', RegionalFallbackProfile> = {
  mountain: {
    id: 'mountain',
    name: 'Mountainous (Cold & Arid)',
    locationName: 'Leh, Ladakh',
    climateZone: 'cold_arid',
    elevationMeters: 3500,
    description: 'Extreme sub-zero winter temperatures, sparse vegetation, severe nighttime radiative cooling, and intense solar radiation through rarefied atmosphere (850+ W/m²). Primary challenge is winter space heating and preventing severe infiltration.',
    vernacularStrategies: [
      'Thick mass Trombe walls with south-facing high solar glazing',
      'Compact building envelope with minimal surface-area-to-volume (S/V) ratio',
      'Heavy mud-straw insulation on timber rafters to retard heat loss',
      'Air-lock lobbies (vestibules) to arrest cold drafts',
      'Small North/East apertures; concentrated direct solar South apertures'
    ],
    climate: {
      regionId: 'mountain',
      regionName: 'Mountainous (Cold & Arid)',
      locationName: 'Leh, Ladakh',
      latitude: 34.1526,
      longitude: 77.5771,
      elevationMeters: 3500,
      climateZone: 'cold_arid',
      outdoorTempC: 3.2,
      minTempC: -7.5,
      maxTempC: 12.8,
      diurnalSwingC: 20.3,
      relativeHumidityPercent: 28,
      windSpeedMs: 4.8,
      directNormalSolarRadiationWm2: 860,
      diffuseSolarRadiationWm2: 120,
      totalHorizontalSolarRadiationWm2: 680,
      runningMeanOutdoorTempC: 1.5, // Used for IMAC
      // 24-hour typical day profile (00:00 to 23:00)
      hourlyOutdoorTemps: [
        -5.2, -6.1, -6.8, -7.5, -7.0, -5.5, -2.0, 1.5,
        5.0, 8.2, 10.8, 12.4, 12.8, 11.9, 9.5, 6.2,
        3.0, 0.5, -1.8, -3.2, -4.0, -4.6, -4.9, -5.1
      ],
      hourlySolarRadiationWm2: [
        0, 0, 0, 0, 0, 15, 120, 310,
        580, 780, 890, 920, 880, 750, 520, 290,
        90, 10, 0, 0, 0, 0, 0, 0
      ],
      conditionSummary: 'Sub-Zero Night Radiative Loss with Intense High-Altitude Insolation',
      source: 'offline_fallback_profile',
      fetchedAtIso: new Date().toISOString()
    },
    recommendedDefaults: {
      wallThicknessMm: 380, // Thick rammed earth or double stone
      insulationThicknessMm: 75, // Continuous EPS or rockwool layer
      roofType: 'pitched', // Low pitch with heavy insulation
      roofPitchDegrees: 22,
      overhangDepthMeters: 0.45, // Modest overhang to allow winter solar entry
      windowToWallRatioPercent: 18, // Moderate WWR, oriented South
      windowOrientation: 'south',
      shadingType: 'chhajja_overhang',
      glazingType: 'double_low_e',
      airChangesPerHourACH: 0.8, // Controlled infiltration
      wallMaterialId: 'mat_mud_rammed_earth',
      roofMaterialId: 'mat_roof_mud_timber',
      insulationMaterialId: 'mat_ins_rockwool',
      glazingMaterialId: 'mat_glaze_double_low_e'
    }
  },

  desert: {
    id: 'desert',
    name: 'Desert (Hot & Dry)',
    locationName: 'Jaisalmer, Thar Desert, Rajasthan',
    climateZone: 'hot_dry',
    elevationMeters: 225,
    description: 'Scorching daytime temperatures exceeding 42°C, intense direct solar radiation, very low humidity (<20%), and strong diurnal fluctuations dropping to 22°C at night. Challenge: delaying daytime heat transfer until night and maximizing nocturnal cooling.',
    vernacularStrategies: [
      'High thermal mass masonry (Sandstone / Adobe) to provide 8-10 hour thermal phase delay',
      'Small Window-to-Wall Ratio (WWR 10-15%) to minimize solar aperture radiation',
      'Deep stone chhajjas and jalis (perforated screens) for self-shading',
      'High-albedo reflective roof coatings (lime wash / surkhi)',
      'Nocturnal cross-ventilation flushing daytime stored heat'
    ],
    climate: {
      regionId: 'desert',
      regionName: 'Desert (Hot & Dry)',
      locationName: 'Jaisalmer, Thar Desert',
      latitude: 26.9157,
      longitude: 70.9083,
      elevationMeters: 225,
      climateZone: 'hot_dry',
      outdoorTempC: 38.5,
      minTempC: 23.4,
      maxTempC: 43.8,
      diurnalSwingC: 20.4,
      relativeHumidityPercent: 18,
      windSpeedMs: 3.6,
      directNormalSolarRadiationWm2: 890,
      diffuseSolarRadiationWm2: 95,
      totalHorizontalSolarRadiationWm2: 740,
      runningMeanOutdoorTempC: 32.8,
      hourlyOutdoorTemps: [
        26.2, 25.0, 24.1, 23.4, 24.0, 26.5, 29.8, 33.2,
        36.8, 39.5, 41.8, 43.2, 43.8, 43.1, 41.4, 38.9,
        36.0, 33.2, 30.8, 29.2, 28.1, 27.4, 26.9, 26.5
      ],
      hourlySolarRadiationWm2: [
        0, 0, 0, 0, 0, 25, 180, 420,
        660, 840, 930, 960, 910, 790, 590, 360,
        140, 20, 0, 0, 0, 0, 0, 0
      ],
      conditionSummary: 'Severe Solar Gain, High Diurnal Swing & Low Atmospheric Moisture',
      source: 'offline_fallback_profile',
      fetchedAtIso: new Date().toISOString()
    },
    recommendedDefaults: {
      wallThicknessMm: 350, // Massive stone or earth wall
      insulationThicknessMm: 50,
      roofType: 'flat', // Flat roof with parapet for sleeping/radiant night cooling
      roofPitchDegrees: 0,
      overhangDepthMeters: 0.85, // Deep stone chhajjas
      windowToWallRatioPercent: 12, // Restrict window area
      windowOrientation: 'north',
      shadingType: 'louvers',
      glazingType: 'double_standard',
      airChangesPerHourACH: 1.2, // Low daytime, night purge
      wallMaterialId: 'mat_stone_masonry',
      roofMaterialId: 'mat_roof_lime_surkhi_terracing',
      insulationMaterialId: 'mat_ins_rockwool',
      glazingMaterialId: 'mat_glaze_double_standard'
    }
  },

  river: {
    id: 'river',
    name: 'River-Near (Warm & Humid / Composite)',
    locationName: 'Gangetic Basin / Delta (Varanasi - Bengal)',
    climateZone: 'warm_humid',
    elevationMeters: 76,
    description: 'High relative humidity (70-85%), high summer temperatures (32-37°C), low diurnal swing (5-8°C), and high cloudiness diffusing solar radiation. Skin sweat evaporation is suppressed; maximum air velocity and rapid envelope heat dissipation are critical.',
    vernacularStrategies: [
      'Elevated plinth / stilt construction to catch river breezes and resist seasonal flood dampness',
      'Large operable openings on opposite windward/leeward walls for continuous cross-ventilation',
      'High pitched roof with generous eaves to shed monsoon downpours and shade walls',
      'Ventilated double-roof / clay tile cavity exhausting trapped hot humid air',
      'Lightweight, breathable, low-thermal-mass building materials (Bamboo, Wattle & Daub, Porous AAC)'
    ],
    climate: {
      regionId: 'river',
      regionName: 'River-Near (Warm & Humid)',
      locationName: 'Gangetic Basin / Varanasi',
      latitude: 25.3176,
      longitude: 82.9739,
      elevationMeters: 76,
      climateZone: 'warm_humid',
      outdoorTempC: 33.6,
      minTempC: 27.2,
      maxTempC: 36.4,
      diurnalSwingC: 9.2,
      relativeHumidityPercent: 78,
      windSpeedMs: 2.8,
      directNormalSolarRadiationWm2: 450,
      diffuseSolarRadiationWm2: 260,
      totalHorizontalSolarRadiationWm2: 520,
      runningMeanOutdoorTempC: 31.0,
      hourlyOutdoorTemps: [
        28.4, 27.9, 27.5, 27.2, 27.6, 28.5, 30.1, 31.8,
        33.2, 34.6, 35.8, 36.4, 36.1, 35.4, 34.2, 33.1,
        32.0, 31.1, 30.2, 29.6, 29.2, 28.9, 28.7, 28.5
      ],
      hourlySolarRadiationWm2: [
        0, 0, 0, 0, 0, 10, 90, 240,
        420, 560, 640, 680, 650, 540, 410, 230,
        80, 10, 0, 0, 0, 0, 0, 0
      ],
      conditionSummary: 'High Vapor Pressure, Humid Calm Air, Requiring Enhanced Air Movement',
      source: 'offline_fallback_profile',
      fetchedAtIso: new Date().toISOString()
    },
    recommendedDefaults: {
      wallThicknessMm: 150, // Lightweight breathable wall
      insulationThicknessMm: 0, // In humid climates, ventilation dominates; low mass preferred
      roofType: 'ventilated_cavity', // Ventilated clay tile roof
      roofPitchDegrees: 30,
      overhangDepthMeters: 1.10, // Deep protective overhang against torrential rain and high solar
      windowToWallRatioPercent: 32, // Large cross-ventilation apertures
      windowOrientation: 'cross_distributed',
      shadingType: 'chhajja_overhang',
      glazingType: 'single_clear',
      airChangesPerHourACH: 5.5, // High air exchange to induce convective cooling
      wallMaterialId: 'mat_bamboo_composite',
      roofMaterialId: 'mat_roof_ventilated_mangalore',
      insulationMaterialId: 'mat_ins_none',
      glazingMaterialId: 'mat_glaze_single_clear'
    }
  }
};

export function getRegionalProfile(regionId: 'mountain' | 'desert' | 'river'): RegionalFallbackProfile {
  return DEFAULT_CLIMATES[regionId] || DEFAULT_CLIMATES.mountain;
}
