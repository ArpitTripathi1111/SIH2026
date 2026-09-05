/**
 * Team CODE TITANS - SIH26051
 * Offline LocalStorage Persistence & Python/Django REST Adapter
 * 
 * Features:
 * - Resilient fallback: seamlessly handles sandboxed iframe environments where localStorage may throw SecurityError
 * - Dual persistence: window.localStorage + in-memory fallback cache
 * - Full CRUD: save, save-as-new, duplicate, delete, restore archetypes, import/export
 * - Future-Proofing for Django Backend REST Serializers
 */

import { RegionId, ShelterDesign, ShelterGeometry } from '../types';
import { DEFAULT_CLIMATES } from '../data/defaultClimates';
import { runThermalSimulation } from './thermalEngine';

const STORAGE_KEY = 'code_titans_sih26051_shelters_v1';

// In-memory fallback map for environments where localStorage is restricted or throws
const memoryStorage = new Map<string, string>();

/**
 * Safe read from storage with cross-environment iframe protection
 */
function readStorageSafe(key: string): string | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const val = window.localStorage.getItem(key);
      if (val !== null) {
        memoryStorage.set(key, val);
        return val;
      }
    }
  } catch (err) {
    console.warn('localStorage access restricted; using resilient in-memory store:', err);
  }
  return memoryStorage.get(key) ?? null;
}

/**
 * Safe write to storage with error handling
 */
function writeStorageSafe(key: string, value: string): boolean {
  memoryStorage.set(key, value);
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
      return true;
    }
  } catch (err) {
    console.warn('localStorage write restricted; preserved in resilient memory store:', err);
  }
  return true;
}

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
    id: `shelter_${regionId}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
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

/**
 * Seed initial baseline designs for hackathon showcase
 */
function getInitialDefaultDesigns(): ShelterDesign[] {
  return [
    createDefaultDesignForRegion('mountain', 'Leh Alpine Thermal Shelter'),
    createDefaultDesignForRegion('desert', 'Thar High-Inertia Adobe Habitat'),
    createDefaultDesignForRegion('river', 'Varanasi Ventilated Stilt Shelter')
  ];
}

/**
 * Retrieve all saved designs from offline storage
 */
export function getAllSavedDesigns(): ShelterDesign[] {
  try {
    const raw = readStorageSafe(STORAGE_KEY);
    if (!raw) {
      const defaults = getInitialDefaultDesigns();
      writeStorageSafe(STORAGE_KEY, JSON.stringify(defaults));
      return defaults;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    // If empty array, re-seed
    const defaults = getInitialDefaultDesigns();
    writeStorageSafe(STORAGE_KEY, JSON.stringify(defaults));
    return defaults;
  } catch (err) {
    console.error('Error loading saved designs from storage:', err);
    const defaults = getInitialDefaultDesigns();
    return defaults;
  }
}

/**
 * Update an existing design or save if not yet existing
 */
export function saveDesign(design: ShelterDesign): boolean {
  try {
    const all = getAllSavedDesigns();
    const existingIndex = all.findIndex((d) => d.id === design.id);
    const updated: ShelterDesign = {
      ...design,
      updatedAtIso: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      all[existingIndex] = updated;
    } else {
      all.unshift(updated);
    }

    return writeStorageSafe(STORAGE_KEY, JSON.stringify(all));
  } catch (err) {
    console.error('Error saving design to storage:', err);
    return false;
  }
}

/**
 * Save current design as a new entry with a unique ID and custom name
 */
export function saveDesignAsNew(
  design: ShelterDesign,
  customName?: string
): { success: boolean; savedDesign: ShelterDesign } {
  try {
    const all = getAllSavedDesigns();
    const newId = `shelter_${design.regionId}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const finalName = customName?.trim() || `${design.name} (Custom Save)`;

    const newDesign: ShelterDesign = {
      ...design,
      id: newId,
      name: finalName,
      createdAtIso: new Date().toISOString(),
      updatedAtIso: new Date().toISOString()
    };

    all.unshift(newDesign);
    const success = writeStorageSafe(STORAGE_KEY, JSON.stringify(all));
    return { success, savedDesign: newDesign };
  } catch (err) {
    console.error('Error saving new design entry:', err);
    return { success: false, savedDesign: design };
  }
}

/**
 * Duplicate a saved design
 */
