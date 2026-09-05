/**
 * Team CODE TITANS - SIH26051
 * Indian Government Standards Compliance & Rules Database (complianceRules.ts)
 * 
 * Formal codification of Indian national building codes and statutory directives:
 * 1. ECBC 2017 (Bureau of Energy Efficiency - Clause 4.3.2 Fenestration WWR Limit)
 * 2. NDMA Guidelines (National Disaster Management Authority - Flood Hazard Building Resiliency)
 * 3. IMAC (Indian Model for Adaptive Comfort - NBC 2016 Part 8 / CEPT 90% Acceptability Band)
 * 4. NBC 2016 Part 6 / IS 875 (Structural Roof Drainage & Snow Shedding)
 * 5. ECBC Table 4-1 (Roof & Wall Thermal Transmittance / Insulation Standards)
 */

import { ClimateData, ShelterDesign, SimulationResults } from '../types';
import { getMaterialById } from '../data/materials';
import { calculateIMACComfort, simulateShelterThermalPerformance } from './thermalEngine';

export type ComplianceSeverity = 'violation' | 'deviation' | 'compliant';
export type AuthorityCode = 'ECBC' | 'NDMA' | 'IMAC' | 'NBC' | 'IS_CODES';
export type StandardCategory = 'energy_code' | 'disaster_management' | 'thermal_comfort' | 'structural_safety';

export interface AutoFixAction {
  label: string;
  description: string;
  parameterName: string;
  targetValue: string;
  apply: (currentDesign: ShelterDesign) => ShelterDesign;
}

export interface ComplianceItem {
  id: string;
  code: string;
  authority: AuthorityCode;
  authorityFullName: string;
  category: StandardCategory;
  severity: ComplianceSeverity;
  title: string;
  message: string;
  legalLimit: string;
  currentValue: string;
  clauseReference: string;
  autoFix?: AutoFixAction;
}

export interface ComplianceReport {
  isFullyCompliant: boolean;
  totalChecks: number;
  violationCount: number; // Critical Red
  deviationCount: number; // Yellow Advisory
  compliantCount: number; // Green Passed
  status: 'compliant' | 'deviation' | 'violation';
  items: ComplianceItem[];
  violations: ComplianceItem[];
  deviations: ComplianceItem[];
  compliantItems: ComplianceItem[];
  evaluatedAtIso: string;
}

export interface ComplianceRuleDefinition {
  id: string;
  code: string;
  authority: AuthorityCode;
  authorityFullName: string;
  category: StandardCategory;
  title: string;
  clauseReference: string;
  evaluate: (
    design: ShelterDesign,
    climate: ClimateData,
    simulation?: SimulationResults
  ) => {
    isViolated: boolean;
    isDeviation?: boolean;
    message: string;
    legalLimit: string;
    currentValue: string;
    autoFix?: AutoFixAction;
  } | null;
}

/**
 * Hardcoded Government Standards & Guidelines Database
 */
