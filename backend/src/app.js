const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL || '*',
    credentials: true
}));
app.use(bodyParser.json());
app.use(express.json());

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ ERROR: SUPABASE_URL or SUPABASE_ANON_KEY is missing in .env file');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
console.log('✅ Supabase client initialized');

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        supabase: supabaseUrl ? 'configured' : 'missing',
        environment: process.env.NODE_ENV
    });
});

// Test database connection
app.get('/api/test-db', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .limit(1);
        
        if (error) throw error;
        
        res.json({
            success: true,
            message: 'Database connection successful',
            data: data || 'Table might be empty'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// User Registration
app.post('/api/register', async (req, res) => {
    try {
        const { email, password, username } = req.body;
        
        if (!email || !password || !username) {
            return res.status(400).json({
                success: false,
                error: 'Email, password, and username are required'
            });
        }

        // 1. Sign up with Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password
        });

        if (authError) {
            console.error('Auth error:', authError);
            return res.status(400).json({
                success: false,
                error: authError.message
            });
        }

        // 2. Create user profile in profiles table
        const { error: profileError } = await supabase
            .from('profiles')
            .insert({
                id: authData.user.id,
                email: email,
                username: username,
                coins: 100,
                experience: 0,
                level: 1,
                created_at: new Date(),
                updated_at: new Date()
            });

        if (profileError) {
            console.error('Profile error:', profileError);
            
            // Rollback: delete auth user if profile creation fails
            await supabase.auth.admin.deleteUser(authData.user.id);
            
            return res.status(400).json({
                success: false,
                error: 'Failed to create user profile: ' + profileError.message
            });
        }

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            user: {
                id: authData.user.id,
                email: authData.user.email,
                username: username
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error: ' + error.message
        });
    }
});

// User Login
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email and password are required'
            });
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials: ' + error.message
            });
        }

        // Get user profile
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

        if (profileError) {
            console.error('Profile fetch error:', profileError);
        }

        res.json({
            success: true,
            message: 'Login successful',
            session: data.session,
            user: {
                ...data.user,
                profile: profile || {}
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error: ' + error.message
        });
    }
});

// Get user profile
app.get('/api/user/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        res.json({
            success: true,
            user: data
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Update user profile
app.put('/api/user/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        
        // Remove protected fields
        delete updates.id;
        delete updates.created_at;
        
        updates.updated_at = new Date();

        const { data, error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: data
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err.stack);
    res.status(500).json({
        success: false,
        error: 'Something went wrong!',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 Supabase URL: ${supabaseUrl ? 'Configured' : 'NOT Configured'}`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
});
