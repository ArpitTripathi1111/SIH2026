/**
 * Team CODE TITANS - SIH26051
 * Problem Statement: Software Based Model Development for Design of Area-Specific Shelter for Thermal Comfort Maintenance
 * 
 * Architectural Geometry Solver & Dynamic Bill of Quantities (BOQ) Calculator
 * 
 * Mathematical Equations:
 * 1. Flat-Roof Box: Standard orthogonal prism V = L*W*H, S = 2(L+W)H + L*W
 * 2. Pitched / A-Frame: Triangular gable volume V = L*W*H + 0.5*W*H_rise*L, Rafter length = sqrt((W/2)^2 + H_rise^2)
 * 3. Vaulted / Dome: Catenary/parabolic arch volume V = L*(W*H_knee + (2/3)*W*H_arch), Arc length = W*(1 + (2/3)*(2*H_arch/W)^2)
 * 4. Lean-to / Sloped: Mono-pitch slope V = L*W*H_avg, Rafter slope length = sqrt(W^2 + H_delta^2)
 */

import {
  ArchitecturalShape,
  BillOfQuantities,
  BOQItem,
  MaterialProperty,
  ShelterGeometry
} from '../types';

export interface ShapeGeometryMetrics {
  shape: ArchitecturalShape;
  lengthMeters: number;
  widthMeters: number;
  heightMeters: number;
  floorAreaM2: number;
  grossWallAreaM2: number;
  windowAreaM2: number;
  netWallAreaM2: number;
  roofAreaM2: number;
  internalVolumeM3: number;
  totalEnvelopeAreaM2: number;
  surfaceAreaToVolumeRatio: number;
  apexRiseMeters: number;
  shapeEffectiveSolarFactor: number;
  eavesHeightMeters: number;
  peakHeightMeters: number;
}

/**
 * Resolves architectural shape cleanly, defaulting to 'flat_box' or mapping from roofType if omitted.
 */
export function resolveArchitecturalShape(geometry: ShelterGeometry): ArchitecturalShape {
  if (geometry.architecturalShape) {
    return geometry.architecturalShape;
  }
  if (geometry.roofType === 'vaulted') {
    return 'vaulted_dome';
  }
  if (geometry.roofType === 'pitched' || geometry.roofType === 'ventilated_cavity') {
    return 'pitched_a_frame';
  }
  return 'flat_box';
}

/**
 * Computes exact mathematical surface areas, internal volumes, and S/V ratios for all 4 architectural forms.
 */