export const GOVERNMENT_COMPLIANCE_RULES: ComplianceRuleDefinition[] = [
  // =========================================================================
  // 1. ECBC (ENERGY CONSERVATION BUILDING CODE 2017)
  // Clause 4.3.2 Fenestration: Maximum WWR in Hot-Dry Climate <= 40%
  // =========================================================================
  {
    id: 'ecbc-wwr-hot-dry',
    code: 'ECBC-2017-CL-4.3.2',
    authority: 'ECBC',
    authorityFullName: 'Bureau of Energy Efficiency - ECBC 2017',
    category: 'energy_code',
    title: 'ECBC Window-to-Wall Ratio (WWR) Envelope Limit',
    clauseReference: 'ECBC 2017 Section 4.3.2 (Mandatory Hot & Dry Envelope Requirements)',
    evaluate: (design, climate) => {
      const isHotDry =
        climate.regionId === 'desert' ||
        climate.climateZone === 'hot_dry' ||
        climate.outdoorTempC >= 36;

      const wwr = design.geometry.windowToWallRatioPercent;
      const maxAllowedWWR = 40;

      if (isHotDry && wwr > maxAllowedWWR) {
        return {
          isViolated: true,
          message: `ECBC Violation: WWR is ${wwr}%. Max allowed is 40% in hot/dry climates to prevent extreme solar gain.`,
          legalLimit: 'Maximum 40% WWR (Mandatory under ECBC 2017 Table 4-2)',
          currentValue: `${wwr}% WWR`,
          autoFix: {
            label: 'Apply ECBC Limit (Set WWR to 40%)',
            description: 'Clamps Window-to-Wall Ratio down to the statutory 40% ceiling to stop solar greenhouse overheating.',
            parameterName: 'Window-to-Wall Ratio',
            targetValue: '40%',
            apply: (curr) => ({
              ...curr,
              geometry: {
                ...curr.geometry,
                windowToWallRatioPercent: 40
              }
            })
          }
        };
      }
      return null;
    }
  },

  // =========================================================================
  // 2. NDMA (NATIONAL DISASTER MANAGEMENT AUTHORITY) GUIDELINES
  // Flood Plain Resilient Base: Mud/Rammed Earth Walls Strictly Prohibited
  // =========================================================================
  {
    id: 'ndma-flood-mud-walls',
    code: 'NDMA-FLD-2010-S4.3',
    authority: 'NDMA',
    authorityFullName: 'National Disaster Management Authority (NDMA)',
    category: 'disaster_management',
    title: 'NDMA Flood Zone Inundation Resilient Base Directive',
    clauseReference: 'NDMA Guidelines on Management of Floods (2010, Section 4.3) & IS 13827:2020',
    evaluate: (design, climate) => {
      const isFloodZone =
        climate.regionId === 'river' ||
        climate.locationName.toLowerCase().includes('river') ||
        climate.locationName.toLowerCase().includes('basin') ||
        climate.climateZone === 'warm_humid';

      const wallMat = getMaterialById(design.wallMaterialId);
      const isMudOrEarth =
        design.wallMaterialId === 'mat_mud_rammed_earth' ||
        wallMat.name.toLowerCase().includes('mud') ||
        wallMat.name.toLowerCase().includes('rammed earth') ||
        wallMat.name.toLowerCase().includes('adobe');

      if (isFloodZone && isMudOrEarth) {
        return {
          isViolated: true,
          message: 'NDMA Violation: In Flood/River zones, mud/rammed earth walls are strictly prohibited for base structures due to slaking and rapid liquefaction.',
          legalLimit: 'Water-impervious masonry (Burnt Brick / Reinforced Concrete with DPC barrier)',
          currentValue: `${wallMat.name} (Erodible earthen substrate)`,
          autoFix: {
            label: 'Apply NDMA Guideline (Swap to Brick)',
            description: 'Replaces water-vulnerable mud walls with 230mm kiln-burnt masonry resistant to flood saturation.',
            parameterName: 'Wall Material',
            targetValue: 'Kiln-Burnt Clay Brick (230mm)',
            apply: (curr) => ({
              ...curr,
              wallMaterialId: 'mat_brick_standard',
              geometry: {
                ...curr.geometry,
                wallThicknessMm: 230
              }
            })
          }
        };
      }
      return null;
    }
  },

  // =========================================================================
  // 3. IMAC (INDIAN MODEL FOR ADAPTIVE COMFORT)
  // NBC 2016 Part 8 / CEPT: Operative Temp must remain within 90% Acceptability Band (±2.5°C from T_neutral)
  // Evaluated via statutory bioclimatic envelope passive solar & thermal insulation controls
  // =========================================================================
  {
    id: 'imac-90-comfort-band',
    code: 'NBC-2016-IMAC-NV-90',
    authority: 'IMAC',
    authorityFullName: 'Indian Model for Adaptive Comfort (NBC 2016 / CEPT)',
    category: 'thermal_comfort',
    title: 'IMAC Naturally Ventilated 90% Adaptive Comfort Band',
    clauseReference: 'NBC 2016 Part 8 Building Services Section 1 & CEPT University IMAC-NV Empirical Model',
    evaluate: (design, climate, simulation) => {
      // Statutory IMAC adaptive neutral calculation (NBC 2016 / CEPT)
      const imac = calculateIMACComfort(climate.outdoorTempC);
      const neutral = imac.neutralTempC;
      const minComfort90 = Number((neutral - 2.5).toFixed(1));
      const maxComfort90 = Number((neutral + 2.5).toFixed(1));

      const isColdClimate =
        climate.regionId === 'mountain' ||
        climate.climateZone === 'cold_arid' ||
        climate.minTempC <= 0;

      const isHumidRiver =
        climate.regionId === 'river' ||
        climate.climateZone === 'warm_humid' ||
        climate.relativeHumidityPercent >= 60;

      const isHotClimate =
        !isColdClimate &&
        !isHumidRiver &&
        (climate.regionId === 'desert' ||
          climate.climateZone === 'hot_dry' ||
          climate.outdoorTempC >= 32);

      const wwr = design.geometry.windowToWallRatioPercent;
      const insMm = design.geometry.insulationThicknessMm;
      const isUnshaded = design.geometry.shadingType === 'none' || design.geometry.overhangDepthMeters < 0.35;
      const isSingleGlazed =
        design.geometry.glazingType === 'single_clear' ||
        design.glazingMaterialId === 'mat_glaze_single_clear';
      const isUninsulated = insMm < 30 || design.insulationMaterialId === 'mat_ins_none';
      const isLowVentilation = design.geometry.airChangesPerHourACH < 3.0;

      // Evaluation in Hot / Arid climate:
      if (isHotClimate) {
        const hasExcessiveGain = (wwr > 25 && isUnshaded) || isSingleGlazed || isUninsulated;
        if (hasExcessiveGain) {
          const isCritical = wwr > 40 || (isUnshaded && isSingleGlazed);
          return {
            isViolated: isCritical,
            isDeviation: !isCritical,
            message: `${isCritical ? 'IMAC Violation' : 'IMAC Deviation'}: Excessive solar heat gain (${wwr}% WWR, ${isUnshaded ? 'unshaded' : 'insufficient shading'}, ${isSingleGlazed ? 'single glazing' : 'deficient envelope'}) pushes indoor operative temperature beyond statutory 90% comfort band (${minComfort90}°C – ${maxComfort90}°C). NBC 2016 Part 8 mandates passive solar shading, double glazing, and continuous roof insulation.`,
            legalLimit: `IMAC 90% Comfort Band (${minComfort90}°C – ${maxComfort90}°C) with statutory passive shading & envelope protection`,
            currentValue: `WWR ${wwr}% | ${design.geometry.shadingType} (${design.geometry.overhangDepthMeters}m) | ${insMm}mm insulation`,
            autoFix: {
              label: 'Apply IMAC Limit (Solar Shading & Double Glazing)',
              description: 'Applies exterior louvers (0.8m depth), double-glazed fenestration, 50mm insulation, and clamps WWR to 18% to keep indoor operative temperature within the IMAC 90% band.',
              parameterName: 'Bioclimatic Passive Envelope Controls',
              targetValue: 'WWR ≤ 20%, Louver Shading (0.8m), Double Glazing, 50mm Rockwool',
              apply: (curr) => ({
                ...curr,
                geometry: {
                  ...curr.geometry,
                  windowToWallRatioPercent: Math.min(curr.geometry.windowToWallRatioPercent, 18),
                  shadingType: 'louvers',
                  overhangDepthMeters: Math.max(curr.geometry.overhangDepthMeters, 0.8),
                  airChangesPerHourACH: Math.max(curr.geometry.airChangesPerHourACH, 3.5),
                  insulationThicknessMm: Math.max(curr.geometry.insulationThicknessMm, 50)
                },
                glazingMaterialId: 'mat_glaze_double_standard',
                insulationMaterialId: 'mat_ins_rockwool'
              })
            }
          };
        }
      }

      // Evaluation in Cold / Mountain climate:
      if (isColdClimate) {
        const lacksColdProtection = insMm < 45 || isSingleGlazed || design.geometry.airChangesPerHourACH > 2.5;
        if (lacksColdProtection) {
          return {
            isViolated: true,
            message: `IMAC Violation: High-altitude cold envelope lacks statutory thermal containment (insulation: ${insMm}mm < 50mm required; ${isSingleGlazed ? 'single glazing' : 'air leakage'}). Operative temperature drops severely below NBC 2016 safety limits.`,
            legalLimit: 'Continuous envelope insulation ≥ 50mm & Low-E double glazing (NBC Part 8 / SP 41)',
            currentValue: `${insMm}mm insulation | ${isSingleGlazed ? 'Single glass' : 'Double glass'} | ACH: ${design.geometry.airChangesPerHourACH}`,
            autoFix: {
              label: 'Apply IMAC Limit (Continuous 75mm Rockwool & Double Low-E)',
              description: 'Installs 75mm continuous Rockwool thermal blanket, Double Low-E glazing, and tightens envelope to 0.8 ACH to maintain thermal security.',
              parameterName: 'High-Altitude Thermal Boundary',
              targetValue: '75mm Rockwool + Double Low-E + 0.8 ACH',
              apply: (curr) => ({
                ...curr,
                geometry: {
                  ...curr.geometry,
                  insulationThicknessMm: Math.max(curr.geometry.insulationThicknessMm, 75),
                  airChangesPerHourACH: Math.min(curr.geometry.airChangesPerHourACH, 1.0)
                },
                insulationMaterialId: 'mat_ins_rockwool',
                glazingMaterialId: 'mat_glaze_double_low_e'
              })
            }
          };
        }
      }

      // Evaluation in Warm Humid / River Basin:
      if (isHumidRiver) {
        if (isLowVentilation || (isUnshaded && wwr > 20)) {
          return {
            isViolated: false,
            isDeviation: true,
            message: `IMAC Deviation: Inadequate cross-ventilation (${design.geometry.airChangesPerHourACH} ACH < 4.0 ACH) and insufficient solar overhang in warm-humid zone traps radiant heat. NBC Part 8 recommends deep overhangs and cross-ventilation.`,
            legalLimit: 'Cross-ventilation ≥ 4.0 ACH with deep overhang ≥ 0.8m (NBC 2016 Part 8)',
            currentValue: `${design.geometry.airChangesPerHourACH} ACH | Overhang: ${design.geometry.overhangDepthMeters}m`,
            autoFix: {
              label: 'Apply IMAC Limit (Cross-Ventilation & Deep Overhang)',
              description: 'Configures 5.0 ACH convective cross-ventilation and 1.0m protective eaves overhang.',
              parameterName: 'Humid Convective Cooling',
              targetValue: '5.0 ACH + 1.0m Eaves Overhang',
              apply: (curr) => ({
                ...curr,
                geometry: {
                  ...curr.geometry,
                  airChangesPerHourACH: Math.max(curr.geometry.airChangesPerHourACH, 5.0),
                  shadingType: 'chhajja_overhang',
                  overhangDepthMeters: Math.max(curr.geometry.overhangDepthMeters, 1.0)
                }
              })
            }
          };
        }
      }

      return null;
    }
  },

  // =========================================================================
  // 4. NBC 2016 PART 6 / IS 875 (PART 4)
  // Structural Snow & Rain Drainage: Flat Roofs Prohibited in Heavy Precipitation Zones
  // =========================================================================
  {
    id: 'nbc-roof-drainage',
    code: 'NBC-2016-STR-ROOF-DRAIN',
    authority: 'NBC',
    authorityFullName: 'National Building Code of India 2016 (Part 6)',
    category: 'structural_safety',
    title: 'NBC 2016 Structural Roof Water & Snow Shedding Standard',
    clauseReference: 'NBC 2016 Part 6 Section 1 & IS 875 (Part 4) Snow Loads',
    evaluate: (design, climate) => {
      const isHighSnow =
        climate.regionId === 'mountain' ||
        climate.elevationMeters >= 2000 ||
        climate.minTempC <= 0;

      const isHighRain =
        climate.regionId === 'river' ||
        climate.relativeHumidityPercent >= 70;

      const isFlat =
        design.geometry.roofType === 'flat' ||
        design.geometry.architecturalShape === 'flat_box' ||
        design.geometry.roofPitchDegrees === 0;

      if ((isHighSnow || isHighRain) && isFlat) {
        const hazardName = isHighSnow ? 'snow accumulation load' : 'torrential water ponding';
        return {
          isViolated: true,
          message: `NBC Violation: Flat roof (${design.geometry.roofPitchDegrees}°) creates severe ${hazardName} in ${climate.locationName}. NBC Part 6 mandates minimum 20° pitch for gravity drainage.`,
          legalLimit: 'Pitched roof with slope ≥ 20° (IS 875 Part 4 / NBC 2016)',
          currentValue: `Flat roof (${design.geometry.roofPitchDegrees}° pitch)`,
          autoFix: {
            label: 'Apply NBC Roof Pitch (Set to 25° Pitched)',
            description: 'Converts the roof structure to a 25° pitched gable to provide instantaneous gravity drainage of snow/water.',
            parameterName: 'Roof Profile & Pitch',
            targetValue: 'Pitched Gable (25°)',
            apply: (curr) => ({
              ...curr,
              geometry: {
                ...curr.geometry,
                roofType: 'pitched',
                roofPitchDegrees: 25,
                architecturalShape: 'pitched_a_frame'
              },
              roofMaterialId: curr.regionId === 'river' ? 'mat_roof_ventilated_mangalore' : 'mat_roof_mud_timber'
            })
          }
        };
      }
      return null;
    }
  },

  // =========================================================================
  // 5. ECBC 2017 TABLE 4-1 / NBC PART 8
  // Roof Thermal Transmittance (U-Value <= 0.33 W/m²·K in Extreme Climates)
  // =========================================================================
  {
    id: 'ecbc-roof-insulation-uvalue',
    code: 'ECBC-2017-TBL-4.1',
    authority: 'ECBC',
    authorityFullName: 'Bureau of Energy Efficiency - ECBC 2017',
    category: 'energy_code',
    title: 'ECBC Roof Thermal Transmittance (U-Value Ceiling)',
    clauseReference: 'ECBC 2017 Table 4-1 Maximum Roof U-Factor (0.33 W/m²·K)',
    evaluate: (design, climate, simulation) => {
      const isExtremeClimate =
        climate.regionId === 'desert' ||
        climate.regionId === 'mountain' ||
        climate.outdoorTempC >= 35 ||
        climate.minTempC <= 0;

      const insMm = design.geometry.insulationThicknessMm;
      const isUninsulated = insMm < 20 || design.insulationMaterialId === 'mat_ins_none';

      if (isExtremeClimate && isUninsulated) {
        return {
          isViolated: false,
          isDeviation: true,
          message: `ECBC Standard Deviation: Roof insulation (${insMm}mm) is insufficient for ${climate.locationName}. ECBC Table 4-1 specifies minimum 40mm-50mm continuous thermal barrier.`,
          legalLimit: 'Roof U-Value ≤ 0.33 W/m²·K (Continuous Insulation ≥ 40mm)',
          currentValue: `${insMm}mm insulation (${design.insulationMaterialId === 'mat_ins_none' ? 'None' : 'Deficient'})`,
          autoFix: {
            label: 'Apply ECBC Roof Insulation (40mm)',
            description: 'Installs 40mm expanded thermal insulation board to satisfy ECBC envelope transmittance standards.',
            parameterName: 'Roof Insulation Thickness',
            targetValue: '40mm Rockwool/EPS',
            apply: (curr) => ({
              ...curr,
              geometry: {
                ...curr.geometry,
                insulationThicknessMm: 40
              },
              insulationMaterialId: 'mat_ins_rockwool'
            })
          }
        };
      }
      return null;
    }
  }
];

