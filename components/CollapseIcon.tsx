import React from 'react';

interface CollapseIconProps {
  isCollapsed: boolean;
}

export const CollapseIcon: React.FC<CollapseIconProps> = ({ isCollapsed }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={`w-5 h-5 transition-transform duration-200 ${!isCollapsed ? 'rotate-180' : ''}`}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
    </svg>
);