export function calculateShapeGeometry(geometry: ShelterGeometry): ShapeGeometryMetrics {
  const shape = resolveArchitecturalShape(geometry);
  const L = Number.isFinite(geometry.lengthMeters) && geometry.lengthMeters > 0 ? geometry.lengthMeters : 6.0;
  const W = Number.isFinite(geometry.widthMeters) && geometry.widthMeters > 0 ? geometry.widthMeters : 4.5;
  const H = Number.isFinite(geometry.heightMeters) && geometry.heightMeters > 0 ? geometry.heightMeters : 3.0;
  const overhang = Number.isFinite(geometry.overhangDepthMeters) ? Math.max(0, geometry.overhangDepthMeters) : 0.6;
  const wwr = Number.isFinite(geometry.windowToWallRatioPercent) ? Math.max(0, Math.min(60, geometry.windowToWallRatioPercent)) : 15;

  const floorArea = Number((L * W).toFixed(2));

  let grossWallArea = 0;
  let roofArea = 0;
  let internalVolume = 0;
  let apexRise = 0;
  let shapeSolarFactor = 1.0;
  let eavesHeight = H;
  let peakHeight = H;

  switch (shape) {
    case 'pitched_a_frame': {
      // Pitched / A-frame roof with triangular gables
      const pitchDeg = Number.isFinite(geometry.roofPitchDegrees) && geometry.roofPitchDegrees > 0
        ? geometry.roofPitchDegrees
        : 26;
      const pitchRad = (pitchDeg * Math.PI) / 180;
      apexRise = (W / 2) * Math.tan(pitchRad);
      eavesHeight = H;
      peakHeight = H + apexRise;

      // Rafter slope length with overhang extension
      const rafterHalfSpan = (W / 2) / Math.cos(pitchRad);
      const extendedRafter = rafterHalfSpan + overhang;
      const extendedRidgeLength = L + 2 * overhang;

      // Sloping roof area (2 pitches)
      roofArea = 2 * extendedRafter * extendedRidgeLength;

      // Walls: 2 longitudinal walls (L * H) + 2 end walls with triangular gables (W * H + 0.5 * W * apexRise)
      const gableAreaPerEnd = 0.5 * W * apexRise;
      grossWallArea = 2 * (L * H) + 2 * (W * H + gableAreaPerEnd);

      // Volume: box portion + triangular prism attic
      const boxVolume = L * W * H;
      const atticVolume = 0.5 * W * apexRise * L;
      internalVolume = boxVolume + atticVolume;

      // Solar exposure factor: Pitched roof faces solar trajectory at angle
      shapeSolarFactor = 0.92;
      break;
    }

    case 'vaulted_dome': {
      // Arched catenary / barrel vault or dome geometry
      // Lower knee walls (40% height) with self-supporting compressive arch rise (60% height)
      const kneeHeight = Math.max(1.2, H * 0.4);
      const archRise = Math.max(1.2, H * 0.6);
      apexRise = archRise;
      eavesHeight = kneeHeight;
      peakHeight = kneeHeight + archRise;

      // Ramanujan approximation for semi-elliptic / parabolic arc length
      // Arc length spanning width W with rise archRise
      const hParam = Math.pow((W / 2 - archRise) / (W / 2 + archRise), 2);
      const approxArcLength = Math.PI * ((W / 2 + archRise) / 2) * (1 + (3 * hParam) / (10 + Math.sqrt(4 - 3 * hParam)));

      roofArea = (approxArcLength + 2 * overhang) * (L + 2 * overhang);

      // Gable ends (parabolic arch area = 2/3 * W * archRise)
      const archEndArea = (2 / 3) * W * archRise;
      const endWallArea = 2 * (W * kneeHeight + archEndArea);
      const sideWallArea = 2 * (L * kneeHeight);
      grossWallArea = sideWallArea + endWallArea;

      // Volume: knee wall box + parabolic vault
      internalVolume = (L * W * kneeHeight) + (L * archEndArea);

      // Crucial thermodynamic advantage: Vaulted dome minimizes solar gain at peak noon
      // because the curved tangent reflects oblique rays (diffused incidence)
      shapeSolarFactor = 0.78;
      break;
    }

    case 'lean_to': {
      // Mono-pitch sloped shelter (rapid assembly, directional drainage)
      // Slopes from high wall to low wall
      const slopeAngleDeg = 14;
      const slopeAngleRad = (slopeAngleDeg * Math.PI) / 180;
      const heightDelta = W * Math.tan(slopeAngleRad);

      const lowWall = Math.max(2.1, H - heightDelta / 2);
      const highWall = lowWall + heightDelta;
      eavesHeight = lowWall;
      peakHeight = highWall;
      apexRise = heightDelta;

      const rafterLength = W / Math.cos(slopeAngleRad) + 2 * overhang;
      roofArea = (L + 2 * overhang) * rafterLength;

      // Trapezoidal side walls (2 walls of area W * (lowWall + highWall)/2)
      // Longitudinal front (highWall * L) and back (lowWall * L)
      const avgWallH = (lowWall + highWall) / 2;
      grossWallArea = 2 * (W * avgWallH) + (L * highWall) + (L * lowWall);

      internalVolume = L * W * avgWallH;
      shapeSolarFactor = 0.95;
      break;
    }

    case 'flat_box':
    default: {
      // Standard rectangular prism baseline with 450mm parapet perimeter
      apexRise = 0;
      eavesHeight = H;
      peakHeight = H + 0.45; // including parapet
      roofArea = (L + 2 * overhang) * (W + 2 * overhang);

      // Gross wall area including 450mm parapet
      grossWallArea = 2 * (L + W) * H + 2 * (L + W) * 0.45;
      internalVolume = L * W * H;
      shapeSolarFactor = 1.0;
      break;
    }
  }

  // Window aperture deduction
  const windowArea = Number((grossWallArea * (wwr / 100)).toFixed(2));
  const netWallArea = Number(Math.max(1, grossWallArea - windowArea).toFixed(2));
  const totalEnvelopeArea = Number((grossWallArea + roofArea).toFixed(2));
  const surfaceAreaToVolumeRatio = Number((totalEnvelopeArea / Math.max(1, internalVolume)).toFixed(3));

  return {
    shape,
    lengthMeters: L,
    widthMeters: W,
    heightMeters: H,
    floorAreaM2: floorArea,
    grossWallAreaM2: Number(grossWallArea.toFixed(2)),
    windowAreaM2: windowArea,
    netWallAreaM2: netWallArea,
    roofAreaM2: Number(roofArea.toFixed(2)),
    internalVolumeM3: Number(internalVolume.toFixed(2)),
    totalEnvelopeAreaM2: totalEnvelopeArea,
    surfaceAreaToVolumeRatio,
    apexRiseMeters: Number(apexRise.toFixed(2)),
    shapeEffectiveSolarFactor: shapeSolarFactor,
    eavesHeightMeters: Number(eavesHeight.toFixed(2)),
    peakHeightMeters: Number(peakHeight.toFixed(2))
  };
}

