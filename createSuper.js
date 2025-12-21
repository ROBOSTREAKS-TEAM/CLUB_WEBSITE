import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User.js'; // .js extension is mandatory

dotenv.config();

const createSuperAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB...');

        const username = 'root';       // Default Username
        const password = 'admin123';   // Default Password

        // Check if root already exists to avoid duplicates
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            console.log('Super Admin user already exists.');
            process.exit();
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create the user
        await User.create({
            username,
            password: hashedPassword,
            role: 'superadmin'
        });

        console.log(`✅ Super Admin Created Successfully!`);
        console.log(`Username: ${username}`);
        console.log(`Password: ${password}`);
        
        process.exit();
    } catch (error) {
        console.error('❌ Error creating admin:', error);
        process.exit(1);
    }
};

createSuperAdmin();