// data/reactions.js

export const reactionsData = [
  // EASY
  {
    id: "easy-s1",
    type: "synthesis",
    difficulty: "easy",
    unbalanced: "H2 + O2 = H2O",
    balanced: "2H2 + O2 = 2H2O",
    reactants: ["H2", "O2"],
    products: ["H2O"],
    coeffs: { reactants: [2, 1], products: [2] },
    explanation: "Synthesis of water from hydrogen and oxygen. Balance oxygen first by doubling H2O, then double H2."
  },
  {
    id: "easy-s2",
    type: "synthesis",
    difficulty: "easy",
    unbalanced: "Mg + O2 = MgO",
    balanced: "2Mg + O2 = 2MgO",
    reactants: ["Mg", "O2"],
    products: ["MgO"],
    coeffs: { reactants: [2, 1], products: [2] },
    explanation: "Synthesis of magnesium oxide. Double MgO to balance O, then double Mg."
  },
  {
    id: "easy-d1",
    type: "decomposition",
    difficulty: "easy",
    unbalanced: "H2O = H2 + O2",
    balanced: "2H2O = 2H2 + O2",
    reactants: ["H2O"],
    products: ["H2", "O2"],
    coeffs: { reactants: [2], products: [2, 1] },
    explanation: "Electrolysis of water into hydrogen and oxygen gases."
  },
  {
    id: "easy-d2",
    type: "decomposition",
    difficulty: "easy",
    unbalanced: "HgO = Hg + O2",
    balanced: "2HgO = 2Hg + O2",
    reactants: ["HgO"],
    products: ["Hg", "O2"],
    coeffs: { reactants: [2], products: [2, 1] },
    explanation: "Thermal decomposition of mercuric oxide."
  },
  {
    id: "easy-sr1",
    type: "single_replacement",
    difficulty: "easy",
    unbalanced: "Zn + HCl = ZnCl2 + H2",
    balanced: "Zn + 2HCl = ZnCl2 + H2",
    reactants: ["Zn", "HCl"],
    products: ["ZnCl2", "H2"],
    coeffs: { reactants: [1, 2], products: [1, 1] },
    explanation: "Zinc metal reacts with hydrochloric acid. Double HCl to balance chlorine and hydrogen."
  },
  {
    id: "easy-dr1",
    type: "double_replacement",
    difficulty: "easy",
    unbalanced: "AgNO3 + NaCl = AgCl + NaNO3",
    balanced: "AgNO3 + NaCl = AgCl + NaNO3",
    reactants: ["AgNO3", "NaCl"],
    products: ["AgCl", "NaNO3"],
    coeffs: { reactants: [1, 1], products: [1, 1] },
    explanation: "Precipitation reaction. Already balanced as 1:1:1:1."
  },
  {
    id: "easy-c1",
    type: "combustion",
    difficulty: "easy",
    unbalanced: "C + O2 = CO2",
    balanced: "C + O2 = CO2",
    reactants: ["C", "O2"],
    products: ["CO2"],
    coeffs: { reactants: [1, 1], products: [1] },
    explanation: "Complete combustion of pure carbon. Already balanced."
  },

  // MEDIUM
  {
    id: "med-s1",
    type: "synthesis",
    difficulty: "medium",
    unbalanced: "Na + Cl2 = NaCl",
    balanced: "2Na + Cl2 = 2NaCl",
    reactants: ["Na", "Cl2"],
    products: ["NaCl"],
    coeffs: { reactants: [2, 1], products: [2] },
    explanation: "Sodium reacts with chlorine gas. Double NaCl to balance diatomic chlorine, then double Na."
  },
  {
    id: "med-d1",
    type: "decomposition",
    difficulty: "medium",
    unbalanced: "CaCO3 = CaO + CO2",
    balanced: "CaCO3 = CaO + CO2",
    reactants: ["CaCO3"],
    products: ["CaO", "CO2"],
    coeffs: { reactants: [1], products: [1, 1] },
    explanation: "Thermal decomposition of calcium carbonate (limestone). Already balanced."
  },
  {
    id: "med-d2",
    type: "decomposition",
    difficulty: "medium",
    unbalanced: "KClO3 = KCl + O2",
    balanced: "2KClO3 = 2KCl + 3O2",
    reactants: ["KClO3"],
    products: ["KCl", "O2"],
    coeffs: { reactants: [2], products: [2, 3] },
    explanation: "Decomposition of potassium chlorate. Find common multiple (6) for oxygen: 2 molecules KClO3 produce 3 molecules O2."
  },
  {
    id: "med-sr1",
    type: "single_replacement",
    difficulty: "medium",
    unbalanced: "Fe + CuSO4 = FeSO4 + Cu",
    balanced: "Fe + CuSO4 = FeSO4 + Cu",
    reactants: ["Fe", "CuSO4"],
    products: ["FeSO4", "Cu"],
    coeffs: { reactants: [1, 1], products: [1, 1] },
    explanation: "Iron displaces copper from copper sulfate solution. Already balanced."
  },
  {
    id: "med-sr2",
    type: "single_replacement",
    difficulty: "medium",
    unbalanced: "Al + HCl = AlCl3 + H2",
    balanced: "2Al + 6HCl = 2AlCl3 + 3H2",
    reactants: ["Al", "HCl"],
    products: ["AlCl3", "H2"],
    coeffs: { reactants: [2, 6], products: [2, 3] },
    explanation: "Aluminum dissolves in hydrochloric acid. Balance chlorine first (multiple of 3 and 2 is 6), then balance Al and H."
  },
  {
    id: "med-dr1",
    type: "double_replacement",
    difficulty: "medium",
    unbalanced: "NaOH + H2SO4 = Na2SO4 + H2O",
    balanced: "2NaOH + H2SO4 = Na2SO4 + 2H2O",
    reactants: ["NaOH", "H2SO4"],
    products: ["Na2SO4", "H2O"],
    coeffs: { reactants: [2, 1], products: [1, 2] },
    explanation: "Neutralization reaction. Double NaOH to balance sodium, then double H2O to balance hydrogen and oxygen."
  },
  {
    id: "med-dr2",
    type: "double_replacement",
    difficulty: "medium",
    unbalanced: "BaCl2 + Na2SO4 = BaSO4 + NaCl",
    balanced: "BaCl2 + Na2SO4 = BaSO4 + 2NaCl",
    reactants: ["BaCl2", "Na2SO4"],
    products: ["BaSO4", "NaCl"],
    coeffs: { reactants: [1, 1], products: [1, 2] },
    explanation: "Precipitation of barium sulfate. Double NaCl to balance sodium and chlorine."
  },
  {
    id: "med-c1",
    type: "combustion",
    difficulty: "medium",
    unbalanced: "CH4 + O2 = CO2 + H2O",
    balanced: "CH4 + 2O2 = CO2 + 2H2O",
    reactants: ["CH4", "O2"],
    products: ["CO2", "H2O"],
    coeffs: { reactants: [1, 2], products: [1, 2] },
    explanation: "Combustion of methane. Balance hydrogen first by doubling H2O, then balance oxygen by doubling O2."
  },

  // HARD
  {
    id: "hard-s1",
    type: "synthesis",
    difficulty: "hard",
    unbalanced: "Fe + O2 = Fe2O3",
    balanced: "4Fe + 3O2 = 2Fe2O3",
    reactants: ["Fe", "O2"],
    products: ["Fe2O3"],
    coeffs: { reactants: [4, 3], products: [2] },
    explanation: "Iron rusting synthesis. Find common multiple (6) for oxygen: 3 molecules O2 react with 4 Fe atoms to form 2 Fe2O3."
  },
  {
    id: "hard-s2",
    type: "synthesis",
    difficulty: "hard",
    unbalanced: "N2 + H2 = NH3",
    balanced: "N2 + 3H2 = 2NH3",
    reactants: ["N2", "H2"],
    products: ["NH3"],
    coeffs: { reactants: [1, 3], products: [2] },
    explanation: "Haber process for ammonia synthesis. Double NH3 to balance nitrogen, then triple H2 to balance hydrogen."
  },
  {
    id: "hard-d1",
    type: "decomposition",
    difficulty: "hard",
    unbalanced: "NH4NO3 = N2O + H2O",
    balanced: "NH4NO3 = N2O + 2H2O",
    reactants: ["NH4NO3"],
    products: ["N2O", "H2O"],
    coeffs: { reactants: [1], products: [1, 2] },
    explanation: "Thermal decomposition of ammonium nitrate. Double H2O to balance hydrogen and oxygen."
  },
  {
    id: "hard-d2",
    type: "decomposition",
    difficulty: "hard",
    unbalanced: "Pb(NO3)2 = PbO + NO2 + O2",
    balanced: "2Pb(NO3)2 = 2PbO + 4NO2 + O2",
    reactants: ["Pb(NO3)2"],
    products: ["PbO", "NO2", "O2"],
    coeffs: { reactants: [2], products: [2, 4, 1] },
    explanation: "Decomposition of lead nitrate. High matrix difficulty due to multiple oxygen sources and nitrogen splits."
  },
  {
    id: "hard-sr1",
    type: "single_replacement",
    difficulty: "hard",
    unbalanced: "Al + Fe2O3 = Al2O3 + Fe",
    balanced: "2Al + Fe2O3 = Al2O3 + 2Fe",
    reactants: ["Al", "Fe2O3"],
    products: ["Al2O3", "Fe"],
    coeffs: { reactants: [2, 1], products: [1, 2] },
    explanation: "Thermite reaction. Double Al and Fe to balance metals; oxygen is already balanced."
  },
  {
    id: "hard-dr1",
    type: "double_replacement",
    difficulty: "hard",
    unbalanced: "Al2(SO4)3 + Ca(OH)2 = Al(OH)3 + CaSO4",
    balanced: "Al2(SO4)3 + 3Ca(OH)2 = 2Al(OH)3 + 3CaSO4",
    reactants: ["Al2(SO4)3", "Ca(OH)2"],
    products: ["Al(OH)3", "CaSO4"],
    coeffs: { reactants: [1, 3], products: [2, 3] },
    explanation: "Double displacement precipitate. Double Al(OH)3 to balance Al, triple Ca(OH)2 to balance hydroxide, then triple CaSO4."
  },
  {
    id: "hard-c1",
    type: "combustion",
    difficulty: "hard",
    unbalanced: "C3H8 + O2 = CO2 + H2O",
    balanced: "C3H8 + 5O2 = 3CO2 + 4H2O",
    reactants: ["C3H8", "O2"],
    products: ["CO2", "H2O"],
    coeffs: { reactants: [1, 5], products: [3, 4] },
    explanation: "Combustion of propane. Balance carbon (3) and hydrogen (8) in products first, then tally oxygen (10) and balance reactants."
  },
  {
    id: "hard-c2",
    type: "combustion",
    difficulty: "hard",
    unbalanced: "C4H10 + O2 = CO2 + H2O",
    balanced: "2C4H10 + 13O2 = 8CO2 + 10H2O",
    reactants: ["C4H10", "O2"],
    products: ["CO2", "H2O"],
    coeffs: { reactants: [2, 13], products: [8, 10] },
    explanation: "Combustion of butane. Balancing leads to a fractional oxygen coefficient (6.5), requiring all coefficients to be doubled."
  }
];
