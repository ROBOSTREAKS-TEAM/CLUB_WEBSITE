import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

// Load Config
dotenv.config();
import connectDB from './config/db.js'; // Extension .js is required
import adminRoutes from './routes/admin.js';

// Connect to Database
connectDB();

const app = express();
// Debugging Middleware
app.use((req, res, next) => {
    console.log(`[DEBUG] Request for: ${req.url}`);
    next();
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());

// Set View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/test-login', (req, res) => {
    res.render('login');
});

// Routes
app.use('/admin', adminRoutes);

// FORCE TEST ROUTE
app.get('/test', (req, res) => {
    res.send('Server is working! This is not a static file.');
});
// Static Files
app.use(express.static(path.join(__dirname, 'public'))); 

// Redirect root to index
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// ... existing code ...

// Export for Vercel
export default app;

// Local Development
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    // Bind to '0.0.0.0' to accept connections from other devices
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running on http://0.0.0.0:${PORT}`);
    });
}