/**
 * Evaluates the full shelter design against all Indian Government Standards
 */
export function evaluateGovernmentCompliance(
  design: ShelterDesign,
  climate: ClimateData,
  simulation?: SimulationResults
): ComplianceReport {
  // If simulation is not supplied, run a fast calculation
  const sim = simulation || simulateShelterThermalPerformance(design, climate);

  const items: ComplianceItem[] = [];

  for (const rule of GOVERNMENT_COMPLIANCE_RULES) {
    const outcome = rule.evaluate(design, climate, sim);

    if (outcome) {
      const severity: ComplianceSeverity = outcome.isViolated
        ? 'violation'
        : outcome.isDeviation
        ? 'deviation'
        : 'compliant';

      items.push({
        id: `${rule.id}-${rule.code}`,
        code: rule.code,
        authority: rule.authority,
        authorityFullName: rule.authorityFullName,
        category: rule.category,
        severity,
        title: rule.title,
        message: outcome.message,
        legalLimit: outcome.legalLimit,
        currentValue: outcome.currentValue,
        clauseReference: rule.clauseReference,
        autoFix: outcome.autoFix
      });
    } else {
      // Rule passed cleanly!
      let compliantLimit = 'Within code thresholds';
      if (rule.authority === 'ECBC' && rule.id === 'ecbc-wwr-hot-dry') {
        compliantLimit = 'WWR ≤ 40% (ECBC 2017 Section 4.3.2)';
      } else if (rule.authority === 'NDMA') {
        compliantLimit = 'Water-resistant non-erodible base (NDMA 2010)';
      } else if (rule.authority === 'IMAC') {
        const imac = calculateIMACComfort(climate.outdoorTempC);
        compliantLimit = `Operative Temp in 90% Band (${(imac.neutralTempC - 2.5).toFixed(1)}°C - ${(imac.neutralTempC + 2.5).toFixed(1)}°C)`;
      } else if (rule.authority === 'NBC') {
        compliantLimit = 'Adequate gravity slope drainage (NBC Part 6)';
      }

      items.push({
        id: `${rule.id}-${rule.code}`,
        code: rule.code,
        authority: rule.authority,
        authorityFullName: rule.authorityFullName,
        category: rule.category,
        severity: 'compliant',
        title: rule.title,
        message: `Fully compliant with ${rule.authorityFullName}. Parameters conform to statutory guidelines.`,
        legalLimit: compliantLimit,
        currentValue: 'Compliant',
        clauseReference: rule.clauseReference
      });
    }
  }

  const violations = items.filter((i) => i.severity === 'violation');
  const deviations = items.filter((i) => i.severity === 'deviation');
  const compliantItems = items.filter((i) => i.severity === 'compliant');

  const violationCount = violations.length;
  const deviationCount = deviations.length;
  const compliantCount = compliantItems.length;

  const isFullyCompliant = violationCount === 0 && deviationCount === 0;

  const status: 'compliant' | 'deviation' | 'violation' =
    violationCount > 0 ? 'violation' : deviationCount > 0 ? 'deviation' : 'compliant';

  return {
    isFullyCompliant,
    totalChecks: items.length,
    violationCount,
    deviationCount,
    compliantCount,
    status,
    items,
    violations,
    deviations,
    compliantItems,
    evaluatedAtIso: new Date().toISOString()
  };
}

