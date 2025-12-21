import React from 'react';

import { ChevronDown } from 'lucide-react';

interface CollapseIconProps {
  isCollapsed: boolean;
}

export const CollapseIcon: React.FC<CollapseIconProps> = ({ isCollapsed }) => (
  <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${!isCollapsed ? 'rotate-180' : ''}`} />
);
