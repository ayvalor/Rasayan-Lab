"use client";

import React, { useState, useEffect } from "react";
import { reactionsData } from "../data/reactions";
import { Printer, Eye, EyeOff, RotateCcw, FileText, CheckSquare, Settings, ShieldAlert } from "lucide-react";

// Helper: Convert formula numbers to subscript characters
function formatSubscripts(str) {
  const subscripts = {
    "0": "₀", "1": "₁", "2": "₂", "3": "₃", "4": "₄",
    "5": "₅", "6": "₆", "7": "₇", "8": "₈", "9": "₉"
  };
  return str.replace(/\d/g, m => subscripts[m] || m);
}

// Helper: Format equations with blank blanks for balancing
// e.g. "C3H8 + O2 = CO2 + H2O" -> "___ C₃H₈ + ___ O₂ → ___ CO₂ + ___ H₂O"
function formatBalancingQuestion(unbalancedFormula) {
  const sides = unbalancedFormula.replace(/\s+/g, "").split("=");
  if (sides.length !== 2) return unbalancedFormula;

  const formatSide = (sideStr) => {
    return sideStr.split("+").map(compound => `___ ${formatSubscripts(compound)}`).join(" + ");
  };

  return `${formatSide(sides[0])}  →  ${formatSide(sides[1])}`;
}

// Helper: Format equations for reaction type identification
function formatIdentificationQuestion(unbalancedFormula) {
  const sides = unbalancedFormula.replace(/\s+/g, "").split("=");
  if (sides.length !== 2) return unbalancedFormula;
  
  const formatSide = (sideStr) => {
    return sideStr.split("+").map(compound => formatSubscripts(compound)).join(" + ");
  };

  return `${formatSide(sides[0])}  →  ${formatSide(sides[1])}`;
}

// Helper: Format balanced answer equation
// coeffs is e.g. { reactants: [1, 5], products: [3, 4] }
function formatBalancingAnswer(reaction) {
  const sides = reaction.unbalanced.replace(/\s+/g, "").split("=");
  const reactants = sides[0].split("+");
  const products = sides[1].split("+");
  const rCoeffs = reaction.coeffs.reactants;
  const pCoeffs = reaction.coeffs.products;

  const balancedReactants = reactants.map((r, idx) => {
    const coeff = rCoeffs[idx];
    return `[${coeff}] ${formatSubscripts(r)}`;
  }).join(" + ");

  const balancedProducts = products.map((p, idx) => {
    const coeff = pCoeffs[idx];
    return `[${coeff}] ${formatSubscripts(p)}`;
  }).join(" + ");

  return `${balancedReactants}  →  ${balancedProducts}`;
}

const getCategoryLabel = (type) => {
  switch (type) {
    case "synthesis": return "Synthesis (A + B → AB)";
    case "decomposition": return "Decomposition (AB → A + B)";
    case "single_replacement": return "Single Replacement (A + BC → AC + B)";
    case "double_replacement": return "Double Replacement (AB + CD → AD + CB)";
    case "combustion": return "Combustion (Hydrocarbon + O₂ → CO₂ + H₂O)";
    default: return type;
  }
};

