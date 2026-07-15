"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { elementsData } from "../data/elements";
import { Play, Pause, Plus, Minus, Calculator, RefreshCw, Table2, ShieldAlert, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- HELPERS FOR PARSING & BALANCING ---

// Helper: Parse formula (e.g. H2O, Ca(OH)2, Al2(SO4)3)
function parseFormula(formula) {
  try {
    const stack = [{}];
    let i = 0;
    while (i < formula.length) {
      const char = formula[i];
      if (char === "(") {
        stack.push({});
        i++;
      } else if (char === ")") {
        i++;
        let start = i;
        while (i < formula.length && /\d/.test(formula[i])) {
          i++;
        }
        const mult = start === i ? 1 : parseInt(formula.slice(start, i), 10);
        const top = stack.pop();
        const parent = stack[stack.length - 1];
        if (!top || !parent) return null;
        for (const [el, val] of Object.entries(top)) {
          parent[el] = (parent[el] || 0) + val * mult;
        }
      } else if (/[A-Z]/.test(char)) {
        let startEl = i;
        i++;
        if (i < formula.length && /[a-z]/.test(formula[i])) {
          i++;
        }
        const el = formula.slice(startEl, i);
        let startNum = i;
        while (i < formula.length && /\d/.test(formula[i])) {
          i++;
        }
        const count = startNum === i ? 1 : parseInt(formula.slice(startNum, i), 10);
        const top = stack[stack.length - 1];
        if (!top) return null;
        top[el] = (top[el] || 0) + count;
      } else {
        i++;
      }
    }
    return stack[0];
  } catch (err) {
    return null;
  }
}

// Helper: Get element atomic mass
function getAtomicMass(symbol) {
  const el = elementsData.find(e => e.symbol === symbol);
  return el ? el.mass : 0;
}

// Helper: Find Greatest Common Divisor (GCD) for an array of numbers
function gcdOfArray(arr) {
  const gcd = (a, b) => (!b ? a : gcd(b, a % b));
  let result = arr[0];
  for (let i = 1; i < arr.length; i++) {
    result = gcd(result, arr[i]);
  }
  return result;
}

// Helper: Balance equation using brute force search
function balanceEquation(equationStr) {
  const cleaned = equationStr.replace(/\s+/g, "");
  const sides = cleaned.split(/=|->|-->/);
  if (sides.length !== 2) {
    return { success: false, error: "Equation must have exactly one '=' or '->' separator." };
  }

  const reactantStrs = sides[0].split("+");
  const productStrs = sides[1].split("+");

  const reactants = reactantStrs.map(r => ({ formula: r, parsed: parseFormula(r) }));
  const products = productStrs.map(p => ({ formula: p, parsed: parseFormula(p) }));

  // Check if parsing failed
  if (reactants.some(r => !r.parsed) || products.some(p => !p.parsed)) {
    return { success: false, error: "Failed to parse formula syntax. Check parentheses or elements." };
  }

  // Get all unique elements
  const allElements = new Set();
  reactants.forEach(r => Object.keys(r.parsed).forEach(el => allElements.add(el)));
  
  // Verify products contain the same elements
  const productElements = new Set();
  products.forEach(p => Object.keys(p.parsed).forEach(el => productElements.add(el)));

  if (allElements.size === 0) {
    return { success: false, error: "No elements found." };
  }

  for (let el of allElements) {
    if (!productElements.has(el)) {
      return { success: false, error: `Reactant element '${el}' is missing from products.` };
    }
  }
  for (let el of productElements) {
    if (!allElements.has(el)) {
      return { success: false, error: `Product element '${el}' is missing from reactants.` };
    }
  }

  const uniqueElementsList = Array.from(allElements);

  // Solves coefficients using grid search (brute force coefficients 1-15)
  const numReactants = reactants.length;
  const numProducts = products.length;
  const totalCompounds = numReactants + numProducts;

  if (totalCompounds > 5) {
    return { success: false, error: "Too many compounds. Balancer supports up to 5 compounds." };
  }

  // Set limits based on complexity
  const limit = totalCompounds === 5 ? 10 : 15;
  const coeff = Array(totalCompounds).fill(1);

  let solved = false;

  const checkBalance = () => {
    for (const el of uniqueElementsList) {
      let reactantCount = 0;
      for (let j = 0; j < numReactants; j++) {
        reactantCount += coeff[j] * (reactants[j].parsed[el] || 0);
      }
      let productCount = 0;
      for (let j = 0; j < numProducts; j++) {
        productCount += coeff[numReactants + j] * (products[j].parsed[el] || 0);
      }
      if (reactantCount !== productCount) return false;
    }
    return true;
  };

  // Nested search loop dynamically configured by recursion
  const solve = (index) => {
    if (index === totalCompounds) {
      if (checkBalance()) {
        solved = true;
        return true;
      }
      return false;
    }

    for (let val = 1; val <= limit; val++) {
      coeff[index] = val;
      if (solve(index + 1)) return true;
    }
    return false;
  };

  solve(0);

  if (solved) {
    // Simplify coefficients
    const divisor = gcdOfArray(coeff);
    const simplified = coeff.map(c => c / divisor);

    const balancedReactants = reactants.map((r, idx) => {
      const c = simplified[idx];
      return `${c > 1 ? c : ""}${r.formula}`;
    }).join(" + ");

    const balancedProducts = products.map((p, idx) => {
      const c = simplified[numReactants + idx];
      return `${c > 1 ? c : ""}${p.formula}`;
    }).join(" + ");

    // Atom summary table
    const table = uniqueElementsList.map(el => {
      let rCount = 0;
      for (let j = 0; j < numReactants; j++) {
        rCount += simplified[j] * (reactants[j].parsed[el] || 0);
      }
      return {
        element: el,
        atoms: rCount
      };
    });

    return {
      success: true,
      balancedEquation: `${balancedReactants} = ${balancedProducts}`,
      reactantsCoeffs: simplified.slice(0, numReactants),
      productsCoeffs: simplified.slice(numReactants),
      table
    };
  }

  return { success: false, error: "No integer coefficients found within search limits. Verify the chemical equation is valid." };
}

// --- SOLUBILITY LOOKUP DATA & RULES ---
const cationsList = ["Na+", "K+", "NH4+", "Ca2+", "Ba2+", "Mg2+", "Cu2+", "Fe3+", "Ag+", "Pb2+"];
const anionsList = ["Cl-", "Br-", "I-", "NO3-", "SO42-", "CO32-", "PO43-", "S2-", "OH-"];

function getSolubility(cation, anion) {
  // Alkali metals & Ammonium rules (always soluble)
  if (cation === "Na+" || cation === "K+" || cation === "NH4+") {
    return { status: "Soluble", rule: "All common salts of Group 1 metals and ammonium are soluble." };
  }
  // Nitrates rules (always soluble)
  if (anion === "NO3-") {
    return { status: "Soluble", rule: "All common nitrates are soluble." };
  }
  // Halides rules (Cl-, Br-, I-)
  if (anion === "Cl-" || anion === "Br-" || anion === "I-") {
    if (cation === "Ag+" || cation === "Pb2+") {
      return { status: "Insoluble", rule: "Most chlorides, bromides, and iodides are soluble, EXCEPT those of silver and lead." };
    }
    return { status: "Soluble", rule: "Most chlorides, bromides, and iodides are soluble." };
  }
  // Sulfates rules (SO42-)
  if (anion === "SO42-") {
    if (cation === "Ba2+" || cation === "Pb2+") {
      return { status: "Insoluble", rule: "Most sulfates are soluble, EXCEPT those of barium, calcium, and lead." };
    }
    if (cation === "Ca2+") {
      return { status: "Slightly Soluble", rule: "Calcium sulfate is slightly (partially) soluble." };
    }
    return { status: "Soluble", rule: "Most sulfates are soluble." };
  }
  // Hydroxides rules (OH-)
  if (anion === "OH-") {
    if (cation === "Ba2+") {
      return { status: "Soluble", rule: "Most hydroxides are insoluble, EXCEPT barium hydroxide which is soluble." };
    }
    if (cation === "Ca2+") {
      return { status: "Slightly Soluble", rule: "Calcium hydroxide is slightly soluble." };
    }
    return { status: "Insoluble", rule: "Most hydroxides are insoluble." };
  }
  // Carbonates, Phosphates, Sulfides rules (CO32-, PO43-, S2-)
  if (anion === "CO32-" || anion === "PO43-" || anion === "S2-") {
    return { status: "Insoluble", rule: "All common carbonates, phosphates, and sulfides are insoluble EXCEPT those of Group 1 and ammonium." };
  }

  return { status: "Soluble", rule: "Soluble in water." };
}

// Helper: Calculate Bohr model electron shell distribution based on Aufbau Principle
function getBohrShells(Z) {
  const subshells = [
    { max: 2, shell: 1 }, // 1s
    { max: 2, shell: 2 }, // 2s
    { max: 6, shell: 2 }, // 2p
    { max: 2, shell: 3 }, // 3s
    { max: 6, shell: 3 }, // 3p
    { max: 2, shell: 4 }, // 4s
    { max: 10, shell: 3 }, // 3d
    { max: 6, shell: 4 }, // 4p
    { max: 2, shell: 5 }, // 5s
    { max: 10, shell: 4 }, // 4d
    { max: 6, shell: 5 }, // 5p
    { max: 2, shell: 6 }, // 6s
    { max: 14, shell: 4 }, // 4f
    { max: 10, shell: 5 }, // 5d
    { max: 6, shell: 6 }, // 6p
    { max: 2, shell: 7 }, // 7s
    { max: 14, shell: 5 }, // 5f
    { max: 10, shell: 6 }, // 6d
    { max: 6, shell: 7 }  // 7p
  ];

  const shells = [0, 0, 0, 0, 0, 0, 0, 0];
  let remaining = Z;
  for (const sub of subshells) {
    if (remaining <= 0) break;
    const fill = Math.min(remaining, sub.max);
    shells[sub.shell] += fill;
    remaining -= fill;
  }
  const result = shells.slice(1);
  while (result.length > 0 && result[result.length - 1] === 0) {
    result.pop();
  }
  return result;
}

// Custom 360° Interactive 3D Atom Showcase Canvas Component
function InteractiveAtom3D({ protons, neutrons, electrons, isPlaying, speed }) {
  const canvasRef = useRef(null);
  const rotationRef = useRef({ x: 0.5, y: 0.5 });
  const mouseRef = useRef({ isDragging: false, startX: 0, startY: 0 });
  const timeRef = useRef(0);

  // Memoize stable 3D nucleus coordinates so they don't jump around
  const nucleusParticles = useMemo(() => {
    const particles = [];
    const count = protons + neutrons;
    if (count <= 0) return particles;
    for (let i = 0; i < count; i++) {
      const isProton = i < protons;
      // Spherical distribution using spiral/golden coordinates
      const theta = i * 2.39996; // Golden angle
      const phi = Math.acos(1 - (2 * (i + 0.5)) / count);
      const r = Math.min(16, Math.sqrt(i) * 2.8 + 4);
      
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);
      particles.push({ x, y, z, isProton });
    }
    return particles;
  }, [protons, neutrons]);

  // Calculate dynamic Bohr shells based on electrons count
  const shells = useMemo(() => {
    const el = elementsData.find(e => e.electrons === electrons);
    if (el && el.shellConfig && el.shellConfig !== "N/A") {
      return el.shellConfig.split(",").map(s => parseInt(s.trim(), 10));
    }
    return getBohrShells(electrons);
  }, [electrons]);

  // Handle Drag interaction
  const handleMouseDown = (e) => {
    mouseRef.current = {
      isDragging: true,
      startX: e.clientX,
      startY: e.clientY
    };
  };

  const handleMouseMove = (e) => {
    if (!mouseRef.current.isDragging) return;
    const dx = e.clientX - mouseRef.current.startX;
    const dy = e.clientY - mouseRef.current.startY;
    rotationRef.current.y += dx * 0.008;
    rotationRef.current.x += dy * 0.008;
    mouseRef.current.startX = e.clientX;
    mouseRef.current.startY = e.clientY;
  };

  const handleMouseUp = () => {
    mouseRef.current.isDragging = false;
  };

  // Touch Support for Mobile
  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      mouseRef.current = {
        isDragging: true,
        startX: e.touches[0].clientX,
        startY: e.touches[0].clientY
      };
    }
  };

  const handleTouchMove = (e) => {
    if (!mouseRef.current.isDragging || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - mouseRef.current.startX;
    const dy = e.touches[0].clientY - mouseRef.current.startY;
    rotationRef.current.y += dx * 0.01;
    rotationRef.current.x += dy * 0.01;
    mouseRef.current.startX = e.touches[0].clientX;
    mouseRef.current.startY = e.touches[0].clientY;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let localFrameId;

    const render = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      // Dynamic auto-scaling based on shells to fit 75%-85% viewport (radius ~38% of width)
      const totalShells = shells.length || 1;
      const spacePerShell = 20;
      const maxOrbitRadius = 45 + (totalShells - 1) * spacePerShell;
      const maxBoundary = maxOrbitRadius + 6; // Radius + outermost electron particle boundary
      
      // Calculate scale factor relative to target padded radius (38% of canvas.width)
      const baseScale = (canvas.width * 0.38) / maxBoundary;
      const d = 300; // perspective distance

      if (isPlaying) {
        timeRef.current += 0.016 * speed;
      }

      // Current camera rotation matrix angles
      const rotY = rotationRef.current.y; // yaw
      const rotX = rotationRef.current.x; // pitch

      const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
      const cosX = Math.cos(rotX), sinX = Math.sin(rotX);

      // 3D rotation helper with dynamic scaling
      const projectPoint = (x, y, z) => {
        // Rotate Y (horizontal drag)
        const x1 = x * cosY - z * sinY;
        const z1 = x * sinY + z * cosY;
        // Rotate X (vertical drag)
        const y2 = y * cosX - z1 * sinX;
        const z2 = y * sinX + z1 * cosX;
        
        // Perspective projection applying our adaptive scaling factor
        const scale = d / (d + z2 * baseScale);
        return {
          x: cx + x1 * baseScale * scale,
          y: cy + y2 * baseScale * scale,
          z: z2 * baseScale, // depth for Painter's algorithm
          scale: baseScale * scale
        };
      };

      const drawList = [];

      // 1. Generate 3D Nucleus Particles
      nucleusParticles.forEach(part => {
        const proj = projectPoint(part.x, part.y, part.z);
        drawList.push({
          type: "nucleus",
          z: proj.z,
          x: proj.x,
          y: proj.y,
          r: 6 * proj.scale,
          isProton: part.isProton
        });
      });

      // 2. Generate 3D Orbit segments & Electrons
      const shellColors = ["#00d2d3", "#54a0ff", "#a855f7", "#ff7675", "#feca57", "#1dd1a1", "#9b59b6"];
      
      shells.forEach((count, i) => {
        const radius = 45 + i * 20;
        const color = shellColors[i % shellColors.length];
        
        // Custom orbit tilts (inclination and azimuth) to look organic and volumetric
        const incl = (35 + i * 22) * (Math.PI / 180);
        const azim = (i * 45) * (Math.PI / 180);
        const cosI = Math.cos(incl), sinI = Math.sin(incl);
        const cosA = Math.cos(azim), sinA = Math.sin(azim);

        // Helper to rotate the circular path to its tilted orientation
        const getTiltedPoint = (angle) => {
          // Circular point in flat plane
          const ox = radius * Math.cos(angle);
          const oy = radius * Math.sin(angle);
          const oz = 0;

          // Rotate X (inclination)
          const y1 = oy * cosI;
          const z1 = -oy * sinI;

          // Rotate Y (azimuth)
          const x2 = ox * cosA + z1 * sinA;
          const z2 = -ox * sinA + z1 * cosA;

          return { x: x2, y: y1, z: z2 };
        };

        // Draw 3D Orbit rings using segments
        const numSegments = 64;
        for (let j = 0; j < numSegments; j++) {
          const a1 = (j * 2 * Math.PI) / numSegments;
          const a2 = ((j + 1) * 2 * Math.PI) / numSegments;
          
          const p1 = getTiltedPoint(a1);
          const p2 = getTiltedPoint(a2);

          const proj1 = projectPoint(p1.x, p1.y, p1.z);
          const proj2 = projectPoint(p2.x, p2.y, p2.z);

          drawList.push({
            type: "orbit",
            z: (proj1.z + proj2.z) / 2,
            x1: proj1.x,
            y1: proj1.y,
            x2: proj2.x,
            y2: proj2.y,
            color
          });
        }

        // Draw Electrons along this shell
        const baseSpeed = 1.2;
        const orbitSpeed = (baseSpeed - (i * 0.1)) * timeRef.current;
        for (let k = 0; k < count; k++) {
          const eAngle = orbitSpeed + (k * 2 * Math.PI) / count;
          const pos = getTiltedPoint(eAngle);
          const proj = projectPoint(pos.x, pos.y, pos.z);
          
          drawList.push({
            type: "electron",
            z: proj.z,
            x: proj.x,
            y: proj.y,
            r: 4.5 * proj.scale,
            color
          });
        }
      });

      // 3. Painter's Algorithm: Sort by depth (Z) descending (back to front)
      drawList.sort((a, b) => b.z - a.z);

      // 4. Draw all objects sequentially
      drawList.forEach(item => {
        if (item.type === "orbit") {
          ctx.beginPath();
          ctx.moveTo(item.x1, item.y1);
          ctx.lineTo(item.x2, item.y2);
          ctx.strokeStyle = item.color;
          ctx.lineWidth = 1;
          ctx.globalAlpha = 0.28;
          ctx.stroke();
          ctx.globalAlpha = 1.0;
        } else if (item.type === "nucleus") {
          ctx.beginPath();
          ctx.arc(item.x, item.y, item.r, 0, 2 * Math.PI);
          
          // Radial 3D shading gradient
          const grad = ctx.createRadialGradient(
            item.x - item.r * 0.3,
            item.y - item.r * 0.3,
            item.r * 0.1,
            item.x,
            item.y,
            item.r
          );
          if (item.isProton) {
            grad.addColorStop(0, "#ff7675");
            grad.addColorStop(1, "#d63031");
          } else {
            grad.addColorStop(0, "#74b9ff");
            grad.addColorStop(1, "#0984e3");
          }
          ctx.fillStyle = grad;
          ctx.fill();
        } else if (item.type === "electron") {
          ctx.beginPath();
          ctx.arc(item.x, item.y, item.r, 0, 2 * Math.PI);
          
          // Glowing electron sphere
          const grad = ctx.createRadialGradient(
            item.x - item.r * 0.2,
            item.y - item.r * 0.2,
            item.r * 0.1,
            item.x,
            item.y,
            item.r
          );
          grad.addColorStop(0, "#ffffff");
          grad.addColorStop(0.3, item.color);
          grad.addColorStop(1, "rgba(0,0,0,0.85)");
          
          ctx.fillStyle = grad;
          ctx.fill();
        }
      });

      localFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(localFrameId);
    };
  }, [nucleusParticles, shells, isPlaying, speed]);

  return (
    <canvas
      ref={canvasRef}
      width={360}
      height={360}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleMouseUp}
      className="cursor-grab active:cursor-grabbing max-w-full select-none"
    />
  );
}

