// Load environment variables from .env file immediately
require('dotenv').config();

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');

// Security Packages
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

// ==========================================
// SECURITY MIDDLEWARE
// ==========================================

// 1. Helmet: Secures HTTP headers
app.use(helmet());

// 2. CORS: Restricts who can talk to your API
// IMPORTANT: Once Render gives you your live URL, replace the string below with it!
// For now, it allows your local computer to test it.
const allowedOrigins = ['http://localhost:3000', 'https://my-fitness-app-h7ec.onrender.com'];
app.use(cors({
    origin: function(origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
}));

// 3. Rate Limiting: Prevents spam/DDoS attacks
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window
    message: "Too many requests from this IP, please try again later."
});
// Apply the rate limiter only to our API routes
app.use('/api/', apiLimiter);


// ==========================================
// STANDARD MIDDLEWARE & DATABASE
// ==========================================

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Connect to MongoDB Atlas securely using the hidden .env variable
const dbURI = process.env.MONGODB_URI;

if (!dbURI) {
    console.error("FATAL ERROR: MONGODB_URI is not defined in your .env file.");
    process.exit(1);
}

mongoose.connect(dbURI)
    .then(() => console.log('Successfully connected to MongoDB Cloud!'))
    .catch(err => console.log('Database connection error:', err));

// Define the Database Structure (Schema)
const appStateSchema = new mongoose.Schema({
    userProfile: mongoose.Schema.Types.Mixed,
    customCalGoal: Number,
    customProGoal: Number,
    nutritionData: mongoose.Schema.Types.Mixed,
    weeklyPlans: mongoose.Schema.Types.Mixed,
    weeklyLogs: mongoose.Schema.Types.Mixed
}, { minimize: false });

const AppState = mongoose.model('AppState', appStateSchema);

// ==========================================
// API ROUTES
// ==========================================

// API Route: Get data from the cloud
app.get('/api/state', async (req, res) => {
    try {
        let state = await AppState.findOne();
        
        if (!state) {
            state = await AppState.create({
                userProfile: null,
                customCalGoal: null,
                customProGoal: null,
                nutritionData: { date: new Date().toISOString().split('T')[0], logs: [] },
                weeklyPlans: {},
                weeklyLogs: {}
            });
        }
        res.json(state);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// API Route: Save data to the cloud
app.post('/api/state', async (req, res) => {
    try {
        let state = await AppState.findOne();
        if (state) {
            Object.assign(state, req.body);
            state.markModified('userProfile');
            state.markModified('nutritionData');
            state.markModified('weeklyPlans');
            state.markModified('weeklyLogs');
            await state.save();
        } else {
            await AppState.create(req.body);
        }
        res.json({ message: "Saved to cloud successfully!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// FRONTEND PAGE ROUTES
// ==========================================

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'views', 'index.html')));
app.get('/workouts', (req, res) => res.sendFile(path.join(__dirname, 'views', 'workouts.html')));
app.get('/nutrition', (req, res) => res.sendFile(path.join(__dirname, 'views', 'nutrition.html')));

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});