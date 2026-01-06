const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { authenticate, requireBusinessOwner } = require('../middleware/auth');
const BusinessModel = require('../models/Business');
const CampaignModel = require('../models/Campaign');
const { supabase, supabaseAdmin } = require('../config/supabase');

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
        const { data: business, error: businessError } = await supabase
            .from('businesses')
            .select('id')
            .eq('user_id', req.user.id)
            .single();
        
        if (businessError || !business) {
            return res.status(404).json({
                success: false,
                error: 'کسب‌وکار یافت نشد'
            });
        }
        
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
    body('campaign_type').isIn(['sale', 'visit', 'signup', 'order']).withMessage('نوع کمپین نامعتبر است'),
    body('title').isLength({ min: 5, max: 200 }).withMessage('عنوان باید بین ۵ تا ۲۰۰ کاراکتر باشد'),
    body('description').optional().isLength({ max: 1000 }).withMessage('توضیحات حداکثر ۱۰۰۰ کاراکتر'),
    body('budget').isFloat({ min: 10000 }).withMessage('بودجه باید حداقل ۱۰,۰۰۰ تومان باشد'),
    body('reward_per_action').isFloat({ min: 1000 }).withMessage('پاداش هر اقدام باید حداقل ۱,۰۰۰ تومان باشد'),
    body('total_actions').isInt({ min: 1, max: 10000 }).withMessage('تعداد اقدامات باید بین ۱ تا ۱۰,۰۰۰ باشد'),
    body('requirements').optional().isObject(),
    body('start_date').optional().isISO8601().withMessage('فرت تاریخ شروع نامعتبر است'),
    body('end_date').optional().isISO8601().withMessage('فرمت تاریخ پایان نامعتبر است'),
    body('daily_limit').optional().isInt({ min: 1 }).withMessage('محدودیت روزانه باید عدد مثبت باشد'),
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
        const { data: business, error: businessError } = await supabase
            .from('businesses')
            .select('id')
            .eq('user_id', req.user.id)
            .single();
        
        if (businessError || !business) {
            return res.status(404).json({
                success: false,
                error: 'کسب‌وکار یافت نشد'
            });
        }
        
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
        const { data: business, error: businessError } = await supabase
            .from('businesses')
            .select('id')
            .eq('user_id', req.user.id)
            .single();
        
        if (businessError || !business) {
            return res.status(404).json({
                success: false,
                error: 'کسب‌وکار یافت نشد'
            });
        }
        
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
        const { data: business, error: businessError } = await supabase
            .from('businesses')
            .select('id')
            .eq('user_id', req.user.id)
            .single();
        
        if (businessError || !business) {
            return res.status(404).json({
                success: false,
                error: 'کسب‌وکار یافت نشد'
            });
        }
        
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
        const { data: business, error: businessError } = await supabase
            .from('businesses')
            .select('id')
            .eq('user_id', req.user.id)
            .single();
        
        if (businessError || !business) {
            return res.status(404).json({
                success: false,
                error: 'کسب‌وکار یافت نشد'
            });
        }
        
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
        const { data: business, error: businessError } = await supabase
            .from('businesses')
            .select('id')
            .eq('user_id', req.user.id)
            .single();
        
        if (businessError || !business) {
            return res.status(404).json({
                success: false,
                error: 'کسب‌وکار یافت نشد'
            });
        }
        
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
        const { data: business, error: businessError } = await supabase
            .from('businesses')
            .select('id')
            .eq('user_id', req.user.id)
            .single();
        
        if (businessError || !business) {
            return res.status(404).json({
                success: false,
                error: 'کسب‌وکار یافت نشد'
            });
        }
        
        const { data: campaigns, error: campaignsError } = await supabase
            .from('campaigns')
            .select('id')
            .eq('business_id', business.id);
        
        if (campaignsError) throw campaignsError;
        
        const campaignIds = campaigns.map(c => c.id);
        
        if (campaignIds.length === 0) {
            return res.json({
                success: true,
                actions: [],
                total: 0
            });
        }
        
        const { data: pendingActions, error: actionsError } = await supabase
            .from('user_actions')
            .select(`
                *,
                mission:missions(title),
                user:users(name, level)
            `)
            .in('campaign_id', campaignIds)
            .eq('status', 'completed')
            .order('created_at', { ascending: false });
        
        if (actionsError) throw actionsError;
        
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
        
        // بررسی وجود اقدام
        const { data: action, error: actionError } = await supabase
            .from('user_actions')
            .select('campaign_id, status, mission_id, user_id, amount')
            .eq('id', actionId)
            .single();
        
        if (actionError || !action) {
            return res.status(404).json({
                success: false,
                error: 'اقدام یافت نشد'
            });
        }
        
        // بررسی اینکه اقدام در وضعیت completed باشد
        if (action.status !== 'completed') {
            return res.status(400).json({
                success: false,
                error: 'این اقدام قابل تأیید نیست'
            });
        }
        
        // بررسی مالکیت کمپین
        const { data: business, error: businessError } = await supabase
            .from('businesses')
            .select('id')
            .eq('user_id', req.user.id)
            .single();
        
        if (businessError || !business) {
            return res.status(404).json({
                success: false,
                error: 'کسب‌وکار یافت نشد'
            });
        }
        
        const { data: campaign, error: campaignError } = await supabase
            .from('campaigns')
            .select('id, budget, spent, reward_per_action')
            .eq('id', action.campaign_id)
            .eq('business_id', business.id)
            .single();
        
        if (campaignError || !campaign) {
            return res.status(403).json({
                success: false,
                error: 'شما مجوز تأیید این اقدام را ندارید'
            });
        }
        
        // شروع تراکنش
        const session = await require('mongoose').startSession();
        session.startTransaction();
        
        try {
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
            
            // 2. افزایش تعداد اقدامات تکمیل شده کمپین
            await supabaseAdmin
                .from('campaigns')
                .update({
                    completed_actions: supabase.raw('completed_actions + 1'),
                    spent: supabase.raw(`spent + ${campaign.reward_per_action}`),
                    updated_at: new Date().toISOString()
                })
                .eq('id', campaign.id);
            
            // 3. پرداخت به کاربر (75% مبلغ اصلی، 25% کارمزد پلتفرم)
            const userAmount = campaign.reward_per_action * 0.75;
            const platformFee = campaign.reward_per_action * 0.25;
            
            // افزایش موجودی کاربر
            await supabaseAdmin
                .from('wallets')
                .update({
                    balance: supabase.raw(`balance + ${userAmount}`),
                    total_earned: supabase.raw(`total_earned + ${userAmount}`),
                    updated_at: new Date().toISOString()
                })
                .eq('owner_type', 'user')
                .eq('owner_id', action.user_id);
            
            // افزایش کارمزد پلتفرم
            await supabaseAdmin
                .from('wallets')
                .update({
                    balance: supabase.raw(`balance + ${platformFee}`),
                    total_earned: supabase.raw(`total_earned + ${platformFee}`),
                    updated_at: new Date().toISOString()
                })
                .eq('owner_type', 'platform')
                .eq('owner_id', '00000000-0000-0000-0000-000000000000');
            
            // 4. ثبت تراکنش پرداخت به کاربر
            await supabaseAdmin
                .from('transactions')
                .insert([{
                    from_type: 'business',
                    from_id: business.id,
                    to_type: 'user',
                    to_id: action.user_id,
                    amount: userAmount,
                    transaction_type: 'mission_reward',
                    campaign_id: action.campaign_id,
                    mission_id: action.mission_id,
                    user_action_id: actionId,
                    status: 'completed',
                    description: `پاداش مأموریت: ${userAmount.toLocaleString()} تومان`,
                    metadata: {
                        mission_reward: userAmount,
                        platform_fee: platformFee,
                        total_amount: campaign.reward_per_action
                    }
                }]);
            
            // 5. ثبت تراکنش کارمزد پلتفرم
            await supabaseAdmin
                .from('transactions')
                .insert([{
                    from_type: 'business',
                    from_id: business.id,
                    to_type: 'platform',
                    to_id: '00000000-0000-0000-0000-000000000000',
                    amount: platformFee,
                    transaction_type: 'platform_commission',
                    campaign_id: action.campaign_id,
                    mission_id: action.mission_id,
                    user_action_id: actionId,
                    status: 'completed',
                    description: `کارمزد پلتفرم: ${platformFee.toLocaleString()} تومان`
                }]);
            
            // 6. ارسال نوتیفیکیشن به کاربر
            await supabaseAdmin
                .from('notifications')
                .insert([{
                    user_id: action.user_id,
                    title: '💰 پاداش دریافت شد',
                    message: `مأموریت شما تأیید شد! ${userAmount.toLocaleString()} تومان به کیف پول شما واریز شد.`,
                    type: 'success',
                    data: {
                        action_id: actionId,
                        amount: userAmount,
                        campaign_id: action.campaign_id
                    }
                }]);
            
            await session.commitTransaction();
            
            res.json({
                success: true,
                action: updatedAction,
                payment: {
                    user_amount: userAmount,
                    platform_fee: platformFee,
                    total: campaign.reward_per_action
                },
                message: 'اقدام با موفقیت تأیید و پرداخت انجام شد'
            });
            
        } catch (transactionError) {
            await session.abortTransaction();
            throw transactionError;
        } finally {
            session.endSession();
        }
        
    } catch (error) {
        console.error('Verify action error:', error);
        res.status(500).json({
            success: false,
            error: 'خطای سرور'
        });
    }
});

