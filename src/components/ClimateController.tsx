/**
 * Team CODE TITANS - SIH26051
 * Problem Statement: Software Based Model Development for Design of Area-Specific Shelter for Thermal Comfort Maintenance
 * 
 * ClimateController.tsx
 * Climate Override & Environmental Parameter Controller (Interaction Zone 2)
 * 
 * Allows fine-grained manual adjustments and synthetic climate stress-testing:
 * - Ambient Outdoor Temperature
 * - Diurnal Temperature Swing
 * - Direct Normal Solar Radiation
 * - Relative Humidity & Wind Speed
 * 
 * Couples seamlessly with LocationSelector.tsx and triggers instant thermalEngine.ts re-calculation.
 */

import React from 'react';
import { ClimateData } from '../types';
import { Thermometer, Sun, Droplets, Wind, RotateCcw, SlidersHorizontal } from 'lucide-react';
import { DEFAULT_CLIMATES } from '../data/defaultClimates';

export interface ClimateControllerProps {
  climate: ClimateData;
  onClimateChange: (updatedClimate: ClimateData) => void;
  className?: string;
}

export const ClimateController: React.FC<ClimateControllerProps> = ({
  climate,
  onClimateChange,
  className = ''
}) => {
  const handleFieldChange = (field: keyof ClimateData, value: number) => {
    // If outdoor temperature changes, dynamically adjust min, max, and hourly arrays
    if (field === 'outdoorTempC') {
      const halfSwing = climate.diurnalSwingC / 2;
      const minTempC = Number((value - halfSwing).toFixed(1));
      const maxTempC = Number((value + halfSwing).toFixed(1));
      
      // Scale 24-hour diurnal profile
      const hourlyTemps = climate.hourlyOutdoorTemps.map((_, h) => {
        // Typical diurnal curve: min at 05:00, max at 14:00
        const rad = ((h - 5) / 24) * 2 * Math.PI;
        const normalized = (1 - Math.cos(rad)) / 2;
        return Number((minTempC + normalized * (maxTempC - minTempC)).toFixed(1));
      });

      onClimateChange({
        ...climate,
        outdoorTempC: value,
        minTempC,
        maxTempC,
        hourlyOutdoorTemps: hourlyTemps,
        runningMeanOutdoorTempC: value
      });
      return;
    }

    if (field === 'diurnalSwingC') {
      const halfSwing = value / 2;
      const minTempC = Number((climate.outdoorTempC - halfSwing).toFixed(1));
      const maxTempC = Number((climate.outdoorTempC + halfSwing).toFixed(1));
      
      const hourlyTemps = climate.hourlyOutdoorTemps.map((_, h) => {
        const rad = ((h - 5) / 24) * 2 * Math.PI;
        const normalized = (1 - Math.cos(rad)) / 2;
        return Number((minTempC + normalized * (maxTempC - minTempC)).toFixed(1));
      });

      onClimateChange({
        ...climate,
        diurnalSwingC: value,
        minTempC,
        maxTempC,
        hourlyOutdoorTemps: hourlyTemps
      });
      return;
    }

    if (field === 'directNormalSolarRadiationWm2') {
      const maxPeak = value;
      const hourlySolar = climate.hourlySolarRadiationWm2.map((_, h) => {
        // Solar bell curve between 06:00 and 18:00
        if (h < 6 || h > 18) return 0;
        const solarRad = Math.sin(((h - 6) / 12) * Math.PI);
        return Math.round(maxPeak * Math.max(0, solarRad));
      });

      onClimateChange({
        ...climate,
        directNormalSolarRadiationWm2: value,
        totalHorizontalSolarRadiationWm2: Math.round(value * 0.85),
        hourlySolarRadiationWm2: hourlySolar
      });
      return;
    }

    onClimateChange({
      ...climate,
      [field]: value
    });
  };

  const handleResetToRegionDefault = () => {
    const fallback = DEFAULT_CLIMATES[climate.regionId].climate;
    onClimateChange({
      ...fallback,
      locationName: climate.locationName,
      latitude: climate.latitude,
      longitude: climate.longitude,
      elevationMeters: climate.elevationMeters
    });
  };

  return (
    <div className={`bg-slate-900 border border-slate-700/80 rounded-xl shadow-md text-slate-100 overflow-hidden ${className}`}>
      {/* HEADER */}
      <div className="px-4 py-3 bg-slate-800/90 border-b border-slate-700 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-amber-400" />
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Climate Stress-Testing & Manual Override
            </h3>
            <p className="text-[11px] text-slate-400">
              Fine-tune microclimate variables to test thermal resilience under extreme weather spikes.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleResetToRegionDefault}
          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded text-[11px] font-mono flex items-center gap-1.5 transition-colors"
          title="Reset environmental variables to regional baseline"
        >
          <RotateCcw className="w-3 h-3 text-amber-400" />
          <span>Reset Climate Baseline</span>
        </button>
      </div>

      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* OVERRIDE 1: AMBIENT TEMPERATURE */}
        <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Thermometer className="w-3.5 h-3.5 text-red-400" />
              Ambient Temp
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-900 text-red-400 border border-slate-700 font-mono text-xs font-bold">
              {climate.outdoorTempC.toFixed(1)}°C
            </span>
          </div>

          <input
            type="range"
            min="-15"
            max="48"
            step="0.5"
            value={climate.outdoorTempC}
            onChange={(e) => handleFieldChange('outdoorTempC', Number(e.target.value))}
            className="w-full h-1.5 bg-slate-700 rounded appearance-none cursor-pointer accent-red-500"
          />

          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>-15°C (Extreme Cold)</span>
            <span>+48°C (Extreme Heat)</span>
          </div>
        </div>

        {/* OVERRIDE 2: DIURNAL SWING */}
        <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Thermometer className="w-3.5 h-3.5 text-orange-400" />
              Diurnal Swing (ΔT)
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-900 text-orange-400 border border-slate-700 font-mono text-xs font-bold">
              Δ{climate.diurnalSwingC.toFixed(1)}°C
            </span>
          </div>

          <input
            type="range"
            min="3"
            max="25"
            step="0.5"
            value={climate.diurnalSwingC}
            onChange={(e) => handleFieldChange('diurnalSwingC', Number(e.target.value))}
            className="w-full h-1.5 bg-slate-700 rounded appearance-none cursor-pointer accent-orange-500"
          />

          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>3°C (Maritime)</span>
            <span>15°C (Composite)</span>
            <span>25°C (Desert)</span>
          </div>
        </div>

        {/* OVERRIDE 3: DIRECT SOLAR RADIATION */}
        <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              Solar Irradiance
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-900 text-amber-400 border border-slate-700 font-mono text-xs font-bold">
              {climate.directNormalSolarRadiationWm2} W/m²
            </span>
          </div>

          <input
            type="range"
            min="200"
            max="1050"
            step="25"
            value={climate.directNormalSolarRadiationWm2}
            onChange={(e) => handleFieldChange('directNormalSolarRadiationWm2', Number(e.target.value))}
            className="w-full h-1.5 bg-slate-700 rounded appearance-none cursor-pointer accent-amber-500"
          />

          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>200 (Overcast)</span>
            <span>600 (Average)</span>
            <span>1000+ (High Zenith)</span>
          </div>
        </div>

        {/* OVERRIDE 4: RELATIVE HUMIDITY */}
        <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5 text-cyan-400" />
              Relative Humidity
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-900 text-cyan-400 border border-slate-700 font-mono text-xs font-bold">
              {climate.relativeHumidityPercent}%
            </span>
          </div>

          <input
            type="range"
            min="10"
            max="95"
            step="1"
            value={climate.relativeHumidityPercent}
            onChange={(e) => handleFieldChange('relativeHumidityPercent', Number(e.target.value))}
            className="w-full h-1.5 bg-slate-700 rounded appearance-none cursor-pointer accent-cyan-500"
          />

          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>10% (Arid Desert)</span>
            <span>50% (Comfort)</span>
            <span>95% (Monsoon)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClimateController;
