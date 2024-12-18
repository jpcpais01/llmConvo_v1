'use client';

import React, { ReactNode } from 'react';

interface ResponsiveContainerProps {
  children: ReactNode;
  className?: string;
}

export function ResponsiveContainer({ children, className = '' }: ResponsiveContainerProps) {
  return (
    <div 
      className={`screen-container no-scroll ${className}`}
    >
      <div className="screen-content">
        {children}
      </div>
    </div>
  );
}
