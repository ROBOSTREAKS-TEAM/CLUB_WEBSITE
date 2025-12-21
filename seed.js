import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import RoboData from './models/RoboData.js';

dotenv.config();

// Fix directory paths for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// POINT THIS TO YOUR JSON FOLDER
// If your json files are in "src/data", keep it as is.
const dataDir = path.join(__dirname, 'src', 'data'); 

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('🔌 MongoDB Connected...');

        // Read files
        if (!fs.existsSync(dataDir)) {
            console.error(`❌ Error: Folder not found at ${dataDir}`);
            process.exit(1);
        }

        const files = fs.readdirSync(dataDir);

        for (const file of files) {
            if (file.endsWith('.json')) {
                const category = file.replace('.json', ''); // e.g., 'members.json' -> 'members'
                const rawData = fs.readFileSync(path.join(dataDir, file), 'utf-8');
                const jsonData = JSON.parse(rawData);

                // Update database (Upsert: Create if new, Update if exists)
                await RoboData.findOneAndUpdate(
                    { category: category },
                    { data: jsonData },
                    { upsert: true, new: true }
                );
                console.log(`✅ Uploaded: ${category}`);
            }
        }
        
        console.log('🎉 All data migrated successfully!');
        process.exit();
    } catch (error) {
        console.error('❌ Migration Failed:', error);
        process.exit(1);
    }
};

seedDatabase();