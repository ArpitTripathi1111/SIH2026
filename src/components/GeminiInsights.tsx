/**
 * Team CODE TITANS - SIH26051
 * Gemini Engineering Insights (BYOK Enabled)
 * 
 * Minimal, professional engineering advisor that analyzes numerical simulation outputs
 * and outputs a concise thermodynamic rationale.
 */

import React, { useState } from 'react';
import { ClimateData, ShelterDesign, SimulationResults } from '../types';
import { fetchGeminiEngineeringAnalysis } from '../services/geminiService';
import { Bot, Key, Send, CheckCircle, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';

interface GeminiInsightsProps {
  design: ShelterDesign;
  climate: ClimateData;
  results: SimulationResults;
}

export const GeminiInsights: React.FC<GeminiInsightsProps> = ({
  design,
  climate,
  results
}) => {
  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem('code_titans_byok_gemini_key') || '';
  });
  const [showKeyInput, setShowKeyInput] = useState<boolean>(false);
  const [analysisText, setAnalysisText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasRun, setHasRun] = useState<boolean>(false);

  const handleSaveKey = (val: string) => {
    setApiKey(val);
    localStorage.setItem('code_titans_byok_gemini_key', val.trim());
  };

  const handleGenerateAnalysis = async () => {
    setIsLoading(true);
    try {
      const output = await fetchGeminiEngineeringAnalysis(design, climate, results, apiKey);
      setAnalysisText(output);
      setHasRun(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm text-slate-800 p-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded bg-slate-900 flex items-center justify-center text-cyan-400">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              AI Building Physics Review & Material Justification
            </h3>
            <p className="text-xs text-slate-500">
              Analytical thermodynamic assessment based on NBC 2016 building science principles.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowKeyInput(!showKeyInput)}
            className="px-2.5 py-1 text-xs text-slate-600 hover:text-slate-900 border border-slate-300 rounded flex items-center gap-1.5 transition-colors"
            title="Configure BYOK (Bring Your Own Key)"
          >
            <Key className="w-3.5 h-3.5 text-amber-600" />
            <span>{apiKey ? 'API Key Stored' : 'Enter Gemini Key'}</span>
            {showKeyInput ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          <button
            type="button"
            onClick={handleGenerateAnalysis}
            disabled={isLoading}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Analyzing Physics...
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5 text-cyan-400" />
                {hasRun ? 'Re-Evaluate Design' : 'Generate Engineering Review'}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Optional BYOK Key Drawer */}
      {showKeyInput && (
        <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-700">Bring Your Own Key (BYOK) - Optional</span>
            <span className="text-slate-400 text-[11px]">Stored locally in browser</span>
          </div>
          <div className="flex gap-2">
            <input
              type="password"
              placeholder="Paste Google AI Studio Gemini API Key (e.g. AIzaSy...)"
              value={apiKey}
              onChange={(e) => handleSaveKey(e.target.value)}
              className="flex-1 px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-slate-500 font-mono"
            />
            {apiKey && (
              <button
                type="button"
                onClick={() => handleSaveKey('')}
                className="px-2 py-1 text-[11px] text-red-600 hover:bg-red-50 rounded border border-red-200"
              >
                Clear
              </button>
            )}
          </div>
          <p className="text-[11px] text-slate-500">
            Note: If left blank or without internet, the engine automatically falls back to deterministic NBC 2016 thermodynamic analysis.
          </p>
        </div>
      )}

      {/* Analysis Output Box */}
      <div className="mt-4">
        {analysisText ? (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs leading-relaxed font-mono text-slate-800 whitespace-pre-line">
            <div className="flex items-center gap-1.5 text-emerald-700 font-semibold mb-2 text-[11px] uppercase tracking-wider">
              <CheckCircle className="w-3.5 h-3.5" />
              Thermodynamic Synthesis Report
            </div>
            {analysisText}
          </div>
        ) : (
          <div className="py-6 px-4 border border-dashed border-slate-300 rounded text-center text-xs text-slate-500 bg-slate-50/50">
            Click <strong>"Generate Engineering Review"</strong> to trigger thermodynamic assessment of the current envelope materials, U-values, WWR, and IMAC compliance.
          </div>
        )}
      </div>
    </div>
  );
};
