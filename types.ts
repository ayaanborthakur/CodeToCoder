
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

export interface UserAchievements {
  earnedBadgeIds: string[];
  totalPoints: number;
  lastUpdated: number;
}

export type BadgeType = 'lesson' | 'practice' | 'quiz' | 'project' | 'streak' | 'collection' | 'special';
export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface Badge {
  id: string;
  name: string;
  description: string;
  type: BadgeType;
  tier: BadgeTier;
  requirement: number;
  icon: string;
}

// Token & Marketplace System Types
export interface UserStars {
  balance: number;
  totalEarned: number;
  totalSpent: number;
  lastUpdated: number;
}

export interface FocusStats {
    totalStarsLost: number;
    totalStarsEarned: number;
    totalFocusMinutes: number;
}

export type UserRole = 'student' | 'teacher';

export interface Classroom {
  classId: string;
  className: string;
  teacherId: string;
  teacherName: string;
  joinCode: string;      // 6 uppercase letters, unique
  studentIds: string[];
  createdAt: number;
  // Optional teacher-managed fields (all back-compat — pre-feature docs
  // simply have them absent and the UI treats absence as the default).
  description?: string;          // short subject/period note
  archived?: boolean;            // hidden from the active switcher
  archivedAt?: number;           // unix ms when archive flag flipped on
  // School the owning teacher belonged to when the class was created (or when
  // they later registered a school — see registerSchool backfill). Denormalised
  // onto the classroom so a student can validate "same school" at join time
  // without reading the teacher's user doc (which rules forbid pre-join).
  schoolId?: string;
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
  focusStats?: FocusStats;
  role?: UserRole;
  // Student: a single classroom they joined.
  // Teachers historically had this too; new code uses classIds[] but keep this
  // populated to the first classroom for backwards compatibility.
  classId?: string;
  // Teacher only: all classrooms they own. Allows a teacher to manage multiple
  // sections from one account. Students stay on classId.
  classIds?: string[];
  // Student only: course IDs the teacher has explicitly unlocked for this
  // student (overrides the prerequisite gate). Python Basics is always
  // unlocked; this is for granting early access to later courses.
  unlockedCourseIds?: string[];
  // School association (Phase A: teacher self-registers a school; later
  // phases gate classroom-joins and the school-leaderboard by this field).
  // Set only after the school's registrar approves the join request.
  schoolId?: string;
  // True while waiting for the school's registrar to approve the join.
  // The user can use the app normally but is not yet 'a student of' the school.
  schoolJoinPending?: boolean;
  // Set true once we've shown the "Are you part of a school?" prompt to
  // an existing user. Stops it from re-appearing every login.
  schoolPromptSeen?: boolean;
}

/** A school registered on Code2Coder. Registrars are the teacher who created it. */
export interface School {
  id: string;
  name: string;
  // Teacher (user.id) who registered this school. They approve student join
  // requests and are the de-facto admin for the school's membership.
  registrarId: string;
  registrarName?: string;
  city?: string;
  state?: string;
  country?: string;
  // Free-text identifier (e.g. school district, board). Optional.
  notes?: string;
  createdAt: number;
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
  type: 'lesson' | 'quiz' | 'practice' | 'project' | 'focus';
  itemId: string;
  itemTitle: string;
  moduleId?: string;        // for lessons — lets the Review tab build a proper /lessons/:moduleId/:lessonId URL
  category?: string;        // for practice items — quiz / problem / project (URL category segment)
  timestamp: number;
  durationSeconds: number;
  attempts?: number;
  score?: number;
  completed: boolean;
  skillRatings?: SkillRatings;
  metadata?: Record<string, any>;
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
  moduleId?: string;          // for lesson reviews — drives the Open button URL
  category?: string;          // for practice reviews — quiz / problem / project
  nextReviewDate: number;
  interval: number;
  easeFactor: number;
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

// Courses are a local-only grouping over remote modules.
// "Python Basics" wraps all existing modules; future courses are
// placeholders (empty moduleIds, comingSoon:true) until their
// content is added to the remote manifest.
export interface Course {
  id: string;
  title: string;
  description: string;
  icon: string;           // emoji
  accentColor: string;    // tailwind gradient classes, e.g. "from-cyan-500 to-blue-600"
  order: number;
  comingSoon: boolean;
  // Module IDs (matching the remote manifest) that belong to this course.
  // Empty for placeholder courses.
  moduleIds: string[];
  // Which course must be completed (>= unlockThreshold) before this one unlocks.
  // null = always unlocked.
  prerequisiteCourseId: string | null;
  unlockThreshold: number; // 0..1, fraction of prerequisite course lessons completed
}

// A comment on either a post or an assignment.
// Stored under:
//   classrooms/{classId}/posts/{postId}/comments/{commentId}
//   classrooms/{classId}/assignments/{assignmentId}/comments/{commentId}
export interface Comment {
  id: string;
  classroomId: string;
  parentKind: 'post' | 'assignment';
  parentId: string;
  authorId: string;
  authorName: string;
  authorRole: 'teacher' | 'student';
  content: string;
  createdAt: number;
}

// Teacher post / announcement for a classroom (Google-Classroom-style stream).
// Stored under classrooms/{classroomId}/posts/{postId}.
export interface Post {
  id: string;
  pinned?: boolean;        // pinned posts sort to the top of the stream
  classroomId: string;
  teacherId: string;
  teacherName: string;
  content: string;        // plain text for now
  createdAt: number;
}

// Teacher-assigned work for a classroom.
// Stored under classrooms/{classroomId}/assignments/{assignmentId}.
//
// Two kinds:
//   - 'lesson'   : assigns a curriculum lesson (course + module + lesson IDs).
//   - 'practice' : assigns a practice item (quiz/problem/project, built-in OR
//                  AI-generated). The full PracticeItem is denormalised inline
//                  so students can open it without access to the teacher's
//                  per-user custom-quiz collection.
//
// `kind` is optional for back-compat — pre-feature assignments are implicitly
// lessons (lessonId present).
export interface Assignment {
  id: string;
  classroomId: string;
  teacherId: string;
  kind?: 'lesson' | 'practice';

  // Lesson fields (when kind === 'lesson' or unset)
  courseId?: string;
  courseTitle?: string;
  moduleId?: string;
  lessonId?: string;
  lessonTitle?: string;            // primary display title for lessons

  // Practice fields (when kind === 'practice')
  practiceItem?: PracticeItem;     // full item content, inlined

  assignedAt: number;
  dueAt: number | null;            // unix ms; null = no due date
  // Whole class (null) or specific student IDs.
  studentIds: string[] | null;
}
