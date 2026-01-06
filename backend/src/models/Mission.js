const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { authenticate, requireBusinessOwner } = require('../middleware/auth');
const BusinessModel = require('../models/Business');
const CampaignModel = require('../models/Campaign');

// 📊 دریافت اطلاعات کسب‌وکار
router.get('/profile', authenticate, requireBusinessOwner, async (req, res) => {
    try {
        const result = await BusinessModel.getBusiness(req.user.id);
        
        if (!result.success) {
            return res.status(400).json(result);
        }
        
        res.json(result);
    } catch (error) {
        console.error('Get business profile error:', error);
        res.status(500).json({
            success: false,
            error: 'خطای سرور'
        });
    }
});

// ✏️ به‌روزرسانی اطلاعات کسب‌وکار
router.put('/profile', authenticate, requireBusinessOwner, [
    body('business_name').optional().isLength({ min: 2 }),
    body('business_type').optional().isIn(['فروشگاهی', 'خدماتی', 'تولیدی', 'دیگر']),
    body('manager_name').optional().isLength({ min: 2 }),
    body('tax_code').optional().isLength({ min: 10 })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        
        // دریافت آیدی کسب‌وکار
        const { data: business } = await require('../config/supabase').supabase
            .from('businesses')
            .select('id')
            .eq('user_id', req.user.id)
            .single();
        
        const result = await BusinessModel.updateBusiness(business.id, req.body);
        
        if (!result.success) {
            return res.status(400).json(result);
        }
        
        res.json(result);
    } catch (error) {
        console.error('Update business profile error:', error);
        res.status(500).json({
            success: false,
            error: 'خطای سرور'
        });
    }
});

// 🏗️ ایجاد کمپین جدید
router.post('/campaigns', authenticate, requireBusinessOwner, [
    body('campaign_type').isIn(['sale', 'visit', 'signup', 'order']),
    body('title').isLength({ min: 5, max: 200 }),
    body('description').optional().isLength({ max: 1000 }),
    body('budget').isFloat({ min: 10000 }), // حداقل 10,000 تومان
    body('reward_per_action').isFloat({ min: 1000 }), // حداقل 1,000 تومان
    body('total_actions').isInt({ min: 1, max: 10000 }),
    body('requirements').optional().isObject(),
    body('start_date').optional().isISO8601(),
    body('end_date').optional().isISO8601(),
    body('daily_limit').optional().isInt({ min: 1 }),
    body('tags').optional().isArray()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        
        // دریافت آیدی کسب‌وکار
        const { data: business } = await require('../config/supabase').supabase
            .from('businesses')
            .select('id')
            .eq('user_id', req.user.id)
            .single();
        
        const result = await CampaignModel.createCampaign(business.id, req.body);
        
        if (!result.success) {
            return res.status(400).json(result);
        }
        
        res.status(201).json(result);
    } catch (error) {
        console.error('Create campaign error:', error);
        res.status(500).json({
            success: false,
            error: 'خطای سرور'
        });
    }
});

// 📋 دریافت لیست کمپین‌ها
router.get('/campaigns', authenticate, requireBusinessOwner, async (req, res) => {
    try {
        const { data: business } = await require('../config/supabase').supabase
            .from('businesses')
            .select('id')
            .eq('user_id', req.user.id)
            .single();
        
        const filters = {
            status: req.query.status,
            campaign_type: req.query.type,
            limit: parseInt(req.query.limit) || 10,
            offset: parseInt(req.query.offset) || 0
        };
        
        const result = await BusinessModel.getCampaigns(business.id, filters);
        
        if (!result.success) {
            return res.status(400).json(result);
        }
        
        res.json(result);
    } catch (error) {
        console.error('Get campaigns error:', error);
        res.status(500).json({
            success: false,
            error: 'خطای سرور'
        });
    }
});

// 🔍 دریافت جزئیات کمپین
router.get('/campaigns/:id', authenticate, requireBusinessOwner, async (req, res) => {
    try {
        const { data: business } = await require('../config/supabase').supabase
            .from('businesses')
            .select('id')
            .eq('user_id', req.user.id)
            .single();
        
        const result = await CampaignModel.getCampaignDetails(req.params.id, business.id);
        
        if (!result.success) {
            return res.status(404).json(result);
        }
        
        res.json(result);
    } catch (error) {
        console.error('Get campaign details error:', error);
        res.status(500).json({
            success: false,
            error: 'خطای سرور'
        });
    }
});

