
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { LESSON_PLAN } from './data/lessonPlan';
import { PRACTICE_ITEMS } from './data/practiceItems';
import { REFERENCE_DATA } from './data/referenceData';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');
const OUTPUT_DIR = path.join(PROJECT_ROOT, 'content_bundle');

async function generateContentBundle() {
    console.log('📦 Starting content bundle generation...');

    // 1. Create output directory
    if (fs.existsSync(OUTPUT_DIR)) {
        fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
    }
    fs.mkdirSync(OUTPUT_DIR);
    fs.mkdirSync(path.join(OUTPUT_DIR, 'lessons'));
    fs.mkdirSync(path.join(OUTPUT_DIR, 'practice'));
    fs.mkdirSync(path.join(OUTPUT_DIR, 'references'));

    const manifest = {
        version: '1.0.0',
        lastUpdated: Date.now(),
        modules: [] as any[],
        practice: [] as any[],
        references: [] as any[]
    };

    // 2. Iterate through modules
    for (const module of LESSON_PLAN) {
        console.log(`Processing Module: ${module.id}...`);
        
        // Create module directory
        const moduleDir = path.join(OUTPUT_DIR, 'lessons', module.id);
        if (!fs.existsSync(moduleDir)) {
            fs.mkdirSync(moduleDir, { recursive: true });
        }

        const lessonIds: string[] = [];

        // 3. Process lessons
        for (const lesson of module.lessons) {
            const fileName = `${lesson.id}.json`;
            const filePath = path.join(moduleDir, fileName);
            
            fs.writeFileSync(filePath, JSON.stringify(lesson, null, 2));
            lessonIds.push(lesson.id);
        }

        // Add to manifest
        manifest.modules.push({
            id: module.id,
            title: module.title,
            lessons: lessonIds
        });
    }

    // 4. Process Practice Items
    console.log('Processing Practice Items...');
    for (const item of PRACTICE_ITEMS) {
        const fileName = `${item.id}.json`;
        const filePath = path.join(OUTPUT_DIR, 'practice', fileName);
        fs.writeFileSync(filePath, JSON.stringify(item, null, 2));
        
        // Add minimal info to manifest
        manifest.practice.push({
            id: item.id,
            title: item.title,
            type: item.type,
            difficulty: item.difficulty
        });
    }

    // 5. Process References
    console.log('Processing References...');
    for (const ref of REFERENCE_DATA) {
        const fileName = `${ref.id}.json`;
        const filePath = path.join(OUTPUT_DIR, 'references', fileName);
        fs.writeFileSync(filePath, JSON.stringify(ref, null, 2));

        // Add minimal info to manifest
        manifest.references.push({
            id: ref.id,
            title: ref.title,
            category: ref.category
        });
    }

    // 6. Write manifest
    fs.writeFileSync(
        path.join(OUTPUT_DIR, 'manifest.json'), // Moving manifest to root of bundle for easier access
        JSON.stringify(manifest, null, 2)
    );
    // Also write to lessons/manifest.json for backward compatibility if needed, 
    // but better to switch app to use root manifest. 
    // For now, let's keep it clean and just have one manifest at root of content bundle?
    // The previous code put it in `lessons/manifest.json`. 
    // Let's SUPPORT BOTH paths for safety during migration, or just update the service.
    // The previous service looked at `${BUCKET_URL}/lessons/manifest.json`.
    // Let's create a copy there too to not break immediate existing logic until I update the service.
    
    fs.writeFileSync(
        path.join(OUTPUT_DIR, 'lessons', 'manifest.json'),
        JSON.stringify(manifest, null, 2)
    );

    console.log('✅ Content bundle generated successfully at:', OUTPUT_DIR);
}

generateContentBundle().catch(console.error);
