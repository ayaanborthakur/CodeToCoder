
import { Lesson, Module, PracticeItem } from '../types';
import { ReferenceTopic } from '../types';


const BUCKET_URL = 'https://storage.googleapis.com/code2coder-static-content/content_bundle';
const MANIFEST_URL = `${BUCKET_URL}/lessons/manifest.json`;

interface ContentManifest {
  version: string;
  lastUpdated: number;
  modules: {
    id: string;
    title: string;
    lessons: string[];
    isCheckpoint?: boolean;
  }[];
  practice: {
      id: string;
      title: string;
      type: string;
      difficulty: string;
  }[];
  references: {
      id: string;
      title: string;
      category: string;
  }[];
}

class ContentService {
  private manifest: ContentManifest | null = null;
  private lessonCache: Map<string, Lesson> = new Map();
  private moduleCache: Map<string, Module> = new Map();
  // No local fallback state needed

  async loadManifest(): Promise<ContentManifest> {
    if (this.manifest) return this.manifest;

    try {
      const response = await fetch(MANIFEST_URL);
      if (!response.ok) throw new Error('Failed to load manifest');
      this.manifest = await response.json();
      return this.manifest!;
    } catch (error) {
      console.error('[ContentService] Failed to load manifest from GCS.', error);
      throw error; // Fail hard as per "good testing environment" requirement
    }
  }

  async getLesson(lessonId: string): Promise<Lesson | null> {
    // Check cache first
    if (this.lessonCache.has(lessonId)) {
      return this.lessonCache.get(lessonId)!;
    }

    try {
      // We need to know which module the lesson belongs to for the path
      let moduleId = '';
      if (this.manifest) {
          const module = this.manifest.modules.find(m => m.lessons.includes(lessonId));
          if (module) moduleId = module.id;
      }
      
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
      return null;
    }
  }

  // Helper to get full module structure
  async getModule(moduleId: string): Promise<Module | null> {
      if (this.moduleCache.has(moduleId)) return this.moduleCache.get(moduleId)!;
      
      const manifest = await this.loadManifest();
      const moduleMeta = manifest.modules.find(m => m.id === moduleId);
      
      if (!moduleMeta) return null;

      // Fetch all lessons in the module to allow full module construction
      const lessonPromises = moduleMeta.lessons.map(id => this.getLesson(id));
      const lessons = (await Promise.all(lessonPromises)).filter((l): l is Lesson => l !== null);
      
      const fullModule: Module = {
          id: moduleMeta.id,
          title: moduleMeta.title,
          lessons: lessons,
          isCheckpoint: moduleMeta.isCheckpoint
      };
      
      this.moduleCache.set(moduleId, fullModule);
      return fullModule;
  }
  
  async getAllModules(): Promise<Module[]> {
      const manifest = await this.loadManifest();
      const modules = await Promise.all(manifest.modules.map(m => this.getModule(m.id)));
      return modules.filter((m): m is Module => m !== null);
  }
  async getPracticeItems(): Promise<PracticeItem[]> {
      const manifest = await this.loadManifest();
      const items = await Promise.all(
          manifest.practice.map(p => this.getPracticeItem(p.id))
      );
      return items.filter((i): i is PracticeItem => i !== null);
  }

  async getPracticeItem(id: string): Promise<PracticeItem | null> {
      try {
          const response = await fetch(`${BUCKET_URL}/practice/${id}.json`);
          if (!response.ok) throw new Error(`Failed to fetch practice item ${id}`);
          const data = await response.json();
          return data as PracticeItem;
      } catch (error) {
           console.warn(`[ContentService] Failed to load practice item ${id}`, error);
           return null;
      }
  }

  async getReferences(): Promise<ReferenceTopic[]> {
       const manifest = await this.loadManifest();
       const items = await Promise.all(
           manifest.references.map(r => this.getReference(r.id))
       );
       return items.filter((i): i is ReferenceTopic => i !== null);
  }

  async getReference(id: string): Promise<ReferenceTopic | null> {
      try {
          const response = await fetch(`${BUCKET_URL}/references/${id}.json`);
          if (!response.ok) throw new Error(`Failed to fetch reference ${id}`);
          const data = await response.json();
          return data as ReferenceTopic;
      } catch (error) {
          console.warn(`[ContentService] Failed to load reference ${id}`, error);
          return null;
      }
  }
}

export const contentService = new ContentService();