/**
 * Generates an itemized Bill of Quantities (BOQ) with materials costs and embodied carbon
 * dynamically tailored to the selected architectural geometry.
 */
export function calculateBillOfQuantities(
  geometry: ShelterGeometry,
  wallMaterial: MaterialProperty,
  roofMaterial: MaterialProperty,
  insulationMaterial: MaterialProperty,
  glazingMaterial: MaterialProperty
): BillOfQuantities {
  const geom = calculateShapeGeometry(geometry);
  const insThicknessMm = Number.isFinite(geometry.insulationThicknessMm) ? geometry.insulationThicknessMm : 50;

  const items: BOQItem[] = [];

  // 1. Substructure Plinth Slab
  const plinthRate = 480; // ₹/m² (Rubble stone + lime concrete plinth)
  const plinthCarbonRate = 22; // kg CO2e/m²
  items.push({
    id: 'boq_substructure',
    category: 'substructure',
    description: `Plinth Beam & Anti-Capillary Base Slab (${geom.floorAreaM2} m²)`,
    unit: 'm²',
    quantity: geom.floorAreaM2,
    rateINR: plinthRate,
    amountINR: Math.round(geom.floorAreaM2 * plinthRate),
    carbonRateKgM2: plinthCarbonRate,
    totalCarbonKg: Math.round(geom.floorAreaM2 * plinthCarbonRate)
  });

  // 2. Structural Envelope Walls
  const wallRate = wallMaterial.costPerSquareMeterINR || 850;
  const wallCarbon = wallMaterial.embodiedCarbonKgCo2PerM2 || 45;
  items.push({
    id: 'boq_walls',
    category: 'walls',
    description: `${wallMaterial.name} Core Walls (${geometry.wallThicknessMm}mm thick, Net Area)`,
    unit: 'm²',
    quantity: geom.netWallAreaM2,
    rateINR: wallRate,
    amountINR: Math.round(geom.netWallAreaM2 * wallRate),
    carbonRateKgM2: wallCarbon,
    totalCarbonKg: Math.round(geom.netWallAreaM2 * wallCarbon)
  });

  // 3. Roof Assembly Weathering Deck
  const roofRate = roofMaterial.costPerSquareMeterINR || 650;
  const roofCarbon = roofMaterial.embodiedCarbonKgCo2PerM2 || 35;
  const shapeRoofLabel = geom.shape === 'vaulted_dome'
    ? 'Vaulted Arch Shell'
    : geom.shape === 'pitched_a_frame'
    ? 'Dual-Pitch Sloped Weathering Skin'
    : geom.shape === 'lean_to'
    ? 'Mono-Pitch Rafter Deck'
    : 'Terraced Flat Deck';

  items.push({
    id: 'boq_roof',
    category: 'roof',
    description: `${roofMaterial.name} — ${shapeRoofLabel}`,
    unit: 'm²',
    quantity: geom.roofAreaM2,
    rateINR: roofRate,
    amountINR: Math.round(geom.roofAreaM2 * roofRate),
    carbonRateKgM2: roofCarbon,
    totalCarbonKg: Math.round(geom.roofAreaM2 * roofCarbon)
  });

  // 4. Continuous Thermal Insulation
  const insRatio = insThicknessMm > 0 ? insThicknessMm / 50 : 0;
  const insRate = (insulationMaterial.costPerSquareMeterINR || 240) * insRatio;
  const insCarbon = (insulationMaterial.embodiedCarbonKgCo2PerM2 || 12) * insRatio;
  const totalInsulatedArea = geom.netWallAreaM2 + geom.roofAreaM2;

  if (insThicknessMm > 0) {
    items.push({
      id: 'boq_insulation',
      category: 'insulation',
      description: `${insulationMaterial.name} Batt/Board (${insThicknessMm}mm continuous layer)`,
      unit: 'm²',
      quantity: totalInsulatedArea,
      rateINR: Math.round(insRate),
      amountINR: Math.round(totalInsulatedArea * insRate),
      carbonRateKgM2: Math.round(insCarbon * 10) / 10,
      totalCarbonKg: Math.round(totalInsulatedArea * insCarbon)
    });
  }

  // 5. Fenestration / High Performance Glazing
  const glazeRate = glazingMaterial.costPerSquareMeterINR || 1450;
  const glazeCarbon = glazingMaterial.embodiedCarbonKgCo2PerM2 || 25;
  items.push({
    id: 'boq_fenestration',
    category: 'fenestration',
    description: `${glazingMaterial.name} Apertures (WWR ${geometry.windowToWallRatioPercent}%)`,
    unit: 'm²',
    quantity: geom.windowAreaM2,
    rateINR: glazeRate,
    amountINR: Math.round(geom.windowAreaM2 * glazeRate),
    carbonRateKgM2: glazeCarbon,
    totalCarbonKg: Math.round(geom.windowAreaM2 * glazeCarbon)
  });

  // 6. Structural Framing, Trusses & Formwork (Shape Dependent)
  let framingDesc = '';
  let framingRate = 0;
  let framingCarbon = 0;

  switch (geom.shape) {
    case 'pitched_a_frame':
      framingDesc = 'Timber King-Post Truss, Tie Beams & Roof Purlins';
      framingRate = 420;
      framingCarbon = 18;
      break;
    case 'vaulted_dome':
      framingDesc = 'Arched Centering Formwork, Compressive Tie Rods & Abutments';
      framingRate = 380;
      framingCarbon = 14;
      break;
    case 'lean_to':
      framingDesc = 'Single-Rake Rafter Poles, Eaves Fascia & Gutter Channel';
      framingRate = 220;
      framingCarbon = 11;
      break;
    case 'flat_box':
    default:
      framingDesc = 'Reinforced Slab Shuttering, Parapet Coping & Eaves Band';
      framingRate = 280;
      framingCarbon = 16;
      break;
  }

  items.push({
    id: 'boq_framing',
    category: 'structural_framing',
    description: framingDesc,
    unit: 'm²',
    quantity: geom.roofAreaM2,
    rateINR: framingRate,
    amountINR: Math.round(geom.roofAreaM2 * framingRate),
    carbonRateKgM2: framingCarbon,
    totalCarbonKg: Math.round(geom.roofAreaM2 * framingCarbon)
  });

  const totalCost = items.reduce((acc, it) => acc + it.amountINR, 0);
  const totalCarbon = items.reduce((acc, it) => acc + it.totalCarbonKg, 0);

  return {
    items,
    totalCostINR: totalCost,
    costPerFloorAreaINR: Math.round(totalCost / Math.max(1, geom.floorAreaM2)),
    totalEmbodiedCarbonKg: totalCarbon,
    carbonPerFloorAreaKg: Math.round(totalCarbon / Math.max(1, geom.floorAreaM2)),
    grossEnvelopeAreaM2: geom.totalEnvelopeAreaM2,
    internalVolumeM3: geom.internalVolumeM3,
    surfaceAreaToVolumeRatio: geom.surfaceAreaToVolumeRatio
  };
}
