/**
 * Team CODE TITANS - SIH26051
 * Input Dashboard - Architectural & Climate Specification Form
 * 
 * Clean, standard, and engineering-focused interface for adjusting shelter envelope
 * and environmental parameters.
 */

import React from 'react';
import { ArchitecturalShape, ClimateData, RegionId, ShelterDesign, ShelterGeometry } from '../types';
import { MATERIALS_DATABASE } from '../data/materials';
import { DEFAULT_CLIMATES } from '../data/defaultClimates';
import { RefreshCw, MapPin, Sparkles, Sliders, ShieldCheck, FolderOpen, Check } from 'lucide-react';
import { ShapeSelector } from './ShapeSelector';
import { saveDesignAsNew } from '../services/storageService';

interface InputDashboardProps {
  design: ShelterDesign;
  climate: ClimateData;
  isLoadingWeather: boolean;
  onDesignChange: (updated: ShelterDesign) => void;
  onRegionChange: (region: RegionId) => void;
  onFetchLiveWeather: () => void;
  onResetToArchetype: () => void;
}

export const InputDashboard: React.FC<InputDashboardProps> = ({
  design,
  climate,
  isLoadingWeather,
  onDesignChange,
  onRegionChange,
  onFetchLiveWeather,
  onResetToArchetype
}) => {
  const wallMaterials = MATERIALS_DATABASE.filter((m) => m.category === 'wall');
  const roofMaterials = MATERIALS_DATABASE.filter((m) => m.category === 'roof');
  const insulationMaterials = MATERIALS_DATABASE.filter((m) => m.category === 'insulation');
  const glazingMaterials = MATERIALS_DATABASE.filter((m) => m.category === 'glazing');

  const [savedToast, setSavedToast] = React.useState<boolean>(false);

  const handleQuickSave = () => {
    saveDesignAsNew(design);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3500);
  };

  const updateGeometry = (field: keyof ShelterGeometry, value: any) => {
    onDesignChange({
      ...design,
      geometry: {
        ...design.geometry,
        [field]: value
      }
    });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm text-slate-800">
      {/* Header Bar */}
      <div className="px-5 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/80">
        <div>
          <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-slate-700" />
            Shelter Parameters & Envelope Specification
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure geometry, materials, and fenestration for IMAC thermal modeling.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleQuickSave}
            id="quick-save-design-btn"
            className={`px-3 py-1.5 text-xs font-semibold rounded transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
              savedToast
                ? 'bg-emerald-600 text-white border border-emerald-700'
                : 'text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100'
            }`}
            title="Save active design to offline local storage"
          >
            {savedToast ? <Check className="w-3.5 h-3.5" /> : <FolderOpen className="w-3.5 h-3.5 text-blue-600" />}
            {savedToast ? 'Saved to Offline Storage!' : 'Save Design (Offline)'}
          </button>

          <button
            type="button"
            onClick={onResetToArchetype}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors flex items-center gap-1.5"
            title="Reset to recommended regional archetype defaults"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            Load Archetype
          </button>

          <button
            type="button"
            onClick={onFetchLiveWeather}
            disabled={isLoadingWeather}
            className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition-colors flex items-center gap-1.5 disabled:opacity-50"
            title="Fetch live weather via Open-Meteo with offline fallback protection"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingWeather ? 'animate-spin' : ''}`} />
            {isLoadingWeather ? 'Syncing...' : 'Sync Live Weather'}
          </button>
        </div>
      </div>

      <div className="p-5 space-y-6">
        {/* REGION SELECTION & METEOROLOGICAL BANNER */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            1. Target Climate Zone & Geographic Region
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {(['mountain', 'desert', 'river'] as RegionId[]).map((regId) => {
              const profile = DEFAULT_CLIMATES[regId];
              const isSelected = design.regionId === regId;
              return (
                <button
                  key={regId}
                  type="button"
                  onClick={() => onRegionChange(regId)}
                  className={`p-3 text-left rounded-lg border transition-all ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{profile.name}</span>
                    <MapPin className={`w-3.5 h-3.5 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                  </div>
                  <div className="text-[11px] text-slate-600 mt-1 font-medium">{profile.locationName}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5 uppercase tracking-wide">
                    Elev: {profile.elevationMeters}m | {profile.climateZone.replace('_', ' ')}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Climate Snapshot Card */}
          <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-md text-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${
                climate.source === 'live_open_meteo'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : 'bg-amber-100 text-amber-800 border border-amber-200'
              }`}>
                <ShieldCheck className="w-3 h-3" />
                {climate.source === 'live_open_meteo' ? 'Open-Meteo Live' : 'Verified Offline Profile'}
              </span>
              <span className="text-slate-700 font-medium">
                {climate.locationName}: <strong>{climate.outdoorTempC}°C</strong> (Diurnal Swing: {climate.diurnalSwingC}°C)
              </span>
            </div>
            <div className="text-slate-500 font-mono text-[11px]">
              T_om: {climate.runningMeanOutdoorTempC}°C | Solar: {climate.directNormalSolarRadiationWm2} W/m² | RH: {climate.relativeHumidityPercent}%
            </div>
          </div>
        </div>

        {/* BASE ARCHITECTURAL GEOMETRY (NBC 2016 Forms) */}
        <div className="pt-4 border-t border-slate-200">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            2. Base Architectural Geometry (NBC 2016 Forms)
          </label>
          <ShapeSelector
            selectedShape={design.geometry.architecturalShape || 'flat_box'}
            onSelectShape={(newShape: ArchitecturalShape) => {
              const roofTypeMap: Record<ArchitecturalShape, 'flat' | 'pitched' | 'vaulted' | 'ventilated_cavity'> = {
                standard_cuboid: 'flat',
                flat_box: 'flat',
                a_frame_pitched: 'pitched',
                pitched_a_frame: 'pitched',
                gabled_cuboid: 'pitched',
                dome_vaulted: 'vaulted',
                vaulted_dome: 'vaulted',
                cylindrical_yurt: 'pitched',
                hexagonal_pod: 'pitched',
                lean_to_sloped: 'pitched',
                lean_to: 'pitched',
                butterfly_roof: 'pitched',
              };
              const pitchMap: Record<ArchitecturalShape, number> = {
                standard_cuboid: 0,
                flat_box: 0,
                a_frame_pitched: 45,
                pitched_a_frame: 30,
                gabled_cuboid: 25,
                dome_vaulted: 25,
                vaulted_dome: 25,
                cylindrical_yurt: 22,
                hexagonal_pod: 24,
                lean_to_sloped: 14,
                lean_to: 14,
                butterfly_roof: 18,
              };
              onDesignChange({
                ...design,
                geometry: {
                  ...design.geometry,
                  architecturalShape: newShape,
                  roofType: roofTypeMap[newShape],
                  roofPitchDegrees: pitchMap[newShape]
                }
              });
            }}
            currentGeometry={design.geometry}
          />
        </div>

        {/* STRUCTURAL WALL SPECIFICATIONS */}
        <div className="pt-4 border-t border-slate-200">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            3. Wall Material & Thickness
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-600 mb-1 font-medium">Core Wall Material</label>
              <select
                value={design.wallMaterialId}
                onChange={(e) => onDesignChange({ ...design, wallMaterialId: e.target.value })}
                className="w-full text-xs bg-white border border-slate-300 rounded px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {wallMaterials.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} — k: {m.thermalConductivityK} W/m·K (₹{m.costPerSquareMeterINR}/m²)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs text-slate-600 font-medium">Wall Thickness (mm)</label>
                <span className="text-xs font-mono font-bold text-slate-900">{design.geometry.wallThicknessMm} mm</span>
              </div>
              <input
                type="range"
                min="100"
                max="500"
                step="10"
                value={design.geometry.wallThicknessMm}
                onChange={(e) => updateGeometry('wallThicknessMm', Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                <span>100mm (Thin Panel)</span>
                <span>230mm (1 Brick)</span>
                <span>380mm (Heavy Adobe/Stone)</span>
              </div>
            </div>
          </div>
        </div>

        {/* ROOF ASSEMBLY & INSULATION */}
        <div className="pt-4 border-t border-slate-200">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            4. Roof Type, Material & Insulation Layer
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-slate-600 mb-1 font-medium">Roof Structural Profile</label>
              <select
                value={design.geometry.roofType}
                onChange={(e) => updateGeometry('roofType', e.target.value)}
                className="w-full text-xs bg-white border border-slate-300 rounded px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="flat">Flat Deck (with Parapet)</option>
                <option value="pitched">Pitched / Sloping Rafters</option>
                <option value="ventilated_cavity">Ventilated Double-Roof Cavity</option>
                <option value="vaulted">Masonry Vault / Arch</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-600 mb-1 font-medium">Roof Weathering Material</label>
              <select
                value={design.roofMaterialId}
                onChange={(e) => onDesignChange({ ...design, roofMaterialId: e.target.value })}
                className="w-full text-xs bg-white border border-slate-300 rounded px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {roofMaterials.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} (U: {m.uValuePerStandardThickness} W/m²·K)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-600 mb-1 font-medium">Insulation Type & Thickness</label>
              <select
                value={design.insulationMaterialId}
                onChange={(e) => onDesignChange({ ...design, insulationMaterialId: e.target.value })}
                className="w-full text-xs bg-white border border-slate-300 rounded px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {insulationMaterials.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>

              <div className="mt-2 flex items-center justify-between gap-2">
                <input
                  type="range"
                  min="0"
                  max="150"
                  step="10"
                  value={design.geometry.insulationThicknessMm}
                  onChange={(e) => updateGeometry('insulationThicknessMm', Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <span className="text-xs font-mono font-bold text-slate-800 min-w-[50px] text-right">
                  {design.geometry.insulationThicknessMm} mm
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* FENESTRATION, WWR & PASSIVE SHADING */}
        <div className="pt-4 border-t border-slate-200">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            5. Fenestration (WWR), Glazing & Solar Shading
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs text-slate-600 font-medium">Window-to-Wall Ratio (WWR)</label>
                <span className="text-xs font-mono font-bold text-blue-700">{design.geometry.windowToWallRatioPercent}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                step="1"
                value={design.geometry.windowToWallRatioPercent}
                onChange={(e) => updateGeometry('windowToWallRatioPercent', Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <span className="text-[10px] text-slate-400">NBC Recommended: 10-25%</span>
            </div>

            <div>
              <label className="block text-xs text-slate-600 mb-1 font-medium">Glazing Unit</label>
              <select
                value={design.glazingMaterialId}
                onChange={(e) => onDesignChange({ ...design, glazingMaterialId: e.target.value })}
                className="w-full text-xs bg-white border border-slate-300 rounded px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {glazingMaterials.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-600 mb-1 font-medium">Shading Device</label>
              <select
                value={design.geometry.shadingType}
                onChange={(e) => updateGeometry('shadingType', e.target.value)}
                className="w-full text-xs bg-white border border-slate-300 rounded px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="chhajja_overhang">Chhajja Cantilever Overhang</option>
                <option value="louvers">External Solar Louvers</option>
                <option value="deep_reveals">Deep Window Wall Reveals</option>
                <option value="none">No Shading (Unprotected)</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs text-slate-600 font-medium">Chhajja Overhang Depth</label>
                <span className="text-xs font-mono font-bold text-slate-800">{design.geometry.overhangDepthMeters.toFixed(2)} m</span>
              </div>
              <input
                type="range"
                min="0"
                max="1.5"
                step="0.05"
                value={design.geometry.overhangDepthMeters}
                onChange={(e) => updateGeometry('overhangDepthMeters', Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <span className="text-[10px] text-slate-400">Projection from facade</span>
            </div>
          </div>
        </div>

        {/* VENTILATION & OCCUPANCY */}
        <div className="pt-4 border-t border-slate-200">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            6. Passive Ventilation, Shelter Footprint & Occupancy
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs text-slate-600 font-medium">Air Changes / Hour (ACH)</label>
              <span className="text-xs font-mono font-bold text-slate-800">{design.geometry.airChangesPerHourACH} ACH</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="10.0"
              step="0.5"
              value={design.geometry.airChangesPerHourACH}
              onChange={(e) => updateGeometry('airChangesPerHourACH', Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <span className="text-[10px] text-slate-400">Natural wind-driven ventilation rate</span>
          </div>

          <div>
            <label className="block text-xs text-slate-600 mb-1 font-medium">Shelter Dimensions (L × W × H)</label>
            <div className="flex gap-2">
              <input
                type="number"
                min="3"
                max="15"
                value={design.geometry.lengthMeters}
                onChange={(e) => updateGeometry('lengthMeters', Number(e.target.value))}
                className="w-1/3 text-xs bg-white border border-slate-300 rounded px-2 py-1.5 text-center font-mono"
                title="Length (m)"
              />
              <input
                type="number"
                min="3"
                max="15"
                value={design.geometry.widthMeters}
                onChange={(e) => updateGeometry('widthMeters', Number(e.target.value))}
                className="w-1/3 text-xs bg-white border border-slate-300 rounded px-2 py-1.5 text-center font-mono"
                title="Width (m)"
              />
              <input
                type="number"
                min="2.4"
                max="5.0"
                step="0.1"
                value={design.geometry.heightMeters}
                onChange={(e) => updateGeometry('heightMeters', Number(e.target.value))}
                className="w-1/3 text-xs bg-white border border-slate-300 rounded px-2 py-1.5 text-center font-mono"
                title="Height (m)"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-600 mb-1 font-medium">Occupancy & Internal Heat Gain</label>
            <div className="flex gap-2">
              <div className="w-1/2">
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={design.geometry.occupancyCount}
                  onChange={(e) => updateGeometry('occupancyCount', Number(e.target.value))}
                  className="w-full text-xs bg-white border border-slate-300 rounded px-2 py-1.5 font-mono"
                  title="Persons (75W sensible heat each)"
                />
                <span className="text-[10px] text-slate-400">Persons</span>
              </div>
              <div className="w-1/2">
                <input
                  type="number"
                  min="0"
                  max="1000"
                  step="50"
                  value={design.geometry.internalLoadWatts}
                  onChange={(e) => updateGeometry('internalLoadWatts', Number(e.target.value))}
                  className="w-full text-xs bg-white border border-slate-300 rounded px-2 py-1.5 font-mono"
                  title="Equipment / Lights Watts"
                />
                <span className="text-[10px] text-slate-400">Equip Watts</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};
