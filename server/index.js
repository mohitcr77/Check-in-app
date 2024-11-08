import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import attendanceRoutes from './routes/attendance.js';
import locationRoutes from './routes/location.js';
import userRoutes from './routes/user.js';
import adminRoutes from './routes/admin.js';
import organizationRoutes from './routes/organization.js';
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
// app.use(rateLimit);
app.use(helmet())
app.use(cors());
app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
//routes
app.use('/api/auth', authRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/location', locationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/organizations', organizationRoutes)

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

