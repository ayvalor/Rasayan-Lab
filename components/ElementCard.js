"use client";

import React, { useRef, useState } from "react";

export default function ElementCard({ element, onClick, activeFilters }) {
  const cardRef = useRef(null);
  const [tiltStyle, setTiltStyle] = useState({});

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate tilt
    const px = x / rect.width;
    const py = y / rect.height;
    const rx = (0.5 - py) * 20; // Max pitch 20 deg
    const ry = (px - 0.5) * 20; // Max yaw 20 deg

    setTiltStyle({
      transform: `perspective(600px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.06)`,
      "--mouse-x": `${x}px`,
      "--mouse-y": `${y}px`,
      zIndex: 10,
    });
  };

  const handleMouseLeave = () => {
    setTiltStyle({
      transform: "perspective(600px) rotateX(0deg) rotateY(0deg) scale(1)",
      transition: "transform 0.4s ease, z-index 0.4s ease",
      zIndex: 1,
    });
  };

  // Determine if the card matches active search/filters
  const isFiltered = () => {
    if (!activeFilters) return true;
    
    const { search, category, block, phase } = activeFilters;
    
    // Search filter
    if (search) {
      const q = search.toLowerCase();
      const matchName = element.name.toLowerCase().includes(q);
      const matchSymbol = element.symbol.toLowerCase().includes(q);
      const matchNum = element.number.toString() === q;
      if (!matchName && !matchSymbol && !matchNum) return false;
    }
    
    // Category filter
    if (category && element.category !== category) return false;
    
    // Block filter
    if (block && element.block !== block) return false;
    
    // Phase filter
    if (phase && element.phase !== phase) return false;
    
    return true;
  };

  const matched = isFiltered();

  // Position grid coordinates on desktop
  const gridStyle = {
    gridRowStart: element.period,
    gridColumnStart: element.group || 3,
  };

  // Lanthanides & Actinides positioning override
  if (element.number >= 58 && element.number <= 71) {
    gridStyle.gridRowStart = 9;
    gridStyle.gridColumnStart = (element.number - 58) + 4;
  } else if (element.number >= 90 && element.number <= 103) {
    gridStyle.gridRowStart = 10;
    gridStyle.gridColumnStart = (element.number - 90) + 4;
  }

  return (
    <div
      ref={cardRef}
      data-category={element.category}
      style={{ ...gridStyle, ...tiltStyle }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => onClick(element)}
      className={`element-card element-card-3d-wrapper relative select-none cursor-pointer flex flex-col justify-between p-1.5 md:p-2 rounded-lg transition-all duration-100 ease-out h-[68px] md:h-[78px] lg:h-[84px] text-left overflow-hidden ${
        matched ? "opacity-100 scale-100" : "opacity-20 scale-95 pointer-events-none"
      }`}
    >
      {/* Light shine reflection overlay */}
      <div className="shine-overlay" />

      {/* Top row: Number and mass */}
      <div className="flex justify-between items-center text-[8px] md:text-[9px]">
        <span className="element-number">{element.number}</span>
        <span className="element-mass truncate max-w-[70%]">{element.mass.toFixed(2)}</span>
      </div>

      {/* Center: Symbol */}
      <div className="element-symbol text-center text-lg md:text-2xl leading-none tracking-tight select-none">
        {element.symbol}
      </div>

      {/* Bottom row: Name */}
      <div className="element-name text-[7px] md:text-[9px] truncate tracking-tight text-center select-none">
        {element.name}
      </div>
      
      {/* Subtle indicator of electron configuration */}
      <div className="element-block-indicator absolute right-1 bottom-1 text-[6px] font-mono hidden md:block">
        {element.block}
      </div>
    </div>
  );
}
