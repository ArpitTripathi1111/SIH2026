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
 * Resolves architectural shape cleanly, supporting all 8 shapes and legacy aliases.
 */
export function resolveArchitecturalShape(geometry: ShelterGeometry): ArchitecturalShape {
  if (geometry.architecturalShape) {
    const s = geometry.architecturalShape;
    if (s === 'flat_box') return 'standard_cuboid';
    if (s === 'pitched_a_frame') return 'a_frame_pitched';
    if (s === 'vaulted_dome') return 'dome_vaulted';
    if (s === 'lean_to') return 'lean_to_sloped';
    return s;
  }
  if (geometry.roofType === 'vaulted') {
    return 'dome_vaulted';
  }
  if (geometry.roofType === 'pitched' || geometry.roofType === 'ventilated_cavity') {
    return 'gabled_cuboid';
  }
  return 'standard_cuboid';
}

/**
 * Computes exact mathematical surface areas, internal volumes, and S/V ratios for all 8 architectural forms:
 * 1. Standard Cuboid (Baseline orthogonal prism with parapet)
 * 2. A-Frame / Pitched (Steep triangular roof reaching ground, zero side walls)
 * 3. Gabled Roof Cuboid (Standard rectangular walls with dual-pitch gable roof)
 * 4. Dome / Vaulted (Hemispherical structure with minimal SA/V ratio)
 * 5. Cylindrical / Yurt (Circular base with conical roof for high wind resistance)
 * 6. Hexagonal Pod (6-sided base with faceted pyramid roof for modular clustering)
 * 7. Lean-to / Sloped (Single-pitch mono-slope for rapid assembly)
 * 8. Butterfly Roof (Inverted-V roof for rainwater harvesting in monsoon zones)
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
    // 1. STANDARD CUBOID (Baseline)
    case 'standard_cuboid':
    case 'flat_box': {
      apexRise = 0;
      eavesHeight = H;
      peakHeight = H + 0.45; // 450mm parapet
      roofArea = (L + 2 * overhang) * (W + 2 * overhang);
      // Perimeter walls plus 450mm parapet wall rim
      grossWallArea = 2 * (L + W) * H + 2 * (L + W) * 0.45;
      internalVolume = L * W * H;
      shapeSolarFactor = 1.0;
      break;
    }

    // 2. A-FRAME / PITCHED (Steep triangular roof reaching the ground)
    case 'a_frame_pitched':
    case 'pitched_a_frame': {
      // Pure A-Frame: Roof rafters land directly on ground plinth (zero longitudinal side walls)
      // Ideal for high snow & mountain zones: steep angle sheds snow immediately
      const pitchDeg = Number.isFinite(geometry.roofPitchDegrees) && geometry.roofPitchDegrees >= 30
        ? geometry.roofPitchDegrees
        : 45; // default steep 45° for A-frame
      const pitchRad = (pitchDeg * Math.PI) / 180;
      // Roof reaches peak height H (or calculated from pitch if requested)
      const calculatedApex = (W / 2) * Math.tan(pitchRad);
      const effectiveApex = Math.max(H, calculatedApex);
      apexRise = effectiveApex;
      eavesHeight = 0; // Roof touches ground plinth
      peakHeight = effectiveApex;

      // Rafter slope length from ground to peak
      const rafterSlope = Math.sqrt(Math.pow(W / 2, 2) + Math.pow(effectiveApex, 2));
      const extendedRafter = rafterSlope + overhang;
      const extendedRidge = L + 2 * overhang;

      // Sloped roof covers both sides completely
      roofArea = 2 * extendedRafter * extendedRidge;

      // Walls: Zero longitudinal side walls! Only 2 triangular gable end walls
      const gableAreaPerEnd = 0.5 * W * effectiveApex;
      grossWallArea = 2 * gableAreaPerEnd; // = W * effectiveApex

      // Volume of triangular prism: 0.5 * base * height * length
      internalVolume = 0.5 * W * effectiveApex * L;

      // High snow shedding, oblique solar reflection
      shapeSolarFactor = 0.86;
      break;
    }

    // 3. GABLED ROOF CUBOID (Standard vertical walls with pitched roof)
    case 'gabled_cuboid': {
      const pitchDeg = Number.isFinite(geometry.roofPitchDegrees) && geometry.roofPitchDegrees > 0
        ? geometry.roofPitchDegrees
        : 26;
      const pitchRad = (pitchDeg * Math.PI) / 180;
      apexRise = (W / 2) * Math.tan(pitchRad);
      eavesHeight = H;
      peakHeight = H + apexRise;

      const rafterHalfSpan = (W / 2) / Math.cos(pitchRad);
      const extendedRafter = rafterHalfSpan + overhang;
      const extendedRidgeLength = L + 2 * overhang;

      roofArea = 2 * extendedRafter * extendedRidgeLength;

      // 2 longitudinal walls + 2 end walls with triangular gables
      const gableAreaPerEnd = 0.5 * W * apexRise;
      grossWallArea = 2 * (L * H) + 2 * (W * H + gableAreaPerEnd);

      // Volume: orthogonal box + triangular attic prism
      internalVolume = (L * W * H) + (0.5 * W * apexRise * L);
      shapeSolarFactor = 0.92;
      break;
    }

    // 4. DOME / VAULTED (Hemispherical structure - Minimizes solar gain, ideal for deserts)
    case 'dome_vaulted':
    case 'vaulted_dome': {
      // Equivalent hemisphere based on base footprint
      const eqRadius = Math.sqrt((L * W) / Math.PI);
      const domeRise = Math.max(1.5, Math.min(H * 1.1, eqRadius * 1.1));
      apexRise = domeRise;
      eavesHeight = 0.4; // Low perimeter ring beam / skirt
      peakHeight = eavesHeight + domeRise;

      // Surface area of oblate/prolate hemispherical dome cap (approximated via ellipse of revolution)
      // A_dome ≈ 2 * π * R_eff^2
      const rEff = (L + W) / 4;
      // Roof/Dome shell area with small base overhang
      roofArea = 2 * Math.PI * Math.pow(rEff + overhang * 0.5, 2) * (domeRise / rEff);

      // Low perimeter curb / perimeter wall (400mm high plinth skirt)
      const perimeter = Math.PI * (3 * (L / 2 + W / 2) - Math.sqrt((3 * L / 2 + W / 2) * (L / 2 + 3 * W / 2)));
      grossWallArea = perimeter * eavesHeight;

      // Volume of hemispherical cap: (2/3) * π * a * b * c
      internalVolume = (2 / 3) * Math.PI * (L / 2) * (W / 2) * domeRise + (floorArea * eavesHeight);

      // Drastically lower SA/V ratio and diffuse solar reflection at noon
      shapeSolarFactor = 0.72;
      break;
    }

    // 5. CYLINDRICAL / YURT (Circular base with conical roof - High wind resistance)
    case 'cylindrical_yurt': {
      // Radius matching floor area: π * R^2 = L * W
      const radius = Math.sqrt((L * W) / Math.PI);
      const wallH = H * 0.75;
      const coneRise = Math.max(0.7, H * 0.45);
      apexRise = coneRise;
      eavesHeight = wallH;
      peakHeight = wallH + coneRise;

      // Conical roof slant height with overhang
      const coneSlant = Math.sqrt(Math.pow(radius + overhang, 2) + Math.pow(coneRise, 2));
      roofArea = Math.PI * (radius + overhang) * coneSlant;

      // Cylindrical vertical wall area: 2 * π * R * H_wall
      grossWallArea = 2 * Math.PI * radius * wallH;

      // Volume: cylinder volume + cone volume
      internalVolume = Math.PI * Math.pow(radius, 2) * wallH + (1 / 3) * Math.PI * Math.pow(radius, 2) * coneRise;

      // Aerodynamic shape deflects wind seamlessly and spreads solar radiation around circumference
      shapeSolarFactor = 0.80;
      break;
    }

    // 6. HEXAGONAL POD (6-sided base with faceted roof - Excellent for modular clustering)
    case 'hexagonal_pod': {
      // Regular hexagon matching floor area: A = (3 * sqrt(3) / 2) * s^2 => s = sqrt(2 * A / (3 * sqrt(3)))
      const side = Math.sqrt((2 * floorArea) / (3 * Math.sqrt(3)));
      const wallH = H * 0.80;
      const pyramidRise = Math.max(0.6, H * 0.38);
      apexRise = pyramidRise;
      eavesHeight = wallH;
      peakHeight = wallH + pyramidRise;

      // 6 Faceted vertical walls
      grossWallArea = 6 * side * wallH;

      // 6 Faceted pyramid roof with overhang
      const inRadius = side * (Math.sqrt(3) / 2);
      const facetSlant = Math.sqrt(Math.pow(inRadius + overhang, 2) + Math.pow(pyramidRise, 2));
      const extendedSide = side + 1.15 * overhang;
      roofArea = 6 * (0.5 * extendedSide * facetSlant);

      // Volume: Hexagonal prism + Hexagonal pyramid
      internalVolume = floorArea * wallH + (1 / 3) * floorArea * pyramidRise;

      shapeSolarFactor = 0.84;
      break;
    }

    // 7. LEAN-TO / SLOPED (Single-pitch sloped roof - Simplest rapid-assembly structure)
    case 'lean_to_sloped':
    case 'lean_to': {
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
      shapeSolarFactor = 0.94;
      break;
    }

    // 8. BUTTERFLY ROOF (Inverted V-roof - Designed for rainwater harvesting in heavy monsoon zones)
    case 'butterfly_roof': {
      // Inverted pitch: eaves are elevated, center ridge is a low valley gutter channel
      const butterflyPitchDeg = 18;
      const pitchRad = (butterflyPitchDeg * Math.PI) / 180;
      const eavesRise = (W / 2) * Math.tan(pitchRad);
      const valleyHeight = H;
      const elevatedEaves = H + eavesRise;

      apexRise = eavesRise;
      eavesHeight = elevatedEaves; // high eaves
      peakHeight = elevatedEaves;

      // Two inward-sloping planes meeting at central valley
      const halfRafter = (W / 2) / Math.cos(pitchRad) + overhang;
      roofArea = 2 * halfRafter * (L + 2 * overhang);

      // 2 elevated longitudinal walls + 2 end walls with inverted V gables
      // Inverted gable area = W * H + 2 * (0.5 * (W/2) * eavesRise) = W*H + 0.5*W*eavesRise
      grossWallArea = 2 * (L * elevatedEaves) + 2 * (W * valleyHeight + 0.5 * W * eavesRise);

      // Volume: base box + triangular upper inverted space
      internalVolume = (L * W * valleyHeight) + (0.5 * W * eavesRise * L);

      // Central valley gutter concentrates rainwater collection and allows clerestory high vents
      shapeSolarFactor = 0.90;
      break;
    }

    default: {
      apexRise = 0;
      eavesHeight = H;
      peakHeight = H + 0.45;
      roofArea = (L + 2 * overhang) * (W + 2 * overhang);
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
  let shapeRoofLabel = 'Terraced Flat Deck';
  switch (geom.shape) {
    case 'dome_vaulted':
    case 'vaulted_dome':
      shapeRoofLabel = 'Hemispherical Compression Arch Shell';
      break;
    case 'a_frame_pitched':
    case 'pitched_a_frame':
      shapeRoofLabel = 'Ground-to-Ridge Dual-Slope Rafter Skin';
      break;
    case 'gabled_cuboid':
      shapeRoofLabel = 'Dual-Pitch Sloped Weathering Skin';
      break;
    case 'cylindrical_yurt':
      shapeRoofLabel = 'Conical Weathering Roof & Aerodynamic Ring';
      break;
    case 'hexagonal_pod':
      shapeRoofLabel = '6-Faceted Modular Pyramid Roof';
      break;
    case 'lean_to_sloped':
    case 'lean_to':
      shapeRoofLabel = 'Mono-Pitch Rafter Deck';
      break;
    case 'butterfly_roof':
      shapeRoofLabel = 'Inverted-V Rainwater Harvesting Wing Deck';
      break;
    case 'standard_cuboid':
    case 'flat_box':
    default:
      shapeRoofLabel = 'Terraced Parapet Flat Deck';
      break;
  }

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
    case 'a_frame_pitched':
    case 'pitched_a_frame':
      framingDesc = 'Ground-Anchored A-Frame Rafters, Collar Ties & Base Footings';
      framingRate = 450;
      framingCarbon = 19;
      break;
    case 'gabled_cuboid':
      framingDesc = 'Timber King-Post Truss, Tie Beams & Roof Purlins';
      framingRate = 420;
      framingCarbon = 18;
      break;
    case 'dome_vaulted':
    case 'vaulted_dome':
      framingDesc = 'Geodesic Struts, Arched Centering Formwork & Abutments';
      framingRate = 380;
      framingCarbon = 14;
      break;
    case 'cylindrical_yurt':
      framingDesc = 'Tension Crown Ring, Radial Rafters & Trellis Khana Lath';
      framingRate = 360;
      framingCarbon = 13;
      break;
    case 'hexagonal_pod':
      framingDesc = 'Hexagonal Space Frame, Corner Brackets & Facet Rafters';
      framingRate = 390;
      framingCarbon = 15;
      break;
    case 'lean_to_sloped':
    case 'lean_to':
      framingDesc = 'Single-Rake Rafter Poles, Eaves Fascia & Gutter Channel';
      framingRate = 220;
      framingCarbon = 11;
      break;
    case 'butterfly_roof':
      framingDesc = 'Inverted Strut Trusses, Valley Gutter Flashing & Rain Downspout';
      framingRate = 460;
      framingCarbon = 20;
      break;
    case 'standard_cuboid':
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