// ❌ رد کردن اقدام کاربر
router.post('/actions/:actionId/reject', authenticate, requireBusinessOwner, async (req, res) => {
    try {
        const { actionId } = req.params;
        const { reason } = req.body;
        
        // بررسی وجود اقدام
        const { data: action, error: actionError } = await supabase
            .from('user_actions')
            .select('campaign_id, status, user_id')
            .eq('id', actionId)
            .single();
        
        if (actionError || !action) {
            return res.status(404).json({
                success: false,
                error: 'اقدام یافت نشد'
            });
        }
        
        // بررسی مالکیت کمپین
        const { data: business, error: businessError } = await supabase
            .from('businesses')
            .select('id')
            .eq('user_id', req.user.id)
            .single();
        
        if (businessError || !business) {
            return res.status(404).json({
                success: false,
                error: 'کسب‌وکار یافت نشد'
            });
        }
        
        const { data: campaign, error: campaignError } = await supabase
            .from('campaigns')
            .select('id')
            .eq('id', action.campaign_id)
            .eq('business_id', business.id)
            .single();
        
        if (campaignError || !campaign) {
            return res.status(403).json({
                success: false,
                error: 'شما مجوز رد این اقدام را ندارید'
            });
        }
        
        // بروزرسانی وضعیت اقدام
        const { data: updatedAction, error: updateError } = await supabaseAdmin
            .from('user_actions')
            .update({
                status: 'rejected',
                updated_at: new Date().toISOString(),
                proof_data: {
                    ...(action.proof_data || {}),
                    rejection_reason: reason,
                    rejected_at: new Date().toISOString(),
                    rejected_by: req.user.id
                }
            })
            .eq('id', actionId)
            .select()
            .single();
        
        if (updateError) throw updateError;
        
        // ارسال نوتیفیکیشن به کاربر
        await supabaseAdmin
            .from('notifications')
            .insert([{
                user_id: action.user_id,
                title: '❌ اقدام رد شد',
                message: `اقدام شما رد شد. دلیل: ${reason || 'مشخص نشده'}`,
                type: 'error',
                data: {
                    action_id: actionId,
                    reason: reason
                }
            }]);
        
        res.json({
            success: true,
            action: updatedAction,
            message: 'اقدام با موفقیت رد شد'
        });
        
    } catch (error) {
        console.error('Reject action error:', error);
        res.status(500).json({
            success: false,
            error: 'خطای سرور'
        });
    }
});

