import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from '../server/routes/auth.js';
import employeeRoutes from '../server/routes/employees.js';
import checklistRoutes from '../server/routes/checklists.js';
import serviceRoutes from '../server/routes/services.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(helmet());

const corsOptions = {
    origin: (origin, callback) => {
        const allowed = process.env.ALLOWED_ORIGINS?.split(',').map(s => s.trim()) || ['http://localhost:5173', 'http://localhost:3000', 'https://gestao-frotas-lime.vercel.app'];
        if (!origin || allowed.indexOf(origin) !== -1 || origin.includes('vercel.app')) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

const MONGO_URI = process.env.MONGO_URI;
let mongoConnected = false;

const ensureMongoConnection = async () => {
    if (mongoose.connection.readyState === 1) {
        mongoConnected = true;
        return true;
    }
    if (!MONGO_URI) return false;
    try {
        const dbName = 'gestao_frotas';
        await mongoose.connect(MONGO_URI, { dbName });
        mongoConnected = true;
        return true;
    } catch (err) {
        console.error('❌ MongoDB connection error:', err.message);
        return false;
    }
};

// Middleware to ensure connection on every request
app.use(async (req, res, next) => {
    await ensureMongoConnection();
    next();
});

app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/checklists', checklistRoutes);
app.use('/api/services', serviceRoutes);

app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        db: mongoConnected ? 'Connected' : 'Disconnected',
        readyState: mongoose.connection.readyState
    });
});

export default app;
