
import React from 'react';

import SettingsIconSvg from '../assets/icons/SettingsIcon.svg?react';

export const SettingsIcon: React.FC<{ className?: string }> = ({ className }) => (
    <SettingsIconSvg className={className || "w-6 h-6"} />
);