export function duplicateDesign(designId: string): ShelterDesign | null {
  try {
    const all = getAllSavedDesigns();
    const target = all.find((d) => d.id === designId);
    if (!target) return null;

    const copy: ShelterDesign = {
      ...target,
      id: `shelter_${target.regionId}_${Date.now()}_copy`,
      name: `${target.name} (Copy)`,
      createdAtIso: new Date().toISOString(),
      updatedAtIso: new Date().toISOString()
    };

    all.unshift(copy);
    writeStorageSafe(STORAGE_KEY, JSON.stringify(all));
    return copy;
  } catch (err) {
    console.error('Error duplicating design:', err);
    return null;
  }
}

/**
 * Delete a design from storage
 */
export function deleteDesign(designId: string): boolean {
  try {
    const all = getAllSavedDesigns().filter((d) => d.id !== designId);
    return writeStorageSafe(STORAGE_KEY, JSON.stringify(all));
  } catch (err) {
    console.error('Error deleting design:', err);
    return false;
  }
}

/**
 * Reset saved designs to standard regional archetypes
 */
export function resetSavedDesignsToDefaults(): ShelterDesign[] {
  const defaults = getInitialDefaultDesigns();
  writeStorageSafe(STORAGE_KEY, JSON.stringify(defaults));
  return defaults;
}

/**
 * Import designs from JSON (supports single ShelterDesign, array of designs, or Django fixtures)
 */
export function importDesignsFromJson(jsonStr: string): { success: boolean; count: number; error?: string } {
  try {
    const parsed = JSON.parse(jsonStr);
    const all = getAllSavedDesigns();
    let addedCount = 0;

    if (Array.isArray(parsed)) {
      for (const item of parsed) {
        // Check if item is Django fixture format
        if (item.model === 'shelter_engine.shelterdesign' && item.fields) {
          const f = item.fields;
          const imported: ShelterDesign = {
            id: f.uuid || `shelter_imported_${Date.now()}_${addedCount}`,
            name: f.name || 'Imported Django Shelter',
            regionId: f.region || 'mountain',
            notes: 'Imported from Django fixture',
            geometry: f.geometry_payload || createDefaultDesignForRegion(f.region || 'mountain').geometry,
            wallMaterialId: f.wall_material || 'mat_mud_rammed_earth',
            roofMaterialId: f.roof_material || 'mat_roof_timber_shingle',
            insulationMaterialId: f.insulation_material || 'mat_ins_straw_clay',
            glazingMaterialId: f.glazing_material || 'mat_glaze_double',
            createdAtIso: f.created_at || new Date().toISOString(),
            updatedAtIso: f.updated_at || new Date().toISOString()
          };
          all.unshift(imported);
          addedCount++;
        } else if (item.id && item.geometry) {
          // Standard ShelterDesign item
          const newId = `shelter_${item.regionId || 'custom'}_${Date.now()}_${addedCount}`;
          all.unshift({
            ...item,
            id: newId,
            updatedAtIso: new Date().toISOString()
          });
          addedCount++;
        }
      }
    } else if (parsed && typeof parsed === 'object' && parsed.geometry) {
      // Single ShelterDesign object
      const newId = `shelter_${parsed.regionId || 'custom'}_${Date.now()}`;
      all.unshift({
        ...parsed,
        id: newId,
        name: parsed.name ? `${parsed.name} (Imported)` : 'Imported Custom Shelter',
        updatedAtIso: new Date().toISOString()
      });
      addedCount++;
    } else {
      return { success: false, count: 0, error: 'Unrecognized JSON structure. Expected ShelterDesign or Django fixture.' };
    }

    if (addedCount > 0) {
      writeStorageSafe(STORAGE_KEY, JSON.stringify(all));
      return { success: true, count: addedCount };
    }
    return { success: false, count: 0, error: 'No valid shelter designs found in the provided JSON.' };
  } catch (err: any) {
    return { success: false, count: 0, error: err?.message || 'Invalid JSON syntax.' };
  }
}

/**
 * Export all designs as Django fixtures
 */
export function exportDesignsAsDjangoJson(): string {
  const designs = getAllSavedDesigns();
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

/**
 * Export single design as standard JSON
 */
export function exportSingleDesignJson(design: ShelterDesign): string {
  return JSON.stringify(design, null, 2);
}

