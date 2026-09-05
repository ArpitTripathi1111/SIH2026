/**
 * Team CODE TITANS - SIH26051
 * 
 * Interactive 3D Parametric Architectural Visualizer (Three.js & React Three Fiber)
 * 
 * Renders an interactive, real-time 3D engineering schematic model of the shelter envelope.
 * Fully coupled to global parametric state (Length, Width, Height, Wall Thickness,
 * Window-to-Wall Ratio, Roof Pitch, Overhang Depth, and all 8 Architectural Forms).
 * 
 * The 8 Architectural Geometries:
 * 1. Standard Cuboid: Flat roof, rectangular base (Baseline)
 * 2. A-Frame / Pitched: Steep triangular roof reaching ground plinth (Mountain Snow)
 * 3. Gabled Roof Cuboid: Standard rectangular walls with pitched roof (Traditional)
 * 4. Dome / Vaulted: Hemispherical structure (Desert Heat Minimizer)
 * 5. Cylindrical / Yurt: Circular base with conical roof (High Wind Resistance)
 * 6. Hexagonal Pod: 6-sided base with faceted roof (Modular Clustering)
 * 7. Lean-to / Sloped: Single-pitch sloped roof (Rapid Assembly)
 * 8. Butterfly Roof: Inverted V-roof (Monsoon Rainwater Harvesting)
 * 
 * Engineering Schematic Aesthetic:
 * - Clean matte solid architectural materials (no heavy raster textures, 100% offline).
 * - High-contrast CAD outlines and geometric precision.
 * - Free orbit, pan, zoom via OrbitControls with perspective camera presets.
 * - X-Ray / Interior cutaway toggle to inspect inner wall thickness and room depth.
 * - Wireframe blueprint mode for pure vector CAD structural verification.
 */

import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { ShelterGeometry, ArchitecturalShape, RoofType } from '../types';
import { resolveArchitecturalShape } from '../services/costCalculator';
import {
  Rotate3d,
  Layers,
  Sun,
  Eye,
  Camera,
  Maximize,
  Compass,
  Sparkles,
  Grid
} from 'lucide-react';

export interface Shelter3DProps {
  geometry: ShelterGeometry;
  wallColor?: string;
  roofColor?: string;
  wireframeDefault?: boolean;
  className?: string;
}

// Internal helper for camera controls
interface CameraControllerProps {
  viewPreset: 'iso' | 'front' | 'side' | 'top' | null;
  onResetView: () => void;
}

const CameraController: React.FC<CameraControllerProps> = ({ viewPreset, onResetView }) => {
  useFrame(({ camera }) => {
    if (!viewPreset) return;

    let targetPos = new THREE.Vector3(8, 7, 9);
    if (viewPreset === 'front') {
      targetPos = new THREE.Vector3(0, 2.5, 12);
    } else if (viewPreset === 'side') {
      targetPos = new THREE.Vector3(12, 2.5, 0);
    } else if (viewPreset === 'top') {
      targetPos = new THREE.Vector3(0.001, 14, 0);
    } else if (viewPreset === 'iso') {
      targetPos = new THREE.Vector3(9, 7.5, 9);
    }

    camera.position.lerp(targetPos, 0.1);
    camera.lookAt(0, 1.5, 0);

    if (camera.position.distanceTo(targetPos) < 0.05) {
      onResetView();
    }
  });

  return null;
};

