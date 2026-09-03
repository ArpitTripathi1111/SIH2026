/**
 * Team CODE TITANS - SIH26051
 * Problem Statement: Software Based Model Development for Design of Area-Specific Shelter for Thermal Comfort Maintenance
 * 
 * LocationSelector.tsx
 * Professional, engineering-focused geographic location search & selector.
 * 
 * Features:
 * - Online Geocoding: Connects to Open-Meteo Geocoding API to resolve cities to Lat/Lon/Elevation
 * - Offline City Database: Hardcoded resilient fallback for Indian cities (Lucknow, Leh, Jaisalmer, Chennai, Mumbai, etc.)
 * - Seamless Fallback: Automatically falls back to local database if API times out (3.5s) or fails
 * - Reactive State Update: Triggers weatherService.ts -> thermalEngine.ts re-calculation to update all charts & 2D SVG
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { ClimateData, RegionId, ClimateZoneType } from '../types';
import { fetchClimateConditions } from '../services/weatherService';
import {
  Search,
  MapPin,
  Compass,
  Radio,
  Wifi,
  WifiOff,
  RefreshCw,
  Check,
  Globe2,
  AlertCircle,
  X
} from 'lucide-react';

export interface LocationOption {
  id: string;
  name: string;
  stateOrRegion: string;
  country: string;
  latitude: number;
  longitude: number;
  elevationMeters: number;
  climateZone: ClimateZoneType;
  regionId: RegionId;
  isOfflinePreset?: boolean;
  baseClimate?: Partial<ClimateData>;
}

/**
 * Hardcoded, diverse Indian city database for resilient offline mode.
 * Realistically represents NBC 2016 climate zones across India.
 */
