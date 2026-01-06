// backend/src/routes/user.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Business = require('../models/Business');
const Transaction = require('../models/Transaction');
const { authenticateToken } = require('../middleware/auth');

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByWallet(req.user.wallet_address);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Get user businesses
    const businesses = await Business.findByOwner(req.user.wallet_address);
    
    // Get user balance
    const balanceResult = await Transaction.getBalance(req.user.wallet_address);

    res.json({
      success: true,
      data: {
        user: {
          ...user,
          password: undefined
        },
        businesses,
        balance: balanceResult.success ? balanceResult.data : null
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch profile'
    });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { username, email, avatar_url, bio } = req.body;
    
    const updates = {};
    if (username) updates.username = username;
    if (email) updates.email = email;
    if (avatar_url) updates.avatar_url = avatar_url;
    if (bio !== undefined) updates.bio = bio;

    const updatedUser = await User.update(req.user.wallet_address, updates);

    res.json({
      success: true,
      data: {
        ...updatedUser,
        password: undefined
      },
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update profile'
    });
  }
});

// Get user transactions
router.get('/transactions', authenticateToken, async (req, res) => {
  try {
    const { limit = 50, offset = 0, type } = req.query;
    
    let result;
    if (type) {
      result = await Transaction.getByType(req.user.wallet_address, type, parseInt(limit));
    } else {
      result = await Transaction.getByWallet(req.user.wallet_address, parseInt(limit), parseInt(offset));
    }

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json({
      success: true,
      data: result.data,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: result.data.length
      }
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch transactions'
    });
  }
});

// Get user balance
router.get('/balance', authenticateToken, async (req, res) => {
  try {
    const result = await Transaction.getBalance(req.user.wallet_address);
    
    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json({
      success: true,
      data: result.data
    });
  } catch (error) {
    console.error('Get balance error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch balance'
    });
  }
});

// Get user statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    // Get transaction statistics
    const txStats = await Transaction.getStatistics(req.user.wallet_address, period);
    
    // Get business count
    const businesses = await Business.findByOwner(req.user.wallet_address);
    
    // Get user info
    const user = await User.findByWallet(req.user.wallet_address);

    const stats = {
      user: {
        username: user.username,
        join_date: user.created_at,
        businesses_count: businesses.length
      },
      transactions: txStats.success ? txStats.data : {},
      businesses: businesses.map(b => ({
        name: b.name,
        category: b.category,
        created_at: b.created_at
      }))
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics'
    });
  }
});

// Get leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const { type = 'balance', limit = 100 } = req.query;
    
    // This is a simplified version - in production you'd want a more optimized query
    // For now, we'll get all users and sort in memory (not efficient for large datasets)
    
    const supabase = require('../config/supabase').supabase;
    
    let query = supabase
      .from('users')
      .select('wallet_address, username, avatar_url, created_at')
      .order('created_at', { ascending: false })
      .limit(parseInt(limit));

    const { data: users, error } = await query;

    if (error) throw error;

    // Get balances for all users
    const usersWithBalance = await Promise.all(
      users.map(async (user) => {
        const balanceResult = await Transaction.getBalance(user.wallet_address);
        return {
          ...user,
          balance: balanceResult.success ? parseFloat(balanceResult.data.balance) : 0
        };
      })
    );

    // Sort by balance
    usersWithBalance.sort((a, b) => b.balance - a.balance);

    // Add ranks
    const leaderboard = usersWithBalance.map((user, index) => ({
      rank: index + 1,
      ...user
    }));

    res.json({
      success: true,
      data: leaderboard,
      type: type,
      updated_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch leaderboard'
    });
  }
});

// Search users
router.get('/search', authenticateToken, async (req, res) => {
  try {
    const { query, limit = 20 } = req.query;
    
    if (!query || query.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Search query must be at least 2 characters'
      });
    }

    const supabase = require('../config/supabase').supabase;
    
    const { data, error } = await supabase
      .from('users')
      .select('wallet_address, username, avatar_url, bio')
      .or(`username.ilike.%${query}%,wallet_address.ilike.%${query}%`)
      .limit(parseInt(limit));

    if (error) throw error;

    res.json({
      success: true,
      data: data || [],
      query: query,
      count: data ? data.length : 0
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search users'
    });
  }
});

module.exports = router;
