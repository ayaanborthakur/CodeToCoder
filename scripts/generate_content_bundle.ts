
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { LESSON_PLAN } from '../lessonPlan';

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

    const manifest = {
        version: '1.0.0',
        lastUpdated: Date.now(),
        modules: [] as any[]
    };

    // 2. Iterate through modules
    for (const module of LESSON_PLAN) {
        console.log(`Processing ${module.id}...`);
        
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

    // 4. Write manifest
    fs.writeFileSync(
        path.join(OUTPUT_DIR, 'lessons', 'manifest.json'), 
        JSON.stringify(manifest, null, 2)
    );

    console.log('✅ Content bundle generated successfully at:', OUTPUT_DIR);
}

generateContentBundle().catch(console.error);