// 📊 دریافت آمار کمپین
router.get('/campaigns/:id/stats', authenticate, requireBusinessOwner, async (req, res) => {
    try {
        const { data: business } = await require('../config/supabase').supabase
            .from('businesses')
            .select('id')
            .eq('user_id', req.user.id)
            .single();
        
        const result = await CampaignModel.getCampaignStats(req.params.id, business.id);
        
        if (!result.success) {
            return res.status(404).json(result);
        }
        
        res.json(result);
    } catch (error) {
        console.error('Get campaign stats error:', error);
        res.status(500).json({
            success: false,
            error: 'خطای سرور'
        });
    }
});

// 💰 دریافت آمار مالی
router.get('/stats/financial', authenticate, requireBusinessOwner, async (req, res) => {
    try {
        const { data: business } = await require('../config/supabase').supabase
            .from('businesses')
            .select('id')
            .eq('user_id', req.user.id)
            .single();
        
        const period = req.query.period || 'monthly';
        const result = await BusinessModel.getFinancialStats(business.id, period);
        
        if (!result.success) {
            return res.status(400).json(result);
        }
        
        res.json(result);
    } catch (error) {
        console.error('Get financial stats error:', error);
        res.status(500).json({
            success: false,
            error: 'خطای سرور'
        });
    }
});

// 👥 دریافت اقدامات در انتظار تأیید
router.get('/actions/pending', authenticate, requireBusinessOwner, async (req, res) => {
    try {
        const { data: business } = await require('../config/supabase').supabase
            .from('businesses')
            .select('id')
            .eq('user_id', req.user.id)
            .single();
        
        const { data: campaigns } = await require('../config/supabase').supabase
            .from('campaigns')
            .select('id')
            .eq('business_id', business.id);
        
        const campaignIds = campaigns.map(c => c.id);
        
        const { data: pendingActions, error } = await require('../config/supabase').supabase
            .from('user_actions')
            .select(`
                *,
                mission:missions(title),
                user:users(name, level)
            `)
            .in('campaign_id', campaignIds)
            .eq('status', 'completed')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        res.json({
            success: true,
            actions: pendingActions || [],
            total: pendingActions?.length || 0
        });
        
    } catch (error) {
        console.error('Get pending actions error:', error);
        res.status(500).json({
            success: false,
            error: 'خطای سرور'
        });
    }
});

// ✅ تأیید اقدام کاربر
router.post('/actions/:actionId/verify', authenticate, requireBusinessOwner, async (req, res) => {
    try {
        const { actionId } = req.params;
        
        // بررسی مالکیت اقدام
        const { data: action } = await require('../config/supabase').supabase
            .from('user_actions')
            .select('campaign_id')
            .eq('id', actionId)
            .single();
        
        if (!action) {
            return res.status(404).json({
                success: false,
                error: 'اقدام یافت نشد'
            });
        }
        
        // بررسی مالکیت کمپین
        const { data: business } = await require('../config/supabase').supabase
            .from('businesses')
            .select('id')
            .eq('user_id', req.user.id)
            .single();
        
        const { data: campaign } = await require('../config/supabase').supabase
            .from('campaigns')
            .select('id')
            .eq('id', action.campaign_id)
            .eq('business_id', business.id)
            .single();
        
        if (!campaign) {
            return res.status(403).json({
                success: false,
                error: 'شما مجوز تأیید این اقدام را ندارید'
            });
        }
        
        // تأیید اقدام
        const { supabaseAdmin } = require('../config/supabase');
        
        // 1. بروزرسانی وضعیت اقدام
        const { data: updatedAction, error: updateError } = await supabaseAdmin
            .from('user_actions')
            .update({
                status: 'verified',
                verified_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .eq('id', actionId)
            .select()
            .single();
        
        if (updateError) throw updateError;
        
        // 2. پرداخت به کاربر (در مرحله بعدی کامل می‌شود)
        // اینجا فقط وضعیت رو تغییر می‌دیم
        
        res.json({
            success: true,
            action: updatedAction,
            message: 'اقدام با موفقیت تأیید شد'
        });
        
    } catch (error) {
        console.error('Verify action error:', error);
        res.status(500).json({
            success: false,
            error: 'خطای سرور'
        });
    }
});

module.exports = router;
