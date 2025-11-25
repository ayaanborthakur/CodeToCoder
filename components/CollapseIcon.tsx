import React from 'react';

import CollapseIconSvg from '../assets/icons/CollapseIcon.svg?react';

interface CollapseIconProps {
  isCollapsed: boolean;
}

export const CollapseIcon: React.FC<CollapseIconProps> = ({ isCollapsed }) => (
  <CollapseIconSvg className={`w-5 h-5 transition-transform duration-200 ${!isCollapsed ? 'rotate-180' : ''}`} />
);
