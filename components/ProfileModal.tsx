
import React from 'react';
import { useAuth } from '../contexts/AuthContext';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: {
      lessons: number;
      practice: number;
  };
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, stats }) => {
  const { user, logout } = useAuth();

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 max-w-md w-full border border-gray-200 dark:border-gray-700 animate-scale-in relative overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Background Decoration */}
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-br from-cyan-500 to-blue-600 opacity-20 dark:opacity-30"></div>

        <div className="relative flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-3xl font-bold text-white shadow-xl border-4 border-white dark:border-gray-800 mb-4">
                {user.name.charAt(0).toUpperCase()}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{user.name}</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">{user.email}</p>

            <div className="grid grid-cols-2 gap-4 w-full mb-8">
                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl text-center border border-gray-100 dark:border-gray-600">
                    <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">{stats.lessons}</div>
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Lessons</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl text-center border border-gray-100 dark:border-gray-600">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.practice}</div>
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Practice</div>
                </div>
            </div>
            
            <div className="w-full pt-6 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                 <div className="text-xs text-gray-400">
                     Member since {new Date(user.joinedAt).toLocaleDateString()}
                 </div>
                 <button 
                    onClick={() => {
                        onClose();
                        logout();
                    }}
                    className="px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                 >
                     Sign Out
                 </button>
            </div>
        </div>
      </div>
       <style>{`
        @keyframes scale-in {
            0% { transform: scale(0.95); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
        }
        .animate-scale-in {
            animation: scale-in 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};