// 💳 شارژ کیف پول کسب‌وکار
router.post('/wallet/deposit', authenticate, requireBusinessOwner, [
    body('amount').isFloat({ min: 10000 }).withMessage('حداقل مبلغ شارژ ۱۰,۰۰۰ تومان است'),
    body('gateway').isIn(['zarinpal', 'idpay']).withMessage('درگاه پرداخت نامعتبر است')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        
        const { amount, gateway } = req.body;
        
        // دریافت آیدی کسب‌وکار
        const { data: business, error: businessError } = await supabase
            .from('businesses')
            .select('id, business_name')
            .eq('user_id', req.user.id)
            .single();
        
        if (businessError || !business) {
            return res.status(404).json({
                success: false,
                error: 'کسب‌وکار یافت نشد'
            });
        }
        
        // در اینجا باید درگاه پرداخت فراخوانی شود
        // فعلاً فقط شبیه‌سازی می‌کنیم
        
        const paymentRequest = {
            amount: amount * 10, // تبدیل به ریال
            description: `شارژ کیف پول ${business.business_name}`,
            callback_url: `${process.env.APP_URL}/api/payment/callback`,
            merchant_id: process.env.ZARINPAL_MERCHANT_ID,
            metadata: {
                business_id: business.id,
                business_name: business.business_name,
                user_id: req.user.id,
                type: 'business_deposit'
            }
        };
        
        // شبیه‌سازی درخواست پرداخت
        const simulatedResponse = {
            success: true,
            data: {
                authority: `DEP${Date.now()}${Math.floor(Math.random() * 1000)}`,
                payment_url: `https://sandbox.zarinpal.com/pg/StartPay/${Date.now()}`,
                amount: amount,
                gateway: gateway,
                status: 'pending'
            },
            message: 'درخواست پرداخت ایجاد شد'
        };
        
        // ثبت درخواست پرداخت در دیتابیس
        await supabaseAdmin
            .from('transactions')
            .insert([{
                from_type: 'business',
                from_id: business.id,
                to_type: 'business_wallet',
                to_id: business.id,
                amount: amount,
                transaction_type: 'deposit',
                status: 'pending',
                gateway_data: {
                    gateway: gateway,
                    authority: simulatedResponse.data.authority,
                    amount: amount
                },
                description: `درخواست شارژ کیف پول از طریق ${gateway}`,
                metadata: paymentRequest.metadata
            }]);
        
        res.json(simulatedResponse);
        
    } catch (error) {
        console.error('Deposit error:', error);
        res.status(500).json({
            success: false,
            error: 'خطای سرور'
        });
    }
});

