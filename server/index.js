import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import attendanceRoutes from './routes/attendance.js';
import locationRoutes from './routes/location.js';
import userRoutes from './routes/user.js';
import adminRoutes from './routes/admin.js';
import organizationRoutes from './routes/organization.js';
import analyticsRoutes from './routes/analytics.js';
import errorMiddleware from './middleware/errorMiddleware.js';
import logger from './utils/logger.js';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import helmet from 'helmet';
import swaggerDocs from './utils/swagger.js';
import cors from 'cors'

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Configure CORS with specific origins
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests from Expo development and production domains
        const allowedOrigins = [
            'http://localhost:19006',
            'http://localhost:8081',
            'exp://localhost:8081',
            process.env.CLIENT_URL || 'https://your-production-domain.com'
        ];

        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 600 // Cache preflight for 10 minutes
};

// Configure Rate Limiting
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per window
    message: { msg: 'Too many attempts, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
});

const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100, // 100 requests per 15 minutes for general routes
    standardHeaders: true,
    legacyHeaders: false,
});

// Security Headers
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
        },
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    },
}));

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' })); // Limit payload size
app.use(generalLimiter); // Apply general rate limiting to all routes
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

//routes
// Apply stricter rate limiting to auth routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/location', locationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/analytics', analyticsRoutes);

// Centralized error handling middleware
app.use(errorMiddleware);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URL)
    .then(() => {
        logger.info("MongoDB connected successfully.");
        app.listen(PORT, '0.0.0.0', () => {
            logger.info(`Server is running on port ${PORT}`);
        });
    })
    .catch(error => {
        logger.error('MongoDB connection error:', error);
    });