export default function WorksheetGenerator() {
  const [exerciseType, setExerciseType] = useState("balance"); // balance, identify, combined
  const [quantity, setQuantity] = useState(10);
  const [categories, setCategories] = useState({
    synthesis: true,
    decomposition: true,
    single_replacement: true,
    double_replacement: true,
    combustion: true
  });
  const [difficulties, setDifficulties] = useState({
    easy: true,
    medium: true,
    hard: false
  });

  const [questions, setQuestions] = useState([]);
  const [showAnswers, setShowAnswers] = useState(false);

  // Generate initial worksheet
  useEffect(() => {
    generateWorksheet();
  }, []);

  const handleCategoryToggle = (cat) => {
    setCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const handleDifficultyToggle = (diff) => {
    setDifficulties(prev => ({ ...prev, [diff]: !prev[diff] }));
  };

  const generateWorksheet = () => {
    // Filter reactionsData based on parameters
    let pool = reactionsData.filter(rx => {
      const matchCat = categories[rx.type];
      const matchDiff = difficulties[rx.difficulty];
      return matchCat && matchDiff;
    });

    if (pool.length === 0) {
      setQuestions([]);
      return;
    }

    // Shuffle pool (Fisher-Yates)
    const shuffled = [...pool];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // Slice to desired quantity. If pool is too small, we repeat or just show max
    const selected = shuffled.slice(0, quantity);

    // Map each reaction to a worksheet item containing the instruction type
    const formatted = selected.map((rx, idx) => {
      // For combined mode, we alternate question types
      let qType = exerciseType;
      if (exerciseType === "combined") {
        qType = idx % 2 === 0 ? "balance" : "identify";
      }

      return {
        ...rx,
        questionType: qType
      };
    });

    setQuestions(formatted);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full flex flex-col gap-6 select-none">
      
      {/* Configuration Panel - Hidden during Printing */}
      <div className="glass-panel w-full p-6 rounded-3xl flex flex-col gap-6 no-print text-left">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-indigo-400" />
          <h2 className="text-xl font-black text-slate-800 dark:text-slate-100">Worksheet Configurations</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Column 1: Exercise Selection */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] uppercase font-bold text-slate-600 dark:text-slate-400 tracking-wider">Exercise Type</span>
            <div className="flex flex-col gap-1.5">
              {[
                { id: "balance", label: "Balance Equations" },
                { id: "identify", label: "Identify Reaction Types" },
                { id: "combined", label: "Combined Exam Mode" }
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setExerciseType(opt.id)}
                  className={`text-xs px-3 py-2 rounded-xl text-left border font-semibold transition-all ${
                    exerciseType === opt.id
                      ? "bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border-indigo-500/40 font-bold"
                      : "bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-slate-800 dark:text-zinc-300 hover:bg-black/10 dark:hover:bg-white/15"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Column 2: Quantity Chips */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] uppercase font-bold text-slate-600 dark:text-slate-400 tracking-wider">Questions Quantity</span>
            <div className="flex flex-wrap gap-2">
              {[5, 10, 20, 30].map(qty => (
                <button
                  key={qty}
                  onClick={() => setQuantity(qty)}
                  className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-xs border transition-all ${
                    quantity === qty
                      ? "bg-violet-500/20 text-violet-700 dark:text-violet-300 border-violet-500/40 font-bold scale-105 shadow-inner"
                      : "bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-slate-800 dark:text-zinc-300 hover:bg-black/10 dark:hover:bg-white/15"
                  }`}
                >
                  {qty}
                </button>
              ))}
            </div>
          </div>

          {/* Column 3: Reaction Categories Checkboxes */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] uppercase font-bold text-slate-600 dark:text-slate-400 tracking-wider">Reaction Categories</span>
            <div className="flex flex-col gap-2 text-xs">
              {[
                { id: "synthesis", label: "Synthesis" },
                { id: "decomposition", label: "Decomposition" },
                { id: "single_replacement", label: "Single Replacement" },
                { id: "double_replacement", label: "Double Replacement" },
                { id: "combustion", label: "Combustion" }
              ].map(cat => (
                <label key={cat.id} className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-zinc-350 hover:text-slate-955 dark:hover:text-white font-medium">
                  <input
                    type="checkbox"
                    checked={categories[cat.id]}
                    onChange={() => handleCategoryToggle(cat.id)}
                    className="rounded border-black/15 dark:border-white/15 bg-black/5 dark:bg-white/5 text-indigo-500 focus:ring-0 focus:ring-offset-0 w-4 h-4 cursor-pointer"
                  />
                  {cat.label}
                </label>
              ))}
            </div>
          </div>

          {/* Column 4: Difficulty Levels */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] uppercase font-bold text-slate-600 dark:text-slate-400 tracking-wider">Difficulty Thresholds</span>
            <div className="flex flex-col gap-2 text-xs">
              {[
                { id: "easy", label: "Easy Matrix" },
                { id: "medium", label: "Medium Matrix" },
                { id: "hard", label: "Hard Matrix" }
              ].map(diff => (
                <label key={diff.id} className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-zinc-350 hover:text-slate-955 dark:hover:text-white font-medium">
                  <input
                    type="checkbox"
                    checked={difficulties[diff.id]}
                    onChange={() => handleDifficultyToggle(diff.id)}
                    className="rounded border-black/15 dark:border-white/15 bg-black/5 dark:bg-white/5 text-violet-500 focus:ring-0 focus:ring-offset-0 w-4 h-4 cursor-pointer"
                  />
                  {diff.label}
                </label>
              ))}
            </div>
          </div>

        </div>

        {/* Generate / Print Actions bar */}
        <div className="flex flex-wrap items-center gap-4 mt-4 border-t border-black/5 dark:border-white/5 pt-4">
          <button
            onClick={generateWorksheet}
            className="glass-btn px-6 py-2.5 rounded-xl text-xs font-bold text-indigo-600 dark:text-white bg-indigo-500/10 dark:bg-indigo-500/20 hover:bg-indigo-500/20 dark:hover:bg-indigo-500/30 border-indigo-500/30 dark:border-indigo-500/40 shadow"
          >
            Generate Worksheet
          </button>

          <button
            onClick={() => setShowAnswers(!showAnswers)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all ${
              showAnswers
                ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 font-extrabold"
                : "bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-slate-800 dark:text-zinc-300 hover:bg-black/10 dark:hover:bg-white/15"
            }`}
          >
            {showAnswers ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            {showAnswers ? "Hide Answer Key" : "Show Answer Key"}
          </button>

          {questions.length > 0 && (
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 ml-auto glass-btn px-5 py-2.5 rounded-xl text-xs font-bold text-violet-600 dark:text-white shadow bg-violet-500/10 dark:bg-violet-500/20 hover:bg-violet-500/20 dark:hover:bg-violet-500/30 border-violet-500/30 dark:border-violet-500/40"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </button>
          )}
        </div>
      </div>

      {/* Structured Question Paper Layout */}
      {questions.length > 0 ? (
        <div className="glass-panel w-full p-8 md:p-12 rounded-3xl text-left bg-zinc-900/5 dark:bg-zinc-950/20 shadow-2xl relative">
          
          {/* Header Metadata section (Prints nicely at the top) */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b-2 border-zinc-350 dark:border-zinc-700 pb-6 w-full text-slate-700 dark:text-zinc-300">
            <div className="flex flex-col text-left gap-1">
              <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <FileText className="w-6 h-6 text-indigo-500 dark:text-indigo-400 no-print" /> 
                <span>Chemistry Practice Sheet</span>
              </h1>
              <span className="text-xs text-slate-750 dark:text-zinc-400 font-semibold font-mono">
                Topic: Balancing & Reaction Classifications
              </span>
            </div>

            {/* School paper name details line */}
            <div className="flex flex-col gap-2 text-xs font-bold font-mono w-full md:w-auto mt-4 md:mt-0 text-left md:text-right">
              <div>Name: _______________________________</div>
              <div className="flex justify-between md:justify-end gap-6 mt-1">
                <span>Date: ____________</span>
                <span>Class: ___________</span>
              </div>
            </div>
          </div>

          {/* Practice Questions List */}
          <div className="flex flex-col gap-8 mt-8">
            {questions.map((rx, idx) => (
              <div key={idx} className="flex flex-col gap-2 pb-6 border-b border-black/5 dark:border-white/5 last:border-0">
                <div className="flex items-start gap-3">
                  <span className="font-bold text-sm text-indigo-400 font-mono w-6 text-right shrink-0 mt-0.5">
                    {idx + 1}.
                  </span>
                  
                  <div className="flex flex-col gap-3 w-full text-left">
                    {/* balancing question */}
                    {rx.questionType === "balance" && (
                      <div className="flex flex-col gap-1.5">
                        <span className="text-xs text-slate-700 dark:text-zinc-400 font-bold uppercase tracking-wide">
                          Question: Balance the chemical reaction
                        </span>
                        
                        <div className="text-base md:text-lg font-bold font-mono text-slate-900 dark:text-white tracking-wide mt-1">
                          {showAnswers ? (
                            <span className="text-emerald-600 dark:text-emerald-300 leading-relaxed font-black">
                              {formatBalancingAnswer(rx)}
                            </span>
                          ) : (
                            <span className="text-slate-900 dark:text-white leading-relaxed">
                              {formatBalancingQuestion(rx.unbalanced)}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* reaction type identification question */}
                    {rx.questionType === "identify" && (
                      <div className="flex flex-col gap-2">
                        <span className="text-xs text-slate-700 dark:text-zinc-400 font-bold uppercase tracking-wide">
                          Question: Identify the type of reaction
                        </span>
                        
                        <div className="text-base md:text-lg font-bold font-mono text-slate-900 dark:text-zinc-100 mt-1">
                          {formatIdentificationQuestion(rx.unbalanced)}
                        </div>

                        <div className="text-sm font-semibold mt-2 text-slate-800 dark:text-zinc-350">
                          {showAnswers ? (
                            <span>
                              Reaction Type: <span className="text-emerald-600 dark:text-emerald-400 font-black">{getCategoryLabel(rx.type)}</span>
                            </span>
                          ) : (
                            <span>
                              Reaction Type: __________________________________________________
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Teacher logic explanation block (shows only with Answer Key) */}
                    {showAnswers && rx.explanation && (
                      <div className="bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-lg text-xs mt-1">
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider block text-[9px]">
                          Balancing logic / Explanation
                        </span>
                        <p className="text-slate-750 dark:text-zinc-300 mt-1 leading-relaxed">{rx.explanation}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer of Question Paper */}
          <div className="border-t border-zinc-300 dark:border-zinc-700 pt-6 text-center text-xs text-slate-600 dark:text-slate-400 font-mono mt-12 flex justify-between">
            <span>Rasayan Lab Exam Engine</span>
            <span>Grade Score: ______ / {questions.length}</span>
          </div>
        </div>
      ) : (
        <div className="glass-panel w-full p-12 rounded-3xl text-center flex flex-col items-center justify-center gap-3">
          <ShieldAlert className="w-12 h-12 text-rose-500 dark:text-rose-400 opacity-80" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-2">No matching equations found</h3>
          <p className="text-xs text-slate-600 dark:text-zinc-400 max-w-sm">
            We couldn't find any chemical reactions matching your checked options. Try checking more categories or difficulties.
          </p>
        </div>
      )}
    </div>
  );
}
