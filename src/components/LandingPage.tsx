/**
 * Team CODE TITANS - SIH26051
 * Landing Page - Engineering Portal
 * 
 * Standard, practical, classic engineering presentation.
 * Prominently features Team Code Titans, SIH26051 Problem Statement,
 * and 3 Regional Archetype Quick-Launchers.
 */

import React from 'react';
import { RegionId } from '../types';
import { DEFAULT_CLIMATES } from '../data/defaultClimates';
import {
  Compass,
  ArrowRight,
  ShieldCheck,
  Mountain,
  SunMedium,
  Waves,
  Cpu,
  FileSpreadsheet,
  CheckCircle2
} from 'lucide-react';

interface LandingPageProps {
  onStartPrototype: (selectedRegion?: RegionId) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStartPrototype }) => {
  return (
    <div className="space-y-10 py-4 max-w-6xl mx-auto">
      {/* Hero Header Section */}
      <div className="bg-white border border-slate-200 rounded-xl p-8 md:p-10 shadow-sm text-slate-900 relative overflow-hidden">
        <div className="max-w-3xl space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 bg-slate-900 text-white font-mono text-xs font-bold uppercase tracking-wider rounded">
              TEAM CODE TITANS
            </span>
            <span className="px-2.5 py-1 bg-blue-50 text-blue-800 border border-blue-200 font-mono text-xs font-semibold rounded">
              SIH26051
            </span>
            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-medium rounded flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              Offline 2D Visualizer Ready
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 leading-tight">
            Software Based Model Development for Design of Area-Specific Shelter for Thermal Comfort Maintenance
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            An engineering decision-support system built for Smart India Hackathon 2026.
            Simulates dynamic 24-hour heat balance across India's extreme microclimates,
            evaluating passive envelopes against the <strong>Indian Model for Adaptive Comfort (IMAC / NBC 2016)</strong> with
            an offline 2D architectural CAD visualizer.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onStartPrototype('mountain')}
              className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-lg flex items-center gap-2 transition-all shadow-sm hover:shadow"
            >
              <span>Start Prototype</span>
              <ArrowRight className="w-4 h-4 text-cyan-400" />
            </button>

            <span className="text-xs text-slate-500 font-mono">
              No login required • Offline resilient • Django REST ready
            </span>
          </div>
        </div>
      </div>

      {/* 3 Regional Archetype Quick-Launch Presets */}
      <div>
        <div className="mb-4">
          <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider">
            Select Regional Archetype for Instant Modeling
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Hardcoded fallback datasets ensure uninterrupted evaluation during pitch presentations even without internet access.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Mountain */}
          <div
            onClick={() => onStartPrototype('mountain')}
            className="bg-white border border-slate-200 hover:border-blue-500 rounded-lg p-5 shadow-sm hover:shadow-md cursor-pointer transition-all flex flex-col justify-between group"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center border border-sky-200">
                <Mountain className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-sky-700">
                  COLD & ARID ZONE
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  Mountainous (Ladakh - 3500m)
                </h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Sub-zero nighttime lows (-7.5°C), high solar insolation (860 W/m²). Optimized with rammed earth, double low-E south glazing, and continuous insulation.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-600 group-hover:translate-x-1 transition-transform">
              <span>Load Ladakh Model</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Desert */}
          <div
            onClick={() => onStartPrototype('desert')}
            className="bg-white border border-slate-200 hover:border-amber-500 rounded-lg p-5 shadow-sm hover:shadow-md cursor-pointer transition-all flex flex-col justify-between group"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
                <SunMedium className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-700">
                  HOT & DRY ZONE
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  Desert (Jaisalmer, Thar)
                </h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Extreme daytime peak (43.8°C) with 20.4°C diurnal swing. Employs 350mm stone masonry thermal mass for 8.2-hour lag and deep solar chhajjas.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-amber-700 group-hover:translate-x-1 transition-transform">
              <span>Load Thar Desert Model</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* River */}
          <div
            onClick={() => onStartPrototype('river')}
            className="bg-white border border-slate-200 hover:border-emerald-500 rounded-lg p-5 shadow-sm hover:shadow-md cursor-pointer transition-all flex flex-col justify-between group"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
                <Waves className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-700">
                  WARM & HUMID ZONE
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  River-Near (Gangetic Basin)
                </h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                High humidity (78%) requiring enhanced air velocity. Employs stilt plinth, lightweight bamboo composite, and ventilated cavity roof.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-emerald-700 group-hover:translate-x-1 transition-transform">
              <span>Load River Basin Model</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>

      {/* Core Engineering Methodology Grid */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
          Core Engineering Framework (NBC 2016 / CEPT University)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3 bg-white rounded border border-slate-200 space-y-1.5">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
              IMAC-NV Adaptive Standard
            </div>
            <p className="text-slate-600 leading-relaxed">
              Calculates neutral temperature <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[11px]">T_comf = 0.54·T_om + 12.83</code> and 80% acceptability limits for naturally ventilated spaces.
            </p>
          </div>

          <div className="p-3 bg-white rounded border border-slate-200 space-y-1.5">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
              Sol-Air Heat Transfer
            </div>
            <p className="text-slate-600 leading-relaxed">
              Solves exterior radiation balance accounting for incident solar absorption, surface emissivity, and longwave nocturnal radiative cooling to sky.
            </p>
          </div>

          <div className="p-3 bg-white rounded border border-slate-200 space-y-1.5">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
              Django Backend Serialization
            </div>
            <p className="text-slate-600 leading-relaxed">
              Architected so state maps 1:1 to Python (Django REST Framework) serializers, enabling direct export as database fixtures.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
