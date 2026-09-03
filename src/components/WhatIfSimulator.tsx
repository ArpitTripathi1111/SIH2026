/**
 * Team CODE TITANS - SIH26051
 * What-If Interactive Thermal Simulator
 * 
 * Compares 24-hour diurnal performance of the Baseline Design vs Optimized Design
 * against the NBC 2016 IMAC Adaptive Comfort Band using Recharts.
 */

import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import { ClimateData, ShelterDesign, SimulationResults } from '../types';
import { TrendingDown, Activity, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

interface WhatIfSimulatorProps {
  design: ShelterDesign;
  climate: ClimateData;
  results: SimulationResults;
  onQuickSliderChange: (field: 'windowToWallRatioPercent' | 'insulationThicknessMm' | 'airChangesPerHourACH' | 'overhangDepthMeters', val: number) => void;
}

export const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({
  design,
  climate,
  results,
  onQuickSliderChange
}) => {
  const chartData = results.hourlyProfiles.map((p) => ({
    hour: `${p.hour.toString().padStart(2, '0')}:00`,
    'Outdoor Ambient': p.outdoorTempC,
    'Baseline Design': p.indoorTempBaselineC,
    'Optimized Design': p.indoorTempOptimizedC,
    'IMAC Neutral': p.imacNeutralTempC,
    imacMin: p.imacLowerLimit80C,
    imacMax: p.imacUpperLimit80C
  }));

  // Min and max for chart Y domain
  const allTemps = results.hourlyProfiles
    .flatMap((p) => [
      p.outdoorTempC,
      p.indoorTempBaselineC,
      p.indoorTempOptimizedC,
      p.imacLowerLimit80C,
      p.imacUpperLimit80C
    ])
    .filter((n) => typeof n === 'number' && Number.isFinite(n));

  const validMin = allTemps.length > 0 ? Math.min(...allTemps) : 12;
  const validMax = allTemps.length > 0 ? Math.max(...allTemps) : 38;
  const yMin = Math.floor(validMin - 3);
  const yMax = Math.ceil(validMax + 3);

  const isCompliant = results.percentComfortCompliance80 >= 75;

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm text-slate-800 p-5 space-y-6">
      {/* Title & Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-600" />
            24-Hour Diurnal Thermal Performance & IMAC Comfort Band
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time sensitivity modeling: adjust WWR, insulation, and ventilation to witness immediate thermal response.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold ${
              isCompliant
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                : 'bg-amber-50 text-amber-700 border border-amber-300'
            }`}
          >
            {isCompliant ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                NBC 2016 IMAC Compliant ({results.percentComfortCompliance80}%)
              </>
            ) : (
              <>
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                Moderate Thermal Strain ({results.percentComfortCompliance80}%)
              </>
            )}
          </span>
        </div>
      </div>

      {/* RECHARTS 24-HOUR THERMAL CURVE */}
      <div className="w-full h-[320px] pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="hour"
              stroke="#64748b"
              fontSize={11}
              interval={2}
              tickLine={false}
            />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              domain={[yMin, yMax]}
              unit="°C"
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#334155',
                borderRadius: '6px',
                color: '#f8fafc',
                fontSize: '12px'
              }}
              formatter={(val: any) => [`${val}°C`]}
            />
            <Legend
              wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
              iconType="plainline"
            />

            {/* IMAC 80% Comfort Band Boundaries */}
            <ReferenceLine
              y={results.imacComfortBand80.max}
              stroke="#10b981"
              strokeDasharray="4 4"
              label={{ value: `IMAC Upper (${results.imacComfortBand80.max}°C)`, position: 'insideTopRight', fill: '#059669', fontSize: 10 }}
            />
            <ReferenceLine
              y={results.imacComfortBand80.min}
              stroke="#10b981"
              strokeDasharray="4 4"
              label={{ value: `IMAC Lower (${results.imacComfortBand80.min}°C)`, position: 'insideBottomRight', fill: '#059669', fontSize: 10 }}
            />

            {/* Outdoor Ambient curve */}
            <Line
              type="monotone"
              dataKey="Outdoor Ambient"
              stroke="#ef4444"
              strokeWidth={1.8}
              strokeDasharray="4 3"
              dot={false}
            />

            {/* Baseline Unoptimized design */}
            <Line
              type="monotone"
              dataKey="Baseline Design"
              stroke="#94a3b8"
              strokeWidth={1.8}
              strokeDasharray="2 2"
              dot={false}
            />

            {/* Optimized design */}
            <Line
              type="monotone"
              dataKey="Optimized Design"
              stroke="#0284c7"
              strokeWidth={2.8}
              dot={false}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="text-[11px] text-slate-500 text-center font-mono">
        Light green band denotes NBC 2016 IMAC 80% natural ventilation comfort zone (
        {results.imacComfortBand80.min}°C to {results.imacComfortBand80.max}°C, Neutral: {results.imacComfortNeutralTempC}°C)
      </div>

      {/* QUICK SENSITIVITY RANGE SLIDERS */}
      <div className="pt-3 border-t border-slate-200">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
          Interactive "What-If" Parametric Sensitivity Sliders
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
          <div>
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="font-medium text-slate-700">WWR (%)</span>
              <span className="font-mono font-bold text-blue-700">{design.geometry.windowToWallRatioPercent}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="50"
              step="1"
              value={design.geometry.windowToWallRatioPercent}
              onChange={(e) => onQuickSliderChange('windowToWallRatioPercent', Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <span className="text-[10px] text-slate-400">Controls solar aperture</span>
          </div>

          <div>
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="font-medium text-slate-700">Insulation (mm)</span>
              <span className="font-mono font-bold text-blue-700">{design.geometry.insulationThicknessMm} mm</span>
            </div>
            <input
              type="range"
              min="0"
              max="150"
              step="5"
              value={design.geometry.insulationThicknessMm}
              onChange={(e) => onQuickSliderChange('insulationThicknessMm', Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <span className="text-[10px] text-slate-400">Thermal boundary layer</span>
          </div>

          <div>
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="font-medium text-slate-700">Ventilation (ACH)</span>
              <span className="font-mono font-bold text-blue-700">{design.geometry.airChangesPerHourACH} ACH</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="10.0"
              step="0.5"
              value={design.geometry.airChangesPerHourACH}
              onChange={(e) => onQuickSliderChange('airChangesPerHourACH', Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <span className="text-[10px] text-slate-400">Air changes per hour</span>
          </div>

          <div>
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="font-medium text-slate-700">Chhajja Overhang</span>
              <span className="font-mono font-bold text-blue-700">{design.geometry.overhangDepthMeters.toFixed(2)} m</span>
            </div>
            <input
              type="range"
              min="0"
              max="1.5"
              step="0.05"
              value={design.geometry.overhangDepthMeters}
              onChange={(e) => onQuickSliderChange('overhangDepthMeters', Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <span className="text-[10px] text-slate-400">Direct beam solar cut-off</span>
          </div>
        </div>
      </div>

      {/* QUANTIFIABLE ENGINEERING METRIC CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
        <div className="p-3 bg-slate-50 border border-slate-200 rounded">
          <div className="text-[10px] font-mono uppercase text-slate-500">PEAK INDOOR TEMP</div>
          <div className="text-xl font-bold font-mono text-slate-900 mt-1">
            {results.peakIndoorTempC}°C
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Outdoor Max: {climate.maxTempC}°C (Δ: {(climate.maxTempC - results.peakIndoorTempC).toFixed(1)}°C)
          </div>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded">
          <div className="text-[10px] font-mono uppercase text-slate-500">THERMAL DAMPING</div>
          <div className="text-xl font-bold font-mono text-emerald-700 mt-1">
            {results.diurnalDampingPercent}%
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Lag: {results.thermalLagHours} Hours Phase Shift
          </div>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded">
          <div className="text-[10px] font-mono uppercase text-slate-500">IMAC 80% COMFORT</div>
          <div className="text-xl font-bold font-mono text-blue-700 mt-1">
            {results.hoursInComfortBand80} / 24 hrs
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {results.percentComfortCompliance80}% Diurnal Cycle
          </div>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded">
          <div className="text-[10px] font-mono uppercase text-slate-500">EST. SHELTER COST</div>
          <div className="text-xl font-bold font-mono text-slate-900 mt-1">
            ₹{results.estimatedMaterialCostINR.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Carbon: {results.embodiedCarbonTotalKg} kg CO₂e
          </div>
        </div>
      </div>
    </div>
  );
};
