/**
 * Team CODE TITANS - SIH26051
 * Multi-Criteria Optimization Cards
 * 
 * Renders the 3 ranked shelter variations (Best Thermal, Balanced, Budget)
 * with instant 1-click apply to active simulation.
 */

import React from 'react';
import { ClimateData, OptimizationVariant, ShelterDesign } from '../types';
import { generateOptimizedVariants } from '../services/optimizationEngine';
import { getMaterialById } from '../data/materials';
import { Award, Zap, DollarSign, Check, ArrowRight, Layers } from 'lucide-react';

interface OptimizationCardsProps {
  currentDesign: ShelterDesign;
  climate: ClimateData;
  onApplyVariant: (design: ShelterDesign) => void;
}

export const OptimizationCards: React.FC<OptimizationCardsProps> = ({
  currentDesign,
  climate,
  onApplyVariant
}) => {
  const variants = generateOptimizedVariants(currentDesign, climate);

  return (
    <div className="space-y-4">
      <div className="border-b border-slate-200 pb-3">
        <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
          <Award className="w-4 h-4 text-blue-600" />
          Automated Engineering Design Optimizations
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Algorithmic multi-objective trade-off analysis ranking thermal comfort, capital cost, and vernacular local materials.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {variants.map((v) => {
          const wallMat = getMaterialById(v.design.wallMaterialId);
          const roofMat = getMaterialById(v.design.roofMaterialId);

          let icon = <Zap className="w-4 h-4 text-amber-500" />;
          let headerBadgeClass = 'bg-blue-100 text-blue-800 border-blue-200';
          if (v.id === 'best_thermal') {
            icon = <Award className="w-4 h-4 text-emerald-600" />;
            headerBadgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-200';
          } else if (v.id === 'budget') {
            icon = <DollarSign className="w-4 h-4 text-indigo-600" />;
            headerBadgeClass = 'bg-indigo-100 text-indigo-800 border-indigo-200';
          }

          return (
            <div
              key={v.id}
              className="bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between overflow-hidden"
            >
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border ${headerBadgeClass}`}>
                    {icon}
                    {v.title}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-700">
                    ₹{v.results.estimatedMaterialCostINR.toLocaleString('en-IN')}
                  </span>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-800">{v.tagline}</h4>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {v.description}
                  </p>
                </div>

                {/* Quantitative Spec Summary */}
                <div className="bg-slate-50 p-2.5 rounded border border-slate-200 text-[11px] font-mono space-y-1 text-slate-600">
                  <div className="flex justify-between">
                    <span>Wall:</span>
                    <span className="text-slate-900 font-semibold truncate max-w-[130px]" title={wallMat.name}>
                      {wallMat.name.split('(')[0]}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Thickness:</span>
                    <span className="text-slate-900">{v.design.geometry.wallThicknessMm} mm</span>
                  </div>
                  <div className="flex justify-between">
                    <span>WWR:</span>
                    <span className="text-slate-900">{v.design.geometry.windowToWallRatioPercent}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>IMAC 80% Comfort:</span>
                    <span className="text-emerald-700 font-bold">{v.results.percentComfortCompliance80}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Wall U-Value:</span>
                    <span className="text-slate-900">{v.results.compositeWallUValue} W/m²·K</span>
                  </div>
                </div>

                {/* Key Advantages Checklist */}
                <div className="space-y-1 pt-1">
                  {v.keyAdvantages.map((adv, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 text-[11px] text-slate-700">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{adv}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="p-3 bg-slate-50 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => onApplyVariant(v.design)}
                  className="w-full py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>Apply {v.title}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
