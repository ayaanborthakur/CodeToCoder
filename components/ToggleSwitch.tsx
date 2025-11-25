
import React from 'react';

interface ToggleSwitchProps {
  isChecked: boolean;
  onChange: (isChecked: boolean) => void;
  label: string;
  tooltip?: string;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ isChecked, onChange, label, tooltip }) => {
  const id = React.useId();
  return (
    <label htmlFor={id} className="flex items-center justify-between cursor-pointer group relative">
      <span className="text-sm font-bold text-gray-900 dark:text-white">{label}</span>
      
      {/* Tooltip */}
      {tooltip && (
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max max-w-[200px] p-2 bg-black/90 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 text-center">
          {tooltip}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-black/90"></div>
        </div>
      )}

      <div className="relative">
        <input
          id={id}
          type="checkbox"
          className="sr-only"
          checked={isChecked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div className={`block w-12 h-6 rounded-full transition-colors ${isChecked ? 'bg-cyan-600' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
        <div
          className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
            isChecked ? 'transform translate-x-6' : ''
          }`}
        ></div>
      </div>
    </label>
  );
};