export const OFFLINE_INDIAN_CITIES: LocationOption[] = [
  {
    id: 'in_leh',
    name: 'Leh',
    stateOrRegion: 'Ladakh',
    country: 'India',
    latitude: 34.1526,
    longitude: 77.5771,
    elevationMeters: 3524,
    climateZone: 'cold_arid',
    regionId: 'mountain',
    isOfflinePreset: true,
    baseClimate: {
      outdoorTempC: -8.5,
      minTempC: -16.0,
      maxTempC: -1.0,
      diurnalSwingC: 15.0,
      relativeHumidityPercent: 28,
      windSpeedMs: 3.8,
      directNormalSolarRadiationWm2: 820,
      runningMeanOutdoorTempC: -6.0
    }
  },
  {
    id: 'in_shimla',
    name: 'Shimla',
    stateOrRegion: 'Himachal Pradesh',
    country: 'India',
    latitude: 31.1048,
    longitude: 77.1734,
    elevationMeters: 2276,
    climateZone: 'cold_arid',
    regionId: 'mountain',
    isOfflinePreset: true,
    baseClimate: {
      outdoorTempC: 6.2,
      minTempC: 1.5,
      maxTempC: 11.0,
      diurnalSwingC: 9.5,
      relativeHumidityPercent: 55,
      windSpeedMs: 2.8,
      directNormalSolarRadiationWm2: 680,
      runningMeanOutdoorTempC: 7.0
    }
  },
  {
    id: 'in_srinagar',
    name: 'Srinagar',
    stateOrRegion: 'Jammu & Kashmir',
    country: 'India',
    latitude: 34.0837,
    longitude: 74.7973,
    elevationMeters: 1585,
    climateZone: 'cold_arid',
    regionId: 'mountain',
    isOfflinePreset: true,
    baseClimate: {
      outdoorTempC: 3.5,
      minTempC: -2.0,
      maxTempC: 8.5,
      diurnalSwingC: 10.5,
      relativeHumidityPercent: 68,
      windSpeedMs: 2.2,
      directNormalSolarRadiationWm2: 640,
      runningMeanOutdoorTempC: 4.5
    }
  },
  {
    id: 'in_jaisalmer',
    name: 'Jaisalmer',
    stateOrRegion: 'Rajasthan',
    country: 'India',
    latitude: 26.9157,
    longitude: 70.9083,
    elevationMeters: 225,
    climateZone: 'hot_dry',
    regionId: 'desert',
    isOfflinePreset: true,
    baseClimate: {
      outdoorTempC: 41.5,
      minTempC: 28.0,
      maxTempC: 45.0,
      diurnalSwingC: 17.0,
      relativeHumidityPercent: 22,
      windSpeedMs: 4.5,
      directNormalSolarRadiationWm2: 890,
      runningMeanOutdoorTempC: 35.0
    }
  },
  {
    id: 'in_bikaner',
    name: 'Bikaner',
    stateOrRegion: 'Rajasthan',
    country: 'India',
    latitude: 28.0229,
    longitude: 73.3119,
    elevationMeters: 242,
    climateZone: 'hot_dry',
    regionId: 'desert',
    isOfflinePreset: true,
    baseClimate: {
      outdoorTempC: 39.8,
      minTempC: 27.2,
      maxTempC: 44.0,
      diurnalSwingC: 16.8,
      relativeHumidityPercent: 25,
      windSpeedMs: 4.0,
      directNormalSolarRadiationWm2: 860,
      runningMeanOutdoorTempC: 34.2
    }
  },
  {
    id: 'in_ahmedabad',
    name: 'Ahmedabad',
    stateOrRegion: 'Gujarat',
    country: 'India',
    latitude: 23.0225,
    longitude: 72.5714,
    elevationMeters: 53,
    climateZone: 'hot_dry',
    regionId: 'desert',
    isOfflinePreset: true,
    baseClimate: {
      outdoorTempC: 36.5,
      minTempC: 25.0,
      maxTempC: 41.5,
      diurnalSwingC: 16.5,
      relativeHumidityPercent: 42,
      windSpeedMs: 3.2,
      directNormalSolarRadiationWm2: 810,
      runningMeanOutdoorTempC: 32.0
    }
  },
  {
    id: 'in_lucknow',
    name: 'Lucknow',
    stateOrRegion: 'Uttar Pradesh',
    country: 'India',
    latitude: 26.8467,
    longitude: 80.9462,
    elevationMeters: 123,
    climateZone: 'composite',
    regionId: 'river',
    isOfflinePreset: true,
    baseClimate: {
      outdoorTempC: 33.2,
      minTempC: 24.5,
      maxTempC: 38.0,
      diurnalSwingC: 13.5,
      relativeHumidityPercent: 62,
      windSpeedMs: 2.5,
      directNormalSolarRadiationWm2: 730,
      runningMeanOutdoorTempC: 29.5
    }
  },
  {
    id: 'in_varanasi',
    name: 'Varanasi',
    stateOrRegion: 'Uttar Pradesh',
    country: 'India',
    latitude: 25.3176,
    longitude: 82.9739,
    elevationMeters: 81,
    climateZone: 'composite',
    regionId: 'river',
    isOfflinePreset: true,
    baseClimate: {
      outdoorTempC: 34.0,
      minTempC: 25.2,
      maxTempC: 39.0,
      diurnalSwingC: 13.8,
      relativeHumidityPercent: 65,
      windSpeedMs: 2.3,
      directNormalSolarRadiationWm2: 745,
      runningMeanOutdoorTempC: 30.1
    }
  },
  {
    id: 'in_mumbai',
    name: 'Mumbai',
    stateOrRegion: 'Maharashtra',
    country: 'India',
    latitude: 19.0760,
    longitude: 72.8777,
    elevationMeters: 14,
    climateZone: 'warm_humid',
    regionId: 'river',
    isOfflinePreset: true,
    baseClimate: {
      outdoorTempC: 31.8,
      minTempC: 26.0,
      maxTempC: 34.2,
      diurnalSwingC: 8.2,
      relativeHumidityPercent: 82,
      windSpeedMs: 4.8,
      directNormalSolarRadiationWm2: 660,
      runningMeanOutdoorTempC: 29.2
    }
  },
  {
    id: 'in_chennai',
    name: 'Chennai',
    stateOrRegion: 'Tamil Nadu',
    country: 'India',
    latitude: 13.0827,
    longitude: 80.2707,
    elevationMeters: 6,
    climateZone: 'warm_humid',
    regionId: 'river',
    isOfflinePreset: true,
    baseClimate: {
      outdoorTempC: 33.5,
      minTempC: 27.0,
      maxTempC: 36.5,
      diurnalSwingC: 9.5,
      relativeHumidityPercent: 78,
      windSpeedMs: 4.2,
      directNormalSolarRadiationWm2: 710,
      runningMeanOutdoorTempC: 30.8
    }
  },
  {
    id: 'in_nagpur',
    name: 'Nagpur',
    stateOrRegion: 'Maharashtra',
    country: 'India',
    latitude: 21.1458,
    longitude: 79.0882,
    elevationMeters: 310,
    climateZone: 'composite',
    regionId: 'desert',
    isOfflinePreset: true,
    baseClimate: {
      outdoorTempC: 37.0,
      minTempC: 25.5,
      maxTempC: 42.0,
      diurnalSwingC: 16.5,
      relativeHumidityPercent: 40,
      windSpeedMs: 2.8,
      directNormalSolarRadiationWm2: 800,
      runningMeanOutdoorTempC: 32.5
    }
  },
  {
    id: 'in_shillong',
    name: 'Shillong',
    stateOrRegion: 'Meghalaya',
    country: 'India',
    latitude: 25.5788,
    longitude: 91.8933,
    elevationMeters: 1525,
    climateZone: 'temperate',
    regionId: 'mountain',
    isOfflinePreset: true,
    baseClimate: {
      outdoorTempC: 19.5,
      minTempC: 14.0,
      maxTempC: 23.5,
      diurnalSwingC: 9.5,
      relativeHumidityPercent: 84,
      windSpeedMs: 2.6,
      directNormalSolarRadiationWm2: 590,
      runningMeanOutdoorTempC: 18.0
    }
  }
];

