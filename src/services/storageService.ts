/**
 * Team CODE TITANS - SIH26051
 * Offline LocalStorage Persistence & Future Python/Django REST Adapter
 * 
 * Future-Proofing for Django Backend:
 * Data schema matches Django REST Framework Serializers:
 * class ShelterDesignSerializer(serializers.ModelSerializer):
 *     geometry = GeometrySerializer()
 *     simulation_results = SimulationSerializer()
 */

import { RegionId, ShelterDesign, ShelterGeometry } from '../types';
import { DEFAULT_CLIMATES } from '../data/defaultClimates';
import { runThermalSimulation } from './thermalEngine';

const STORAGE_KEY = 'code_titans_sih26051_shelters_v1';

export function createDefaultDesignForRegion(regionId: RegionId, customName?: string): ShelterDesign {
  const profile = DEFAULT_CLIMATES[regionId];
  const rec = profile.recommendedDefaults;

  const geometry: ShelterGeometry = {
    lengthMeters: 6.0,
    widthMeters: 4.5,
    heightMeters: 3.2,
    floorAreaM2: 27.0,
    wallThicknessMm: rec.wallThicknessMm,
    insulationThicknessMm: rec.insulationThicknessMm,
    roofType: rec.roofType,
    roofPitchDegrees: rec.roofPitchDegrees,
    overhangDepthMeters: rec.overhangDepthMeters,
    windowToWallRatioPercent: rec.windowToWallRatioPercent,
    windowOrientation: rec.windowOrientation,
    shadingType: rec.shadingType,
    glazingType: rec.glazingType,
    airChangesPerHourACH: rec.airChangesPerHourACH,
    occupancyCount: 3,
    internalLoadWatts: 180
  };

  const results = runThermalSimulation(
    geometry,
    profile.climate,
    rec.wallMaterialId,
    rec.roofMaterialId,
    rec.insulationMaterialId,
    rec.glazingMaterialId
  );

  return {
    id: `shelter_${regionId}_${Date.now()}`,
    name: customName || `${profile.name} Archetype Shelter`,
    regionId,
    notes: `Engineered archetype for ${profile.locationName} (${profile.climateZone.toUpperCase()}).`,
    geometry,
    wallMaterialId: rec.wallMaterialId,
    roofMaterialId: rec.roofMaterialId,
    insulationMaterialId: rec.insulationMaterialId,
    glazingMaterialId: rec.glazingMaterialId,
    createdAtIso: new Date().toISOString(),
    updatedAtIso: new Date().toISOString(),
    simulationResults: results
  };
}

export function getAllSavedDesigns(): ShelterDesign[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Seed default designs for instant hackathon showcase
      const defaults = [
        createDefaultDesignForRegion('mountain', 'Leh Alpine Thermal Shelter'),
        createDefaultDesignForRegion('desert', 'Thar High-Inertia Adobe Habitat'),
        createDefaultDesignForRegion('river', 'Varanasi Ventilated Stilt Shelter')
      ];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
      return defaults;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error loading saved designs from localStorage:', err);
    return [];
  }
}

export function saveDesign(design: ShelterDesign): boolean {
  try {
    const all = getAllSavedDesigns();
    const existingIndex = all.findIndex((d) => d.id === design.id);
    const updated = {
      ...design,
      updatedAtIso: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      all[existingIndex] = updated;
    } else {
      all.unshift(updated);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    return true;
  } catch (err) {
    console.error('Error saving design to localStorage:', err);
    return false;
  }
}

export function deleteDesign(designId: string): boolean {
  try {
    const all = getAllSavedDesigns().filter((d) => d.id !== designId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    return true;
  } catch (err) {
    console.error('Error deleting design:', err);
    return false;
  }
}

export function exportDesignsAsDjangoJson(): string {
  const designs = getAllSavedDesigns();
  // Formatted for Django `loaddata` fixture or REST POST batch
  const djangoPayload = designs.map((d, idx) => ({
    model: 'shelter_engine.shelterdesign',
    pk: idx + 1,
    fields: {
      uuid: d.id,
      name: d.name,
      region: d.regionId,
      created_at: d.createdAtIso,
      updated_at: d.updatedAtIso,
      geometry_payload: d.geometry,
      wall_material: d.wallMaterialId,
      roof_material: d.roofMaterialId,
      insulation_material: d.insulationMaterialId,
      glazing_material: d.glazingMaterialId,
      simulation_summary: d.simulationResults
        ? {
            wall_u_value: d.simulationResults.compositeWallUValue,
            roof_u_value: d.simulationResults.compositeRoofUValue,
            comfort_80_percent: d.simulationResults.percentComfortCompliance80,
            estimated_cost_inr: d.simulationResults.estimatedMaterialCostINR
          }
        : null
    }
  }));
  return JSON.stringify(djangoPayload, null, 2);
}
