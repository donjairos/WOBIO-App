import React from 'react';

export const WobioLogo: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* White Circle Background */}
    <circle cx="60" cy="60" r="58" fill="white" />
    
    {/* Stylized Blue W */}
    <path 
      d="M32 40 L44 80 L60 45 L76 80 L88 40" 
      stroke="#1877F2" 
      strokeWidth="14" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);