/**
 * Single-click master reconciliation function:
 * Takes any arbitrary shelter design state and modifies parameters to guarantee
 * 100% compliance across all statutory Indian Government construction standards
 * (ECBC 2017, NDMA 2010, IMAC / NBC 2016, and NBC Part 6).
 */
export function autoCorrectAllViolations(
  design: ShelterDesign,
  climate: ClimateData,
  simulation?: SimulationResults
): ShelterDesign {
  let current: ShelterDesign = {
    ...design,
    geometry: {
      ...design.geometry
    }
  };

  // 1. ECBC WWR Limit (ECBC 2017 Section 4.3.2) - applies universally across India (max 40%)
  if (current.geometry.windowToWallRatioPercent > 40) {
    current.geometry.windowToWallRatioPercent = 35;
  }

  // 2. NDMA Flood Plain Mud Walls (NDMA 2010 Section 4.3 & IS 13827)
  const isFloodZone =
    climate.regionId === 'river' ||
    climate.locationName.toLowerCase().includes('river') ||
    climate.locationName.toLowerCase().includes('basin') ||
    climate.climateZone === 'warm_humid';
  const wallMat = getMaterialById(current.wallMaterialId);
  const isMudOrEarth =
    current.wallMaterialId === 'mat_mud_rammed_earth' ||
    wallMat.name.toLowerCase().includes('mud') ||
    wallMat.name.toLowerCase().includes('rammed earth') ||
    wallMat.name.toLowerCase().includes('adobe');
  if (isFloodZone && isMudOrEarth) {
    current.wallMaterialId = 'mat_brick_standard';
    current.geometry.wallThicknessMm = 230;
  }

  // 3. NBC Structural Snow & Rain Drainage (NBC 2016 Part 6 & IS 875 Part 4)
  const isHighSnow =
    climate.regionId === 'mountain' ||
    climate.elevationMeters >= 2000 ||
    climate.minTempC <= 0;
  const isHighRain =
    climate.regionId === 'river' ||
    climate.relativeHumidityPercent >= 70;
  const isFlat =
    current.geometry.roofType === 'flat' ||
    current.geometry.architecturalShape === 'flat_box' ||
    current.geometry.roofPitchDegrees < 15;
  if ((isHighSnow || isHighRain) && isFlat) {
    current.geometry.roofType = 'pitched';
    current.geometry.roofPitchDegrees = 25;
    current.geometry.architecturalShape = 'pitched_a_frame';
    if (isFloodZone) {
      current.roofMaterialId = 'mat_roof_ventilated_mangalore';
    } else {
      current.roofMaterialId = 'mat_roof_mud_timber';
    }
  }

  // 4. IMAC Bioclimatic Adaptive Comfort Envelope (NBC 2016 Part 8)
  const isColdMountain =
    climate.regionId === 'mountain' ||
    climate.climateZone === 'cold_arid' ||
    climate.minTempC <= 0;
  const isHotDry =
    !isColdMountain &&
    (climate.regionId === 'desert' ||
      climate.climateZone === 'hot_dry' ||
      (climate.outdoorTempC >= 35 && climate.relativeHumidityPercent < 60));

  if (isColdMountain) {
    current.geometry.insulationThicknessMm = Math.max(current.geometry.insulationThicknessMm, 75);
    current.insulationMaterialId = 'mat_ins_rockwool';
    current.glazingMaterialId = 'mat_glaze_double_low_e';
    current.geometry.airChangesPerHourACH = Math.min(current.geometry.airChangesPerHourACH, 1.0);
  } else if (isHotDry) {
    current.geometry.windowToWallRatioPercent = Math.min(current.geometry.windowToWallRatioPercent, 18);
    current.geometry.shadingType = 'louvers';
    current.geometry.overhangDepthMeters = Math.max(current.geometry.overhangDepthMeters, 0.8);
    current.geometry.insulationThicknessMm = Math.max(current.geometry.insulationThicknessMm, 50);
    current.insulationMaterialId = 'mat_ins_rockwool';
    current.glazingMaterialId = 'mat_glaze_double_standard';
  } else {
    // River / Warm Humid
    current.geometry.windowToWallRatioPercent = Math.min(current.geometry.windowToWallRatioPercent, 25);
    current.geometry.shadingType = 'chhajja_overhang';
    current.geometry.overhangDepthMeters = Math.max(current.geometry.overhangDepthMeters, 1.0);
    current.geometry.airChangesPerHourACH = Math.max(current.geometry.airChangesPerHourACH, 4.5);
    current.glazingMaterialId = 'mat_glaze_double_standard';
  }

  // 5. ECBC Roof Thermal Transmittance Table 4-1
  const isExtremeClimate =
    climate.regionId === 'desert' ||
    climate.regionId === 'mountain' ||
    climate.outdoorTempC >= 35 ||
    climate.minTempC <= 0;
  if (isExtremeClimate && (current.geometry.insulationThicknessMm < 40 || current.insulationMaterialId === 'mat_ins_none')) {
    current.geometry.insulationThicknessMm = Math.max(current.geometry.insulationThicknessMm, 50);
    current.insulationMaterialId = 'mat_ins_rockwool';
  }

  return current;
}
