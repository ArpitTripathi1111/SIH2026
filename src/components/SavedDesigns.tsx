/**
 * Team CODE TITANS - SIH26051
 * Saved Designs Manager & Django Backend Export
 */

import React, { useState, useEffect } from 'react';
import { ShelterDesign } from '../types';
import {
  getAllSavedDesigns,
  saveDesign,
  deleteDesign,
  exportDesignsAsDjangoJson
} from '../services/storageService';
import { getMaterialById } from '../data/materials';
import { FolderOpen, Trash2, Download, Plus, Copy, Check } from 'lucide-react';

interface SavedDesignsProps {
  onLoadDesign: (design: ShelterDesign) => void;
  currentDesign: ShelterDesign;
}

export const SavedDesigns: React.FC<SavedDesignsProps> = ({
  onLoadDesign,
  currentDesign
}) => {
  const [designs, setDesigns] = useState<ShelterDesign[]>([]);
  const [copiedDjango, setCopiedDjango] = useState(false);

  useEffect(() => {
    setDesigns(getAllSavedDesigns());
  }, []);

  const handleSaveCurrent = () => {
    saveDesign(currentDesign);
    setDesigns(getAllSavedDesigns());
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteDesign(id);
    setDesigns(getAllSavedDesigns());
  };

  const handleCopyDjangoJson = () => {
    const jsonStr = exportDesignsAsDjangoJson();
    navigator.clipboard.writeText(jsonStr);
    setCopiedDjango(true);
    setTimeout(() => setCopiedDjango(false), 2500);
  };

  const handleDownloadDjangoJson = () => {
    const jsonStr = exportDesignsAsDjangoJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sih26051_django_fixture_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-blue-600" />
            Saved Shelter Designs (Offline Local Storage)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Preserved directly in browser storage. Pre-structured for 1:1 synchronization with a Python (Django) REST backend.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSaveCurrent}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            Save Current Active Design
          </button>

          <button
            type="button"
            onClick={handleCopyDjangoJson}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded flex items-center gap-1.5 transition-colors border border-slate-300"
            title="Copy Django REST serializer payload to clipboard"
          >
            {copiedDjango ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-600" />}
            {copiedDjango ? 'Copied Django JSON!' : 'Copy Django JSON'}
          </button>

          <button
            type="button"
            onClick={handleDownloadDjangoJson}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded flex items-center gap-1.5 transition-colors"
            title="Download JSON fixture for loaddata in Django"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            Export Django Fixture
          </button>
        </div>
      </div>

      {/* Designs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {designs.map((d) => {
          const wall = getMaterialById(d.wallMaterialId);
          const roof = getMaterialById(d.roofMaterialId);
          const comfort = d.simulationResults?.percentComfortCompliance80 ?? 80;

          return (
            <div
              key={d.id}
              onClick={() => onLoadDesign(d)}
              className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:border-blue-500 hover:shadow-md cursor-pointer transition-all flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {d.regionId.toUpperCase()}
                    </span>
                    <h3 className="text-sm font-semibold text-slate-900 mt-1.5">{d.name}</h3>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => handleDelete(d.id, e)}
                    className="text-slate-400 hover:text-red-600 p-1 rounded transition-colors"
                    title="Delete saved design"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="bg-slate-50 p-2.5 rounded border border-slate-200 text-xs font-mono space-y-1 text-slate-600">
                  <div className="flex justify-between">
                    <span>Wall:</span>
                    <span className="text-slate-900 font-semibold truncate max-w-[140px]">{wall.name.split('(')[0]}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Thickness:</span>
                    <span className="text-slate-900">{d.geometry.wallThicknessMm} mm</span>
                  </div>
                  <div className="flex justify-between">
                    <span>WWR / Overhang:</span>
                    <span className="text-slate-900">{d.geometry.windowToWallRatioPercent}% / {d.geometry.overhangDepthMeters}m</span>
                  </div>
                  <div className="flex justify-between">
                    <span>IMAC 80% Comfort:</span>
                    <span className="text-emerald-700 font-bold">{comfort}%</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400">
                  Saved: {new Date(d.updatedAtIso).toLocaleDateString()}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-blue-600 font-medium">
                <span>Click to load into visualizer</span>
                <span>→</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