// 📈 دریافت داشبورد کسب‌وکار
router.get('/dashboard', authenticate, requireBusinessOwner, async (req, res) => {
    try {
        const { data: business, error: businessError } = await supabase
            .from('businesses')
            .select('id, business_name, verified, total_spent, total_campaigns')
            .eq('user_id', req.user.id)
            .single();
        
        if (businessError || !business) {
            return res.status(404).json({
                success: false,
                error: 'کسب‌وکار یافت نشد'
            });
        }
        
        // دریافت کیف پول
        const { data: wallet } = await supabase
            .from('wallets')
            .select('balance, frozen_balance, total_earned, total_spent')
            .eq('owner_type', 'business')
            .eq('owner_id', business.id)
            .single();
        
        // دریافت کمپین‌های فعال
        const { data: activeCampaigns } = await supabase
            .from('campaigns')
            .select('id, title, budget, spent, status')
            .eq('business_id', business.id)
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .limit(5);
        
        // دریافت اقدامات اخیر
        const { data: recentActions } = await supabase
            .from('user_actions')
            .select(`
                id,
                status,
                created_at,
                mission:missions(title),
                user:users(name)
            `)
            .eq('campaign_id', activeCampaigns?.map(c => c.id) || [])
            .order('created_at', { ascending: false })
            .limit(10);
        
        // محاسبه آمار
        const stats = {
            wallet_balance: wallet?.balance || 0,
            frozen_balance: wallet?.frozen_balance || 0,
            available_balance: (wallet?.balance || 0) - (wallet?.frozen_balance || 0),
            total_earned: wallet?.total_earned || 0,
            total_spent: business.total_spent,
            active_campaigns: activeCampaigns?.length || 0,
            total_campaigns: business.total_campaigns,
            pending_actions: recentActions?.filter(a => a.status === 'completed').length || 0,
            conversion_rate: business.total_campaigns > 0 ? 
                ((business.total_spent / (business.total_campaigns * 10000)) * 100).toFixed(2) : 0
        };
        
        res.json({
            success: true,
            business: business,
            wallet: wallet || {},
            stats: stats,
            active_campaigns: activeCampaigns || [],
            recent_actions: recentActions || []
        });
        
    } catch (error) {
        console.error('Get dashboard error:', error);
        res.status(500).json({
            success: false,
            error: 'خطای سرور'
        });
    }
});

module.exports = router;
