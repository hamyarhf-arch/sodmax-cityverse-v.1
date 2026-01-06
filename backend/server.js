require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { testConnection } = require('./src/config/supabase');

// Import Routes
const authRoutes = require('./src/routes/auth');
const userRoutes = require('./src/routes/user');
const businessRoutes = require('./src/routes/business');
const missionRoutes = require('./src/routes/mission');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: {
        success: false,
        error: 'تعداد درخواست‌های شما بیش از حد مجاز است'
    }
});
app.use('/api/', limiter);

// Health Check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'SODmAX CityVerse API',
        version: '1.0.0'
    });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/business', businessRoutes);
app.use('/api/missions', missionRoutes);

// 404 Handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'مسیر یافت نشد'
    });
});

// Error Handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    
    const statusCode = err.status || 500;
    const message = err.message || 'خطای سرور';
    
    res.status(statusCode).json({
        success: false,
        error: message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// Start Server
async function startServer() {
    try {
        // تست اتصال به Supabase
        const isConnected = await testConnection();
        if (!isConnected) {
            console.error('❌ Cannot start server without database connection');
            process.exit(1);
        }
        
        app.listen(PORT, () => {
            console.log(`✅ Server is running on port ${PORT}`);
            console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
            console.log(`🌐 Environment: ${process.env.NODE_ENV}`);
            console.log(`📊 Routes loaded: Auth, User, Business, Mission`);
        });
        
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

startServer();

// Graceful Shutdown
process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM received. Shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('🛑 SIGINT received. Shutting down gracefully...');
    process.exit(0);
});
