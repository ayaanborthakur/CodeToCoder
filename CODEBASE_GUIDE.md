# CodeToCoder: The Comprehensive Codebase Guide

**Version:** 2.0
**Last Updated:** December 6, 2025

---

## 1. Introduction & Architecture

**CodeToCoder** is a sophisticated, client-side educational platform designed to teach Python programming through interactive lessons, AI tutoring, and gamification.

### Core Philosophy
The application is built as a **Single Page Application (SPA)** that uses **Client-Side Routing** (via React Router) to manage views and navigation, while relying heavily on browser capabilities to deliver a desktop-class experience.
*   **Client-Side Execution**: Python code is executed locally in the browser using WebAssembly (Pyodide), ensuring privacy and zero-latency feedback.
*   **AI-First**: Google's Gemini AI is deeply integrated not just as a chatbot, but as a linter, code reviewer, and content generator.
*   **Gamified Learning**: A robust economy system (Stars, Collectibles, Daily Challenges) keeps users engaged.

### Technology Stack
*   **Frontend**: React 18, TypeScript, Tailwind CSS.
*   **Build System**: Vite.
*   **Runtime**: Pyodide (Python 3.11 in WebAssembly).
*   **AI**: Google Gemini (via `@google/genai`).
*   **Backend (BaaS)**: Firebase (Auth, Firestore, Analytics).

---

## 2. System Configuration & Root Files

This section covers the configuration files that control the build process, type safety, and environment.

### 2.1. `package.json`
The manifest file for the project.
*   **Dependencies**:
    *   `@google/genai`: The official SDK for connecting to Gemini.
    *   `firebase`: The full Firebase SDK suite.
    *   `react` / `react-dom`: The UI library.
    *   `react-router-dom`: Handles client-side routing and navigation.
*   **Scripts**:
    *   `dev`: Starts the Vite development server (`vite`).
    *   `build`: Compiles the app for production (`vite build`).
    *   `preview`: Locally previews the production build.

### 2.2. `tsconfig.json`
Configures the TypeScript compiler.
*   **`target: "ES2022"`**: We target modern browsers to support features like Top-level Await (crucial for Pyodide).
*   **`jsx: "react-jsx"`**: Enables the new React JSX transform (no need to `import React` in every file).
*   **`strict: true`**: (Implicit) Ensures high code quality by forbidding implicit `any` types.

### 2.3. `vite.config.ts`
Configures the Vite build tool.
*   **`base: './'`**: Ensures the app can be deployed to subdirectories (relative paths) rather than assuming root.
*   **`plugins`**:
    *   `react()`: Handles Fast Refresh and JSX compilation.
    *   `svgr()`: Allows importing `.svg` files as React components (e.g., `<Logo />`).
*   **`server`**: Configures the dev server to run on port 3000 and expose to the network (`0.0.0.0`).

### 2.4. `tailwind.config.js`
Configures the CSS utility framework.
*   **`darkMode: 'class'`**: Enables dark mode toggling via a CSS class on the `<html>` or `<body>` tag.
*   **`theme.extend.colors`**: Defines semantic color variables (e.g., `surface`, `text-primary`) that map to CSS variables in `index.css`. This is the strategy behind the theming system.

### 2.5. `metadata.json`
A static JSON file containing project metadata.
*   **Usage**: Used by the build system or external tools to identify the project name and description.
*   **Content**: "CodeToCoder: Learn Python with AI V2".

### 2.6. Type Definitions (`*.d.ts`)
*   **`vite-env.d.ts`**: Provides type definitions for Vite-specific features like `import.meta.env`. It explicitly types `VITE_API_KEY` to prevent TypeScript errors when accessing environment variables.
*   **`custom.d.ts`**: A placeholder for project-specific global types that don't fit into `types.ts`.

---

## 3. Core Entry Points

These files are the first to run when the application loads.

### 3.1. `index.html`
The HTML shell.
*   **Root Element**: Contains `<div id="root"></div>` where React mounts.
*   **Pyodide Loading**: It does *not* load Pyodide here. Pyodide is loaded dynamically in `pyodideService.ts` to improve initial page load speed.

### 3.2. `index.tsx`
The JavaScript entry point.
*   **Mounting**: Finds the `#root` element and renders `<App />` inside `React.StrictMode`.
*   **Context Providers**: It wraps the app in the `AuthProvider` to ensure authentication state is available globally from the start.

