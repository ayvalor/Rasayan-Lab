"use client";

import React, { useState } from "react";
import { elementsData, categoryNames } from "../data/elements";
import ElementCard from "./ElementCard";
import { Search, RotateCcw } from "lucide-react";

export default function PeriodicTable({ onElementClick }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [block, setBlock] = useState("");
  const [phase, setPhase] = useState("");

  const activeFilters = { search, category, block, phase };

  const handleReset = () => {
    setSearch("");
    setCategory("");
    setBlock("");
    setPhase("");
  };

  const categories = [
    { id: "alkali", label: "Alkali", color: "bg-group-alkali/15 text-group-alkali border-group-alkali/30" },
    { id: "alkaline", label: "Alkaline", color: "bg-group-alkaline/15 text-group-alkaline border-group-alkaline/30" },
    { id: "transition", label: "Transition", color: "bg-group-transition/15 text-group-transition border-group-transition/30" },
    { id: "post-transition", label: "Post-trans", color: "bg-group-post-transition/15 text-group-post-transition border-group-post-transition/30" },
    { id: "metalloid", label: "Metalloid", color: "bg-group-metalloid/15 text-group-metalloid border-group-metalloid/30" },
    { id: "reactive-nonmetal", label: "Nonmetals", color: "bg-group-reactive-nonmetal/15 text-group-reactive-nonmetal border-group-reactive-nonmetal/30" },
    { id: "halogen", label: "Halogens", color: "bg-group-halogen/15 text-group-halogen border-group-halogen/30" },
    { id: "noble", label: "Noble Gases", color: "bg-group-noble/15 text-group-noble border-group-noble/30" },
    { id: "lanthanide", label: "Lanthanide", color: "bg-group-lanthanide/15 text-group-lanthanide border-group-lanthanide/30" },
    { id: "actinide", label: "Actinide", color: "bg-group-actinide/15 text-group-actinide border-group-actinide/30" },
  ];

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Search & Filter Header Ribbon */}
      <div className="glass-panel w-full p-4 rounded-2xl flex flex-col gap-4 no-print select-none">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          
          {/* Search bar */}
          <div className="relative w-full lg:max-w-md">
            <span className="absolute inset-y-0 left-3 flex items-center text-slate-400 dark:text-zinc-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search elements by name, symbol, or atomic number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl text-sm"
            />
          </div>

          {/* Quick Stats Summary */}
          <div className="flex gap-4 text-xs text-slate-600 dark:text-zinc-400 font-medium">
            <div>
              Total: <span className="text-slate-800 dark:text-slate-100 font-extrabold">{elementsData.length}</span>
            </div>
            <div>
              Gas: <span className="text-cyan-600 dark:text-cyan-400 font-bold">{elementsData.filter(e => e.phase === "Gas").length}</span>
            </div>
            <div>
              Liquid: <span className="text-amber-600 dark:text-amber-400 font-bold">{elementsData.filter(e => e.phase === "Liquid").length}</span>
            </div>
            <div>
              Solid: <span className="text-emerald-600 dark:text-emerald-400 font-bold">{elementsData.filter(e => e.phase === "Solid").length}</span>
            </div>
            <div>
              Synthetic: <span className="text-purple-600 dark:text-purple-400 font-bold">{elementsData.filter(e => e.phase === "Synthetic").length}</span>
            </div>
          </div>
        </div>

        {/* Filter Badges Rows */}
        <div className="flex flex-wrap gap-4 items-center">
          
          {/* Categories */}
          <div className="flex flex-col gap-1.5 w-full">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">Categories</span>
            <div className="flex flex-wrap gap-1.5 max-h-[80px] overflow-y-auto pr-1">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(category === cat.id ? "" : cat.id)}
                  className={`text-[11px] px-2.5 py-1 rounded-full border transition-premium cursor-pointer ${
                    category === cat.id
                      ? `${cat.color} font-bold scale-105 shadow-sm`
                      : "bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-800 dark:hover:text-white"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap lg:flex-nowrap gap-6 w-full mt-1">
            {/* Block Filters */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">Blocks</span>
              <div className="flex gap-1.5">
                {["s", "p", "d", "f"].map((blk) => (
                  <button
                    key={blk}
                    onClick={() => setBlock(block === blk ? "" : blk)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center border font-mono text-sm transition-premium cursor-pointer uppercase ${
                      block === blk
                        ? "bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-bold border-indigo-500/50 scale-105"
                        : "bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-800 dark:hover:text-white"
                    }`}
                  >
                    {blk}
                  </button>
                ))}
              </div>
            </div>

            {/* STP State Filters */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">STP Phase</span>
              <div className="flex gap-1.5">
                {["Solid", "Liquid", "Gas", "Synthetic"].map((phs) => (
                  <button
                    key={phs}
                    onClick={() => setPhase(phase === phs ? "" : phs)}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition-premium cursor-pointer ${
                      phase === phs
                        ? "bg-violet-500/20 text-violet-700 dark:text-violet-300 font-bold border-violet-500/50 scale-105"
                        : "bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-800 dark:hover:text-white"
                    }`}
                  >
                    {phs}
                  </button>
                ))}
              </div>
            </div>

            {/* Reset Button */}
            {(category || block || phase || search) && (
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 self-end ml-auto text-xs text-rose-500 dark:text-rose-400 hover:text-rose-600 dark:hover:text-rose-300 glass-btn px-4 py-2 rounded-xl"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Desktop & Tablet: Periodic Table Grid (18 columns) with horizontal scroll */}
      <div className="hidden md:block w-full">
        <div className="periodic-table-scroll-wrapper">
          <div className="periodic-table-grid glass-panel p-4 rounded-3xl" style={{ minWidth: "980px" }}>
            
            {/* Render elements 1 to 118 with grid layout */}
            {elementsData.map((element) => {
              return (
                <ElementCard
                  key={element.number}
                  element={element}
                  onClick={onElementClick}
                  activeFilters={activeFilters}
                />
              );
            })}


            {/* Spacer Row 8: separator between main table and f-block */}
            <div style={{ gridRowStart: 8, gridColumnStart: 1, gridColumnEnd: 19 }} className="h-3" />


          </div>
        </div>
      </div>

      {/* Mobile Viewport: Scroll-Optimized Vertical List */}
      <div className="block md:hidden flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-slate-500 dark:text-zinc-400 px-1 uppercase tracking-wider">Elements Index</h3>
        <div className="flex flex-col gap-2 max-h-[600px] overflow-y-auto pr-1">
          {elementsData
            .filter((element) => {
              // Apply active filters on mobile too
              const { search, category: cat, block: blk, phase: phs } = activeFilters;
              if (search) {
                const q = search.toLowerCase();
                const mName = element.name.toLowerCase().includes(q);
                const mSym = element.symbol.toLowerCase().includes(q);
                const mNum = element.number.toString() === q;
                if (!mName && !mSym && !mNum) return false;
              }
              if (cat && element.category !== cat) return false;
              if (blk && element.block !== blk) return false;
              if (phs && element.phase !== phs) return false;
              return true;
            })
            .map((element) => (
              <div
                key={element.number}
                onClick={() => onElementClick(element)}
                className="glass-panel p-3 rounded-xl flex items-center justify-between cursor-pointer border border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-50 dark:hover:bg-white/5 transition-premium"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg bg-slate-100 dark:bg-zinc-900/60 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white">
                    {element.symbol}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-sm font-bold text-slate-800 dark:text-white">{element.name}</span>
                    <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium">
                      Atomic No: {element.number} • Block: <span className="uppercase">{element.block}</span>
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border leading-none font-semibold ${
                    element.phase === "Gas" ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20" :
                    element.phase === "Liquid" ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" :
                    element.phase === "Solid" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" :
                    "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20"
                  }`}>
                    {element.phase}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-zinc-400 font-semibold">{element.mass.toFixed(3)}</span>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
