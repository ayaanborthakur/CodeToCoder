
import React, { useState } from 'react';
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
  const { user, logout, deleteAccount } = useAuth();
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !user) return null;

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return;

    setIsDeleting(true);
    try {
      await deleteAccount();
    } catch (error) {
      console.error('Failed to delete account:', error);
      alert('Failed to delete account. Please try again or contact support.');
      setIsDeleting(false);
    }
  };

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

          <div className="w-full pt-6 border-t border-gray-100 dark:border-gray-700 space-y-3">
            <div className="text-xs text-gray-400 text-center mb-4">
              Member since {new Date(user.joinedAt).toLocaleDateString()}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  onClose();
                  logout();
                }}
                className="flex-1 px-4 py-2 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors border border-gray-200 dark:border-gray-600"
              >
                Sign Out
              </button>
              <button
                onClick={() => setIsDeleteConfirmOpen(true)}
                className="flex-1 px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors border border-red-200 dark:border-red-800"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-60" onClick={() => !isDeleting && setIsDeleteConfirmOpen(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 max-w-sm w-full border border-red-500 dark:border-red-700 animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-red-600 dark:text-red-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Delete Account?</h3>
            </div>

            <div className="mb-6 space-y-2">
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                This action is <strong className="text-red-600 dark:text-red-400">permanent and cannot be undone</strong>.
              </p>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                All your data will be deleted:
              </p>
              <ul className="text-gray-600 dark:text-gray-400 text-sm list-disc list-inside space-y-1 ml-2">
                <li>Lesson progress ({stats.lessons} stars)</li>
                <li>Practice progress ({stats.practice} completed)</li>
                <li>All playground files</li>
                <li>Account credentials</li>
              </ul>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Type <span className="text-red-600 dark:text-red-400">DELETE</span> to confirm:
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
                disabled={isDeleting}
                className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-red-500 dark:focus:border-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setIsDeleteConfirmOpen(false);
                  setDeleteConfirmText('');
                }}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors border border-gray-200 dark:border-gray-600 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'DELETE' || isDeleting}
                className="flex-1 px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-500 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}

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
