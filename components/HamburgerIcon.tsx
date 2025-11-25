import React from 'react';

interface HamburgerIconProps {
  onClick: () => void;
  isOpen: boolean;
}

export const HamburgerIcon: React.FC<HamburgerIconProps> = ({ onClick, isOpen }) => {
  const barClasses = "absolute block w-6 h-0.5 bg-gray-600 dark:bg-gray-300 transition-all duration-300 ease-in-out group-hover:bg-cyan-400 left-1/2 -translate-x-1/2";
  
  return (
    <button 
      onClick={onClick} 
      className="w-[32px] h-[32px] rounded-md group relative focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500"
      aria-label="Toggle navigation"
    >
      <span className={`${barClasses} ${isOpen ? 'top-1/2 -translate-y-1/2 rotate-45' : 'top-[9px]'}`}></span>
      <span className={`${barClasses} top-1/2 -translate-y-1/2 ${isOpen ? 'opacity-0' : ''}`}></span>
      <span className={`${barClasses} ${isOpen ? 'top-1/2 -translate-y-1/2 -rotate-45' : 'top-[21px]'}`}></span>
    </button>
  );
};