### 3.3. `App.tsx` (The Brain)
This is the largest and most critical component. It acts as the **Root Component** and **Global State Manager**.
*   **Routing Strategy**: Uses `react-router-dom` to manage navigation. The `Routes` component defines the mapping between URLs (e.g., `/classroom/:moduleId/:lessonId`) and views.
    *   **Legacy State**: While routing is URL-based, some internal state (like `currentLessonId`) is synchronized with the URL parameters via `useEffect` hooks to maintain compatibility with existing logic.
*   **Layout Management**:
    *   It conditionally renders the `Header` and the main content area.
    *   For the "Classroom" view, it renders the 3-pane layout (`NavigationPanel`, `IdePanel`, `ChatPanel`).
*   **Initialization**:
    *   Loads Pyodide in the background (`useEffect`).
    *   Loads User Progress and Marketplace data.
    *   Sets up event listeners for global events like `starUpdate`.

---

## 4. Global State & Contexts

### 4.1. `contexts/AuthContext.tsx`
Manages the user's login session.
*   **`AuthProvider`**: A React Context Provider that wraps the app.
*   **`useAuth` Hook**: Exposes `user` (the current user object) and `isLoading`.
*   **Firebase Listener**: Uses `onAuthStateChanged` to automatically detect when a user logs in or out, updating the state in real-time.

---

## 5. Custom Hooks (Logic Reuse)

Hooks encapsulate complex logic so it can be shared across components.

### 5.1. `hooks/useProgress.ts`
Manages the user's learning journey.
*   **Responsibilities**:
    *   Tracks completed lessons (`completedLessons` Set).
    *   Tracks completed practice items.
    *   Tracks earned badges.
*   **Persistence Strategy**:
    *   **Guest**: Saves to `localStorage` (`codetocoder_progress`).
    *   **User**: Syncs with Firestore (`users/{uid}/progress`).
*   **Migration**: Handles merging guest progress into a user account upon sign-up.

### 5.2. `hooks/useTheme.ts`
Manages the visual theme (Light/Dark).
*   **Strategy**:
    *   Checks `localStorage` for a saved preference.
    *   If none, checks `window.matchMedia('(prefers-color-scheme: dark)')` for system preference.
    *   Applies the `.dark` class to `document.documentElement`.

### 5.3. `hooks/usePlaygroundFiles.ts`
Manages the user's files in the "Playground" mode.
*   **Data Structure**: A list of `PlaygroundFile` objects (id, name, content, chatHistory).
*   **Persistence**: Stores the entire file list in `localStorage` (or Firestore for logged-in users).
*   **Actions**: `createFile`, `updateFile`, `deleteFile`.

### 5.4. `hooks/useCustomQuizzes.ts`
Manages AI-generated quizzes.
*   **Purpose**: Allows users to generate unlimited practice quizzes on any topic.
*   **Storage**: Saves the generated quizzes locally so they persist across reloads.

---

## 6. Services (Business Logic)

The `services/` folder contains the "heavy lifting" code, separated from the UI.

### 6.1. `services/firebase.ts`
*   **Initialization**: Configures the Firebase app instance.
*   **Exports**: `auth`, `db` (Firestore), and `analytics` instances for use in other files.

### 6.2. `services/authService.ts`
*   **Facade Pattern**: Provides a clean API (`login`, `register`, `logout`) that wraps the complex Firebase Auth functions.
*   **Guest Handling**: Implements `loginAnonymously` to create temporary accounts.

### 6.3. `services/geminiService.ts` (The AI Brain)
This service manages all interactions with the Google Gemini API.
*   **`getChatResponse`**:
    *   Constructs a "System Instruction" that defines the AI's persona (Socratic Tutor).
    *   Injects the current lesson context (title, objective, common mistakes) into the prompt so the AI knows what the user is working on.
    *   Manages the chat history array.
*   **`getFeedback`**:
    *   Called after code execution.
    *   Sends the user's code + the execution output to Gemini.
    *   Asks for a 2-sentence critique or encouragement.
*   **`lintCodeWithAI`**:
    *   A background process that sends code to Gemini to check for logical errors (not just syntax).
    *   Uses a strict JSON schema response format to ensure the output can be parsed by the IDE.
*   **`generateLessonVideo`**:
    *   Uses the **Veo** model to generate 3D visualizations.
    *   Handles the complex async polling required for video generation APIs.

### 6.4. `services/pyodideService.ts` (The Python Engine)
*   **Dynamic Loading**: Checks if Pyodide is already loaded on `window` to avoid double-loading.
*   **`runPythonCode`**:
    *   **Input**: Python code string.
    *   **Output Capture**: It overrides `sys.stdout` and `sys.stderr` in Python to capture print statements into a string buffer.
    *   **Input Patching**: It overrides the Python `input()` function to use the browser's JavaScript `prompt()`, enabling interactive programs.
    *   **Return**: Returns an object `{ success, output, error }`.