// --- MAIN WORKSPACE COMPONENT ---

export default function ChemistryWorkspace() {
  const [activeSubTab, setActiveSubTab] = useState("balancer");

  // Balancer State
  const [equationInput, setEquationInput] = useState("C3H8 + O2 = CO2 + H2O");
  const [balanceResult, setBalanceResult] = useState(null);

  // Molar Mass State
  const [formulaInput, setFormulaInput] = useState("H2SO4");
  const [massResult, setMassResult] = useState(null);

  // Solubility State
  const [selectedSolubility, setSelectedSolubility] = useState(null);

  // 3D Atom Showcase State
  const [atomNumber, setAtomNumber] = useState(6); // Default Carbon
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [customProtons, setCustomProtons] = useState(6);
  const [customNeutrons, setCustomNeutrons] = useState(6);
  const [customElectrons, setCustomElectrons] = useState(6);

  // Initial trigger for Balancer
  useEffect(() => {
    if (activeSubTab === "balancer" && equationInput) {
      setBalanceResult(balanceEquation(equationInput));
    }
  }, [activeSubTab]);

  // Handle Equation Balancing
  const handleBalance = (e) => {
    e?.preventDefault();
    setBalanceResult(balanceEquation(equationInput));
  };

  // Handle Molar Mass calculation
  const handleCalculateMass = (e) => {
    e?.preventDefault();
    if (!formulaInput) return;
    const parsed = parseFormula(formulaInput);
    if (!parsed) {
      setMassResult({ success: false, error: "Invalid formula layout. Check casing and matching parentheses." });
      return;
    }

    let totalMass = 0;
    const breakdown = [];
    for (const [symbol, qty] of Object.entries(parsed)) {
      const el = elementsData.find(elem => elem.symbol === symbol);
      if (!el) {
        setMassResult({ success: false, error: `Unknown chemical element symbol: '${symbol}'` });
        return;
      }
      const mass = el.mass;
      const contribution = mass * qty;
      totalMass += contribution;
      breakdown.push({
        symbol,
        name: el.name,
        qty,
        atomicMass: mass,
        contribution
      });
    }

    setMassResult({
      success: true,
      formula: formulaInput,
      totalMass,
      breakdown
    });
  };

  // Sync virtual atom state when element ID changes
  useEffect(() => {
    const el = elementsData.find(e => e.number === parseInt(atomNumber));
    if (el) {
      setCustomProtons(el.protons);
      setCustomNeutrons(el.neutrons);
      setCustomElectrons(el.electrons);
    }
  }, [atomNumber]);

  // Calculate dynamic Bohr shells based on customElectrons state
  const getShellsForRender = () => {
    const el = elementsData.find(e => e.number === customElectrons);
    if (el && el.shellConfig && el.shellConfig !== "N/A" && el.electrons === customElectrons) {
      return el.shellConfig.split(",").map(s => parseInt(s.trim(), 10));
    }
    return getBohrShells(customElectrons);
  };
  const shells = getShellsForRender();

  return (
    <div className="w-full flex flex-col gap-6 select-none">
      
      {/* Sub-Navigation tabs */}
      <div className="glass-panel p-2 rounded-2xl flex gap-1.5 overflow-x-auto no-print">
        {[
          { id: "balancer", label: "Equation Balancer", icon: RefreshCw },
          { id: "molar", label: "Molar Mass Calculator", icon: Calculator },
          { id: "solubility", label: "Solubility Table", icon: Table2 },
          { id: "atom", label: "Virtual 3D Atom Showcase", icon: Play },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
                activeSubTab === tab.id
                  ? "bg-black/10 dark:bg-white/10 text-slate-900 dark:text-white shadow-inner border border-black/10 dark:border-white/15"
                  : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 border border-transparent"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Workspace Panel */}
      <div className="glass-panel w-full p-6 rounded-3xl min-h-[480px] text-left">
        
        {/* TAB 1: EQUATION BALANCER */}
        {activeSubTab === "balancer" && (
          <div className="flex flex-col gap-6 max-w-2xl mx-auto">
            <div className="text-center md:text-left">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">Advanced Chemical Equation Balancer</h2>
              <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1">
                Type an unbalanced reaction using standard molecular formulas separated by '+' and '=' or '{"->"}'.
              </p>
            </div>

            <form onSubmit={handleBalance} className="flex flex-col md:flex-row gap-3">
              <input
                type="text"
                value={equationInput}
                onChange={(e) => setEquationInput(e.target.value)}
                placeholder="e.g., C3H8 + O2 = CO2 + H2O"
                className="glass-input flex-1 px-4 py-3 rounded-xl text-base font-semibold"
              />
              <button
                type="submit"
                className="glass-btn px-6 py-3 rounded-xl text-sm font-bold text-slate-900 dark:text-white shadow bg-indigo-600/20 hover:bg-indigo-600/30 dark:bg-indigo-500/20 dark:hover:bg-indigo-500/40 border border-indigo-600/30 dark:border-indigo-500/40"
              >
                Balance Equation
              </button>
            </form>

            <div className="flex gap-2 justify-center flex-wrap md:justify-start">
              <span className="text-[10px] text-slate-650 dark:text-zinc-400 font-bold uppercase self-center mr-1">Examples:</span>
              {[
                "Fe + O2 = Fe2O3",
                "C3H8 + O2 = CO2 + H2O",
                "NaOH + H2SO4 = Na2SO4 + H2O",
                "Pb(NO3)2 = PbO + NO2 + O2"
              ].map(ex => (
                <button
                  key={ex}
                  type="button"
                  onClick={() => {
                    setEquationInput(ex);
                    setBalanceResult(balanceEquation(ex));
                  }}
                  className="text-[10px] bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/15 border border-black/10 dark:border-white/10 px-2 py-1 rounded text-slate-800 dark:text-zinc-300 font-mono"
                >
                  {ex}
                </button>
              ))}
            </div>

            {balanceResult && (
              <div className="mt-4 flex flex-col gap-4 border-t border-black/10 dark:border-white/10 pt-6">
                {balanceResult.success ? (
                  <>
                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl flex flex-col gap-1.5 text-center">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Balanced Equation</span>
                      <span className="text-xl font-extrabold text-slate-950 dark:text-white tracking-wide font-mono">
                        {balanceResult.balancedEquation}
                      </span>
                    </div>

                    <div className="flex flex-col gap-2">
                      <span className="text-[10px] uppercase font-bold text-slate-700 dark:text-zinc-400 tracking-wider">Reactant vs. Product Atom Counts</span>
                      <div className="overflow-hidden border border-black/10 dark:border-white/10 rounded-xl">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-black/5 dark:bg-white/5 text-slate-700 dark:text-zinc-400 border-b border-black/10 dark:border-white/10 font-bold text-xs">
                              <th className="p-3 text-left">Element</th>
                              <th className="p-3 text-center">Balanced Atom Count</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {balanceResult.table.map(row => (
                              <tr key={row.element} className="hover:bg-black/5 dark:bg-white/5 text-slate-800 dark:text-zinc-200">
                                <td className="p-3 font-bold">{row.element} ({elementsData.find(e => e.symbol === row.element)?.name || ""})</td>
                                <td className="p-3 text-center font-mono font-bold text-indigo-650 dark:text-indigo-300">{row.atoms}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="bg-red-500/10 border border-red-500/25 p-4 rounded-xl flex items-start gap-3">
                    <ShieldAlert className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-bold text-red-700 dark:text-red-400 uppercase tracking-wide">Error Balancing</span>
                      <p className="text-xs text-red-900 dark:text-red-200/90 mt-0.5 leading-relaxed">{balanceResult.error}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MOLAR MASS CALCULATOR */}
        {activeSubTab === "molar" && (
          <div className="flex flex-col gap-6 max-w-2xl mx-auto">
            <div className="text-center md:text-left">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">Molar Mass Breakdown Calculator</h2>
              <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1">
                Enter any molecular formula to compute its total weight and chemical component percentage weights.
              </p>
            </div>

            <form onSubmit={handleCalculateMass} className="flex flex-col md:flex-row gap-3">
              <input
                type="text"
                value={formulaInput}
                onChange={(e) => setFormulaInput(e.target.value)}
                placeholder="e.g., Al2(SO4)3"
                className="glass-input flex-1 px-4 py-3 rounded-xl text-base font-semibold"
              />
              <button
                type="submit"
                className="glass-btn px-6 py-3 rounded-xl text-sm font-bold text-slate-900 dark:text-white shadow bg-indigo-600/20 hover:bg-indigo-600/30 dark:bg-indigo-500/20 dark:hover:bg-indigo-500/40 border border-indigo-600/30 dark:border-indigo-500/40"
              >
                Calculate Mass
              </button>
            </form>

            <div className="flex gap-2 justify-center flex-wrap md:justify-start">
              <span className="text-[10px] text-slate-650 dark:text-zinc-400 font-bold uppercase self-center mr-1">Examples:</span>
              {[
                "H2O",
                "C6H12O6",
                "Ca(OH)2",
                "Mg(NO3)2",
                "(NH4)2SO4"
              ].map(ex => (
                <button
                  key={ex}
                  type="button"
                  onClick={() => {
                    setFormulaInput(ex);
                    // Proactively calculate
                    const parsed = parseFormula(ex);
                    if (parsed) {
                      let totalMass = 0;
                      const breakdown = [];
                      for (const [symbol, qty] of Object.entries(parsed)) {
                        const el = elementsData.find(elem => elem.symbol === symbol);
                        if (el) {
                          totalMass += el.mass * qty;
                          breakdown.push({ symbol, name: el.name, qty, atomicMass: el.mass, contribution: el.mass * qty });
                        }
                      }
                      setMassResult({ success: true, formula: ex, totalMass, breakdown });
                    }
                  }}
                  className="text-[10px] bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/15 border border-black/10 dark:border-white/10 px-2 py-1 rounded text-slate-800 dark:text-zinc-300 font-mono"
                >
                  {ex}
                </button>
              ))}
            </div>

            {massResult && (
              <div className="mt-4 flex flex-col gap-6 border-t border-black/10 dark:border-white/10 pt-6">
                {massResult.success ? (
                  <>
                    <div className="bg-indigo-500/10 border border-indigo-500/20 p-6 rounded-2xl flex flex-col gap-1.5 text-center">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-650 dark:text-indigo-400">Total Molar Mass</span>
                      <span className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-750 dark:from-indigo-300 dark:to-violet-400 font-sans tracking-tight">
                        {massResult.totalMass.toFixed(4)} <span className="text-base font-bold text-slate-700 dark:text-zinc-400 font-sans">g/mol</span>
                      </span>
                    </div>

                    <div className="flex flex-col gap-4">
                      <span className="text-[10px] uppercase font-bold text-slate-700 dark:text-zinc-400 tracking-wider">Elemental Contributions Breakdown</span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {massResult.breakdown.map(row => {
                          const percent = ((row.contribution / massResult.totalMass) * 100);
                          const colors = [
                            { bar: "bg-teal-500", text: "text-teal-700 dark:text-teal-400", border: "border-teal-500/20 bg-teal-500/5" },
                            { bar: "bg-blue-500", text: "text-blue-700 dark:text-blue-400", border: "border-blue-500/20 bg-blue-500/5" },
                            { bar: "bg-purple-500", text: "text-purple-700 dark:text-purple-400", border: "border-purple-500/20 bg-purple-500/5" },
                            { bar: "bg-rose-500", text: "text-rose-700 dark:text-rose-400", border: "border-rose-500/20 bg-rose-500/5" },
                            { bar: "bg-amber-500", text: "text-amber-700 dark:text-amber-400", border: "border-amber-500/20 bg-amber-500/5" }
                          ];
                          const hash = row.symbol.charCodeAt(0) % colors.length;
                          const color = colors[hash];

                          return (
                            <div key={row.symbol} className={`glass-panel-light p-4 rounded-2xl border ${color.border} flex flex-col gap-3 transition-premium`}>
                              <div className="flex justify-between items-start">
                                <div className="flex flex-col">
                                  <span className="text-lg font-black text-slate-950 dark:text-white">{row.symbol}</span>
                                  <span className="text-xs text-slate-600 dark:text-zinc-400">{row.name}</span>
                                </div>
                                <div className="flex flex-col items-end">
                                  <span className="text-base font-black text-slate-950 dark:text-white">{percent.toFixed(2)}%</span>
                                  <span className="text-[10px] text-slate-650 dark:text-zinc-400 font-bold uppercase">Weight Contribution</span>
                                </div>
                              </div>

                              <div className="w-full bg-slate-200 dark:bg-zinc-950/65 rounded-full h-2 overflow-hidden">
                                <div className={`h-full rounded-full ${color.bar}`} style={{ width: `${percent}%` }} />
                              </div>

                              <div className="flex justify-between text-[10px] text-slate-700 dark:text-zinc-400 font-mono mt-1 pt-2 border-t border-black/5 dark:border-white/5">
                                <span>Quantity: <strong className="text-slate-950 dark:text-white">{row.qty}</strong></span>
                                <span>At. Mass: <strong className="text-slate-950 dark:text-white">{row.atomicMass.toFixed(3)}</strong></span>
                                <span>Total: <strong className={color.text}>{row.contribution.toFixed(3)} g</strong></span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="bg-red-500/10 border border-red-500/25 p-4 rounded-xl flex items-start gap-3">
                    <ShieldAlert className="w-5 h-5 text-red-650 dark:text-red-400 shrink-0 mt-0.5" />
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-bold text-red-700 dark:text-red-400 uppercase tracking-wide">Error Parsing Formula</span>
                      <p className="text-xs text-red-900 dark:text-red-200/90 mt-0.5 leading-relaxed">{massResult.error}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SOLUBILITY TABLE */}
        {activeSubTab === "solubility" && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="text-left">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">Interactive Solubility Matrix</h2>
                <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1">
                  Grid displaying salt solubility rules. Click any cell to inspect exceptions and specific rules.
                </p>
              </div>

              <div className="flex gap-4 text-xs font-semibold">
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded bg-emerald-500/20 border border-emerald-500/40 block" />
                  <span className="text-emerald-700 dark:text-emerald-300">Soluble</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded bg-amber-500/20 border border-amber-500/40 block" />
                  <span className="text-amber-700 dark:text-amber-300">Slightly Soluble</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded bg-rose-500/20 border border-rose-500/40 block" />
                  <span className="text-rose-700 dark:text-rose-300">Insoluble</span>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto border border-black/10 dark:border-white/10 rounded-2xl w-full">
              <table className="w-full text-xs min-w-[760px] border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-zinc-950 border-b border-slate-200 dark:border-white/15 text-slate-700 dark:text-zinc-400 font-bold">
                    <th className="p-3 border-r border-black/10 dark:border-white/10 text-left">Cations \ Anions</th>
                    {anionsList.map(an => (
                      <th key={an} className="p-3 text-center border-r border-black/10 dark:border-white/10 font-bold">{an}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {cationsList.map(cat => (
                    <tr key={cat} className="hover:bg-black/5 dark:bg-white/5">
                      <td className="p-3 bg-slate-100 dark:bg-zinc-950/60 border-r border-slate-200 dark:border-white/10 font-black text-slate-900 dark:text-white">{cat}</td>
                      {anionsList.map(an => {
                        const sol = getSolubility(cat, an);
                        const isSelected = selectedSolubility && selectedSolubility.cation === cat && selectedSolubility.anion === an;
                        
                        let cellBg = "";
                        if (sol.status === "Soluble") {
                          cellBg = "bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 backdrop-blur-sm shadow-[inset_0_0_12px_rgba(16,185,129,0.05)] hover:bg-emerald-500/20";
                        } else if (sol.status === "Insoluble") {
                          cellBg = "bg-rose-500/10 border border-rose-500/25 text-rose-400 backdrop-blur-sm shadow-[inset_0_0_12px_rgba(244,63,94,0.05)] hover:bg-rose-500/20";
                        } else {
                          cellBg = "bg-amber-500/10 border border-amber-500/25 text-amber-400 backdrop-blur-sm shadow-[inset_0_0_12px_rgba(245,158,11,0.05)] hover:bg-amber-500/20";
                        }

                        return (
                          <td
                            key={an}
                            onClick={() => setSelectedSolubility({ cation: cat, anion: an, ...sol })}
                            className={`p-3 text-center border-r border-black/10 dark:border-white/10 font-bold cursor-pointer transition-premium ${cellBg} ${
                              isSelected ? "ring-2 ring-white scale-105 z-10" : ""
                            }`}
                          >
                            {sol.status[0]}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Solubility Rule Tooltip Popover */}
            <AnimatePresence>
              {selectedSolubility && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 15 }}
                  transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.6 }}
                  className="glass-panel p-6 rounded-3xl border border-black/10 dark:border-white/15 bg-white/80 dark:bg-slate-900/60 shadow-2xl relative mt-4 text-slate-800 dark:text-white max-w-xl mx-auto flex flex-col gap-2 transition-premium"
                >
                  <div className="flex justify-between items-center border-b border-black/10 dark:border-white/10 pb-3">
                    <span className="text-sm md:text-base font-extrabold text-slate-900 dark:text-white">
                      Solubility Analysis: <span className="text-indigo-650 dark:text-indigo-400 font-mono">{selectedSolubility.cation}</span> + <span className="text-indigo-650 dark:text-indigo-400 font-mono">{selectedSolubility.anion}</span>
                    </span>
                    <button
                      onClick={() => setSelectedSolubility(null)}
                      className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-premium"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-4 mt-3">
                    <div className={`text-xs px-3.5 py-1.5 rounded-full border leading-none font-black tracking-wide ${
                      selectedSolubility.status === "Soluble" ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30" :
                      selectedSolubility.status === "Insoluble" ? "bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/30" :
                      "bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30"
                    }`}>
                      {selectedSolubility.status}
                    </div>
                    <span className="text-xs text-slate-600 dark:text-zinc-400 font-medium">Standard High School Rules Matrix</span>
                  </div>

                  <p className="text-xs md:text-sm text-slate-855 dark:text-zinc-200 mt-3 leading-relaxed italic bg-black/5 dark:bg-black/25 p-4 rounded-xl border border-black/5 dark:border-white/5">
                    "{selectedSolubility.rule}"
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* TAB 4: VIRTUAL 3D ATOM SHOWCASE */}
        {activeSubTab === "atom" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-5xl mx-auto">
            
            {/* Visual Representation (Left Column: 7/12 cols) */}
            <div className="lg:col-span-7 flex flex-col items-center">
              
              {/* 360° Interactive 3D Atom Showcase Canvas */}
              <div className="relative flex items-center justify-center select-none">
                <InteractiveAtom3D
                  protons={customProtons}
                  neutrons={customNeutrons}
                  electrons={customElectrons}
                  isPlaying={isPlaying}
                  speed={speed}
                />
              </div>

              {/* Sub-Showcase Animation Controls */}
              <div className="flex gap-4 mt-6 items-center">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="glass-btn w-10 h-10 rounded-full flex items-center justify-center text-slate-900 dark:text-white"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
                </button>

                <div className="flex items-center gap-2 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 px-3 py-1.5 rounded-xl">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase">Speed</span>
                  <input
                    type="range"
                    min="0.5"
                    max="2.5"
                    step="0.5"
                    value={speed}
                    onChange={(e) => setSpeed(parseFloat(e.target.value))}
                    className="w-20 accent-indigo-500 cursor-pointer h-1 rounded"
                  />
                  <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-300 w-8">{speed}x</span>
                </div>
              </div>
            </div>

            {/* Parameter adjustments (Right Column: 5/12 cols) */}
            <div className="lg:col-span-5 flex flex-col gap-5">
              <div className="text-left">
                <span className="text-[10px] uppercase font-extrabold text-indigo-650 dark:text-indigo-400 tracking-wider">Virtual Lab Showcase</span>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1">Interactive Atom Simulator</h2>
                <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1">
                  Adjust proton, neutron, and electron values to model isotopes, stable atoms, or ions.
                </p>
              </div>

              {/* Element Selector Dropdown */}
              <div className="glass-panel-light p-3 rounded-xl flex flex-col gap-1 text-left">
                <span className="text-[10px] text-slate-700 dark:text-zinc-400 font-bold uppercase tracking-wider">Select Predefined Atom</span>
                <select
                  value={atomNumber}
                  onChange={(e) => setAtomNumber(e.target.value)}
                  className="glass-input bg-white/85 dark:bg-zinc-950/80 border border-black/10 dark:border-white/10 text-slate-900 dark:text-white rounded-lg p-2 mt-1 text-sm font-semibold cursor-pointer w-full focus:outline-none"
                >
                  {elementsData.map(e => (
                    <option key={e.number} value={e.number} className="bg-white dark:bg-zinc-950 text-slate-900 dark:text-white">
                      Z = {e.number}: {e.name} ({e.symbol})
                    </option>
                  ))}
                </select>
              </div>

              {/* Manual Increment/Decrement Controls */}
              <div className="flex flex-col gap-3">
                {/* Protons */}
                <div className="glass-panel-light p-3 rounded-xl flex items-center justify-between">
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold text-rose-700 dark:text-rose-300">Protons (p+)</span>
                    <span className="text-[10px] text-slate-655 dark:text-zinc-400">Defines element identity</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setCustomProtons(Math.max(1, customProtons - 1))}
                      className="glass-btn w-7 h-7 rounded-lg flex items-center justify-center text-slate-900 dark:text-white"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center text-lg font-black text-slate-900 dark:text-white font-mono">{customProtons}</span>
                    <button
                      onClick={() => setCustomProtons(Math.min(118, customProtons + 1))}
                      className="glass-btn w-7 h-7 rounded-lg flex items-center justify-center text-slate-900 dark:text-white"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Neutrons */}
                <div className="glass-panel-light p-3 rounded-xl flex items-center justify-between">
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold text-blue-700 dark:text-blue-300">Neutrons (n0)</span>
                    <span className="text-[10px] text-slate-655 dark:text-zinc-400">Alters isotopic mass</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setCustomNeutrons(Math.max(0, customNeutrons - 1))}
                      className="glass-btn w-7 h-7 rounded-lg flex items-center justify-center text-slate-900 dark:text-white"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center text-lg font-black text-slate-900 dark:text-white font-mono">{customNeutrons}</span>
                    <button
                      onClick={() => setCustomNeutrons(Math.min(176, customNeutrons + 1))}
                      className="glass-btn w-7 h-7 rounded-lg flex items-center justify-center text-slate-900 dark:text-white"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Electrons */}
                <div className="glass-panel-light p-3 rounded-xl flex items-center justify-between">
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300">Electrons (e-)</span>
                    <span className="text-[10px] text-slate-655 dark:text-zinc-400">Determines net charge/ionization</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setCustomElectrons(Math.max(0, customElectrons - 1))}
                      className="glass-btn w-7 h-7 rounded-lg flex items-center justify-center text-slate-900 dark:text-white"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center text-lg font-black text-slate-900 dark:text-white font-mono">{customElectrons}</span>
                    <button
                      onClick={() => setCustomElectrons(Math.min(118, customElectrons + 1))}
                      className="glass-btn w-7 h-7 rounded-lg flex items-center justify-center text-slate-900 dark:text-white"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Dynamic Charge & Stability Analysis */}
              <div className="glass-panel-light p-4 rounded-xl flex flex-col gap-2 text-xs text-left">
                <span className="text-[10px] text-slate-700 dark:text-zinc-400 font-bold uppercase tracking-wider block">Real-time Analysis</span>
                <div className="flex justify-between border-b border-black/5 dark:border-white/5 py-1">
                  <span className="text-slate-600 dark:text-zinc-400">Net Ionic Charge:</span>
                  <span className={`font-mono font-bold ${
                    customProtons - customElectrons > 0 ? "text-amber-600 dark:text-amber-400" :
                    customProtons - customElectrons < 0 ? "text-cyan-600 dark:text-cyan-400" :
                    "text-slate-900 dark:text-white"
                  }`}>
                    {customProtons - customElectrons > 0 ? `+${customProtons - customElectrons} (Cation)` :
                     customProtons - customElectrons < 0 ? `${customProtons - customElectrons} (Anion)` :
                     "0 (Neutral)"}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-600 dark:text-zinc-400">Nuclear Stability:</span>
                  <span className={`font-bold ${
                    Math.abs(customProtons - customNeutrons) <= 2 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                  }`}>
                    {Math.abs(customProtons - customNeutrons) <= 2 ? "Stable Nucleus" : "Unstable/Radioactive Isotope"}
                  </span>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
