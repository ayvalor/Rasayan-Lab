"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, HelpCircle, AlertTriangle, Lightbulb, User, Globe, Calendar, Zap, Layers } from "lucide-react";
import { categoryNames } from "../data/elements";

const getCategoryColor = (category) => {
  switch (category) {
    case "alkali": return "from-group-alkali/40 to-group-alkali/15 border-group-alkali/50 text-group-alkali";
    case "alkaline": return "from-group-alkaline/40 to-group-alkaline/15 border-group-alkaline/50 text-group-alkaline";
    case "transition": return "from-group-transition/40 to-group-transition/15 border-group-transition/50 text-group-transition";
    case "post-transition": return "from-group-post-transition/40 to-group-post-transition/15 border-group-post-transition/50 text-group-post-transition";
    case "metalloid": return "from-group-metalloid/40 to-group-metalloid/15 border-group-metalloid/50 text-group-metalloid";
    case "reactive-nonmetal": return "from-group-reactive-nonmetal/40 to-group-reactive-nonmetal/15 border-group-reactive-nonmetal/50 text-group-reactive-nonmetal";
    case "halogen": return "from-group-halogen/40 to-group-halogen/15 border-group-halogen/50 text-group-halogen";
    case "noble": return "from-group-noble/40 to-group-noble/15 border-group-noble/50 text-group-noble";
    case "lanthanide": return "from-group-lanthanide/40 to-group-lanthanide/15 border-group-lanthanide/50 text-group-lanthanide";
    case "actinide": return "from-group-actinide/40 to-group-actinide/15 border-group-actinide/50 text-group-actinide";
    default: return "from-group-unknown/40 to-group-unknown/15 border-group-unknown/50 text-group-unknown";
  }
};

// Safe display helper: show value or fallback
const safeDisplay = (value, fallback = "N/A") => {
  if (value === undefined || value === null || value === "") return fallback;
  return value;
};

