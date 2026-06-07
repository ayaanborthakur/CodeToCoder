
import React from 'react';

interface TeamMember {
    name: string;
    role: string;
    gradClass: string;
    image: string; // Path to image in assets
}

const TEAM_MEMBERS: TeamMember[] = [
    // Project Managers (Class of 2029)
    { name: "Aryan Kulkarni", role: "Project Manager", gradClass: "Graduating Class of 2029", image: "/assets/team/aryan.png" },
    { name: "Ayaan Borthakur", role: "Project Manager", gradClass: "Graduating Class of 2029", image: "/assets/team/ayaan.png" },
    { name: "Viraj Rungta", role: "Project Manager", gradClass: "Graduating Class of 2029", image: "/assets/team/viraj.png" },

    // Outreach Managers (Class of 2029)
    { name: "Neil Gandhi", role: "Outreach Manager", gradClass: "Graduating Class of 2029", image: "/assets/team/neil.png" },
];

const BackIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
    </svg>
);

// Helper to get initials
const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
};

export const AboutTeam: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    return (
        <div className="h-full w-full bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 overflow-y-auto animate-fade-in">
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="mb-12 flex items-center">
                    <button
                        onClick={onBack}
                        className="back-btn mr-6"
                    >
                        <BackIcon />
                        <span>Back</span>
                    </button>
                    <div className="flex-1 text-center md:text-left">
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight mb-2">Meet the Team</h1>
                        <p className="text-lg text-gray-500 dark:text-gray-400">The brilliant minds behind Code2Coder.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {TEAM_MEMBERS.map((member, index) => (
                        <div
                            key={index}
                            className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 animate-slide-up opacity-0"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <div className="aspect-[4/5] w-full bg-gray-200 dark:bg-gray-700 relative overflow-hidden group">
                                {/* Image with Fallback */}
                                <img
                                    src={member.image}
                                    alt={member.name}
                                    className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                                    onError={(e) => {
                                        // Fallback to colored placeholder if image fails to load
                                        e.currentTarget.style.display = 'none';
                                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                    }}
                                />
                                {/* Fallback Visual (Hidden by default, shown on error) */}
                                <div className="hidden absolute inset-0 w-full h-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                                    <span className="text-6xl font-bold text-white/50">{getInitials(member.name)}</span>
                                </div>
                            </div>
                            <div className="p-6 text-center">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{member.name}</h3>
                                <div className="mb-2">
                                    <span className="inline-block px-3 py-1 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 text-xs font-bold uppercase tracking-wider rounded-full">
                                        {member.role}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                    {member.gradClass}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
