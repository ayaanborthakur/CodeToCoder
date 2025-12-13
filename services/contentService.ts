
import { Lesson, Module } from '../types';


const BUCKET_URL = 'https://storage.googleapis.com/code2coder-static-content/content_bundle';
const MANIFEST_URL = `${BUCKET_URL}/lessons/manifest.json`;

// Fallback to local constants for development/offline
const USE_GCS = import.meta.env.PROD || import.meta.env.VITE_USE_GCS === 'true';

interface ContentManifest {
  version: string;
  lastUpdated: number;
  modules: {
    id: string;
    title: string;
    lessons: string[];
  }[];
}

class ContentService {
  private manifest: ContentManifest | null = null;
  private lessonCache: Map<string, Lesson> = new Map();
  private moduleCache: Map<string, Module> = new Map();
  private localLessonPlan: Module[] | null = null;
  private usingFallback = false;

  private async getLocalData(): Promise<Module[]> {
      if (this.localLessonPlan) return this.localLessonPlan;
      const { LESSON_PLAN } = await import('../lessonPlan');
      this.localLessonPlan = LESSON_PLAN;
      return LESSON_PLAN;
  }

  async loadManifest(): Promise<ContentManifest> {
    if (this.manifest) return this.manifest;

    if (!USE_GCS) {
        console.log('[ContentService] Using local LESSON_PLAN');
        // Convert local LESSON_PLAN to manifest format
        const lessonPlan = await this.getLocalData();
        this.manifest = {
            version: 'local',
            lastUpdated: Date.now(),
            modules: lessonPlan.map(m => ({
                id: m.id,
                title: m.title,
                lessons: m.lessons.map(l => l.id)
            }))
        };
        return this.manifest;
    }

    try {
      const response = await fetch(MANIFEST_URL);
      if (!response.ok) throw new Error('Failed to load manifest');
      this.manifest = await response.json();
      return this.manifest!;
    } catch (error) {
      console.warn('[ContentService] Failed to load manifest from GCS, falling back to local.', error);
      this.usingFallback = true;
      // Fallback logic duplicated for safety
       const lessonPlan = await this.getLocalData();
       this.manifest = {
            version: 'local-fallback',
            lastUpdated: Date.now(),
            modules: lessonPlan.map(m => ({
                id: m.id,
                title: m.title,
                lessons: m.lessons.map(l => l.id)
            }))
        };
        return this.manifest;
    }
  }

  async getLesson(lessonId: string): Promise<Lesson | null> {
    // Check cache first
    if (this.lessonCache.has(lessonId)) {
      return this.lessonCache.get(lessonId)!;
    }

    if (!USE_GCS || this.usingFallback) {
         // Local lookup
         const lessonPlan = await this.getLocalData();
         for (const module of lessonPlan) {
             const lesson = module.lessons.find(l => l.id === lessonId);
             if (lesson) return lesson;
         }
         return null;
    }

    try {
      // We need to know which module the lesson belongs to for the path
      // Optimistically try to find it in the manifest if loaded
      let moduleId = '';
      if (this.manifest) {
          const module = this.manifest.modules.find(m => m.lessons.includes(lessonId));
          if (module) moduleId = module.id;
      }
      
      // If manifest not loaded or module not found, we might need a convention 
      // OR we just load the manifest first.
      if (!moduleId) {
          await this.loadManifest();
           const module = this.manifest!.modules.find(m => m.lessons.includes(lessonId));
          if (module) moduleId = module.id;
      }
      
      if (!moduleId) {
          console.error(`[ContentService] Could not find module for lesson ${lessonId}`);
          return null;
      }

      const url = `${BUCKET_URL}/lessons/${moduleId}/${lessonId}.json`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Failed to load lesson ${lessonId}`);
      
      const lesson = await response.json();
      this.lessonCache.set(lessonId, lesson);
      return lesson;

    } catch (error) {
      console.error('[ContentService] Error fetching lesson:', error);
       // Fallback to local
       const lessonPlan = await this.getLocalData();
       for (const module of lessonPlan) {
             const found = module.lessons.find(l => l.id === lessonId);
             if (found) return found;
         }
      return null;
    }
  }

  // Helper to get full module structure (for the UI which expects Module objects with lessons array)
  async getModule(moduleId: string): Promise<Module | null> {
      if (this.moduleCache.has(moduleId)) return this.moduleCache.get(moduleId)!;
      
      const manifest = await this.loadManifest();
      const moduleMeta = manifest.modules.find(m => m.id === moduleId);
      
      if (!moduleMeta) return null;

      // In a real app we might lazy load lessons, but for now the UI expects them
      // We can create "stub" lessons if we want to avoid fetching everything at once,
      // but the current UI likely renders the list from this. 
      // Actually, NavigationPanel only needs titles and IDs. 
      // But if we want to be fully backward compatible with the `Module` type:
      
      if (!USE_GCS || this.usingFallback) {
          const lessonPlan = await this.getLocalData();
          return lessonPlan.find(m => m.id === moduleId) || null;
      }

      // We only have the list of IDs in the manifest. We assume the UI might need titles.
      // IF the manifest doesn't contain lesson titles, we have a problem: we'd need to fetch every lesson file just to render the sidebar.
      // OPTIMIZATION: We should probably include lesson titles in the manifest or a separate "module index" file.
      // For this implementation, I will assume we fetch them or the manifest WAS generated with them.
      // Let's check the generation script...
      // The generation script `scripts/generate_content_bundle.ts` pushed `lessonIds` to manifest. 
      // It did NOT push titles. This is a potential performance bottleneck if we need to fetch 100 json files to render the menu.
      
      // RECOMMENDATION: Update manifest generation to include titles. 
      // For now, I will implement a "prefetch" that fetches all lessons in the module.
      
      const lessonPromises = moduleMeta.lessons.map(id => this.getLesson(id));
      const lessons = (await Promise.all(lessonPromises)).filter((l): l is Lesson => l !== null);
      
      const fullModule: Module = {
          id: moduleMeta.id,
          title: moduleMeta.title,
          lessons: lessons
      };
      
      this.moduleCache.set(moduleId, fullModule);
      return fullModule;
  }
  
  async getAllModules(): Promise<Module[]> {
      const manifest = await this.loadManifest();
      const modules = await Promise.all(manifest.modules.map(m => this.getModule(m.id)));
      return modules.filter((m): m is Module => m !== null);
  }
}

export const contentService = new ContentService();