export default function ElementDrawer({ element, onClose }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [showMnemonic, setShowMnemonic] = useState(false);

  if (!element) return null;

  const bgGradient = getCategoryColor(element.category);

  // Split shell configuration for shell visualizer
  const shells = element.shellConfig && element.shellConfig !== "N/A"
    ? element.shellConfig.split(",").map(s => parseInt(s.trim()))
    : [];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end no-print select-none">
        
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Drawer panel */}
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.7 }}
          className="relative w-full max-w-lg md:max-w-xl h-full flex flex-col glass-panel shadow-2xl border-l border-white/10 z-10"
        >
          {/* Header Banner - Category gradient */}
          <div className={`p-6 bg-gradient-to-r ${bgGradient} border-b relative flex items-center justify-between`}>
            <div>
              <span className="text-[10px] uppercase font-extrabold tracking-wider bg-black/40 px-2.5 py-1 rounded-full text-white/90">
                Atomic Number {element.number} • {element.block.toUpperCase()}-Block
              </span>
              <h2 className="text-3xl font-extrabold text-white mt-2 leading-none">{element.name}</h2>
              <p className="text-xs text-white/80 mt-1.5 font-medium">{categoryNames[element.category]}</p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Massive floating symbol */}
              <span className="text-6xl font-black opacity-30 select-none pointer-events-none pr-8">
                {element.symbol}
              </span>
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Drawer Tabs Navigation */}
          <div className="flex border-b border-white/10 bg-black/20 p-2 gap-1 overflow-x-auto">
            {[
              { id: "overview", label: "Overview" },
              { id: "structure", label: "Structure" },
              { id: "physical", label: "Physical & Energy" },
              { id: "society", label: "Context & Mnemonic" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`text-xs px-3.5 py-2 rounded-lg font-bold transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-white/10 text-white shadow-sm border border-white/15"
                    : "text-zinc-500 dark:text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content Area */}
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
            
            {/* OVERVIEW TAB */}
            {activeTab === "overview" && (
              <div className="flex flex-col gap-6">
                
                {/* Core parameters Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="glass-panel-light p-3 rounded-xl flex flex-col">
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider">Symbol</span>
                    <span className="text-xl font-black text-zinc-800 dark:text-white">{element.symbol}</span>
                  </div>
                  <div className="glass-panel-light p-3 rounded-xl flex flex-col">
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider">Atomic Mass</span>
                    <span className="text-xl font-bold text-zinc-800 dark:text-white">{element.mass} u</span>
                  </div>
                  <div className="glass-panel-light p-3 rounded-xl flex flex-col">
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider">STP Phase</span>
                    <span className={`text-lg font-bold ${
                      element.phase === "Gas" ? "text-cyan-400" :
                      element.phase === "Liquid" ? "text-amber-400" :
                      element.phase === "Solid" ? "text-emerald-400" :
                      "text-purple-400"
                    }`}>{element.phase}</span>
                  </div>
                  <div className="glass-panel-light p-3 rounded-xl flex flex-col">
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider">Valence Electrons</span>
                    <span className="text-lg font-bold text-zinc-800 dark:text-white">{safeDisplay(element.valenceElectrons)}</span>
                  </div>
                </div>

                {/* Shell breakdown card */}
                {shells.length > 0 && (
                  <div className="glass-panel-light p-4 rounded-xl flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5" /> Electron Shell Configuration
                      </span>
                      <span className="text-xs text-zinc-800 dark:text-white font-mono bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded">
                        {element.shellConfig}
                      </span>
                    </div>
                    {/* Concentric visual shell rings mock */}
                    <div className="flex gap-2 items-center justify-center p-2 bg-black/10 rounded-lg">
                      {shells.map((val, idx) => (
                        <div key={idx} className="flex flex-col items-center p-2 border border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 rounded-lg w-12">
                          <span className="text-[9px] text-zinc-500 dark:text-zinc-400 font-bold">Shell {idx+1}</span>
                          <span className="text-sm font-black text-indigo-600 dark:text-indigo-300 mt-1">{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Chemical Group & Period */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="glass-panel-light p-3 rounded-xl flex flex-col">
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider">Group</span>
                    <span className="text-base font-bold text-zinc-800 dark:text-white">{element.group || "N/A"}</span>
                  </div>
                  <div className="glass-panel-light p-3 rounded-xl flex flex-col">
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider">Period</span>
                    <span className="text-base font-bold text-zinc-800 dark:text-white">{element.period}</span>
                  </div>
                </div>
              </div>
            )}

            {/* STRUCTURE TAB */}
            {activeTab === "structure" && (
              <div className="flex flex-col gap-6">
                
                {/* Subatomic Particle breakdown */}
                <div className="glass-panel-light p-4 rounded-xl">
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider">Subatomic counts</span>
                  <div className="grid grid-cols-3 gap-3 mt-3">
                    <div className="bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl text-center">
                      <div className="text-xs text-rose-600 dark:text-rose-300 font-bold">Protons (p+)</div>
                      <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">{safeDisplay(element.protons)}</div>
                    </div>
                    <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-xl text-center">
                      <div className="text-xs text-blue-600 dark:text-blue-300 font-bold">Neutrons (n0)</div>
                      <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">{safeDisplay(element.neutrons)}</div>
                    </div>
                    <div className="bg-indigo-500/10 border border-indigo-500/20 p-3 rounded-xl text-center">
                      <div className="text-xs text-indigo-600 dark:text-indigo-300 font-bold">Electrons (e-)</div>
                      <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">{safeDisplay(element.electrons)}</div>
                    </div>
                  </div>
                </div>

                {/* Configurations parameters */}
                <div className="flex flex-col gap-4">
                  <div className="glass-panel-light p-3.5 rounded-xl flex flex-col gap-1">
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider">Quantum Electron Configuration</span>
                    <span className="text-sm font-mono font-bold text-white mt-1">{safeDisplay(element.quantumConfig)}</span>
                  </div>
                  <div className="glass-panel-light p-3.5 rounded-xl flex flex-col gap-1">
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider">Atomic Radius</span>
                    <span className="text-base font-bold text-zinc-800 dark:text-white mt-1">
                      {element.radius != null ? `${element.radius} pm` : "N/A"}
                    </span>
                  </div>
                  <div className="glass-panel-light p-3.5 rounded-xl flex flex-col gap-1">
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider">Common Ions Formed</span>
                    <span className="text-sm font-semibold text-zinc-800 dark:text-white mt-1">{safeDisplay(element.commonIons)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* PHYSICAL & ENERGY TAB */}
            {activeTab === "physical" && (
              <div className="flex flex-col gap-6">
                
                {/* Melting / Boiling points */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="glass-panel-light p-3.5 rounded-xl flex flex-col">
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider">Melting Point</span>
                    <span className="text-sm font-bold text-zinc-800 dark:text-white mt-1">{safeDisplay(element.meltingPoint)}</span>
                  </div>
                  <div className="glass-panel-light p-3.5 rounded-xl flex flex-col">
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider">Boiling Point</span>
                    <span className="text-sm font-bold text-zinc-800 dark:text-white mt-1">{safeDisplay(element.boilingPoint)}</span>
                  </div>
                </div>

                {/* Physical metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="glass-panel-light p-3.5 rounded-xl flex flex-col">
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider">Density</span>
                    <span className="text-sm font-semibold text-zinc-800 dark:text-white mt-1">{safeDisplay(element.density)}</span>
                  </div>
                  <div className="glass-panel-light p-3.5 rounded-xl flex flex-col">
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider">Specific Heat Capacity</span>
                    <span className="text-sm font-semibold text-zinc-800 dark:text-white mt-1">{safeDisplay(element.specificHeat)}</span>
                  </div>
                </div>

                {/* Energy attributes */}
                <div className="glass-panel-light p-4 rounded-xl flex flex-col gap-4">
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5" /> Electrodynamic & Energy Properties
                  </span>
                  
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-black/5 dark:bg-white/5 p-2.5 rounded-lg text-center">
                      <span className="text-[9px] text-zinc-500 dark:text-zinc-400 font-bold block">Electronegativity</span>
                      <span className="text-sm font-bold text-zinc-800 dark:text-white block mt-1">{safeDisplay(element.electronegativity)}</span>
                    </div>
                    <div className="bg-black/5 dark:bg-white/5 p-2.5 rounded-lg text-center">
                      <span className="text-[9px] text-zinc-500 dark:text-zinc-400 font-bold block">1st Ionization</span>
                      <span className="text-sm font-bold text-zinc-800 dark:text-white block mt-1">{safeDisplay(element.ionizationEnergy)}</span>
                    </div>
                    <div className="bg-black/5 dark:bg-white/5 p-2.5 rounded-lg text-center">
                      <span className="text-[9px] text-zinc-500 dark:text-zinc-400 font-bold block">Electron Affinity</span>
                      <span className="text-sm font-bold text-zinc-800 dark:text-white block mt-1">{safeDisplay(element.electronAffinity)}</span>
                    </div>
                  </div>
                  <div className="flex flex-col text-left border-t border-black/5 dark:border-white/5 pt-3">
                    <span className="text-[9px] text-zinc-500 dark:text-zinc-400 font-bold block">Common Oxidation States</span>
                    <span className="text-sm font-semibold text-zinc-800 dark:text-white mt-0.5">{safeDisplay(element.oxidationStates)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* CONTEXT & SOCIETY TAB */}
            {activeTab === "society" && (
              <div className="flex flex-col gap-5">
                
                {/* Discovery History */}
                <div className="glass-panel-light p-4 rounded-xl flex flex-col gap-2">
                  <div className="flex items-center gap-2 border-b border-black/5 dark:border-white/5 pb-2 text-[10px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider">
                    <Globe className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" /> Discovery & History
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-left mt-1">
                    <div>
                      <span className="text-zinc-500 dark:text-zinc-400 block">Discovery Year:</span>
                      <span className="font-semibold text-zinc-800 dark:text-white">{safeDisplay(element.discoveryYear)}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 dark:text-zinc-400 block">Discovered By:</span>
                      <span className="font-semibold text-zinc-800 dark:text-white">{safeDisplay(element.discoveredBy)}</span>
                    </div>
                  </div>
                  {element.namedBy && element.namedBy !== element.discoveredBy && (
                    <div className="text-xs text-left mt-1">
                      <span className="text-zinc-500 dark:text-zinc-400">Named By:</span>{" "}
                      <span className="font-semibold text-zinc-800 dark:text-white">{element.namedBy}</span>
                    </div>
                  )}
                </div>

                {/* Practical Uses */}
                {element.commonUses && (
                  <div className="glass-panel-light p-4 rounded-xl flex flex-col gap-2 text-left">
                    <div className="flex items-center gap-2 border-b border-black/5 dark:border-white/5 pb-2 text-[10px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider">
                      <Lightbulb className="w-3.5 h-3.5 text-yellow-400" /> Everyday Practical Uses
                    </div>
                    <p className="text-xs text-zinc-700 dark:text-zinc-200 mt-1 leading-relaxed">{element.commonUses}</p>
                  </div>
                )}

                {/* STSE Context */}
                {element.stseContext && (
                  <div className="glass-panel-light p-4 rounded-xl flex flex-col gap-2 text-left">
                    <div className="flex items-center gap-2 border-b border-black/5 dark:border-white/5 pb-2 text-[10px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider">
                      <HelpCircle className="w-3.5 h-3.5 text-cyan-400" /> Science, Technology, Society & Environment (STSE)
                    </div>
                    <p className="text-xs text-zinc-700 dark:text-zinc-300 mt-1 leading-relaxed italic">"{element.stseContext}"</p>
                  </div>
                )}

                {/* Hazard Risk Profiles */}
                {element.hazardWarning && (
                  <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex flex-col gap-2 text-left">
                    <div className="flex items-center gap-2 text-red-400 font-extrabold text-[10px] uppercase tracking-wider">
                      <AlertTriangle className="w-4 h-4 text-red-400" /> Hazard & Risk Warnings
                    </div>
                    <p className="text-xs text-red-200/80 leading-relaxed font-semibold">{element.hazardWarning}</p>
                  </div>
                )}

                {/* MEMORY MNEMONIC TOGGLE */}
                <div className="glass-panel-light p-4 rounded-xl flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-bold text-white">Student Memory Mnemonic</span>
                      <span className="text-[10px] text-zinc-500 dark:text-zinc-400">Helpful rhyme to memorize chemistry groups</span>
                    </div>
                    <button
                      onClick={() => setShowMnemonic(!showMnemonic)}
                      className={`text-xs px-3 py-1.5 rounded-lg border font-bold transition-all ${
                        showMnemonic 
                          ? "bg-amber-500/20 border-amber-500/30 text-amber-300 scale-105"
                          : "bg-white/5 border-white/10 text-zinc-500 dark:text-zinc-400 hover:text-white"
                      }`}
                    >
                      {showMnemonic ? "Hide" : "Show"}
                    </button>
                  </div>

                  {showMnemonic && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg text-center"
                    >
                      <span className="text-[10px] uppercase tracking-wider text-amber-400 font-bold block">
                        Periodic Mnemonic Association
                      </span>
                      <span className="text-sm font-bold text-zinc-800 dark:text-white mt-1 block">
                        {element.mnemonic || "N/A Mnemonic"}
                      </span>
                    </motion.div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Footer branding */}
          <div className="p-4 bg-black/40 border-t border-black/5 dark:border-white/5 text-center text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">
            Rasayan Lab Universal Studio v1.0.0
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
