const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const MissionModel = require('../models/Mission');

// 🎯 دریافت مأموریت‌های پیشنهادی
router.get('/suggested', authenticate, async (req, res) => {
    try {
        const filters = {
            category: req.query.category,
            difficulty: req.query.difficulty,
            mission_type: req.query.type,
            limit: parseInt(req.query.limit) || 20,
            offset: parseInt(req.query.offset) || 0
        };
        
        const result = await MissionModel.getSuggestedMissions(req.user.id, filters);
        
        if (!result.success) {
            return res.status(400).json(result);
        }
        
        res.json(result);
    } catch (error) {
        console.error('Get suggested missions error:', error);
        res.status(500).json({
            success: false,
            error: 'خطای سرور'
        });
    }
});

// 🔍 دریافت جزئیات مأموریت
router.get('/:id', async (req, res) => {
    try {
        const userId = req.user?.id || null;
        const result = await MissionModel.getMissionDetails(req.params.id, userId);
        
        if (!result.success) {
            return res.status(404).json(result);
        }
        
        res.json(result);
    } catch (error) {
        console.error('Get mission details error:', error);
        res.status(500).json({
            success: false,
            error: 'خطای سرور'
        });
    }
});

// 🚀 شروع مأموریت
router.post('/:id/start', authenticate, async (req, res) => {
    try {
        const result = await MissionModel.startMission(req.user.id, req.params.id);
        
        if (!result.success) {
            return res.status(400).json(result);
        }
        
        res.json(result);
    } catch (error) {
        console.error('Start mission error:', error);
        res.status(500).json({
            success: false,
            error: 'خطای سرور'
        });
    }
});

// ✅ تکمیل مأموریت
router.post('/:id/complete', authenticate, async (req, res) => {
    try {
        // پیدا کردن آیدی اقدام
        const { data: action } = await require('../config/supabase').supabase
            .from('user_actions')
            .select('id')
            .eq('user_id', req.user.id)
            .eq('mission_id', req.params.id)
            .eq('status', 'in_progress')
            .single();
        
        if (!action) {
            return res.status(404).json({
                success: false,
                error: 'اقدام فعالی یافت نشد'
            });
        }
        
        const result = await MissionModel.completeMission(action.id, req.body);
        
        if (!result.success) {
            return res.status(400).json(result);
        }
        
        res.json(result);
    } catch (error) {
        console.error('Complete mission error:', error);
        res.status(500).json({
            success: false,
            error: 'خطای سرور'
        });
    }
});

// 📜 دریافت تاریخچه مأموریت‌های کاربر
router.get('/history', authenticate, async (req, res) => {
    try {
        const filters = {
            status: req.query.status,
            action_type: req.query.type,
            start_date: req.query.start_date,
            end_date: req.query.end_date,
            limit: parseInt(req.query.limit) || 10,
            offset: parseInt(req.query.offset) || 0
        };
        
        const result = await MissionModel.getUserMissionHistory(req.user.id, filters);
        
        if (!result.success) {
            return res.status(400).json(result);
        }
        
        res.json(result);
    } catch (error) {
        console.error('Get mission history error:', error);
        res.status(500).json({
            success: false,
            error: 'خطای سرور'
        });
    }
});

// 🎮 دریافت مأموریت‌های فعال کاربر
router.get('/active', authenticate, async (req, res) => {
    try {
        const { data: activeActions, error } = await require('../config/supabase').supabase
            .from('user_actions')
            .select(`
                *,
                mission:missions(
                    title,
                    description,
                    steps,
                    estimated_time,
                    difficulty,
                    reward
                ),
                campaign:campaigns(title)
            `)
            .eq('user_id', req.user.id)
            .eq('status', 'in_progress')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        res.json({
            success: true,
            actions: activeActions || [],
            total: activeActions?.length || 0
        });
        
    } catch (error) {
        console.error('Get active missions error:', error);
        res.status(500).json({
            success: false,
            error: 'خطای سرور'
        });
    }
});

// 🏆 دریافت برترین مأموریت‌ها
router.get('/top', async (req, res) => {
    try {
        const { data: topMissions, error } = await require('../config/supabase').supabase
            .from('missions')
            .select(`
                *,
                campaign:campaigns(
                    title,
                    business:businesses(business_name, verified)
                )
            `)
            .eq('is_active', true)
            .order('reward', { ascending: false })
            .limit(10);
        
        if (error) throw error;
        
        res.json({
            success: true,
            missions: topMissions || []
        });
        
    } catch (error) {
        console.error('Get top missions error:', error);
        res.status(500).json({
            success: false,
            error: 'خطای سرور'
        });
    }
});

module.exports = router;
