/**
 * Team CODE TITANS - SIH26051
 * Saved Designs Manager & Offline Local Storage Hub
 * 
 * Features:
 * - 100% Offline LocalStorage persistence with resilient in-memory fallback
 * - Full CRUD: Save current design, Save as New copy with custom name, Duplicate, Delete, Load into Visualizer
 * - Import / Export: JSON file upload & download, Django fixtures, clipboard copy
 * - Active design indicator, thermal & cost performance comparison, and instant toast feedback
 */

import React, { useState, useEffect, useRef } from 'react';
import { ShelterDesign } from '../types';
import {
  getAllSavedDesigns,
  saveDesign,
  saveDesignAsNew,
  duplicateDesign,
  deleteDesign,
  resetSavedDesignsToDefaults,
  importDesignsFromJson,
  exportDesignsAsDjangoJson,
  exportSingleDesignJson
} from '../services/storageService';
import { getMaterialById } from '../data/materials';
import {
  FolderOpen,
  Trash2,
  Download,
  Plus,
  Copy,
  Check,
  Upload,
  RefreshCcw,
  Sparkles,
  Sliders,
  CheckCircle2,
  AlertCircle,
  FileCode2,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface SavedDesignsProps {
  onLoadDesign: (design: ShelterDesign) => void;
  currentDesign: ShelterDesign;
}

export const SavedDesigns: React.FC<SavedDesignsProps> = ({
  onLoadDesign,
  currentDesign
}) => {
  const [designs, setDesigns] = useState<ShelterDesign[]>([]);
  const [customSaveName, setCustomSaveName] = useState<string>('');
  const [showSaveOptions, setShowSaveOptions] = useState<boolean>(false);
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [importJsonText, setImportJsonText] = useState<string>('');
  const [importError, setImportError] = useState<string | null>(null);
  const [copiedDjango, setCopiedDjango] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const refreshList = () => {
    const list = getAllSavedDesigns();
    setDesigns(list);
  };

  useEffect(() => {
    refreshList();
    if (currentDesign?.name) {
      setCustomSaveName(`${currentDesign.name} (Custom)`);
    }
  }, [currentDesign]);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ type, text });
    setTimeout(() => {
      setToastMessage((prev) => (prev?.text === text ? null : prev));
    }, 4500);
  };

  // 1. Save Active Design as New entry
  const handleSaveAsNew = () => {
    const nameToUse = customSaveName.trim() || `${currentDesign.name} (Saved)`;
    const result = saveDesignAsNew(currentDesign, nameToUse);
    if (result.success) {
      refreshList();
      setShowSaveOptions(false);
      showToast(`Saved new design "${nameToUse}" to offline local storage!`);
    } else {
      showToast('Could not save design. Storage error.', 'error');
    }
  };

  // 2. Overwrite / Update active design
  const handleUpdateActive = () => {
    const nameToUse = customSaveName.trim() || currentDesign.name;
    const updated = {
      ...currentDesign,
      name: nameToUse
    };
    const success = saveDesign(updated);
    if (success) {
      refreshList();
      setShowSaveOptions(false);
      showToast(`Updated "${nameToUse}" in offline local storage!`);
    } else {
      showToast('Could not update design. Storage error.', 'error');
    }
  };

  // 3. Load design into studio & visualizer
  const handleLoad = (design: ShelterDesign) => {
    onLoadDesign(design);
    showToast(`Loaded "${design.name}" into visualizer!`);
  };

  // 4. Duplicate design
  const handleDuplicate = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const copy = duplicateDesign(id);
    if (copy) {
      refreshList();
      showToast(`Created duplicate: "${copy.name}"`);
    } else {
      showToast('Error duplicating design.', 'error');
    }
  };

  // 5. Delete design
  const handleDelete = (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${name}" from offline storage?`)) {
      const success = deleteDesign(id);
      if (success) {
        refreshList();
        showToast(`Deleted "${name}" from offline storage.`);
      }
    }
  };

  // 6. Reset to standard archetypes
  const handleResetDefaults = () => {
    if (window.confirm('Reset all saved designs back to the 3 standard regional archetypes? Any custom saved designs will be replaced.')) {
      const defaults = resetSavedDesignsToDefaults();
      setDesigns(defaults);
      showToast('Reset saved designs to default regional archetypes.');
    }
  };

  // 7. Copy Django JSON
  const handleCopyDjangoJson = () => {
    const jsonStr = exportDesignsAsDjangoJson();
    navigator.clipboard.writeText(jsonStr);
    setCopiedDjango(true);
    showToast('Django REST JSON copied to clipboard!');
    setTimeout(() => setCopiedDjango(false), 2500);
  };

  // 8. Download Django JSON fixture
  const handleDownloadDjangoJson = () => {
    const jsonStr = exportDesignsAsDjangoJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sih26051_django_fixture_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Downloaded Django fixture JSON.');
  };

  // 9. Download Single Design JSON
  const handleExportSingle = (design: ShelterDesign, e: React.MouseEvent) => {
    e.stopPropagation();
    const jsonStr = exportSingleDesignJson(design);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${design.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Exported "${design.name}" as JSON.`);
  };

  // 10. Handle JSON File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const result = importDesignsFromJson(content);
        if (result.success) {
          refreshList();
          setShowImportModal(false);
          setImportJsonText('');
          setImportError(null);
          showToast(`Successfully imported ${result.count} design(s)!`);
        } else {
          setImportError(result.error || 'Failed to parse JSON file.');
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // 11. Handle Manual JSON Text Import
  const handleImportTextSubmit = () => {
    if (!importJsonText.trim()) {
      setImportError('Please paste JSON text.');
      return;
    }
    const result = importDesignsFromJson(importJsonText);
    if (result.success) {
      refreshList();
      setShowImportModal(false);
      setImportJsonText('');
      setImportError(null);
      showToast(`Successfully imported ${result.count} design(s)!`);
    } else {
      setImportError(result.error || 'Failed to import designs.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Dynamic Toast Feedback Banner */}
      {toastMessage && (
        <div
          className={`p-3.5 rounded-lg border text-xs font-semibold flex items-center justify-between gap-3 shadow-xs transition-all ${
            toastMessage.type === 'error'
              ? 'bg-red-50 text-red-800 border-red-200'
              : toastMessage.type === 'info'
              ? 'bg-blue-50 text-blue-800 border-blue-200'
              : 'bg-emerald-50 text-emerald-900 border-emerald-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {toastMessage.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-slate-700 text-xs px-2 py-0.5 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Action Header Panel */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-mono">
                SIH26051 Storage Engine
              </span>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded flex items-center gap-1">
                <Check className="w-3 h-3 text-emerald-600" />
                Offline Storage Active ({designs.length} Saved)
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-1 flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-blue-600" />
              Saved Shelter Designs (Offline Local Storage)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 max-w-2xl">
              All architectural parameters, envelope materials, and thermal simulation results are preserved in your browser. Fully compatible with offline disaster scenarios and Django REST backend synchronization.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setShowSaveOptions((prev) => !prev)}
              id="btn-save-active-design"
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
              title="Save the current active shelter from the visualizer"
            >
              <Plus className="w-4 h-4" />
              Save Active Design
            </button>

            <button
              type="button"
              onClick={() => setShowImportModal(true)}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors border border-slate-300 cursor-pointer"
              title="Import shelter designs from JSON file or text"
            >
              <Upload className="w-3.5 h-3.5 text-slate-600" />
              Import JSON
            </button>

            <button
              type="button"
              onClick={handleCopyDjangoJson}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors border border-slate-300 cursor-pointer"
              title="Copy Django REST serializer payload to clipboard"
            >
              {copiedDjango ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-600" />}
              {copiedDjango ? 'Copied Fixture!' : 'Copy Django JSON'}
            </button>

            <button
              type="button"
              onClick={handleDownloadDjangoJson}
              className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Download JSON fixture for loaddata in Django"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              Export Fixture
            </button>
          </div>
        </div>

        {/* Expandable Save Active Design Box */}
        {showSaveOptions && (
          <div className="bg-slate-50 border border-blue-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-blue-600" />
                Save Active Design: &quot;{currentDesign.name}&quot; ({currentDesign.regionId.toUpperCase()})
              </span>
              <button
                type="button"
                onClick={() => setShowSaveOptions(false)}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                Cancel
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="w-full sm:flex-1">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Design Name
                </label>
                <input
                  type="text"
                  value={customSaveName}
                  onChange={(e) => setCustomSaveName(e.target.value)}
                  placeholder="Enter custom design name (e.g. Optimized Ladakh Stilt)"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto sm:self-end">
                <button
                  type="button"
                  onClick={handleSaveAsNew}
                  id="btn-save-as-new"
                  className="flex-1 sm:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-md flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Save as New Entry
                </button>

                <button
                  type="button"
                  onClick={handleUpdateActive}
                  id="btn-update-active"
                  className="flex-1 sm:flex-none px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <RefreshCcw className="w-3.5 h-3.5 text-slate-300" />
                  Update Active
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Designs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {designs.map((d) => {
          const wall = getMaterialById(d.wallMaterialId);
          const roof = getMaterialById(d.roofMaterialId);
          const insulation = getMaterialById(d.insulationMaterialId);
          const glazing = getMaterialById(d.glazingMaterialId);
          const comfort = d.simulationResults?.percentComfortCompliance80 ?? 80;
          const cost = d.simulationResults?.estimatedMaterialCostINR?.toLocaleString('en-IN') ?? '—';
          const isActive = d.id === currentDesign.id;

          return (
            <div
              key={d.id}
              className={`bg-white border rounded-xl p-4.5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between ${
                isActive
                  ? 'border-blue-500 ring-2 ring-blue-100 bg-blue-50/20'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="space-y-3">
                {/* Top Row: Region Badge, Active Pill, Action Icons */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded font-mono ${
                        d.regionId === 'mountain'
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : d.regionId === 'desert'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {d.regionId.toUpperCase()}
                    </span>

                    {isActive && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-600 text-white font-mono flex items-center gap-1">
                        <Check className="w-2.5 h-2.5" />
                        Active in Visualizer
                      </span>
                    )}
                  </div>

                  {/* Icon Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => handleExportSingle(d, e)}
                      className="text-slate-400 hover:text-slate-700 p-1.5 rounded hover:bg-slate-100 transition-colors"
                      title="Download single design JSON"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDuplicate(d.id, e)}
                      className="text-slate-400 hover:text-blue-600 p-1.5 rounded hover:bg-slate-100 transition-colors"
                      title="Duplicate this design"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDelete(d.id, d.name, e)}
                      className="text-slate-400 hover:text-red-600 p-1.5 rounded hover:bg-slate-100 transition-colors"
                      title="Delete saved design"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Design Title & Notes */}
                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-snug">{d.name}</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{d.notes}</p>
                </div>

                {/* Specs Strip */}
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs font-mono space-y-1.5 text-slate-600">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Wall:</span>
                    <span className="text-slate-900 font-semibold truncate max-w-[150px]">
                      {wall?.name?.split('(')[0] || d.wallMaterialId} ({d.geometry.wallThicknessMm}mm)
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Roof:</span>
                    <span className="text-slate-900 truncate max-w-[150px]">
                      {roof?.name?.split('(')[0] || d.roofMaterialId} ({d.geometry.roofPitchDegrees}°)
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">WWR / Overhang:</span>
                    <span className="text-slate-900 font-semibold">
                      {d.geometry.windowToWallRatioPercent}% / {d.geometry.overhangDepthMeters}m
                    </span>
                  </div>

                  <div className="flex justify-between items-center pt-1 border-t border-slate-200">
                    <span className="text-slate-500">IMAC 80% Comfort:</span>
                    <span className="text-emerald-700 font-bold">{comfort}%</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Estimated Cost:</span>
                    <span className="text-slate-900 font-bold">₹{cost}</span>
                  </div>
                </div>

                {/* Saved Timestamp */}
                <div className="text-[10px] text-slate-400 font-mono">
                  Saved: {new Date(d.updatedAtIso).toLocaleDateString()} at{' '}
                  {new Date(d.updatedAtIso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              {/* Bottom Load Button */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleLoad(d)}
                  className={`w-full py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
                      : 'bg-slate-900 text-white hover:bg-slate-800'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>{isActive ? 'Loaded in Visualizer (Click to re-sync)' : 'Load into Visualizer'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State Fallback */}
      {designs.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-10 text-center space-y-4 shadow-sm">
          <div className="p-3 bg-blue-50 rounded-full w-12 h-12 mx-auto flex items-center justify-center text-blue-600">
            <FolderOpen className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">No saved designs currently in storage</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              You can save your active visualizer design or restore the three engineered regional benchmark shelters.
            </p>
          </div>
          <div className="flex justify-center gap-3">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <RefreshCcw className="w-3.5 h-3.5" />
              Restore 3 Regional Archetypes
            </button>
          </div>
        </div>
      )}

      {/* Bottom Footer Tooling */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <div>
          <span>Local storage backup key: </span>
          <code className="bg-white px-1.5 py-0.5 rounded border border-slate-300 font-mono text-[11px] text-slate-700">
            code_titans_sih26051_shelters_v1
          </code>
        </div>
        <button
          type="button"
          onClick={handleResetDefaults}
          className="text-slate-600 hover:text-red-700 text-xs font-medium flex items-center gap-1 underline cursor-pointer"
        >
          <RefreshCcw className="w-3 h-3" />
          Reset to Baseline Regional Archetypes
        </button>
      </div>

      {/* Modal: Import Designs from JSON */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl shadow-xl max-w-lg w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Upload className="w-4 h-4 text-blue-600" />
                Import Shelter Designs
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowImportModal(false);
                  setImportError(null);
                  setImportJsonText('');
                }}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Upload a previously exported JSON file or paste Django REST serializer fixtures below:
            </p>

            {/* File Upload Option */}
            <div>
              <input
                type="file"
                ref={fileInputRef}
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2.5 px-3 border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-lg text-xs font-semibold text-slate-700 hover:text-blue-600 flex items-center justify-center gap-2 transition-colors cursor-pointer bg-slate-50"
              >
                <Upload className="w-4 h-4" />
                Select .json file from computer
              </button>
            </div>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink mx-3 text-[10px] uppercase font-bold text-slate-400">Or Paste JSON</span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            {/* Textarea Option */}
            <div>
              <textarea
                rows={5}
                value={importJsonText}
                onChange={(e) => setImportJsonText(e.target.value)}
                placeholder="Paste ShelterDesign or Django loaddata fixture JSON here..."
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {importError && (
              <div className="p-2.5 bg-red-50 text-red-700 rounded border border-red-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{importError}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setShowImportModal(false);
                  setImportError(null);
                  setImportJsonText('');
                }}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleImportTextSubmit}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm"
              >
                Import JSON
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