// Sub-component: The 3D Architectural Shelter Envelope
const ShelterModel: React.FC<{
  geometry: ShelterGeometry;
  wireframe: boolean;
  showRoof: boolean;
  showSunVector: boolean;
}> = ({ geometry, wireframe, showRoof, showSunVector }) => {
  const {
    lengthMeters = 6.0,
    widthMeters = 4.0,
    heightMeters = 3.0,
    wallThicknessMm = 230,
    roofPitchDegrees = 22,
    overhangDepthMeters = 0.6,
    windowToWallRatioPercent = 18,
  } = geometry;

  const activeShape = resolveArchitecturalShape(geometry);

  const L = Math.max(3.0, lengthMeters);
  const W = Math.max(2.5, widthMeters);
  const H = Math.max(2.2, heightMeters);
  const t = Math.max(0.1, Math.min(0.6, wallThicknessMm / 1000));
  const O = Math.max(0.1, Math.min(1.5, overhangDepthMeters));
  const pitchRad = ((roofPitchDegrees || 22) * Math.PI) / 180;
  const roofRise = Math.max(0.35, (W / 2) * Math.tan(pitchRad));

  // Circular / polygonal radius equivalent for radial geometries
  const radiusYurt = Math.max(1.8, Math.sqrt((L * W) / Math.PI));
  const radiusHex = Math.max(2.0, Math.sqrt((L * W) / (2 * Math.sqrt(3))));
  const radiusDome = Math.max(2.0, Math.sqrt((L * W) / Math.PI));

  // Materials for the classic engineering schematic look
  const wallMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#e2e8f0',
    roughness: 0.85,
    metalness: 0.05,
    wireframe,
    side: THREE.DoubleSide
  }), [wireframe]);

  const innerWallMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#cbd5e1',
    roughness: 0.9,
    metalness: 0.05,
    wireframe,
  }), [wireframe]);

  const plinthMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#475569',
    roughness: 0.95,
    metalness: 0.1,
    wireframe,
  }), [wireframe]);

  const roofMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#1e293b',
    roughness: 0.7,
    metalness: 0.15,
    wireframe,
    side: THREE.DoubleSide
  }), [wireframe]);

  const glassMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#38bdf8',
    transparent: true,
    opacity: 0.65,
    roughness: 0.1,
    metalness: 0.1,
    transmission: 0.8,
    wireframe,
  }), [wireframe]);

  const frameMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#0f172a',
    roughness: 0.6,
    wireframe,
  }), [wireframe]);

  const doorMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#78350f',
    roughness: 0.75,
    wireframe,
  }), [wireframe]);

  const chhajjaMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#94a3b8',
    roughness: 0.8,
    wireframe,
  }), [wireframe]);

  // Window sizing derived from WWR
  const facadeArea = L * H;
  const totalWindowArea = facadeArea * (windowToWallRatioPercent / 100);
  const winW = Math.min(L * 0.35, Math.max(0.8, Math.sqrt(totalWindowArea * 1.2)));
  const winH = Math.min(H * 0.55, Math.max(0.7, totalWindowArea / (winW * 1.8)));
  const winY = H * 0.55;

  // Door Dimensions
  const doorW = 0.95;
  const doorH = 2.1;
  const doorX = -L * 0.22;
  const winX = L * 0.22;

  // 1. Pitched Gabled Roof Geometry
  const gabledRoofGeom = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    const halfL = L / 2 + O;
    const halfW = W / 2 + O;
    const ridgeY = H + roofRise;
    const eavesY = H;

    const vertices = new Float32Array([
      // South Pitch
      -halfL, eavesY, halfW,
       halfL, eavesY, halfW,
       halfL, ridgeY, 0,

      -halfL, eavesY, halfW,
       halfL, ridgeY, 0,
      -halfL, ridgeY, 0,

      // North Pitch
      -halfL, ridgeY, 0,
       halfL, ridgeY, 0,
       halfL, eavesY, -halfW,

      -halfL, ridgeY, 0,
       halfL, eavesY, -halfW,
      -halfL, eavesY, -halfW,

      // West Gable
      -L/2, H, W/2,
      -L/2, ridgeY, 0,
      -L/2, H, -W/2,

      // East Gable
      L/2, H, -W/2,
      L/2, ridgeY, 0,
      L/2, H, W/2,
    ]);

    geom.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geom.computeVertexNormals();
    return geom;
  }, [L, W, H, O, roofRise]);

  // 2. A-Frame Steep Ground-to-Ridge Roof Geometry
  const aFrameRoofGeom = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    const halfL = L / 2 + O;
    const halfW = W / 2 + O;
    const groundY = 0.3;
    const peakY = H + roofRise + 0.3;

    const vertices = new Float32Array([
      // South Sloped Wing
      -halfL, groundY, halfW,
       halfL, groundY, halfW,
       halfL, peakY, 0,

      -halfL, groundY, halfW,
       halfL, peakY, 0,
      -halfL, peakY, 0,

      // North Sloped Wing
      -halfL, peakY, 0,
       halfL, peakY, 0,
       halfL, groundY, -halfW,

      -halfL, peakY, 0,
       halfL, groundY, -halfW,
      -halfL, groundY, -halfW,
    ]);

    geom.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geom.computeVertexNormals();
    return geom;
  }, [L, W, H, O, roofRise]);

  // 3. Lean-to Mono-pitch Roof Geometry
  const leanToRoofGeom = useMemo(() => {
    const halfL = L / 2 + O;
    const frontZ = W / 2 + O;
    const backZ = -W / 2 - O;
    const frontY = H + 0.9;
    const backY = H - 0.3;

    const vertices = new Float32Array([
      -halfL, frontY, frontZ,
       halfL, frontY, frontZ,
       halfL, backY, backZ,

      -halfL, frontY, frontZ,
       halfL, backY, backZ,
      -halfL, backY, backZ,
    ]);

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geom.computeVertexNormals();
    return geom;
  }, [L, W, H, O]);

  // 4. Butterfly Inverted-V Roof Geometry
  const butterflyRoofGeom = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    const halfL = L / 2 + O;
    const halfW = W / 2 + O;
    const eavesHighY = H + 0.9;
    const valleyLowY = H + 0.1;

    const vertices = new Float32Array([
      // South Wing (slopes down from +Z eaves to center valley Z=0)
      -halfL, eavesHighY, halfW,
       halfL, eavesHighY, halfW,
       halfL, valleyLowY, 0,

      -halfL, eavesHighY, halfW,
       halfL, valleyLowY, 0,
      -halfL, valleyLowY, 0,

      // North Wing (slopes down from -Z eaves to center valley Z=0)
      -halfL, valleyLowY, 0,
       halfL, valleyLowY, 0,
       halfL, eavesHighY, -halfW,

      -halfL, valleyLowY, 0,
       halfL, eavesHighY, -halfW,
      -halfL, eavesHighY, -halfW,
    ]);

    geom.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geom.computeVertexNormals();
    return geom;
  }, [L, W, H, O]);

  // Determine plinth dimensions based on geometry type
  const isRadial = activeShape === 'cylindrical_yurt' || activeShape === 'dome_vaulted';
  const isHex = activeShape === 'hexagonal_pod';

  return (
    <group position={[0, 0, 0]}>
      {/* 1. FOUNDATION / PLINTH BEAM */}
      {isRadial ? (
        <mesh position={[0, 0.15, 0]}>
          <cylinderGeometry args={[radiusYurt + 0.3, radiusYurt + 0.35, 0.3, 32]} />
          <primitive object={plinthMat} attach="material" />
        </mesh>
      ) : isHex ? (
        <mesh position={[0, 0.15, 0]} rotation={[0, Math.PI / 6, 0]}>
          <cylinderGeometry args={[radiusHex + 0.3, radiusHex + 0.35, 0.3, 6]} />
          <primitive object={plinthMat} attach="material" />
        </mesh>
      ) : (
        <mesh position={[0, 0.15, 0]}>
          <boxGeometry args={[L + 0.6, 0.3, W + 0.6]} />
          <primitive object={plinthMat} attach="material" />
        </mesh>
      )}

      {/* Internal Room Floor Slab */}
      {!isRadial && !isHex && (
        <mesh position={[0, 0.305, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[L - 2 * t, W - 2 * t]} />
          <primitive object={innerWallMat} attach="material" />
        </mesh>
      )}

      {/* 2. GEOMETRY-SPECIFIC WALL & ENVELOPE CONFIGURATIONS */}

      {/* FORM 1: STANDARD CUBOID (Orthogonal Box) */}
      {activeShape === 'standard_cuboid' && (
        <group>
          {/* Back Wall */}
          <mesh position={[0, H / 2 + 0.3, -W / 2 + t / 2]}>
            <boxGeometry args={[L, H, t]} />
            <primitive object={wallMat} attach="material" />
          </mesh>
          {/* Left Wall */}
          <mesh position={[-L / 2 + t / 2, H / 2 + 0.3, 0]}>
            <boxGeometry args={[t, H, W - 2 * t]} />
            <primitive object={wallMat} attach="material" />
          </mesh>
          {/* Right Wall */}
          <mesh position={[L / 2 - t / 2, H / 2 + 0.3, 0]}>
            <boxGeometry args={[t, H, W - 2 * t]} />
            <primitive object={wallMat} attach="material" />
          </mesh>
          {/* Front Wall with Door & Window Openings */}
          <mesh position={[-L / 2 + (L * 0.28 - doorW / 2) / 2, H / 2 + 0.3, W / 2 - t / 2]}>
            <boxGeometry args={[Math.max(0.05, L * 0.28 - doorW / 2), H, t]} />
            <primitive object={wallMat} attach="material" />
          </mesh>
          <mesh position={[0, H / 2 + 0.3, W / 2 - t / 2]}>
            <boxGeometry args={[Math.max(0.1, winX - winW / 2 - (doorX + doorW / 2)), H, t]} />
            <primitive object={wallMat} attach="material" />
          </mesh>
          <mesh position={[L / 2 - (L / 2 - (winX + winW / 2)) / 2, H / 2 + 0.3, W / 2 - t / 2]}>
            <boxGeometry args={[Math.max(0.05, L / 2 - (winX + winW / 2)), H, t]} />
            <primitive object={wallMat} attach="material" />
          </mesh>
          {/* Wall Lintel above Door */}
          <mesh position={[doorX, (H + 0.3 + doorH + 0.3) / 2, W / 2 - t / 2]}>
            <boxGeometry args={[doorW, Math.max(0.05, H - doorH), t]} />
            <primitive object={wallMat} attach="material" />
          </mesh>
          {/* Wall Lintel above Window */}
          <mesh position={[winX, (H + 0.3 + winY + winH / 2 + 0.3) / 2, W / 2 - t / 2]}>
            <boxGeometry args={[winW, Math.max(0.05, H - (winY + winH / 2)), t]} />
            <primitive object={wallMat} attach="material" />
          </mesh>
          {/* Wall Sill below Window */}
          <mesh position={[winX, (winY - winH / 2 + 0.3) / 2 + 0.15, W / 2 - t / 2]}>
            <boxGeometry args={[winW, Math.max(0.05, winY - winH / 2), t]} />
            <primitive object={wallMat} attach="material" />
          </mesh>
        </group>
      )}

      {/* FORM 2: A-FRAME / PITCHED (Steep Triangular Roof to Ground - No Vertical Side Walls) */}
      {activeShape === 'a_frame_pitched' && (
        <group>
          {/* Front Gable End Wall with Door & Window Cutouts */}
          <group position={[0, 0.3, W / 2 - t / 2]}>
            {/* Front Triangular Gable Backdrop */}
            <mesh position={[0, (H + roofRise) / 2, 0]}>
              <boxGeometry args={[L * 0.95, H + roofRise, t]} />
              <primitive object={wallMat} attach="material" />
            </mesh>
          </group>

          {/* Rear Triangular Gable End Wall */}
          <group position={[0, 0.3, -W / 2 + t / 2]}>
            <mesh position={[0, (H + roofRise) / 2, 0]}>
              <boxGeometry args={[L * 0.95, H + roofRise, t]} />
              <primitive object={wallMat} attach="material" />
            </mesh>
          </group>

          {/* Timber Tie-Beams / Collar Struts for Alpine Stability */}
          <mesh position={[0, H * 0.65 + 0.3, 0]}>
            <boxGeometry args={[L * 0.8, 0.12, 0.12]} />
            <primitive object={frameMat} attach="material" />
          </mesh>
        </group>
      )}

      {/* FORM 3: GABLED ROOF CUBOID (Standard Rectangular Walls + Pitched Roof) */}
      {activeShape === 'gabled_cuboid' && (
        <group>
          {/* Standard Perimeter Walls */}
          <mesh position={[0, H / 2 + 0.3, -W / 2 + t / 2]}>
            <boxGeometry args={[L, H, t]} />
            <primitive object={wallMat} attach="material" />
          </mesh>
          <mesh position={[-L / 2 + t / 2, H / 2 + 0.3, 0]}>
            <boxGeometry args={[t, H, W - 2 * t]} />
            <primitive object={wallMat} attach="material" />
          </mesh>
          <mesh position={[L / 2 - t / 2, H / 2 + 0.3, 0]}>
            <boxGeometry args={[t, H, W - 2 * t]} />
            <primitive object={wallMat} attach="material" />
          </mesh>
          {/* Front Piers */}
          <mesh position={[-L / 2 + (L * 0.28 - doorW / 2) / 2, H / 2 + 0.3, W / 2 - t / 2]}>
            <boxGeometry args={[Math.max(0.05, L * 0.28 - doorW / 2), H, t]} />
            <primitive object={wallMat} attach="material" />
          </mesh>
          <mesh position={[0, H / 2 + 0.3, W / 2 - t / 2]}>
            <boxGeometry args={[Math.max(0.1, winX - winW / 2 - (doorX + doorW / 2)), H, t]} />
            <primitive object={wallMat} attach="material" />
          </mesh>
          <mesh position={[L / 2 - (L / 2 - (winX + winW / 2)) / 2, H / 2 + 0.3, W / 2 - t / 2]}>
            <boxGeometry args={[Math.max(0.05, L / 2 - (winX + winW / 2)), H, t]} />
            <primitive object={wallMat} attach="material" />
          </mesh>
          {/* Wall Lintel and Sill */}
          <mesh position={[doorX, (H + 0.3 + doorH + 0.3) / 2, W / 2 - t / 2]}>
            <boxGeometry args={[doorW, Math.max(0.05, H - doorH), t]} />
            <primitive object={wallMat} attach="material" />
          </mesh>
          <mesh position={[winX, (H + 0.3 + winY + winH / 2 + 0.3) / 2, W / 2 - t / 2]}>
            <boxGeometry args={[winW, Math.max(0.05, H - (winY + winH / 2)), t]} />
            <primitive object={wallMat} attach="material" />
          </mesh>
          <mesh position={[winX, (winY - winH / 2 + 0.3) / 2 + 0.15, W / 2 - t / 2]}>
            <boxGeometry args={[winW, Math.max(0.05, winY - winH / 2), t]} />
            <primitive object={wallMat} attach="material" />
          </mesh>
        </group>
      )}

      {/* FORM 4: DOME / VAULTED (Curved Hemispherical Shell) */}
      {activeShape === 'dome_vaulted' && (
        <group>
          {/* Low Cylindrical Knee Wall */}
          <mesh position={[0, 0.3 + 0.25, 0]}>
            <cylinderGeometry args={[radiusDome, radiusDome, 0.5, 32]} />
            <primitive object={wallMat} attach="material" />
          </mesh>

          {/* Vaulted Arch Shell (renders with showRoof) */}
          {showRoof && (
            <mesh position={[0, 0.8, 0]} scale={[L / (2 * radiusDome), (H + 0.5) / radiusDome, W / (2 * radiusDome)]}>
              <sphereGeometry args={[radiusDome, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
              <primitive object={roofMat} attach="material" />
            </mesh>
          )}

          {/* Arched South Entry Vestibule */}
          <mesh position={[0, doorH / 2 + 0.3, radiusDome * 0.95]}>
            <boxGeometry args={[doorW + 0.4, doorH + 0.2, 0.5]} />
            <primitive object={wallMat} attach="material" />
          </mesh>
        </group>
      )}

      {/* FORM 5: CYLINDRICAL / YURT (Circular Base + Conical Roof) */}
      {activeShape === 'cylindrical_yurt' && (
        <group>
          {/* Cylindrical Wall Perimeter */}
          <mesh position={[0, H / 2 + 0.3, 0]}>
            <cylinderGeometry args={[radiusYurt, radiusYurt, H, 32]} />
            <primitive object={wallMat} attach="material" />
          </mesh>

          {/* Conical Roof with Crown Vent */}
          {showRoof && (
            <group position={[0, H + 0.3, 0]}>
              {/* Conical Slope */}
              <mesh position={[0, (roofRise + 0.4) / 2, 0]}>
                <coneGeometry args={[radiusYurt + O, roofRise + 0.4, 32]} />
                <primitive object={roofMat} attach="material" />
              </mesh>
              {/* Crown Ring (Toono / Compression Ring Skylight) */}
              <mesh position={[0, roofRise + 0.45, 0]}>
                <cylinderGeometry args={[0.45, 0.45, 0.12, 16]} />
                <primitive object={glassMat} attach="material" />
              </mesh>
            </group>
          )}

          {/* Door Frame Vestibule on South Perimeter */}
          <mesh position={[0, doorH / 2 + 0.3, radiusYurt - 0.05]}>
            <boxGeometry args={[doorW + 0.2, doorH + 0.1, 0.3]} />
            <primitive object={frameMat} attach="material" />
          </mesh>
        </group>
      )}

      {/* FORM 6: HEXAGONAL POD (6-sided Faceted Base + Pyramid Roof) */}
      {activeShape === 'hexagonal_pod' && (
        <group>
          {/* 6-Sided Perimeter Walls */}
          <mesh position={[0, H / 2 + 0.3, 0]} rotation={[0, Math.PI / 6, 0]}>
            <cylinderGeometry args={[radiusHex, radiusHex, H, 6]} />
            <primitive object={wallMat} attach="material" />
          </mesh>

          {/* 6-Faceted Pyramid Roof */}
          {showRoof && (
            <group position={[0, H + 0.3, 0]} rotation={[0, Math.PI / 6, 0]}>
              <mesh position={[0, (roofRise + 0.3) / 2, 0]}>
                <coneGeometry args={[radiusHex + O, roofRise + 0.3, 6]} />
                <primitive object={roofMat} attach="material" />
              </mesh>
            </group>
          )}

          {/* Modular Door Frame Panel */}
          <mesh position={[0, doorH / 2 + 0.3, radiusHex * Math.cos(Math.PI / 6) - 0.05]}>
            <boxGeometry args={[doorW + 0.2, doorH + 0.1, 0.25]} />
            <primitive object={frameMat} attach="material" />
          </mesh>
        </group>
      )}

      {/* FORM 7: LEAN-TO / SLOPED (Single-Pitch Sloped Roof) */}
      {activeShape === 'lean_to_sloped' && (
        <group>
          {/* High Front Wall */}
          <mesh position={[0, (H + 0.9) / 2 + 0.3, W / 2 - t / 2]}>
            <boxGeometry args={[L, H + 0.9, t]} />
            <primitive object={wallMat} attach="material" />
          </mesh>
          {/* Low Rear Wall */}
          <mesh position={[0, (H - 0.3) / 2 + 0.3, -W / 2 + t / 2]}>
            <boxGeometry args={[L, H - 0.3, t]} />
            <primitive object={wallMat} attach="material" />
          </mesh>
          {/* Side Walls */}
          <mesh position={[-L / 2 + t / 2, H / 2 + 0.3, 0]}>
            <boxGeometry args={[t, H + 0.3, W - 2 * t]} />
            <primitive object={wallMat} attach="material" />
          </mesh>
          <mesh position={[L / 2 - t / 2, H / 2 + 0.3, 0]}>
            <boxGeometry args={[t, H + 0.3, W - 2 * t]} />
            <primitive object={wallMat} attach="material" />
          </mesh>
        </group>
      )}

      {/* FORM 8: BUTTERFLY ROOF (Inverted V-Roof with Central Drainage) */}
      {activeShape === 'butterfly_roof' && (
        <group>
          {/* High Outer Perimeter Walls */}
          <mesh position={[0, H / 2 + 0.3, -W / 2 + t / 2]}>
            <boxGeometry args={[L, H + 0.8, t]} />
            <primitive object={wallMat} attach="material" />
          </mesh>
          <mesh position={[0, H / 2 + 0.3, W / 2 - t / 2]}>
            <boxGeometry args={[L, H + 0.8, t]} />
            <primitive object={wallMat} attach="material" />
          </mesh>
          <mesh position={[-L / 2 + t / 2, H / 2 + 0.3, 0]}>
            <boxGeometry args={[t, H + 0.4, W - 2 * t]} />
            <primitive object={wallMat} attach="material" />
          </mesh>
          <mesh position={[L / 2 - t / 2, H / 2 + 0.3, 0]}>
            <boxGeometry args={[t, H + 0.4, W - 2 * t]} />
            <primitive object={wallMat} attach="material" />
          </mesh>

          {/* Central Valley Rainwater Gutter Trough Beam */}
          {showRoof && (
            <mesh position={[0, H + 0.32, 0]}>
              <boxGeometry args={[L + 2 * O, 0.12, 0.25]} />
              <primitive object={frameMat} attach="material" />
            </mesh>
          )}

          {/* Rainwater Downspout Pipe into Cistern */}
          <mesh position={[L / 2 + O - 0.1, (H + 0.3) / 2, 0]}>
            <cylinderGeometry args={[0.06, 0.06, H + 0.3, 16]} />
            <primitive object={frameMat} attach="material" />
          </mesh>
        </group>
      )}

      {/* 3. FENESTRATION: ENTRANCE DOOR & WINDOWS */}
      {/* Front Entrance Door (for rectangular and a-frame structures) */}
      {activeShape !== 'cylindrical_yurt' && activeShape !== 'hexagonal_pod' && (
        <mesh position={[doorX, doorH / 2 + 0.3, W / 2 - t / 2 + 0.01]}>
          <boxGeometry args={[doorW - 0.04, doorH, t * 0.7]} />
          <primitive object={doorMat} attach="material" />
        </mesh>
      )}

      {/* Front Glazed Window Pane */}
      {activeShape !== 'cylindrical_yurt' && activeShape !== 'hexagonal_pod' && (
        <group position={[winX, winY + 0.3, W / 2 - t / 2 + 0.01]}>
          <mesh>
            <boxGeometry args={[winW - 0.06, winH - 0.06, 0.04]} />
            <primitive object={glassMat} attach="material" />
          </mesh>
          <mesh>
            <boxGeometry args={[winW, winH, 0.06]} />
            <primitive object={frameMat} attach="material" />
          </mesh>
          {/* Passive Solar Shading (Chhajja Overhang) */}
          <mesh position={[0, winH / 2 + 0.05, (O * 0.7) / 2]}>
            <boxGeometry args={[winW + 0.3, 0.08, O * 0.7]} />
            <primitive object={chhajjaMat} attach="material" />
          </mesh>
        </group>
      )}

      {/* Yurt / Hex Door Panel */}
      {activeShape === 'cylindrical_yurt' && (
        <mesh position={[0, doorH / 2 + 0.3, radiusYurt + 0.05]}>
          <boxGeometry args={[doorW, doorH, 0.08]} />
          <primitive object={doorMat} attach="material" />
        </mesh>
      )}
      {activeShape === 'hexagonal_pod' && (
        <mesh position={[0, doorH / 2 + 0.3, radiusHex * Math.cos(Math.PI / 6) + 0.05]}>
          <boxGeometry args={[doorW, doorH, 0.08]} />
          <primitive object={doorMat} attach="material" />
        </mesh>
      )}

      {/* 4. ROOF STRUCTURES (Triggered when showRoof is true) */}
      {showRoof && (
        <group>
          {/* A. Flat Roof Box with Parapet Coping */}
          {activeShape === 'standard_cuboid' && (
            <group position={[0, H + 0.3, 0]}>
              <mesh position={[0, 0.075, 0]}>
                <boxGeometry args={[L + 2 * O, 0.15, W + 2 * O]} />
                <primitive object={roofMat} attach="material" />
              </mesh>
              {/* Parapet Wall (400mm high) */}
              <mesh position={[0, 0.35, (W + 2 * O) / 2 - 0.075]}>
                <boxGeometry args={[L + 2 * O, 0.4, 0.15]} />
                <primitive object={roofMat} attach="material" />
              </mesh>
              <mesh position={[0, 0.35, -(W + 2 * O) / 2 + 0.075]}>
                <boxGeometry args={[L + 2 * O, 0.4, 0.15]} />
                <primitive object={roofMat} attach="material" />
              </mesh>
              <mesh position={[(L + 2 * O) / 2 - 0.075, 0.35, 0]}>
                <boxGeometry args={[0.15, 0.4, W + 2 * O - 0.3]} />
                <primitive object={roofMat} attach="material" />
              </mesh>
              <mesh position={[-(L + 2 * O) / 2 + 0.075, 0.35, 0]}>
                <boxGeometry args={[0.15, 0.4, W + 2 * O - 0.3]} />
                <primitive object={roofMat} attach="material" />
              </mesh>
            </group>
          )}

          {/* B. Pitched A-Frame Truss Roof (Ground-to-Ridge) */}
          {activeShape === 'a_frame_pitched' && (
            <mesh geometry={aFrameRoofGeom} position={[0, 0, 0]}>
              <primitive object={roofMat} attach="material" />
            </mesh>
          )}

          {/* C. Gabled Roof Cuboid */}
          {activeShape === 'gabled_cuboid' && (
            <mesh geometry={gabledRoofGeom} position={[0, 0.3, 0]}>
              <primitive object={roofMat} attach="material" />
            </mesh>
          )}

          {/* D. Lean-to Sloped Roof */}
          {activeShape === 'lean_to_sloped' && (
            <mesh geometry={leanToRoofGeom} position={[0, 0.3, 0]}>
              <primitive object={roofMat} attach="material" />
            </mesh>
          )}

          {/* E. Butterfly Inverted-V Roof */}
          {activeShape === 'butterfly_roof' && (
            <mesh geometry={butterflyRoofGeom} position={[0, 0.3, 0]}>
              <primitive object={roofMat} attach="material" />
            </mesh>
          )}
        </group>
      )}

      {/* 5. SOLAR RADIATION VECTOR (Simulated 45° Summer Solstice Altitude) */}
      {showSunVector && (
        <group position={[winX + 0.2, H + 2.5, W / 2 + 2.8]}>
          <mesh>
            <sphereGeometry args={[0.25, 16, 16]} />
            <meshBasicMaterial color="#f59e0b" />
          </mesh>
          <arrowHelper
            args={[
              new THREE.Vector3(0, -0.65, -0.75).normalize(),
              new THREE.Vector3(0, 0, 0),
              3.2,
              0xf59e0b,
              0.4,
              0.2
            ]}
          />
        </group>
      )}

      {/* 6. CAD GROUND GRID */}
      <gridHelper args={[20, 20, '#475569', '#1e293b']} position={[0, 0, 0]} />
    </group>
  );
};

export const Shelter3D: React.FC<Shelter3DProps> = ({
  geometry,
  className = ''
}) => {
  const [wireframe, setWireframe] = useState<boolean>(false);
  const [showRoof, setShowRoof] = useState<boolean>(true);
  const [showSunVector, setShowSunVector] = useState<boolean>(true);
  const [viewPreset, setViewPreset] = useState<'iso' | 'front' | 'side' | 'top' | null>('iso');

  const resolvedShape = resolveArchitecturalShape(geometry);

  return (
    <div className={`relative w-full h-[460px] sm:h-[520px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 select-none ${className}`}>
      {/* 3D Top Header Overlay */}
      <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Title badge */}
        <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/80 text-xs font-mono flex items-center gap-2 pointer-events-auto shadow-md">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-slate-200 font-bold">3D Parametric Model</span>
          <span className="text-slate-500 hidden sm:inline">|</span>
          <span className="text-cyan-400 hidden sm:inline uppercase text-[11px] font-semibold">
            {resolvedShape.replace(/_/g, ' ')}
          </span>
        </div>

        {/* Action button toggles */}
        <div className="flex items-center gap-1.5 pointer-events-auto bg-slate-900/90 backdrop-blur-md p-1 rounded-lg border border-slate-700/80 text-xs">
          {/* Camera presets */}
          <button
            type="button"
            onClick={() => setViewPreset('iso')}
            className={`px-2 py-1 rounded text-[11px] font-mono transition-colors ${
              viewPreset === 'iso' ? 'bg-cyan-600 text-white' : 'text-slate-300 hover:bg-slate-800'
            }`}
            title="Isometric 3D View"
          >
            ISO
          </button>
          <button
            type="button"
            onClick={() => setViewPreset('front')}
            className={`px-2 py-1 rounded text-[11px] font-mono transition-colors ${
              viewPreset === 'front' ? 'bg-cyan-600 text-white' : 'text-slate-300 hover:bg-slate-800'
            }`}
            title="Front Elevation View"
          >
            FRONT
          </button>
          <button
            type="button"
            onClick={() => setViewPreset('side')}
            className={`px-2 py-1 rounded text-[11px] font-mono transition-colors ${
              viewPreset === 'side' ? 'bg-cyan-600 text-white' : 'text-slate-300 hover:bg-slate-800'
            }`}
            title="Side Elevation View"
          >
            SIDE
          </button>
          <button
            type="button"
            onClick={() => setViewPreset('top')}
            className={`px-2 py-1 rounded text-[11px] font-mono transition-colors ${
              viewPreset === 'top' ? 'bg-cyan-600 text-white' : 'text-slate-300 hover:bg-slate-800'
            }`}
            title="Top Plan View"
          >
            TOP
          </button>

          <div className="w-[1px] h-4 bg-slate-700 mx-0.5" />

          {/* Roof X-ray toggle */}
          <button
            type="button"
            onClick={() => setShowRoof(!showRoof)}
            className={`p-1.5 rounded transition-colors ${
              !showRoof ? 'bg-amber-600 text-white' : 'text-slate-300 hover:bg-slate-800'
            }`}
            title={showRoof ? 'Remove Roof (Inspect Interior & Wall Core)' : 'Show Roof Envelope'}
          >
            <Layers className="w-3.5 h-3.5" />
          </button>

          {/* Wireframe toggle */}
          <button
            type="button"
            onClick={() => setWireframe(!wireframe)}
            className={`p-1.5 rounded transition-colors ${
              wireframe ? 'bg-cyan-600 text-white' : 'text-slate-300 hover:bg-slate-800'
            }`}
            title={wireframe ? 'Switch to Solid Matte' : 'Switch to Wireframe Mesh'}
          >
            <Grid className="w-3.5 h-3.5" />
          </button>

          {/* Sun Vector toggle */}
          <button
            type="button"
            onClick={() => setShowSunVector(!showSunVector)}
            className={`p-1.5 rounded transition-colors ${
              showSunVector ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-slate-400 hover:bg-slate-800'
            }`}
            title="Toggle Solar Radiation Ray"
          >
            <Sun className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* R3F Canvas */}
      <Canvas
        shadows={false}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      >
        <PerspectiveCamera makeDefault position={[9, 7.5, 9]} fov={42} />
        
        {/* Soft engineering lighting */}
        <ambientLight intensity={1.1} />
        <directionalLight position={[12, 18, 10]} intensity={1.4} />
        <directionalLight position={[-10, 8, -10]} intensity={0.5} />

        <CameraController
          viewPreset={viewPreset}
          onResetView={() => setViewPreset(null)}
        />

        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.06}
          minDistance={3.5}
          maxDistance={25}
          maxPolarAngle={Math.PI / 2 - 0.05}
        />

        <ShelterModel
          geometry={geometry}
          wireframe={wireframe}
          showRoof={showRoof}
          showSunVector={showSunVector}
        />
      </Canvas>

      {/* HUD Info Footer Overlay */}
      <div className="absolute bottom-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none text-[11px] font-mono">
        <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-slate-400 flex items-center gap-3">
          <span>L: <strong className="text-slate-200">{geometry.lengthMeters}m</strong></span>
          <span>W: <strong className="text-slate-200">{geometry.widthMeters}m</strong></span>
          <span>H: <strong className="text-slate-200">{geometry.heightMeters}m</strong></span>
          <span>Wall: <strong className="text-cyan-400">{geometry.wallThicknessMm}mm</strong></span>
          <span>WWR: <strong className="text-sky-400">{geometry.windowToWallRatioPercent}%</strong></span>
          <span>Pitch: <strong className="text-amber-400">{geometry.roofPitchDegrees}°</strong></span>
        </div>

        <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-slate-500 hidden md:flex items-center gap-1.5">
          <Rotate3d className="w-3.5 h-3.5 text-cyan-400" />
          <span>Left-click: Rotate • Right-click: Pan • Scroll: Zoom</span>
        </div>
      </div>
    </div>
  );
};

export default Shelter3D;
