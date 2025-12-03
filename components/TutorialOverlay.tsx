import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { TUTORIAL_STEPS, markTutorialCompleted, type TutorialStep, saveTutorialProgress, getTutorialProgress, clearTutorialProgress } from '../services/tutorialService';

interface TutorialOverlayProps {
    userId?: string;
    onComplete: () => void;
    onSkip: () => void;
}

export const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ userId, onComplete, onSkip }) => {
    const [currentStepIndex, setCurrentStepIndex] = useState(() => getTutorialProgress());
    const [isVisible, setIsVisible] = useState(false);
    const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
    const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);
    const navigate = useNavigate();
    const location = useLocation();
    const tooltipRef = useRef<HTMLDivElement>(null);

    const currentStep = TUTORIAL_STEPS[currentStepIndex];
    const isLastStep = TUTORIAL_STEPS.length > 0 && currentStepIndex === TUTORIAL_STEPS.length - 1;

    // Save progress whenever step changes
    useEffect(() => {
        saveTutorialProgress(currentStepIndex);
    }, [currentStepIndex]);

    // Detect when user clicks a lesson (for step 'lesson-nav')
    useEffect(() => {
        if (!currentStep) return;

        // Navigate to the required route if specified (and not null)
        if (currentStep.route && location.pathname !== currentStep.route) {
            navigate(currentStep.route);
        }

        // Wait for navigation and DOM to settle
        const timer = setTimeout(() => {
            if (currentStep.targetElement) {
                const element = document.querySelector(currentStep.targetElement);
                if (element) {
                    const rect = element.getBoundingClientRect();
                    // Check if element is actually visible (has dimensions)
                    if (rect.width === 0 || rect.height === 0) {
                        setHighlightRect(null);
                        centerTooltip();
                    } else {
                        setHighlightRect(rect);
                        calculateTooltipPosition(rect, currentStep.position || 'bottom');
                    }
                } else {
                    // Element not found, show tooltip in center
                    setHighlightRect(null);
                    centerTooltip();
                }
            } else {
                // No target element, show tooltip in center
                setHighlightRect(null);
                centerTooltip();
            }
            setIsVisible(true);
        }, 500);

        return () => clearTimeout(timer);
    }, [currentStepIndex, currentStep, location.pathname, navigate]);

    const calculateTooltipPosition = (rect: DOMRect, position: string) => {
        const padding = 16;
        const tooltipWidth = 320; // Smaller width
        const tooltipHeight = 180; // Approximate, will auto-adjust

        let top = 0;
        let left = 0;

        switch (position) {
            case 'top':
                top = rect.top - tooltipHeight - padding;
                left = rect.left + rect.width / 2 - tooltipWidth / 2;
                break;
            case 'bottom':
                top = rect.bottom + padding;
                left = rect.left + rect.width / 2 - tooltipWidth / 2;
                break;
            case 'left':
                top = rect.top + rect.height / 2 - tooltipHeight / 2;
                left = rect.left - tooltipWidth - padding;
                break;
            case 'right':
                top = rect.top + rect.height / 2 - tooltipHeight / 2;
                left = rect.right + padding;
                break;
            default:
                centerTooltip();
                return;
        }

        // Ensure tooltip stays within viewport
        const maxLeft = window.innerWidth - tooltipWidth - padding;
        const maxTop = window.innerHeight - tooltipHeight - padding;

        left = Math.max(padding, Math.min(left, maxLeft));
        top = Math.max(padding, Math.min(top, maxTop));

        setTooltipPosition({ top, left });
    };

    const centerTooltip = () => {
        setTooltipPosition({
            top: window.innerHeight / 2 - 120,
            left: window.innerWidth / 2 - 160
        });
    };

    const handleNext = () => {
        if (isLastStep) {
            handleComplete();
        } else {
            setIsVisible(false);
            setTimeout(() => {
                setCurrentStepIndex(prev => prev + 1);
            }, 300);
        }
    };

    const handlePrevious = () => {
        if (currentStepIndex > 0) {
            setIsVisible(false);
            setTimeout(() => {
                setCurrentStepIndex(prev => prev - 1);
            }, 300);
        }
    };

    const handleComplete = async () => {
        setIsVisible(false);
        clearTutorialProgress();
        await markTutorialCompleted(userId);
        setTimeout(() => {
            onComplete();
        }, 300);
    };

    const handleSkip = async () => {
        setIsVisible(false);
        clearTutorialProgress();
        await markTutorialCompleted(userId);
        setTimeout(() => {
            onSkip();
        }, 300);
    };

    return (
        <>
            {/* Dark overlay */}
            <div
                className="fixed inset-0 bg-black transition-opacity duration-300 z-[9998]"
                style={{
                    opacity: isVisible ? 0.7 : 0,
                    pointerEvents: isVisible ? 'auto' : 'none'
                }}
            />

            {/* Highlight cutout */}
            {highlightRect && (
                <div
                    className="fixed border-4 border-blue-500 rounded-lg shadow-2xl transition-all duration-300 z-[9999] pointer-events-none"
                    style={{
                        top: highlightRect.top - 4,
                        left: highlightRect.left - 4,
                        width: highlightRect.width + 8,
                        height: highlightRect.height + 8,
                        boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.7), 0 0 20px rgba(59, 130, 246, 0.5)',
                        opacity: isVisible ? 1 : 0
                    }}
                />
            )}

            {/* Tutorial tooltip */}
            <div
                ref={tooltipRef}
                className="fixed bg-white dark:bg-gray-800 rounded-xl shadow-2xl transition-all duration-300 z-[10000] w-80"
                style={{
                    top: tooltipPosition.top,
                    left: tooltipPosition.left,
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? 'scale(1)' : 'scale(0.9)',
                    pointerEvents: isVisible ? 'auto' : 'none'
                }}
            >
                {/* Arrow indicator based on position */}
                {highlightRect && currentStep.position && currentStep.position !== 'center' && (
                    <div
                        className={`absolute w-3 h-3 bg-white dark:bg-gray-800 transform rotate-45 ${currentStep.position === 'top' ? 'bottom-[-6px] left-1/2 -translate-x-1/2' :
                            currentStep.position === 'bottom' ? 'top-[-6px] left-1/2 -translate-x-1/2' :
                                currentStep.position === 'left' ? 'right-[-6px] top-1/2 -translate-y-1/2' :
                                    currentStep.position === 'right' ? 'left-[-6px] top-1/2 -translate-y-1/2' : ''
                            }`}
                    />
                )}

                <div className="p-4">
                    {/* Progress indicator */}
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex gap-1">
                            {TUTORIAL_STEPS.map((_, index) => (
                                <div
                                    key={index}
                                    className={`h-1 rounded-full transition-all duration-300 ${index === currentStepIndex
                                        ? 'w-6 bg-blue-500'
                                        : index < currentStepIndex
                                            ? 'w-1 bg-blue-300'
                                            : 'w-1 bg-gray-300 dark:bg-gray-600'
                                        }`}
                                />
                            ))}
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            {currentStepIndex + 1}/{TUTORIAL_STEPS.length}
                        </span>
                    </div>

                    {/* Content */}
                    <div className="mb-4">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                            {currentStep.title}
                        </h3>
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                            {currentStep.description}
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between gap-2">
                        <button
                            onClick={handleSkip}
                            className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                        >
                            Skip
                        </button>

                        <div className="flex gap-2">
                            {currentStepIndex > 0 && (
                                <button
                                    onClick={handlePrevious}
                                    className="px-3 py-1.5 text-sm bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
                                >
                                    Back
                                </button>
                            )}
                            <button
                                onClick={handleNext}
                                className="px-4 py-1.5 text-sm bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all font-medium shadow-lg hover:shadow-xl"
                            >
                                {isLastStep ? 'Finish' : 'Next'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
