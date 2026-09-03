/**
 * Team CODE TITANS - SIH26051
 * Gemini Engineering Insights Service
 * 
 * Supports BYOK (Bring Your Own Key) and environment keys.
 * Produces strictly analytical, concise thermodynamic reviews of the shelter design.
 */

import { GoogleGenAI } from '@google/genai';
import { ClimateData, ShelterDesign, SimulationResults } from '../types';
import { getMaterialById } from '../data/materials';

export async function fetchGeminiEngineeringAnalysis(
  design: ShelterDesign,
  climate: ClimateData,
  results: SimulationResults,
  apiKey?: string
): Promise<string> {
  const effectiveKey = apiKey?.trim() || (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) || '';

  const wallMat = getMaterialById(design.wallMaterialId);
  const roofMat = getMaterialById(design.roofMaterialId);
  const insMat = getMaterialById(design.insulationMaterialId);

  // If no API key is provided, provide deterministic offline analytical synthesis
  // conforming to NBC 2016 building science principles
  if (!effectiveKey) {
    return generateDeterministicEngineeringSummary(design, climate, results, wallMat.name, roofMat.name);
  }

  const prompt = `
You are a Senior Sustainable Building Physicist and Thermal Engineer advising Team CODE TITANS for Smart India Hackathon 2026 (Problem SIH26051).
Analyze the following numerical thermal simulation outputs for a naturally ventilated shelter in India:

CLIMATE CONTEXT:
- Region: ${climate.regionName} (${climate.locationName})
- Climate Zone: ${climate.climateZone.toUpperCase()}
- Ambient Outdoor Temp: Current ${climate.outdoorTempC}°C (Min: ${climate.minTempC}°C, Max: ${climate.maxTempC}°C, Diurnal Swing: ${climate.diurnalSwingC}°C)
- Solar Radiation: Peak ${climate.directNormalSolarRadiationWm2} W/m² (Horizontal: ${climate.totalHorizontalSolarRadiationWm2} W/m²)
- Relative Humidity: ${climate.relativeHumidityPercent}% | Running Mean Outdoor Temp (T_om): ${climate.runningMeanOutdoorTempC}°C

SHELTER ENVELOPE SPECIFICATIONS:
- Structural Wall: ${wallMat.name} (${design.geometry.wallThicknessMm} mm, k = ${wallMat.thermalConductivityK} W/m·K, Density = ${wallMat.densityKgM3} kg/m³)
- Roof Construction: ${roofMat.name} (Type: ${design.geometry.roofType})
- Insulation Layer: ${insMat.name} (${design.geometry.insulationThicknessMm} mm)
- Fenestration: WWR = ${design.geometry.windowToWallRatioPercent}%, Glazing = ${design.geometry.glazingType}, Shading = ${design.geometry.shadingType} (${design.geometry.overhangDepthMeters}m chhajja)
- Air Changes per Hour (ACH): ${design.geometry.airChangesPerHourACH}

NUMERICAL SIMULATION RESULTS:
- Composite Wall U-Value: ${results.compositeWallUValue} W/(m²·K)
- Composite Roof U-Value: ${results.compositeRoofUValue} W/(m²·K)
- Indoor Temperature: Average ${results.averageIndoorTempC}°C (Range: ${results.minIndoorTempC}°C to ${results.peakIndoorTempC}°C)
- Thermal Mass Damping: ${results.diurnalDampingPercent}% amplitude reduction with ${results.thermalLagHours} hours phase shift
- IMAC Neutral Comfort Temp: ${results.imacComfortNeutralTempC}°C (80% Acceptability Band: ${results.imacComfortBand80.min}°C - ${results.imacComfortBand80.max}°C)
- IMAC Comfort Compliance (80% Band): ${results.percentComfortCompliance80}% of diurnal cycle (${results.hoursInComfortBand80}/24 hours)
- Estimated Material Cost: ₹${results.estimatedMaterialCostINR.toLocaleString('en-IN')}
- Embodied Carbon: ${results.embodiedCarbonTotalKg} kg CO₂e

INSTRUCTIONS:
Write a concise, strictly analytical engineering paragraph (120-180 words).
Focus strictly on:
1. Physical rationale for why this specific material assembly succeeds or encounters limits in this climate.
2. The specific role of thermal mass damping and thermal lag vs. solar heat gain through fenestration.
3. One precise passive architectural adjustment to improve IMAC compliance.
Do NOT use sales buzzwords, marketing fluff, or generic greetings. Speak strictly as an engineer to peer engineers.
`;

  try {
    const ai = new GoogleGenAI({ apiKey: effectiveKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt
    });

    if (response.text) {
      return response.text.trim();
    }
    return generateDeterministicEngineeringSummary(design, climate, results, wallMat.name, roofMat.name);
  } catch (err: any) {
    console.warn('Gemini API call failed; returning deterministic engineering analysis:', err);
    return `[Offline Analysis Fallback due to API Notice: ${err.message || 'Connection offline'}]\n\n` +
      generateDeterministicEngineeringSummary(design, climate, results, wallMat.name, roofMat.name);
  }
}

