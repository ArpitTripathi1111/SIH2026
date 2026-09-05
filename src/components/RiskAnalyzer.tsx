/**
 * Team CODE TITANS - SIH26051
 * RiskAnalyzer UI Component (RiskAnalyzer.tsx)
 * 
 * Dynamic real-time geotechnical, structural & bioclimatic alert panel.
 * Evaluates live global application state (Climate/Location, Wall/Roof Material,
 * Roof Shape, and WWR) using the rule-based vulnerabilityEngine.
 */

import React, { useMemo } from 'react';
import { ClimateData, ShelterDesign } from '../types';
import {
  evaluateVulnerabilities,
  EngineeringRisk,
  VulnerabilityAssessment
} from '../services/vulnerabilityEngine';
import {
  AlertTriangle,
  AlertOctagon,
  ShieldCheck,
  CheckCircle2,
  Wrench,
  Info,
  ShieldAlert,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface RiskAnalyzerProps {
  design: ShelterDesign;
  climate: ClimateData;
  onApplyFix?: (updatedDesign: ShelterDesign) => void;
  className?: string;
}

export const RiskAnalyzer: React.FC<RiskAnalyzerProps> = ({
  design,
  climate,
  onApplyFix,
  className = ''
}) => {
  // Evaluates synchronously on every state mutation (sliders, materials, region)
  const assessment: VulnerabilityAssessment = useMemo(() => {
    return evaluateVulnerabilities(design, climate);
  }, [design, climate]);

  const { passed, criticalCount, warningCount, risks } = assessment;

  // =========================================================================
  // STATE A: PASS (NO RISKS DETECTED) -> CLEAN GREEN SUCCESS BADGE
  // =========================================================================
  if (passed) {
    return (
      <section
        aria-label="Vulnerability and Hazard Assessment"
        className={`bg-emerald-50/90 border border-emerald-300 rounded-lg p-4 text-slate-800 shadow-sm transition-all duration-200 ${className}`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-full text-emerald-700 shrink-0 shadow-xs">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded border border-emerald-200">
                  Structural & Environmental Verification: Passed
                </span>
                <span className="text-[11px] font-mono text-emerald-700">0 Hazards Detected</span>
              </div>
              <h3 className="text-sm font-bold text-emerald-950 mt-0.5">
                Design passes structural & climate checks
              </h3>
              <p className="text-xs text-emerald-700 mt-0.5">
                Envelope roof pitch, geotechnical foundation slaking barrier, and solar window-to-wall ratio conform to NBC 2016 & ECBC criteria for {climate.locationName}.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-center shrink-0">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[11px] font-semibold shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5" />
              Code Compliant
            </span>
          </div>
        </div>
      </section>
    );
  }

  // =========================================================================
  // STATE B: HAZARDS DETECTED -> CRITICAL (RED) & WARNING (YELLOW) BANNERS
  // =========================================================================
  const hasCritical = criticalCount > 0;

  return (
    <section
      aria-label="Vulnerability and Hazard Assessment"
      className={`rounded-lg border shadow-sm overflow-hidden transition-all duration-200 ${
        hasCritical
          ? 'bg-red-50/50 border-red-300'
          : 'bg-amber-50/50 border-amber-300'
      } ${className}`}
    >
      {/* Dynamic Summary Header */}
      <div
        className={`px-4 py-3 border-b flex flex-wrap items-center justify-between gap-2.5 ${
          hasCritical
            ? 'bg-red-100/80 border-red-200 text-red-950'
            : 'bg-amber-100/80 border-amber-200 text-amber-950'
        }`}
      >
        <div className="flex items-center gap-2.5">
          {hasCritical ? (
            <AlertOctagon className="w-5 h-5 text-red-600 shrink-0 animate-pulse" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          )}
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                  hasCritical
                    ? 'bg-red-600 text-white border-red-700'
                    : 'bg-amber-600 text-white border-amber-700'
                }`}
              >
                {hasCritical ? 'Critical Structural Risk' : 'Engineering Advisory'}
              </span>
              <span className="text-xs font-mono font-semibold">
                {risks.length} {risks.length === 1 ? 'Problem' : 'Problems'} Active
              </span>
            </div>
            <h3 className="text-sm font-bold mt-0.5">
              Automated Vulnerability & Environmental Risk Alert
            </h3>
          </div>
        </div>

        {/* Severity Count Pills */}
        <div className="flex items-center gap-1.5 text-xs font-mono">
          {criticalCount > 0 && (
            <span className="px-2 py-0.5 rounded bg-red-200 text-red-900 border border-red-300 font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-600" />
              {criticalCount} Critical
            </span>
          )}
          {warningCount > 0 && (
            <span className="px-2 py-0.5 rounded bg-amber-200 text-amber-900 border border-amber-300 font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-600" />
              {warningCount} Warning
            </span>
          )}
        </div>
      </div>

      {/* List of Detected Risks */}
      <div className="p-3 sm:p-4 space-y-3">
        {risks.map((risk: EngineeringRisk) => {
          const isCrit = risk.severity === 'critical';

          return (
            <div
              key={risk.id}
              className={`rounded-lg p-3.5 border transition-all ${
                isCrit
                  ? 'bg-white border-red-300 shadow-xs'
                  : 'bg-white border-amber-300 shadow-xs'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                {/* Hazard Icon & Description */}
                <div className="flex items-start gap-3 flex-1">
                  <div
                    className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                      isCrit
                        ? 'bg-red-100 text-red-700 border border-red-200'
                        : 'bg-amber-100 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {isCrit ? (
                      <AlertOctagon className="w-4 h-4 text-red-600" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                    )}
                  </div>

                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-[10px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                          isCrit
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {risk.ruleCode}
                      </span>
                      <span className="text-xs font-bold text-slate-900">
                        {risk.title}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono hidden md:inline">
                        • {risk.standardReference}
                      </span>
                    </div>

                    {/* Core Exact Warning Message */}
                    <div
                      className={`text-xs sm:text-sm font-semibold leading-snug ${
                        isCrit ? 'text-red-900' : 'text-amber-900'
                      }`}
                    >
                      {risk.message}
                    </div>

                    {/* Parameter Diagnostic Pill Box */}
                    <div className="mt-2 bg-slate-50 rounded border border-slate-200 p-2 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <span className="font-medium text-slate-700">Affected:</span>
                        <span className="font-mono text-slate-800">{risk.affectedParameter}</span>
                        <span className="text-slate-400">({risk.currentValue})</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-700">
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-medium text-emerald-700">Target:</span>
                        <span className="font-medium">{risk.recommendedValue}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Optional 1-Click Quick Remedy Button */}
                {onApplyFix && risk.quickFix && (
                  <div className="sm:self-center shrink-0">
                    <button
                      type="button"
                      onClick={() => onApplyFix(risk.quickFix!.apply(design))}
                      className={`w-full sm:w-auto px-3 py-1.5 rounded text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer ${
                        isCrit
                          ? 'bg-red-600 hover:bg-red-700 text-white border border-red-700 active:bg-red-800'
                          : 'bg-amber-600 hover:bg-amber-700 text-white border border-amber-700 active:bg-amber-800'
                      }`}
                      title={risk.quickFix.description}
                    >
                      <Sparkles className="w-3.5 h-3.5 shrink-0" />
                      <span>{risk.quickFix.label}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
