import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import employeeRoutes from './routes/employees.js';
import checklistRoutes from './routes/checklists.js';
import serviceRoutes from './routes/services.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(helmet());

const corsOptions = {
    origin: (origin, callback) => {
        const allowed = process.env.ALLOWED_ORIGINS?.split(',').map(s => s.trim()) || ['http://localhost:5173', 'http://localhost:3000'];
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

const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Muitas requisições deste IP, tente novamente mais tarde.'
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: 'Muitas tentativas de autenticação, tente novamente em 15 minutos.'
});

app.use(generalLimiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
        if (!req.path.includes('password') && !req.path.includes('token')) {
            console.log(`${req.method} ${req.path}`);
        }
        next();
    });
}

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
    console.warn('⚠️  MONGO_URI is not defined in environment variables');
    console.warn('Database operations will not work. Run "npm run server" with proper .env configuration.');
}

let mongoConnected = false;

const ensureMongoConnection = async () => {
    if (!mongoConnected && MONGO_URI) {
        try {
            // Force connection to a specific database name
            const dbName = 'GestaoDeFrotas';
            await mongoose.connect(MONGO_URI, {
                dbName: dbName,
                serverSelectionTimeoutMS: 15000
            });
            mongoConnected = true;
            console.log(`✅ Connected to MongoDB (DB: ${dbName})`);
            return true;
        } catch (err) {
            console.error('❌ MongoDB connection error:', err.message);
            return false;
        }
    }
    return mongoConnected;
};

if (MONGO_URI) {
    ensureMongoConnection().catch(err => {
        console.error('Initial MongoDB connection failed:', err);
    });
}

app.use('/api/', async (req, res, next) => {
    const connected = await ensureMongoConnection();
    next();
});

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/checklists', checklistRoutes);
app.use('/api/services', serviceRoutes);

app.get('/api/health', (req, res) => {
    res.json({
        message: 'Server is running',
        mongoConnected: mongoConnected,
        hasMongoUri: !!MONGO_URI,
        mongoReadyState: mongoose.connection?.readyState
    });
});

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

export default app;
