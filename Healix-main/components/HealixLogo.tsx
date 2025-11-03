"use client";

import React from 'react';

interface HealixLogoProps {
  width?: number;
  height?: number;
  className?: string;
  textSize?: string;
}

export default function HealixLogo({ 
  width = 35, 
  height = 35, 
  className = "",
  textSize = "text-2xl"
}: HealixLogoProps) {
  return (
    <div className={`flex items-center ${className}`} style={{ minWidth: 'max-content' }}>
      {/* H SVG Logo */}
      <img 
        alt="Healix Logo" 
        loading="lazy" 
        width={width} 
        height={height} 
        decoding="async" 
        data-nimg="1" 
        className="mr-1 flex-shrink-0" 
        style={{color: 'transparent'}} 
        src="/logo.svg"
      />
      
      {/* "ealix" text */}
      <h1 className={`${textSize} whitespace-nowrap`}>ealix</h1>
    </div>
  );
}
