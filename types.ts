
export interface QuizQuestion {
  id: string;
  text: string;
  options: string[];
  correctAnswerIndex: number;
}

export interface Lesson {
  id: string;
  title: string;
  content: string;
  startingCode: string;
  objective: string;
  goal: string;
  expectedOutput?: string; // Exact output required for lesson completion (optional for quizzes/random lessons)
  type?: 'learn' | 'practice' | 'project' | 'quiz';
  quizQuestions?: QuizQuestion[];
  commonMistakes?: string;
}

export interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
  isCheckpoint?: boolean;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface LintIssue {
  line: number;
  message: string;
  type: 'error' | 'warning';
}

export interface PlaygroundFile {
  id: string;
  name: string;
  content: string;
  terminalOutput: string;
  chatHistory: ChatMessage[];
  lastModified: number;
}

export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type PracticeType = 'quiz' | 'problem' | 'project';

export interface PracticeItem {
  id: string;
  title: string;
  description: string;
  type: PracticeType;
  difficulty: Difficulty;
  content?: string; // Instructions for problems/projects
  startingCode?: string;
  objective?: string;
  quizQuestions?: QuizQuestion[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  username?: string; // Unique username for display/leaderboard
  avatar?: string;
  joinedAt: number;
  achievements?: UserAchievements;
  net_value?: number; // Total value for leaderboard (e.g., total stars earned)
}


// Badge System Types
export type BadgeType = 'lesson' | 'practice' | 'quiz' | 'project' | 'streak' | 'collection' | 'special';
export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface Badge {
  id: string;
  name: string;
  description: string;
  type: BadgeType;
  tier: BadgeTier;
  requirement: number;
  icon?: string; // Emoji or icon identifier
}

export interface UserAchievements {
  earnedBadgeIds: string[];
  totalPoints: number;
  lastUpdated: number;
}

// Token & Marketplace System Types
export interface UserStars {
  balance: number;
  totalEarned: number;
  totalSpent: number;
  lastUpdated: number;
}

export interface StarTransaction {
  id: string;
  amount: number;
  type: 'earn' | 'spend';
  reason: string;
  timestamp: number;
}

export type PackTier = 'starter' | 'premium' | 'elite' | 'developer' | 'designer';
export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic' | 'divine';

export interface Collectible {
  id: string;
  name: string;
  description: string;
  rarity: Rarity;
  image: string; // Emoji or image URL
}

export interface Pack {
  id: string;
  name: string;
  tier: PackTier;
  cost: number;
  description: string;
  rewards: {
    minStars: number;
    maxStars: number;
    collectibles?: {
      dropRate: number; // 0-1 probability
      guaranteedRarity?: Rarity;
      minDrops?: number; // Minimum number of collectibles to drop
      maxDrops?: number; // Maximum number of collectibles to drop
    };
    items?: string[];
  };
}

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  requirement: {
    type: 'lesson' | 'quiz' | 'practice' | 'project';
    count: number;
    difficulty?: Difficulty;
  };
  reward: number;
  completed: boolean;
  progress: number;
  claimed?: boolean;
}

export interface MarketplaceData {
  stars: UserStars;
  ownedCollectibles: string[]; // IDs of owned collectibles
  dailyPrizeClaimed: number; // timestamp
  dailyChallenges: DailyChallenge[];
  transactionHistory: StarTransaction[];
  completedActivities: {
    lessons: string[]; // lesson IDs that have awarded stars
    quizzes: string[]; // quiz IDs that have awarded stars
    practice: string[]; // practice item IDs that have awarded stars
  };
  version?: number;
}

// New Restructured Data Types
export interface ProgressCategoryData {
  completed: string[]; // IDs of completed items
  rewardedItems?: string[]; // IDs of items that have already awarded stars
  lastUpdated: number;
}

export interface ClassroomProgressData {
  completedLessons: string[];
  rewardedLessons?: string[]; // IDs of lessons that have already awarded stars
  lastUpdated: number;
}

export interface StarsData {
  balance: number;
  totalEarned: number;
  totalSpent: number;
  lastUpdated: number;
  transactionHistory: StarTransaction[];
  dailyPrizeClaimed: number;
  // Streak tracking
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string; // YYYY-MM-DD format for easy comparison
}

export interface DailyChallengesData {
  challenges: DailyChallenge[];
  lastRefreshed: number;
}

export interface CollectionData {
  badges: {
    earnedBadgeIds: string[];
    totalPoints: number;
    lastUpdated: number;
  };
  collectibles: {
    ownedCollectibleIds: string[];
  };
}

export interface ReferenceTopic {
  id: string;
  title: string;
  category: string;
  content: string;
}

export interface ReferenceMaterial {
  id: string;
  title: string;
  content: string;
  category?: string;
  topic?: string;
  createdAt: number;
  lastModified?: number;
}


// Flowchart Builder Types (Concept-to-Code)
export type FlowchartNodeType = 'start' | 'end' | 'variable' | 'conditional' | 'loop' | 'function' | 'output';

export interface FlowchartNodeData {
  label: string;
  // Variable node
  variableName?: string;
  variableValue?: string;
  // Conditional node
  condition?: string;
  // Loop node
  loopType?: 'for' | 'while';
  loopCondition?: string;
  // Function node
  functionName?: string;
  functionArgs?: string;
  // Output node
  outputExpression?: string;
}

export interface FlowchartData {
  nodes: Array<{
    id: string;
    type: FlowchartNodeType;
    data: FlowchartNodeData;
    position?: { x: number; y: number };
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
    label?: string; // For conditional branches: "True", "False"
  }>;
}

// User Activity & Analytics Types
export interface SkillRatings {
  logic: number;
  syntax: number;
  algorithms: number;
  debugging: number;
  efficiency: number;
  creativity: number;
}

export interface UserActivity {
  id: string;
  userId: string;
  type: 'lesson' | 'quiz' | 'practice' | 'project';
  itemId: string;
  itemTitle: string;
  timestamp: number;
  durationSeconds: number;
  attempts?: number; // Number of run/check attempts
  score?: number; // 0-100 for quizzes/projects
  completed: boolean;
  skillRatings?: SkillRatings; // AI-assigned proficiency scores (0-100)
  metadata?: Record<string, any>; // Flexible field for "nothing left out" (code, errors, etc.)
}

export interface DailyActivitySummary {
  date: string; // YYYY-MM-DD
  lessonsCompleted: number;
  practiceCompleted: number;
  timeSpentSeconds: number;
  starsEarned: number;
}

// Smart Learning & SRS Types
export interface ReviewItem {
  id?: string;
  userId: string;
  itemId: string; // The lesson or quiz ID
  itemTitle: string;
  topic: string; // e.g. "Loops", "Variables"
  nextReviewDate: number; // Timestamp
  interval: number; // Days until next review
  easeFactor: number; // Multiplier (default 2.5)
  lastReviewed: number;
}

export interface CodeReviewLog {
  id?: string;
  userId: string;
  topic: string; // e.g. "Functions"
  mistake: string; // "Forgot colon", "Indentation error"
  aiTip: string; // The advice given
  timestamp: number;
  relatedLessonId?: string;
}
