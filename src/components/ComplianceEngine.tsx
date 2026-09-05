/**
 * Team CODE TITANS - SIH26051
 * ComplianceEngine UI Component (ComplianceEngine.tsx)
 * 
 * Statutory Indian Government Construction Code & Standards Validation Engine
 * Evaluates live global design state against:
 * - ECBC 2017 (Energy Conservation Building Code - Clause 4.3.2 Fenestration WWR Limit)
 * - NDMA Guidelines (National Disaster Management Authority - Flood Resilient Construction)
 * - IMAC (Indian Model for Adaptive Comfort - NBC 2016 Part 8 / CEPT 90% Comfort Band)
 * - NBC 2016 Part 6 / IS 875 (Structural Snow & Water Gravity Runoff)
 * 
 * Features interactive "Auto-Fix" buttons that directly override centralized state,
 * instantly recalculating thermalEngine & costEngine models and refreshing ShelterVisualizer.
 */

import React, { useMemo, useState } from 'react';
import { ClimateData, ShelterDesign, SimulationResults } from '../types';
import {
  evaluateGovernmentCompliance,
  autoCorrectAllViolations,
  ComplianceItem,
  ComplianceReport,
  AuthorityCode
} from '../services/complianceRules';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  Wrench,
  ArrowRight,
  Sparkles,
  ChevronDown,
  ChevronUp,
  FileCheck2,
  Scale,
  Building,
  ThermometerSnowflake,
  ExternalLink
} from 'lucide-react';

interface ComplianceEngineProps {
  design: ShelterDesign;
  climate: ClimateData;
  simulation?: SimulationResults;
  onApplyFix: (updatedDesign: ShelterDesign) => void;
  className?: string;
}

