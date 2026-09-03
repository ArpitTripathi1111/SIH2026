/**
 * Team CODE TITANS - SIH26051
 * Classic, Standard Engineering Navigation Bar
 */

import React from 'react';
import { Home, Sliders, BarChart3, FolderOpen, FileText, ShieldCheck } from 'lucide-react';

export type ActiveTab = 'home' | 'simulator' | 'dashboard' | 'saved' | 'report';

interface NavbarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  climateSource: 'live_open_meteo' | 'offline_fallback_profile';
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  climateSource
}) => {
  const tabs: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Home', icon: <Home className="w-4 h-4" /> },
    { id: 'simulator', label: 'New Design & Visualizer', icon: <Sliders className="w-4 h-4" /> },
    { id: 'dashboard', label: 'Optimization Dashboard', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'saved', label: 'Saved Designs', icon: <FolderOpen className="w-4 h-4" /> },
    { id: 'report', label: 'Engineering Report', icon: <FileText className="w-4 h-4" /> }
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-50 print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Brand & Problem Tag */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onTabChange('home')}>
            <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white font-mono font-bold text-xs shadow-sm">
              CT
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-tight text-white">CODE TITANS</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-cyan-400 border border-slate-700">
                  SIH26051
                </span>
              </div>
              <div className="text-[10px] text-slate-400 truncate max-w-[200px] sm:max-w-none">
                Area-Specific Shelter Thermal Comfort
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1 sm:gap-2">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onTabChange(tab.id)}
                  className={`px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 transition-colors ${
                    isActive
                      ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  {tab.icon}
                  <span className="hidden md:inline">{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Offline / Live Guarantee Indicator */}
          <div className="hidden lg:flex items-center gap-2 text-xs font-mono">
            <span
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] ${
                climateSource === 'live_open_meteo'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  : 'bg-amber-950 text-amber-300 border border-amber-800'
              }`}
            >
              <ShieldCheck className="w-3 h-3" />
              {climateSource === 'live_open_meteo' ? 'Open-Meteo Live' : 'Offline Verified'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
