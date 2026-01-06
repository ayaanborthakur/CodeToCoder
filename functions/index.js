/**
 * Code2Coder Cloud Functions
 * 
 * Exports all Cloud Functions from their respective modules.
 */

const leaderboard = require('./src/leaderboard');
const aiProxy = require('./src/ai-proxy');

// Export leaderboard functions
exports.updateLeaderboard = leaderboard.updateLeaderboard;

// Export AI proxy functions
exports.aiChat = aiProxy.aiChat;
exports.aiFeedback = aiProxy.aiFeedback;
exports.aiLint = aiProxy.aiLint;
exports.aiReference = aiProxy.aiReference;
exports.aiQuiz = aiProxy.aiQuiz;
exports.aiFlowchart = aiProxy.aiFlowchart;
exports.aiUsernameCheck = aiProxy.aiUsernameCheck;
exports.aiValidateOutput = aiProxy.aiValidateOutput;
exports.aiValidateMethodology = aiProxy.aiValidateMethodology;
exports.aiValidateProject = aiProxy.aiValidateProject;
exports.aiSkillRadar = aiProxy.aiSkillRadar;
