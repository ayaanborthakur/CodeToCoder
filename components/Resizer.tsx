
import React from 'react';

interface ResizerProps {
  direction: 'horizontal' | 'vertical';
  onMouseDown: (event: React.MouseEvent) => void;
}

export const Resizer: React.FC<ResizerProps> = ({ direction, onMouseDown }) => {
  const isHorizontal = direction === 'horizontal';

  return (
    <div
      className={`flex-shrink-0 relative z-50 transition-colors duration-200
        ${isHorizontal ? 'w-px cursor-col-resize' : 'h-px cursor-row-resize'}
        bg-gray-200 dark:bg-gray-800
        hover:bg-cyan-500 dark:hover:bg-cyan-500
      `}
      onMouseDown={onMouseDown}
    >
      {/* Invisible expanded hit area for easier grabbing */}
      <div 
        className={`absolute bg-transparent ${
          isHorizontal ? 'inset-y-0 -left-2 -right-2' : 'inset-x-0 -top-2 -bottom-2'
        }`} 
      />
    </div>
  );
};