### 6.5. `services/marketplaceService.ts` (The Economy)
*   **Data Structure**: Manages complex nested data in Firestore (`users/{uid}/stars`, `users/{uid}/collection`).
*   **Transactions**: Every star change creates a `StarTransaction` record for audit trails.
*   **Pack Logic**:
    *   Contains the probability tables for opening packs.
    *   Uses `Math.random()` against tier-based thresholds (e.g., 1% chance for Mythic) to determine rewards.
*   **Daily Challenges**: Checks the date; if it's a new day, it generates new random challenges.

### 6.6. `services/tutorialService.ts`
*   **Purpose**: Manages the interactive onboarding tour.
*   **`TUTORIAL_STEPS`**: Defines the sequence of steps, target elements, and instructions.
*   **State**: Tracks whether a user has completed the tutorial to prevent re-showing it.

### 6.7. `services/analyticsService.ts`
*   **Wrapper**: Abstraction over Firebase Analytics.
*   **Events**: Logs key actions like `page_view`, `lesson_complete`, `practice_complete`, and `error_occurred` to help understand user behavior.

### 6.8. `services/starService.ts`
*   **One-Time Rewards**: Ensures users are only rewarded stars once per lesson or practice item to prevent farming.
*   **Logic**: Checks `completedLessons` or `completedPracticeItems` before calling `marketplaceService` to award stars.

### 6.9. `services/userDataService.ts`
*   **Centralized Data**: Manages the retrieval and updating of the user's core profile and progress data in Firestore.
*   **Path Validation**: Uses `firestorePathHelper` to ensure all database writes go to valid paths.

### 6.10. `services/firestorePathHelper.ts`
*   **Safety**: Validates that all Firestore paths have an even number of segments (Collection/Doc/Collection/Doc) to prevent "Invalid collection reference" errors.

### 6.11. `services/achievementService.ts`
*   **Badges**: Manages the logic for unlocking achievements based on user stats (e.g., "First Code Run", "10 Stars Earned").
*   **Notifications**: Triggers `BadgeNotification` when a new badge is earned.

### 6.12. `services/lessonValidationService.ts`
*   **Quality Control**: Validates that lesson content (Markdown, code snippets) follows the required format and structure.
*   **Usage**: Primarily used during development or content ingestion to prevent broken lessons.

### 6.13. `services/migrationService.ts`
*   **Data Integrity**: Handles the migration of user data from older schema versions to the current structure.
*   **One-Time Scripts**: Contains logic for tasks like moving stars to a sub-collection.

### 6.14. `services/userSettingsService.ts`
*   **Preferences**: Manages user-specific settings like `theme` (light/dark) and `aiAssistanceLevel`.
*   **Real-time Sync**: Subscribes to Firestore updates so settings apply immediately across devices.

---

## 7. Data Models (`types.ts`)

Understanding the types is key to understanding the data flow.

*   **`Lesson`**: The blueprint for a lesson.
    ```typescript
    interface Lesson {
      id: string;
      content: string; // Markdown
      startingCode: string;
      objective: string; // Hidden instructions for AI
      ...
    }
    ```
*   **`User`**: The user profile.
*   **`StarsData`**: Manages the user's currency balance and transaction history.
*   **`CollectionData`**: Stores earned badges and owned collectibles.
*   **`DailyChallengesData`**: Tracks the user's daily quests and their progress.
*   **`ReferenceMaterial`**: Defines the structure for documentation pages in the Reference section.
*   **`LintIssue`**: Defines the shape of errors returned by the AI linter.

---

## 8. Constants & Static Data

### 8.1. `constants.ts`
*   **`LESSON_PLAN`**: A massive array of `Module` objects. This IS the curriculum. To add a lesson, you simply add an object to this array. No other code changes are needed.

### 8.2. `data/` Directory
*   **`collectiblesData.ts`**: Defines all available cards/items (Common, Rare, Legendary, etc.).
*   **`packsData.ts`**: Defines the available packs in the store and their costs.
*   **`dailyChallengesData.ts`**: Templates for generating daily quests.

---

## 9. Components (UI Architecture)

### 9.1. Layout Components
*   **`NavigationPanel.tsx`**: The left sidebar. Renders the list of modules and lessons. Handles the "locked/unlocked" visual states based on progress.
*   **`BottomPanel.tsx`**: The bottom area containing tabs for "Lesson Content", "Terminal", and "Video".

