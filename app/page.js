"use client";

import React, { useState, useEffect } from "react";
import PeriodicTable from "../components/PeriodicTable";
import ElementDrawer from "../components/ElementDrawer";
import ChemistryWorkspace from "../components/ChemistryWorkspace";
import WorksheetGenerator from "../components/WorksheetGenerator";
import { Table, Beaker, FileSpreadsheet, Atom, Sun, Moon } from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState("table"); // table, suite, worksheet
  const [selectedElement, setSelectedElement] = useState(null);
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "dark";
    setTheme(savedTheme);
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleElementClick = (element) => {
    setSelectedElement(element);
  };

  const handleCloseDrawer = () => {
    setSelectedElement(null);
  };

  return (
    <div className="flex flex-col flex-1 min-h-screen relative pb-16">
      
      {/* Animated Mesh Gradient Background */}
      <div className="mesh-gradient-bg" />

      {/* Main App Navbar Header */}
      <header className="w-full max-w-7xl mx-auto px-4 py-6 no-print select-none">
        <div className="glass-panel w-full px-6 py-4 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* Logo Branding */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center">
              <Atom className="w-5.5 h-5.5 text-indigo-400 animate-pulse" />
            </div>
            <div className="flex flex-col text-left">
              <h1 className="text-xl font-black text-slate-800 dark:text-slate-100 leading-none tracking-tight">Rasayan Lab</h1>
              <span className="text-[10px] text-slate-600 dark:text-slate-400 font-bold uppercase mt-1 tracking-wider">
                Universal Rasayan Studio
              </span>
            </div>
          </div>

          {/* Nav Links + Glassmorphic Mode Toggle */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Navigation Tabs */}
            <nav className="flex gap-1 bg-black/10 dark:bg-black/35 p-1 rounded-xl border border-black/5 dark:border-white/5">
              {[
                { id: "table", label: "Periodic Table", icon: Table },
                { id: "suite", label: "Chemistry Suite", icon: Beaker },
                { id: "worksheet", label: "Worksheet Generator", icon: FileSpreadsheet }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-lg transition-premium cursor-pointer ${
                      activeTab === tab.id
                        ? "bg-white/40 dark:bg-white/10 text-zinc-900 dark:text-white shadow border border-black/10 dark:border-white/10 scale-105"
                        : "text-zinc-600 dark:text-slate-600 dark:text-slate-400 hover:text-zinc-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>

            {/* Glassmorphic Mode Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2.5 rounded-xl border backdrop-blur-md transition-premium flex items-center justify-center cursor-pointer ${
                theme === "light"
                  ? "bg-white/30 border-white/40 shadow-sm text-slate-800"
                  : "bg-slate-900/30 border-slate-800/40 shadow-lg text-yellow-400"
              }`}
              title="Toggle Dark/Light Mode"
            >
              {theme === "light" ? (
                <Moon className="w-4 h-4" />
              ) : (
                <Sun className="w-4 h-4" />
              )}
            </button>
          </div>

        </div>
      </header>

      {/* Main App Content Viewport */}
      <main className="w-full max-w-7xl mx-auto px-4 flex-1 flex flex-col">
        
        {/* Render Periodic Table Grid View */}
        {activeTab === "table" && (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="text-center md:text-left self-start mb-6 no-print relative z-10">
              <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100 leading-none">Interactive Periodic Table</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
                Click any element tile to explore subatomic, thermodynamic, historical, and STSE properties.
              </p>
            </div>
            <PeriodicTable onElementClick={handleElementClick} />
          </div>
        )}

        {/* Render Chemistry Suite Utilities */}
        {activeTab === "suite" && (
          <div className="flex-1 flex flex-col">
            <div className="text-left mb-6 relative z-10">
              <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100 leading-none">Chemistry Tools Workspace</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
                Evaluate stoichiometry, balance reactions, study solubility curves, and model atomic particles.
              </p>
            </div>
            <ChemistryWorkspace />
          </div>
        )}

        {/* Render Worksheet Creator */}
        {activeTab === "worksheet" && (
          <div className="flex-1 flex flex-col">
            <div className="text-left mb-6 no-print relative z-10">
              <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100 leading-none">Practice Worksheet Generator</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
                Generate tailored exams for students, print test sheets, and toggle the master answer keys.
              </p>
            </div>
            <WorksheetGenerator />
          </div>
        )}

      </main>

      {/* Global Minimalist Footer */}
      <footer className="w-full max-w-7xl mx-auto px-4 mt-auto pt-12 no-print select-none">
        <div className="border-t border-slate-200 dark:border-white/10 py-6 text-center text-xs text-slate-500 dark:text-slate-400 font-medium tracking-wide bg-transparent backdrop-blur-sm rounded-t-2xl">
          © 2026 Rasayan Lab. Designed & Developed by ayvalor. All Rights Reserved.
        </div>
      </footer>

      {/* Floating Detailed Sidebar Element Drawer */}
      <ElementDrawer element={selectedElement} onClose={handleCloseDrawer} />
      
    </div>
  );
}