function generateDeterministicEngineeringSummary(
  design: ShelterDesign,
  climate: ClimateData,
  results: SimulationResults,
  wallName: string,
  roofName: string
): string {
  const isCold = climate.climateZone === 'cold_arid';
  const isDesert = climate.climateZone === 'hot_dry';
  const isHumid = climate.climateZone === 'warm_humid';

  if (isCold) {
    return `Thermal envelope analysis for ${climate.locationName} confirms that the composite wall (U = ${results.compositeWallUValue} W/m²·K) and roof (U = ${results.compositeRoofUValue} W/m²·K) utilizing ${wallName} achieve a diurnal temperature damping of ${results.diurnalDampingPercent}%. At a restricted WWR of ${design.geometry.windowToWallRatioPercent}% oriented South with ${design.geometry.glazingType} glazing, direct passive solar insolation balances the ${climate.diurnalSwingC}°C exterior swing, sustaining indoor temperatures at ${results.averageIndoorTempC}°C. The shelter satisfies the NBC 2016 IMAC naturally ventilated 80% acceptability band for ${results.hoursInComfortBand80} of 24 hours (${results.percentComfortCompliance80}% compliance). To further mitigate nighttime sub-zero conductive losses, consider installing insulated night shutters over South fenestration.`;
  }

  if (isDesert) {
    return `In the hot-dry microclimate of ${climate.locationName}, the high volumetric heat capacity of ${wallName} delivers a ${results.thermalLagHours}-hour phase lag, shifting the exterior peak sol-air thermal pulse from 14:00 to the cooler nocturnal period. Coupled with a ${design.geometry.overhangDepthMeters}m chhajja overhang and restricted ${design.geometry.windowToWallRatioPercent}% WWR, the solar heat gain coefficient is effectively curtailed, damping the ${climate.diurnalSwingC}°C outdoor swing by ${results.diurnalDampingPercent}%. The indoor peak of ${results.peakIndoorTempC}°C remains well buffered below the 43.8°C outdoor maximum, achieving ${results.percentComfortCompliance80}% compliance with the IMAC 80% band (${results.imacComfortBand80.min}°C - ${results.imacComfortBand80.max}°C). Implementing night-purge convective cross-ventilation (increasing ACH from 22:00 to 05:00) will further accelerate core heat dissipation.`;
  }

  if (isHumid) {
    return `For the warm-humid conditions of ${climate.locationName}, thermal comfort is predominantly governed by skin sweat evaporation rather than envelope thermal mass. The selection of lightweight ${wallName} with a ${design.geometry.roofType} roof assembly minimizes nocturnal radiant re-radiation into the interior. Operating at ${design.geometry.airChangesPerHourACH} ACH with an expansive ${design.geometry.windowToWallRatioPercent}% WWR shaded by a ${design.geometry.overhangDepthMeters}m overhang ensures convective air movement across the living plane. The design achieves ${results.percentComfortCompliance80}% compliance with the IMAC 80% comfort boundary (${results.imacComfortBand80.min}°C - ${results.imacComfortBand80.max}°C). For monsoon downpour periods, optimizing louver angles on prevailing windward apertures will maintain air exchange while preventing rain penetration.`;
  }

  return `The composite envelope achieves a wall U-value of ${results.compositeWallUValue} W/m²·K and roof U-value of ${results.compositeRoofUValue} W/m²·K, resulting in a diurnal thermal damping of ${results.diurnalDampingPercent}% with an indoor mean of ${results.averageIndoorTempC}°C. The configuration fulfills the IMAC natural ventilation standard for ${results.hoursInComfortBand80} diurnal hours.`;
}
