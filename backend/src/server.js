import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect Database (wrap in try-catch or ensure .env has dummy values for now)
if (process.env.MONGODB_URI) {
    connectDB();
} else {
    console.warn("MONGODB_URI is not set. Database not connected.");
}

// Routes
import searchRoutes from './routes/search.js';
import analyzeRoutes from './routes/analyze.js';
import trackRoutes from './routes/track.js';

app.use('/api/search', searchRoutes);
app.use('/api/analyze', analyzeRoutes);
app.use('/api/track', trackRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'BeforeBuy API' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
