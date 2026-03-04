import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from '../server/routes/auth.js';
import employeeRoutes from '../server/routes/employees.js';
import checklistRoutes from '../server/routes/checklists.js';
import serviceRoutes from '../server/routes/services.js';

dotenv.config();

const app = express();

app.use(helmet());

const corsOptions = {
    origin: (origin, callback) => {
        const allowed = process.env.ALLOWED_ORIGINS?.split(',').map(s => s.trim()) || ['https://gestao-frotas-lime.vercel.app', 'http://localhost:5173'];
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

const connectToDatabase = async () => {
    if (mongoose.connection.readyState >= 1) {
        return;
    }

    if (!MONGO_URI) {
        throw new Error('Variável MONGO_URI não encontrada no ambiente.');
    }

    try {
        await mongoose.connect(MONGO_URI, {
            dbName: 'GestaoDeFrotas',
            serverSelectionTimeoutMS: 15000, // 15 seconds for Atlas handshake
        });
        console.log('✅ MongoDB Connected to GestaoDeFrotas');
    } catch (err) {
        throw new Error(`Erro na conexão Atlas: ${err.message}`);
    }
};

app.use(async (req, res, next) => {
    try {
        await connectToDatabase();
        next();
    } catch (err) {
        console.error('Database middleware error:', err.message);
        res.status(500).json({
            msg: 'Erro de conexão com o banco de dados.',
            error: err.message,
            tip: 'Verifique se o IP da Vercel está autorizado no MongoDB Atlas (Network Access -> 0.0.0.0/0)'
        });
    }
});

app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/checklists', checklistRoutes);
app.use('/api/services', serviceRoutes);

app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        db: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
        databaseName: mongoose.connection.name
    });
});

export default app;
