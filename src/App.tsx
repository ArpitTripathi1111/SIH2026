/**
 * Team CODE TITANS - SIH26051
 * Problem Statement: Software Based Model Development for Design of Area-Specific Shelter for Thermal Comfort Maintenance
 * 
 * Main Application Orchestrator
 */

import React, { useState, useMemo, useEffect } from 'react';
import { ActiveTab, Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { ShelterVisualizer } from './components/ShelterVisualizer';
import { InputDashboard } from './components/InputDashboard';
import { WhatIfSimulator } from './components/WhatIfSimulator';
import { OptimizationCards } from './components/OptimizationCards';
import { GeminiInsights } from './components/GeminiInsights';
import { SavedDesigns } from './components/SavedDesigns';
import { ReportView } from './components/ReportView';
import { LocationSelector } from './components/LocationSelector';
import { ClimateController } from './components/ClimateController';
import { ComplianceEngine } from './components/ComplianceEngine';
import { RiskAnalyzer } from './components/RiskAnalyzer';
import { ClimateData, RegionId, ShelterDesign } from './types';
import { DEFAULT_CLIMATES } from './data/defaultClimates';
import { createDefaultDesignForRegion } from './services/storageService';
import { runThermalSimulation } from './services/thermalEngine';
import { fetchClimateConditions } from './services/weatherService';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [currentRegion, setCurrentRegion] = useState<RegionId>('mountain');
  const [design, setDesign] = useState<ShelterDesign>(() =>
    createDefaultDesignForRegion('mountain')
  );
  const [climate, setClimate] = useState<ClimateData>(
    DEFAULT_CLIMATES.mountain.climate
  );
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);

  // Re-run dynamic simulation whenever geometry, materials, or climate changes
  const simulationResults = useMemo(() => {
    return runThermalSimulation(
      design.geometry,
      climate,
      design.wallMaterialId,
      design.roofMaterialId,
      design.insulationMaterialId,
      design.glazingMaterialId
    );
  }, [
    design.geometry,
    climate,
    design.wallMaterialId,
    design.roofMaterialId,
    design.insulationMaterialId,
    design.glazingMaterialId
  ]);

  // Combined design with current simulation results for downstream export/save
  const currentDesignWithResults = useMemo<ShelterDesign>(() => ({
    ...design,
    simulationResults
  }), [design, simulationResults]);

  // Handle region switch
  const handleRegionChange = (newRegion: RegionId) => {
    setCurrentRegion(newRegion);
    const newDesign = createDefaultDesignForRegion(newRegion);
    setDesign(newDesign);
    setClimate(DEFAULT_CLIMATES[newRegion].climate);
  };

  // Live weather fetch via Open-Meteo with verified offline fallback
  const handleFetchLiveWeather = async () => {
    setIsLoadingWeather(true);
    try {
      const freshClimate = await fetchClimateConditions(currentRegion);
      setClimate(freshClimate);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingWeather(false);
    }
  };

  // Reset to recommended archetype
  const handleResetToArchetype = () => {
    const archetype = createDefaultDesignForRegion(currentRegion);
    setDesign(archetype);
    setClimate(DEFAULT_CLIMATES[currentRegion].climate);
  };

  // Quick slider adjustments from What-If dashboard
  const handleQuickSliderChange = (
    field: 'windowToWallRatioPercent' | 'insulationThicknessMm' | 'airChangesPerHourACH' | 'overhangDepthMeters',
    val: number
  ) => {
    setDesign((prev) => ({
      ...prev,
      geometry: {
        ...prev.geometry,
        [field]: val
      }
    }));
  };

  // Load from saved designs
  const handleLoadSavedDesign = (loaded: ShelterDesign) => {
    setDesign(loaded);
    setCurrentRegion(loaded.regionId);
    setClimate(DEFAULT_CLIMATES[loaded.regionId].climate);
    setActiveTab('simulator');
  };

  // Apply automated optimization variant
  const handleApplyOptimizationVariant = (optimizedDesign: ShelterDesign) => {
    setDesign(optimizedDesign);
    setActiveTab('simulator');
  };

  // Quick start from landing page
  const handleStartPrototype = (selectedRegion?: RegionId) => {
    if (selectedRegion && selectedRegion !== currentRegion) {
      handleRegionChange(selectedRegion);
    }
    setActiveTab('simulator');
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans antialiased">
      {/* Universal Top Navigation */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        climateSource={climate.source}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 print:max-w-none print:w-full print:p-0 print:m-0">
        {activeTab === 'home' && (
          <LandingPage onStartPrototype={handleStartPrototype} />
        )}

        {activeTab === 'simulator' && (
          <div className="space-y-6">
            {/* Top: 2D CAD Visualizer */}
            <ShelterVisualizer
              design={design}
              climate={climate}
              results={simulationResults}
              onDesignChange={setDesign}
              onRegionChange={handleRegionChange}
            />

            {/* Statutory Indian Government Standards Compliance Engine (ECBC • NDMA • IMAC • NBC) */}
            <ComplianceEngine
              design={design}
              climate={climate}
              simulation={simulationResults}
              onApplyFix={setDesign}
            />

            {/* THREE DISTINCT INTERACTION ZONES */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Interaction Zone 1: Location Selection */}
              <LocationSelector
                currentClimate={climate}
                onClimateChange={(newClimate) => {
                  setClimate(newClimate);
                  if (newClimate.regionId !== currentRegion) {
                    setCurrentRegion(newClimate.regionId);
                  }
                }}
                onRegionChange={handleRegionChange}
              />

              {/* Interaction Zone 2: Climate Override */}
              <ClimateController
                climate={climate}
                onClimateChange={setClimate}
              />
            </div>

            {/* Interaction Zone 3: Building Dimensions & Envelope Specification */}
            <InputDashboard
              design={design}
              climate={climate}
              isLoadingWeather={isLoadingWeather}
              onDesignChange={setDesign}
              onRegionChange={handleRegionChange}
              onFetchLiveWeather={handleFetchLiveWeather}
              onResetToArchetype={handleResetToArchetype}
            />

            {/* Bottom: Sensitivity What-If Simulator & Recharts */}
            <WhatIfSimulator
              design={design}
              climate={climate}
              results={simulationResults}
              onQuickSliderChange={handleQuickSliderChange}
            />
          </div>
        )}

        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Statutory Indian Government Standards Compliance Engine (ECBC • NDMA • IMAC • NBC) */}
            <ComplianceEngine
              design={design}
              climate={climate}
              simulation={simulationResults}
              onApplyFix={setDesign}
            />

            {/* Multi-Criteria Automated Optimizations */}
            <OptimizationCards
              currentDesign={design}
              climate={climate}
              onApplyVariant={handleApplyOptimizationVariant}
            />

            {/* Sensitivity What-If Simulator & Recharts curve */}
            <WhatIfSimulator
              design={design}
              climate={climate}
              results={simulationResults}
              onQuickSliderChange={handleQuickSliderChange}
            />

            {/* AI Analytical Insights with BYOK */}
            <GeminiInsights
              design={design}
              climate={climate}
              results={simulationResults}
            />
          </div>
        )}

        {activeTab === 'saved' && (
          <SavedDesigns
            onLoadDesign={handleLoadSavedDesign}
            currentDesign={currentDesignWithResults}
          />
        )}

        {activeTab === 'report' && (
          <ReportView
            design={currentDesignWithResults}
            climate={climate}
            results={simulationResults}
            onBackToStudio={() => setActiveTab('simulator')}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="no-print print:hidden bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500 font-mono">
        Team CODE TITANS • Smart India Hackathon 2026 • Problem SIH26051: Area-Specific Shelter for Thermal Comfort Maintenance
      </footer>
    </div>
  );
}