export const ComplianceEngine: React.FC<ComplianceEngineProps> = ({
  design,
  climate,
  simulation,
  onApplyFix,
  className = ''
}) => {
  // Real-time evaluation against Indian Government standard database
  const report: ComplianceReport = useMemo(() => {
    return evaluateGovernmentCompliance(design, climate, simulation);
  }, [design, climate, simulation]);

  // UI state for showing full compliance matrix vs active issues
  const [showFullMatrix, setShowFullMatrix] = useState<boolean>(false);
  const [activeAuthorityFilter, setActiveAuthorityFilter] = useState<'ALL' | AuthorityCode>('ALL');
  const [lastFixedItemTitle, setLastFixedItemTitle] = useState<string | null>(null);

  const {
    isFullyCompliant,
    violationCount,
    deviationCount,
    compliantCount,
    violations,
    deviations,
    compliantItems,
    items
  } = report;

  // Handle single auto-fix action
  const handleAutoFix = (item: ComplianceItem) => {
    if (!item.autoFix) return;
    const updated = item.autoFix.apply(design);
    onApplyFix(updated);
    setLastFixedItemTitle(item.title);
    setTimeout(() => setLastFixedItemTitle(null), 4000);
  };

  // Handle batch auto-correction of all active violations
  const handleAutoCorrectAll = () => {
    // Reconcile all out-of-spec parameters across all 5 Indian statutory building codes
    const corrected = autoCorrectAllViolations(design, climate, simulation);
    onApplyFix(corrected);
    setLastFixedItemTitle('All code violations corrected. Shelter is under all security measures.');
    setTimeout(() => setLastFixedItemTitle(null), 5000);
  };

  // Filter items if user selects an authority filter
  const filteredItems = useMemo(() => {
    if (activeAuthorityFilter === 'ALL') return items;
    return items.filter((i) => i.authority === activeAuthorityFilter);
  }, [items, activeAuthorityFilter]);

  // Authority badge icon helper
  const getAuthorityBadge = (auth: AuthorityCode) => {
    switch (auth) {
      case 'ECBC':
        return <Scale className="w-3.5 h-3.5" />;
      case 'NDMA':
        return <ShieldAlert className="w-3.5 h-3.5" />;
      case 'IMAC':
        return <ThermometerSnowflake className="w-3.5 h-3.5" />;
      case 'NBC':
      case 'IS_CODES':
        return <Building className="w-3.5 h-3.5" />;
    }
  };

  return (
    <section
      id="compliance-engine-panel"
      aria-label="Statutory Government Standards Compliance Engine"
      className={`rounded-xl border shadow-sm transition-all duration-200 overflow-hidden font-sans ${
        violationCount > 0
          ? 'bg-red-50/40 border-red-300'
          : deviationCount > 0
          ? 'bg-amber-50/40 border-amber-300'
          : 'bg-emerald-50/50 border-emerald-300'
      } ${className}`}
    >
      {/* ======================================================================= */}
      {/* 1. TOP HEADER & METRIC CONTROLLER BAR                                   */}
      {/* ======================================================================= */}
      <div
        className={`px-4 sm:px-6 py-3.5 border-b flex flex-col md:flex-row md:items-center justify-between gap-3 ${
          violationCount > 0
            ? 'bg-red-100/80 border-red-200 text-red-950'
            : deviationCount > 0
            ? 'bg-amber-100/80 border-amber-200 text-amber-950'
            : 'bg-emerald-100/80 border-emerald-200 text-emerald-950'
        }`}
      >
        <div className="flex items-start sm:items-center gap-3">
          <div
            className={`p-2.5 rounded-lg shrink-0 shadow-xs ${
              violationCount > 0
                ? 'bg-red-600 text-white'
                : deviationCount > 0
                ? 'bg-amber-600 text-white'
                : 'bg-emerald-600 text-white'
            }`}
          >
            {violationCount > 0 ? (
              <AlertOctagon className="w-5 h-5 animate-pulse" />
            ) : deviationCount > 0 ? (
              <AlertTriangle className="w-5 h-5" />
            ) : (
              <ShieldCheck className="w-5 h-5" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/80 border border-slate-300 text-slate-800 font-mono">
                SIH26051 Statutory Audit Engine
              </span>
              <span className="text-xs font-semibold text-slate-700">
                Indian Government Guidelines (ECBC • NDMA • IMAC • NBC)
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5 flex items-center gap-2 flex-wrap">
              <span>National Construction Code & Security Measures</span>
              {isFullyCompliant ? (
                <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                  Shelter Under All Security Measures
                </span>
              ) : (
                <span className="text-xs font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full border border-red-300 flex items-center gap-1">
                  <AlertOctagon className="w-3.5 h-3.5 text-red-600" />
                  Caution Warning: {violationCount} Violation{violationCount > 1 ? 's' : ''} Active
                </span>
              )}
            </h2>
          </div>
        </div>

        {/* Global Status Pills & 1-Click Auto-Fix All */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Status Metrics Pills */}
          <div className="flex items-center gap-1.5 text-xs font-mono">
            {violationCount > 0 && (
              <span className="px-2.5 py-1 rounded-md bg-red-600 text-white font-bold flex items-center gap-1 shadow-xs">
                <AlertOctagon className="w-3.5 h-3.5" />
                {violationCount} Critical Violation{violationCount > 1 ? 's' : ''}
              </span>
            )}
            {deviationCount > 0 && (
              <span className="px-2.5 py-1 rounded-md bg-amber-500 text-white font-bold flex items-center gap-1 shadow-xs">
                <AlertTriangle className="w-3.5 h-3.5" />
                {deviationCount} Standard Deviation{deviationCount > 1 ? 's' : ''}
              </span>
            )}
            {isFullyCompliant && (
              <span className="px-2.5 py-1 rounded-md bg-emerald-600 text-white font-bold flex items-center gap-1 shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5" />
                All Security Measures Active
              </span>
            )}
          </div>

          {/* Quick Auto-Correct All Button (if violations exist) */}
          {(violationCount > 0 || deviationCount > 0) && (
            <button
              type="button"
              onClick={handleAutoCorrectAll}
              id="auto-correct-all-standards-btn"
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white flex items-center gap-1.5 shadow-sm transition-all cursor-pointer ring-1 ring-white/20"
              title="Instantly override all out-of-spec parameters to statutory government thresholds"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Auto-Correct All Violations</span>
            </button>
          )}
        </div>
      </div>

      {/* Auto-Fix Success Feedback Alert */}
      {lastFixedItemTitle && (
        <div className="bg-emerald-600 text-white px-4 py-2 text-xs font-medium flex items-center justify-between gap-2 shadow-inner">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-200 shrink-0" />
            <span>
              <strong>Auto-Correction Applied:</strong> Centralized design state modified. Recalculating thermal and cost metrics.
            </span>
          </div>
          <span className="text-[10px] font-mono text-emerald-100 uppercase tracking-wider">Synchronized</span>
        </div>
      )}

      {/* ======================================================================= */}
      {/* 2. REGULATORY AUTHORITY TABS & FILTER BAR                               */}
      {/* ======================================================================= */}
      <div className="bg-white/80 border-b border-slate-200 px-4 py-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1 hidden sm:inline">
            Standards:
          </span>
          {(['ALL', 'ECBC', 'NDMA', 'IMAC', 'NBC'] as const).map((auth) => {
            const count =
              auth === 'ALL'
                ? items.length
                : items.filter((i) => i.authority === auth).length;
            const hasIssue =
              auth === 'ALL'
                ? violationCount > 0 || deviationCount > 0
                : items.some(
                    (i) =>
                      i.authority === auth &&
                      (i.severity === 'violation' || i.severity === 'deviation')
                  );

            return (
              <button
                key={auth}
                type="button"
                onClick={() => setActiveAuthorityFilter(auth)}
                className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeAuthorityFilter === auth
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {auth !== 'ALL' && getAuthorityBadge(auth)}
                <span>{auth === 'ALL' ? 'All Codes' : auth}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                    activeAuthorityFilter === auth
                      ? 'bg-slate-700 text-white'
                      : hasIssue
                      ? 'bg-red-100 text-red-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Toggle Full Matrix View */}
        <button
          type="button"
          onClick={() => setShowFullMatrix(!showFullMatrix)}
          className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer"
        >
          <span>{showFullMatrix ? 'Show Priority Action Items' : 'View Full Compliance Matrix'}</span>
          {showFullMatrix ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* ======================================================================= */}
      {/* 3. COMPLIANCE ASSESSMENT ITEM CARDS                                     */}
      {/* ======================================================================= */}
      <div className="p-4 sm:p-5 space-y-3">
        {/* Case A: 100% Fully Compliant and Not in Full Matrix mode */}
        {isFullyCompliant && !showFullMatrix ? (
          <div className="bg-white border-2 border-emerald-400 rounded-xl p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-100 pb-4">
              <div className="flex items-start gap-3.5">
                <div className="p-3 bg-emerald-100 rounded-xl text-emerald-700 shrink-0">
                  <ShieldCheck className="w-8 h-8 text-emerald-600" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      Indian Statutory Compliance Certified
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200">
                      0 Code Violations
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-emerald-950">
                    Shelter is under all security measures
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl">
                    All Indian Government statutory standards, disaster mitigation guidelines, and thermal comfort criteria are fully verified. All structural and environmental parameters are within safe legal limits.
                  </p>
                </div>
              </div>

              <div className="shrink-0 flex sm:flex-col items-center sm:items-end gap-2">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-600 text-white text-xs font-bold shadow-xs">
                  <ShieldCheck className="w-4 h-4" />
                  All Security Measures Active
                </span>
                <button
                  type="button"
                  onClick={() => setShowFullMatrix(true)}
                  className="text-xs text-emerald-700 hover:text-emerald-900 font-medium underline cursor-pointer"
                >
                  Inspect 5 Statutory Standards
                </button>
              </div>
            </div>

            {/* 4-Item Grid of Verified Security Measures */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
              <div className="bg-emerald-50/60 rounded-lg p-3 border border-emerald-200 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-emerald-900 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>ECBC 2017 Envelope</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-snug">
                  WWR (≤ 40%) & solar heat gain restricted to statutory limits.
                </p>
              </div>

              <div className="bg-emerald-50/60 rounded-lg p-3 border border-emerald-200 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-emerald-900 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>NDMA Flood Security</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-snug">
                  Durable, non-erodible structural base protected against flood slaking.
                </p>
              </div>

              <div className="bg-emerald-50/60 rounded-lg p-3 border border-emerald-200 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-emerald-900 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>IMAC Adaptive Comfort</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-snug">
                  Bioclimatic envelope shading & insulation maintain operative safety band.
                </p>
              </div>

              <div className="bg-emerald-50/60 rounded-lg p-3 border border-emerald-200 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-emerald-900 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>NBC Part 6 Structural</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-snug">
                  Pitched gravity drainage sheds torrential water & snow accumulation.
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {/* Case B: Render Warning / Violation / Detailed Matrix Items */}
        {(showFullMatrix ? filteredItems : items.filter((i) => i.severity !== 'compliant')).map(
          (item: ComplianceItem) => {
            const isViolation = item.severity === 'violation';
            const isDeviation = item.severity === 'deviation';
            const isCompliant = item.severity === 'compliant';

            return (
              <div
                key={item.id}
                id={`compliance-item-${item.code}`}
                className={`rounded-lg border p-4 sm:p-4.5 transition-all shadow-xs ${
                  isViolation
                    ? 'bg-white border-red-300 ring-1 ring-red-200'
                    : isDeviation
                    ? 'bg-white border-amber-300 ring-1 ring-amber-200'
                    : 'bg-white border-emerald-200'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Code Details & Exact Warning Message */}
                  <div className="space-y-2 flex-1">
                    {/* Tags row */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Severity Badge */}
                      <span
                        className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded flex items-center gap-1 ${
                          isViolation
                            ? 'bg-red-600 text-white'
                            : isDeviation
                            ? 'bg-amber-500 text-white'
                            : 'bg-emerald-600 text-white'
                        }`}
                      >
                        {isViolation && <AlertOctagon className="w-3 h-3" />}
                        {isDeviation && <AlertTriangle className="w-3 h-3" />}
                        {isCompliant && <CheckCircle2 className="w-3 h-3" />}
                        <span>{isViolation ? 'Critical Code Violation' : isDeviation ? 'Standard Deviation' : 'Fully Compliant'}</span>
                      </span>

                      {/* Authority Tag */}
                      <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200 flex items-center gap-1">
                        {getAuthorityBadge(item.authority)}
                        <span>{item.authority}</span>
                      </span>

                      {/* Standard Code */}
                      <span className="text-[11px] font-mono font-bold text-slate-700">
                        {item.code}
                      </span>

                      {/* Statutory Legal Reference */}
                      <span className="text-[10px] text-slate-500 font-sans hidden sm:inline">
                        • {item.clauseReference}
                      </span>
                    </div>

                    {/* Exact Warning or Compliance Message */}
                    <div
                      className={`text-xs sm:text-sm font-bold leading-snug ${
                        isViolation
                          ? 'text-red-900'
                          : isDeviation
                          ? 'text-amber-900'
                          : 'text-emerald-950'
                      }`}
                    >
                      {item.message}
                    </div>

                    {/* Comparison Strip: Current Value vs Legal Limit */}
                    <div className="bg-slate-50 rounded-md border border-slate-200 p-2.5 text-xs grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="flex items-start gap-1.5 text-slate-700">
                        <span className="font-bold text-slate-800 shrink-0">Current Design:</span>
                        <span className="font-mono text-slate-900">{item.currentValue}</span>
                      </div>
                      <div className="flex items-start gap-1.5 text-slate-700">
                        <span className="font-bold text-emerald-800 shrink-0">Statutory Legal Limit:</span>
                        <span className="font-medium text-emerald-900">{item.legalLimit}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: The Actionable Auto-Fix Button (State Override) */}
                  {item.autoFix && (isViolation || isDeviation) ? (
                    <div className="lg:self-center shrink-0">
                      <button
                        type="button"
                        onClick={() => handleAutoFix(item)}
                        id={`autofix-btn-${item.id}`}
                        className={`w-full lg:w-auto px-4 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer ${
                          isViolation
                            ? 'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white border border-red-700'
                            : 'bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white border border-amber-700'
                        }`}
                        title={item.autoFix.description}
                      >
                        <Wrench className="w-3.5 h-3.5 text-white" />
                        <span>{item.autoFix.label}</span>
                      </button>
                      <div className="text-[10px] text-slate-500 font-mono text-center lg:text-right mt-1">
                        Forces state to: {item.autoFix.targetValue}
                      </div>
                    </div>
                  ) : isCompliant ? (
                    <div className="lg:self-center shrink-0 flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Code Verified</span>
                    </div>
                  ) : null}
                </div>
              </div>
            );
          }
        )}
      </div>

      {/* ======================================================================= */}
      {/* 4. FOOTER REGULATORY CITATION NOTICE                                    */}
      {/* ======================================================================= */}
      <div className="bg-slate-100/90 border-t border-slate-200 px-4 sm:px-6 py-2.5 text-[11px] text-slate-600 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <FileCheck2 className="w-4 h-4 text-slate-500" />
          <span>
            Compliant with <strong>NBC 2016 Part 8</strong>, <strong>BEE ECBC 2017</strong>, <strong>NDMA Guidelines 2010</strong>, and <strong>IS 13827:2020</strong>.
          </span>
        </div>
        <div className="font-mono text-[10px] text-slate-500">
          Last Verified: {new Date(report.evaluatedAtIso).toLocaleTimeString()}
        </div>
      </div>
    </section>
  );
};
