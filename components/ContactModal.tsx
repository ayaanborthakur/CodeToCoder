import React from 'react';

interface ContactModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
            role="dialog"
            aria-modal="true"
        >
            <div className="bg-[#1e232f] rounded-xl shadow-2xl p-8 max-w-md w-full border border-gray-700 transform transition-all animate-scale-in relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="text-center mb-8">
                    <h2 className="text-4xl font-bold text-[#fef08a] mb-2">Contact Us</h2>
                    <p className="text-gray-400">We'd love to hear from you.</p>
                </div>

                <div className="text-center mb-8">
                    <h3 className="text-xl font-bold text-white">Bellarmine College Preparatory</h3>
                    <p className="text-[#06b6d4] text-sm font-bold tracking-wider mt-1">ORGANIZATION</p>
                </div>

                <div className="space-y-4 mb-8">
                    <div className="bg-[#2d3342] rounded-full py-3 px-6 flex items-center gap-3 border border-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-[#fef08a]">
                            <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-200 text-sm">960 W Hedding St, San Jose, CA 95126</span>
                    </div>

                    <div className="bg-[#2d3342] rounded-full py-3 px-6 flex items-center gap-3 border border-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-[#fef08a]">
                            <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
                            <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
                        </svg>
                        <span className="text-gray-200 text-sm">info.code2coder@gmail.com</span>
                    </div>
                </div>

                <div className="flex justify-center">
                    <button
                        onClick={onClose}
                        className="bg-[#10b981] hover:bg-[#059669] text-white font-bold py-2 px-8 rounded-lg transition-colors shadow-lg"
                    >
                        Done
                    </button>
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