### 9.2. Core IDE Components
*   **`IdePanel.tsx`**:
    *   Wraps the code editor.
    *   Handles the "Run Code" button.
    *   Displays `LintIssue` markers (red squiggly lines) based on AI analysis.
*   **`ChatPanel.tsx`**:
    *   Renders the chat interface.
    *   Handles user input and displays the "Thinking..." state while waiting for Gemini.
    *   Supports Markdown rendering for rich text responses.
*   **`TerminalPanel.tsx`**: Displays the output from Pyodide.

### 9.3. Page Components
*   **`HomePage.tsx`**: The dashboard. Shows "Continue Learning", "Daily Challenges", and "Stats".
*   **`MissionPage.tsx`**: The "Map" view of the curriculum.
*   **`PracticeDashboard.tsx`**: The hub for coding exercises. Categories include "Variables", "Loops", etc., plus AI-generated custom quizzes.
*   **`PlaygroundDashboard.tsx`**: A file manager for the user's personal Python projects. Allows creating, editing, and deleting files.
*   **`ReferencePanel.tsx`**: A documentation viewer for Python syntax and concepts, accessible via `/reference`.
*   **`MarketplacePage.tsx`**: The store interface. Handles pack opening animations and inventory display.
*   **`ProfilePage.tsx`**: Shows user stats, badges, and settings.
*   **`AboutTeam.tsx`**: Displays information about the development team and project credits.

### 9.4. Modals
*   **`AuthModal.tsx`**: Login/Register form.
*   **`CompletionModal.tsx`**: Confetti and celebration when a module is finished.
*   **`TutorialOverlay.tsx`**: A guided tour component that highlights elements on the screen and provides step-by-step instructions for new users.
*   **`GenerateQuizModal.tsx`**: A form for users to request AI-generated quizzes on specific topics.
*   **`PackOpeningModal.tsx`**: Displays the animation and results when opening a card pack.
*   **`SettingsModal.tsx`**: Allows users to configure AI assistance levels and other preferences.
*   **`ContactModal.tsx`**: A simple contact/feedback form.
*   **`RenameModal.tsx`**: Used for renaming files in the Playground.
*   **`ConfirmationModal.tsx`**: A generic "Are you sure?" dialog for destructive actions.

### 9.5. Common UI Components
*   **`BadgeDisplay.tsx` / `BadgeIcon.tsx`**: Renders achievement badges with tooltips.
*   **`BadgeNotification.tsx`**: A toast notification that slides in when a badge is earned.
*   **`StarNotification.tsx`**: A toast notification for earned stars.
*   **`FlyingStar.tsx`**: An animation component that moves a star from the source of reward to the user's balance.
*   **`ToggleSwitch.tsx`**: A reusable iOS-style toggle switch.
*   **`Resizer.tsx`**: The draggable handle between panels in the IDE layout.

---

## 10. Utilities & Scripts

### 10.1. `utils/devLog.ts`
*   A wrapper around `console.log` that can be toggled off in production to keep the console clean.

### 10.2. `scripts/cleanupOldMarketplace.ts`
*   A maintenance script designed to migrate data from the old Firestore structure (all in one document) to the new sub-collection structure (Stars, Collection, Challenges separated).

---

## 11. How It All Connects (The "Glue")

### The "Run Code" Lifecycle
1.  **User Action**: Click "Run" in `IdePanel`.
2.  **Event**: `App.tsx` receives the event.
3.  **Execution**: `App.tsx` calls `pyodideService.runPythonCode(code)`.
4.  **Display**: Output is set to `terminalOutput` state, which `TerminalPanel` renders.
5.  **Feedback**: `App.tsx` calls `geminiService.getFeedback(code, output)`.
6.  **Update**: The AI's feedback is added to `chatHistory` state, which `ChatPanel` renders.
7.  **Progress**: If successful, `useProgress.markLessonAsCompleted()` is called.
8.  **Persistence**: `useProgress` saves the new state to Firebase.

### The "Marketplace" Lifecycle
1.  **User Action**: Click "Buy Pack" in `MarketplacePage`.
2.  **Service Call**: `marketplaceService.purchasePack(uid, packId)` is called.
3.  **Validation**: Service checks `stars.balance`.
4.  **RNG**: Service generates random loot.
5.  **Save**: Service updates `stars` and `collection` sub-collections in Firestore.
6.  **Event**: Service dispatches a custom `starUpdate` window event.
7.  **UI Update**: `App.tsx` listens for `starUpdate` and updates the star counter in the Header immediately.

---

This guide provides a deep dive into the CodeToCoder ecosystem. By understanding these layers—from the root configuration to the complex service logic—developers can effectively maintain and expand the platform.