/**
 * Infer archetype regionId and climateZone from coordinates & elevation
 */
function inferRegionAndClimate(lat: number, lon: number, elevation: number): {
  regionId: RegionId;
  climateZone: ClimateZoneType;
} {
  // High altitude Himalaya / Karakoram
  if (elevation > 1600 || (lat > 31 && elevation > 1000)) {
    return { regionId: 'mountain', climateZone: 'cold_arid' };
  }
  // Arid western Thar / Deccan Rain Shadow
  if (lon < 75 && lat >= 23 && lat <= 30) {
    return { regionId: 'desert', climateZone: 'hot_dry' };
  }
  // Coastal or humid alluvial plains
  if (elevation < 100 && (lon > 82 || lat < 18 || lon < 74)) {
    return { regionId: 'river', climateZone: 'warm_humid' };
  }
  // Default composite Gangetic / central
  return { regionId: 'river', climateZone: 'composite' };
}

export interface LocationSelectorProps {
  currentClimate: ClimateData;
  onClimateChange: (newClimate: ClimateData) => void;
  onRegionChange?: (regionId: RegionId) => void;
  onLocationSelect?: (location: LocationOption) => void;
  className?: string;
}

export const LocationSelector: React.FC<LocationSelectorProps> = ({
  currentClimate,
  onClimateChange,
  onRegionChange,
  onLocationSelect,
  className = ''
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchingApi, setIsSearchingApi] = useState(false);
  const [isFetchingWeather, setIsFetchingWeather] = useState(false);
  const [apiResults, setApiResults] = useState<LocationOption[]>([]);
  const [networkMode, setNetworkMode] = useState<'online' | 'offline_fallback'>('online');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<LocationOption>(() => {
    // Find matching preset by name or default to Lucknow
    const match = OFFLINE_INDIAN_CITIES.find(
      (c) => c.name.toLowerCase() === currentClimate.locationName.toLowerCase()
    );
    if (match) return match;
    return {
      id: 'current_loc',
      name: currentClimate.locationName,
      stateOrRegion: currentClimate.regionName,
      country: 'India',
      latitude: currentClimate.latitude,
      longitude: currentClimate.longitude,
      elevationMeters: currentClimate.elevationMeters,
      climateZone: currentClimate.climateZone,
      regionId: currentClimate.regionId
    };
  });

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<number | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered offline database results
  const offlineFilteredCities = useMemo(() => {
    if (!searchQuery.trim()) {
      return OFFLINE_INDIAN_CITIES.slice(0, 6);
    }
    const q = searchQuery.toLowerCase().trim();
    return OFFLINE_INDIAN_CITIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.stateOrRegion.toLowerCase().includes(q) ||
        c.climateZone.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Unified options: API results when available, else offline matches
  const displayOptions = useMemo(() => {
    if (apiResults.length > 0) {
      return apiResults;
    }
    return offlineFilteredCities;
  }, [apiResults, offlineFilteredCities]);

  // Debounced API Search with Open-Meteo Geocoding
  const performGeocodingSearch = useCallback(async (query: string) => {
    if (!query || query.trim().length < 2) {
      setApiResults([]);
      setIsSearchingApi(false);
      setErrorMessage(null);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsSearchingApi(true);
    setErrorMessage(null);

    const timeoutId = setTimeout(() => controller.abort(), 3500); // 3.5s timeout protection

    try {
      const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        query.trim()
      )}&count=6&language=en&format=json`;

      const response = await fetch(url, {
        signal: controller.signal,
        headers: { Accept: 'application/json' }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Geocoding server status ${response.status}`);
      }

      const data = await response.json();

      if (data && Array.isArray(data.results) && data.results.length > 0) {
        const mapped: LocationOption[] = data.results.map((item: any) => {
          const lat = Number(item.latitude);
          const lon = Number(item.longitude);
          const elevation = Number(item.elevation || 100);
          const { regionId, climateZone } = inferRegionAndClimate(lat, lon, elevation);

          return {
            id: `geo_${item.id || `${lat}_${lon}`}`,
            name: item.name,
            stateOrRegion: item.admin1 || item.country || 'Region',
            country: item.country || 'India',
            latitude: Number(lat.toFixed(4)),
            longitude: Number(lon.toFixed(4)),
            elevationMeters: Math.round(elevation),
            climateZone,
            regionId,
            isOfflinePreset: false
          };
        });

        setApiResults(mapped);
        setNetworkMode('online');
      } else {
        // No results from API, fallback to offline matching
        setApiResults([]);
        setNetworkMode('offline_fallback');
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.info('Geocoding API unavailable or timed out; falling back to offline city database:', err);
      }
      setNetworkMode('offline_fallback');
      setApiResults([]);
    } finally {
      setIsSearchingApi(false);
    }
  }, []);

  // Handle user typing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    setIsOpen(true);

    if (searchTimeoutRef.current) {
      window.clearTimeout(searchTimeoutRef.current);
    }

    if (val.trim().length >= 2) {
      setIsSearchingApi(true);
      searchTimeoutRef.current = window.setTimeout(() => {
        performGeocodingSearch(val);
      }, 300);
    } else {
      setApiResults([]);
      setIsSearchingApi(false);
    }
  };

  // Select location handler
  const handleSelectLocation = async (loc: LocationOption) => {
    setSelectedLocation(loc);
    setSearchQuery('');
    setIsOpen(false);
    setIsFetchingWeather(true);
    setErrorMessage(null);

    // If region changes, notify parent immediately
    if (onRegionChange && loc.regionId !== currentClimate.regionId) {
      onRegionChange(loc.regionId);
    }

    if (onLocationSelect) {
      onLocationSelect(loc);
    }

    try {
      // Trigger weatherService to fetch real-time data at exact coordinates
      const freshClimate = await fetchClimateConditions(
        loc.regionId,
        loc.latitude,
        loc.longitude,
        `${loc.name}, ${loc.stateOrRegion}`,
        loc.elevationMeters
      );

      // Preserve climate zone
      const enrichedClimate: ClimateData = {
        ...freshClimate,
        locationName: `${loc.name}, ${loc.stateOrRegion}`,
        latitude: loc.latitude,
        longitude: loc.longitude,
        elevationMeters: loc.elevationMeters,
        climateZone: loc.climateZone,
        regionId: loc.regionId
      };

      onClimateChange(enrichedClimate);
      setNetworkMode(freshClimate.source === 'live_open_meteo' ? 'online' : 'offline_fallback');
    } catch (err) {
      console.warn('Live weather update failed, applying verified offline city profile:', err);
      setNetworkMode('offline_fallback');

      // Fallback synthesis from city database
      const fallbackPreset = OFFLINE_INDIAN_CITIES.find(
        (c) => c.name.toLowerCase() === loc.name.toLowerCase()
      ) || loc;

      const base = fallbackPreset.baseClimate || {};
      const fallbackData: ClimateData = {
        ...currentClimate,
        regionId: loc.regionId,
        locationName: `${loc.name}, ${loc.stateOrRegion}`,
        latitude: loc.latitude,
        longitude: loc.longitude,
        elevationMeters: loc.elevationMeters,
        climateZone: loc.climateZone,
        outdoorTempC: base.outdoorTempC ?? currentClimate.outdoorTempC,
        minTempC: base.minTempC ?? currentClimate.minTempC,
        maxTempC: base.maxTempC ?? currentClimate.maxTempC,
        diurnalSwingC: base.diurnalSwingC ?? currentClimate.diurnalSwingC,
        relativeHumidityPercent: base.relativeHumidityPercent ?? currentClimate.relativeHumidityPercent,
        windSpeedMs: base.windSpeedMs ?? currentClimate.windSpeedMs,
        directNormalSolarRadiationWm2: base.directNormalSolarRadiationWm2 ?? currentClimate.directNormalSolarRadiationWm2,
        runningMeanOutdoorTempC: base.runningMeanOutdoorTempC ?? currentClimate.runningMeanOutdoorTempC,
        source: 'offline_fallback_profile',
        conditionSummary: `Offline Database: ${loc.name} (${loc.climateZone.replace('_', ' ')})`,
        fetchedAtIso: new Date().toISOString()
      };

      onClimateChange(fallbackData);
    } finally {
      setIsFetchingWeather(false);
    }
  };

  // Re-sync weather at current coordinates
  const handleResyncCurrentLocation = () => {
    if (selectedLocation) {
      handleSelectLocation(selectedLocation);
    }
  };

  return (
    <div className={`bg-slate-900 border border-slate-700/80 rounded-xl shadow-md text-slate-100 overflow-hidden ${className}`}>
      {/* SECTION HEADER */}
      <div className="px-4 py-3 bg-slate-800/90 border-b border-slate-700 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Globe2 className="w-4 h-4 text-cyan-400" />
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Geographic Location & Meteorological Telemetry
            </h3>
            <p className="text-[11px] text-slate-400">
              Search any global city or pick an Indian climate archetype to auto-update thermal parameters.
            </p>
          </div>
        </div>

        {/* NETWORK STATUS BADGE */}
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-medium border ${
              networkMode === 'online'
                ? 'bg-emerald-950/80 border-emerald-600/60 text-emerald-300'
                : 'bg-amber-950/80 border-amber-600/60 text-amber-300'
            }`}
          >
            {networkMode === 'online' ? (
              <>
                <Wifi className="w-3 h-3 text-emerald-400 animate-pulse" />
                <span>Open-Meteo Live API</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3 text-amber-400" />
                <span>Offline City DB Active</span>
              </>
            )}
          </span>

          <button
            type="button"
            onClick={handleResyncCurrentLocation}
            disabled={isFetchingWeather}
            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded text-[11px] font-mono flex items-center gap-1.5 transition-colors disabled:opacity-50"
            title="Re-query live temperature, humidity & solar radiation"
          >
            <RefreshCw className={`w-3 h-3 ${isFetchingWeather ? 'animate-spin text-cyan-400' : ''}`} />
            <span className="hidden sm:inline">Sync</span>
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* SEARCH BAR & DROPDOWN ANCHOR */}
        <div ref={dropdownRef} className="relative">
          <div className="relative flex items-center">
            <Search className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleInputChange}
              onFocus={() => setIsOpen(true)}
              placeholder="Search Indian or global city (e.g., Lucknow, Leh, Jaisalmer, Chennai, Mumbai)..."
              className="w-full pl-9 pr-24 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 font-sans"
            />

            <div className="absolute right-2.5 flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
              {isSearchingApi && (
                <span className="flex items-center gap-1 text-cyan-400">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  Searching...
                </span>
              )}
              {searchQuery && !isSearchingApi && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setApiResults([]);
                  }}
                  className="p-1 hover:text-slate-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* SEARCHABLE DROPDOWN MENU */}
          {isOpen && (
            <div className="absolute z-50 left-0 right-0 mt-1.5 max-h-72 overflow-y-auto bg-slate-900 border border-slate-700 rounded-lg shadow-2xl divide-y divide-slate-800 text-xs">
              <div className="px-3 py-1.5 bg-slate-800/80 text-[10px] font-mono text-slate-400 flex justify-between items-center">
                <span>
                  {apiResults.length > 0
                    ? `Open-Meteo Results (${apiResults.length})`
                    : searchQuery.trim().length >= 2
                    ? 'Offline City Database Matches'
                    : 'Recommended Indian Climate Archetypes'}
                </span>
                <span className="text-slate-500">Click to load environmental telemetry</span>
              </div>

              {displayOptions.length > 0 ? (
                displayOptions.map((item) => {
                  const isCurrent =
                    selectedLocation.name.toLowerCase() === item.name.toLowerCase() ||
                    currentClimate.locationName.toLowerCase().includes(item.name.toLowerCase());

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectLocation(item)}
                      className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between hover:bg-slate-800/90 transition-colors ${
                        isCurrent ? 'bg-cyan-950/40 border-l-2 border-cyan-400' : ''
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <MapPin className={`w-4 h-4 mt-0.5 shrink-0 ${isCurrent ? 'text-cyan-400' : 'text-slate-400'}`} />
                        <div>
                          <div className="font-semibold text-slate-200 flex items-center gap-2">
                            <span>{item.name}</span>
                            <span className="text-[11px] font-normal text-slate-400">
                              {item.stateOrRegion}, {item.country}
                            </span>
                            {item.isOfflinePreset && (
                              <span className="px-1.5 py-0.2 rounded bg-slate-800 text-[9px] font-mono text-slate-400 border border-slate-700">
                                Verified Preset
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] font-mono text-slate-400 mt-0.5 flex flex-wrap gap-x-3 gap-y-1">
                            <span>Lat: {item.latitude}°</span>
                            <span>Lon: {item.longitude}°</span>
                            <span>Elev: {item.elevationMeters}m</span>
                            <span className="text-cyan-300 font-medium capitalize">
                              {item.climateZone.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                      </div>

                      {isCurrent && (
                        <div className="flex items-center gap-1 text-[11px] font-mono text-cyan-400 font-medium">
                          <Check className="w-3.5 h-3.5" />
                          <span>Active</span>
                        </div>
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="p-4 text-center text-slate-400 text-xs">
                  <AlertCircle className="w-4 h-4 mx-auto mb-1 text-amber-400" />
                  No direct geocoding match found for "{searchQuery}".
                  <div className="text-[11px] text-slate-500 mt-1">
                    Select one of the verified Indian cities from the quick-preset chips below.
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* QUICK SELECTION PILLS (High-priority Indian baseline archetypes) */}
        <div>
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
            <Compass className="w-3 h-3 text-cyan-400" />
            <span>Instant Regional Archetypes (1-Click Test):</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {[
              { name: 'Leh', state: 'Ladakh', tag: 'Cold Arid' },
              { name: 'Jaisalmer', state: 'Rajasthan', tag: 'Hot Dry' },
              { name: 'Lucknow', state: 'Uttar Pradesh', tag: 'Composite' },
              { name: 'Mumbai', state: 'Maharashtra', tag: 'Warm Humid' },
              { name: 'Chennai', state: 'Tamil Nadu', tag: 'Coastal' },
              { name: 'Shimla', state: 'Himachal', tag: 'Cold High-Alt' }
            ].map((city) => {
              const preset = OFFLINE_INDIAN_CITIES.find((c) => c.name === city.name);
              const isActive =
                currentClimate.locationName.toLowerCase().includes(city.name.toLowerCase()) ||
                selectedLocation.name.toLowerCase() === city.name.toLowerCase();

              return (
                <button
                  key={city.name}
                  type="button"
                  onClick={() => preset && handleSelectLocation(preset)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 font-bold shadow-sm'
                      : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700/80'
                  }`}
                >
                  <MapPin className="w-3 h-3 text-slate-400" />
                  <span>{city.name}</span>
                  <span className="text-[10px] font-mono opacity-60">({city.tag})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ACTIVE LOCATION TELEMETRY CARD */}
        <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-lg">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5 mb-2.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-bold text-slate-200 font-mono">
                ACTIVE SITE: {currentClimate.locationName}
              </span>
            </div>
            <div className="text-[11px] font-mono text-slate-400">
              {currentClimate.latitude.toFixed(2)}°N, {currentClimate.longitude.toFixed(2)}°E | Elev: {currentClimate.elevationMeters}m
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-xs">
            <div className="bg-slate-900/90 p-2 rounded border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase">Outdoor Ambient</div>
              <div className="text-sm font-bold text-red-400 mt-0.5">
                {currentClimate.outdoorTempC.toFixed(1)}°C
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                Swing: ±{(currentClimate.diurnalSwingC / 2).toFixed(1)}°C
              </div>
            </div>

            <div className="bg-slate-900/90 p-2 rounded border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase">Relative Humidity</div>
              <div className="text-sm font-bold text-cyan-300 mt-0.5">
                {currentClimate.relativeHumidityPercent}%
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                Wind: {currentClimate.windSpeedMs} m/s
              </div>
            </div>

            <div className="bg-slate-900/90 p-2 rounded border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase">Solar Radiation</div>
              <div className="text-sm font-bold text-amber-300 mt-0.5">
                {currentClimate.directNormalSolarRadiationWm2} W/m²
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                Direct Normal Peak
              </div>
            </div>

            <div className="bg-slate-900/90 p-2 rounded border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase">IMAC Reference (T_om)</div>
              <div className="text-sm font-bold text-emerald-400 mt-0.5">
                {currentClimate.runningMeanOutdoorTempC.toFixed(1)}°C
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5 truncate capitalize">
                Zone: {currentClimate.climateZone.replace('_', ' ')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationSelector;
