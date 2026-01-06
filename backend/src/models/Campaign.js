const { supabase, supabaseAdmin } = require('../config/supabase');

class CampaignModel {
    // ایجاد کمپین جدید
    static async createCampaign(businessId, campaignData) {
        try {
            // 1. بررسی موجودی کیف پول کسب‌وکار
            const { data: wallet } = await supabase
                .from('wallets')
                .select('balance')
                .eq('owner_type', 'business')
                .eq('owner_id', businessId)
                .single();

            if (!wallet || wallet.balance < campaignData.budget) {
                throw new Error('موجودی کیف پول کافی نیست');
            }

            // 2. بلوکه کردن بودجه
            const frozenAmount = campaignData.budget;
            await supabaseAdmin
                .from('wallets')
                .update({
                    frozen_balance: parseFloat(wallet.frozen_balance || 0) + frozenAmount,
                    balance: parseFloat(wallet.balance) - frozenAmount,
                    updated_at: new Date().toISOString()
                })
                .eq('owner_type', 'business')
                .eq('owner_id', businessId);

            // 3. ایجاد کمپین
            const { data: newCampaign, error } = await supabaseAdmin
                .from('campaigns')
                .insert([{
                    business_id: businessId,
                    ...campaignData,
                    status: 'active',
                    spent: 0,
                    completed_actions: 0
                }])
                .select()
                .single();

            if (error) throw error;

            // 4. ثبت تراکنش بلوکه کردن بودجه
            await supabaseAdmin
                .from('transactions')
                .insert([{
                    from_type: 'business',
                    from_id: businessId,
                    to_type: 'campaign_budget',
                    to_id: newCampaign.id,
                    amount: frozenAmount,
                    transaction_type: 'campaign_fund',
                    status: 'completed',
                    description: `بودجه کمپین ${campaignData.title}`,
                    metadata: {
                        campaign_id: newCampaign.id,
                        campaign_title: campaignData.title
                    }
                }]);

            // 5. افزایش تعداد کمپین‌های کسب‌وکار
            await supabaseAdmin
                .from('businesses')
                .update({
                    total_campaigns: supabase.raw('total_campaigns + 1'),
                    updated_at: new Date().toISOString()
                })
                .eq('id', businessId);

            // 6. ایجاد مأموریت‌های اولیه
            const missions = await this.createInitialMissions(newCampaign);

            return {
                success: true,
                campaign: newCampaign,
                missions_created: missions.length,
                message: 'کمپین با موفقیت ایجاد شد'
            };

        } catch (error) {
            console.error('Create campaign error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // ایجاد مأموریت‌های اولیه برای کمپین
    static async createInitialMissions(campaign) {
        const missions = [];
        const missionCount = Math.floor(campaign.budget / campaign.reward_per_action);

        for (let i = 0; i < Math.min(missionCount, 100); i++) { // حداکثر 100 مأموریت
            const missionData = this.generateMissionData(campaign, i + 1);

            const { data: mission } = await supabaseAdmin
                .from('missions')
                .insert([missionData])
                .select()
                .single();

            if (mission) {
                missions.push(mission);
            }
        }

        return missions;
    }

    // تولید داده‌های مأموریت بر اساس نوع کمپین
    static generateMissionData(campaign, index) {
        const baseMission = {
            campaign_id: campaign.id,
            mission_type: campaign.campaign_type,
            reward: campaign.reward_per_action,
            experience_points: 10,
            difficulty: 'easy',
            is_active: true,
            accepted_count: 0,
            completed_count: 0
        };

        const missionTypes = {
            sale: {
                title: `خرید از ${campaign.title}`,
                description: 'خرید محصول با حداقل مبلغ مشخص شده',
                steps: [
                    { step: 1, action: 'بازدید از محصول', time: 30, completed: false },
                    { step: 2, action: 'افزودن به سبد خرید', time: 15, completed: false },
                    { step: 3, action: 'تکمیل خرید', time: 60, completed: false }
                ],
                validation_method: 'invoice_upload',
                validation_data: { require_invoice: true, min_amount: campaign.requirements?.min_amount || 0 }
            },
            visit: {
                title: `بازدید از ${campaign.title}`,
                description: 'بازدید از صفحه مورد نظر و ماندن در آن',
                steps: [
                    { step: 1, action: 'کلیک روی لینک', time: 5, completed: false },
                    { step: 2, action: 'ماندن در صفحه', time: campaign.requirements?.min_time_seconds || 60, completed: false },
                    { step: 3, action: 'ثبت اسکرین‌شات', time: 30, completed: false }
                ],
                validation_method: 'screenshot',
                validation_data: { require_screenshot: true, min_time: campaign.requirements?.min_time_seconds || 60 }
            },
            signup: {
                title: `ثبت‌نام در ${campaign.title}`,
                description: 'ثبت‌نام در سرویس مورد نظر',
                steps: [
                    { step: 1, action: 'ورود به صفحه ثبت‌نام', time: 10, completed: false },
                    { step: 2, action: 'تکمیل فرم ثبت‌نام', time: 120, completed: false },
                    { step: 3, action: 'تأیید ایمیل/شماره', time: 60, completed: false }
                ],
                validation_method: 'referral_code',
                validation_data: { require_code: true, code_pattern: campaign.requirements?.code_pattern }
            },
            order: {
                title: `سفارش ${campaign.title}`,
                description: 'ثبت سفارش خدمت یا محصول',
                steps: [
                    { step: 1, action: 'مشاهده خدمات', time: 20, completed: false },
                    { step: 2, action: 'تکمیل فرم سفارش', time: 90, completed: false },
                    { step: 3, action: 'پرداخت', time: 45, completed: false }
                ],
                validation_method: 'order_id',
                validation_data: { require_order_id: true, service_type: campaign.requirements?.service_type }
            }
        };

        const typeConfig = missionTypes[campaign.campaign_type] || missionTypes.visit;

        return {
            ...baseMission,
            ...typeConfig,
            title: `${typeConfig.title} (${index})`,
            category: campaign.tags?.[0] || 'عمومی',
            tags: campaign.tags || [],
            estimated_time: typeConfig.steps.reduce((sum, step) => sum + step.time, 0),
            total_limit: Math.floor(campaign.budget / campaign.reward_per_action / 10) || 10
        };
    }

    // دریافت جزئیات کمپین
    static async getCampaignDetails(campaignId, businessId = null) {
        try {
            let query = supabase
                .from('campaigns')
                .select(`
                    *,
                    business:businesses(business_name, verified, rating),
                    missions(*),
                    user_actions(
                        id,
                        status,
                        created_at,
                        user:users(name, level)
                    )
                `)
                .eq('id', campaignId);

            if (businessId) {
                query = query.eq('business_id', businessId);
            }

            const { data: campaign, error } = await query.single();

            if (error) throw error;

            // محاسبه آمار
            const stats = {
                total_missions: campaign.missions?.length || 0,
                active_missions: campaign.missions?.filter(m => m.is_active).length || 0,
                pending_actions: campaign.user_actions?.filter(a => a.status === 'pending').length || 0,
                completed_actions: campaign.user_actions?.filter(a => a.status === 'verified').length || 0,
                conversion_rate: campaign.total_actions > 0 ? 
                    ((campaign.completed_actions / campaign.total_actions) * 100).toFixed(2) : 0,
                remaining_budget: campaign.budget - campaign.spent,
                days_remaining: campaign.end_date ? 
                    Math.ceil((new Date(campaign.end_date) - new Date()) / (1000 * 60 * 60 * 24)) : null
            };

            return {
                success: true,
                campaign: {
                    ...campaign,
                    stats
                }
            };

        } catch (error) {
            console.error('Get campaign details error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // به‌روزرسانی کمپین
    static async updateCampaign(campaignId, businessId, updateData) {
        try {
            // بررسی مالکیت
            const { data: campaign } = await supabase
                .from('campaigns')
                .select('business_id, status')
                .eq('id', campaignId)
                .single();

            if (!campaign || campaign.business_id !== businessId) {
                throw new Error('شما مجوز ویرایش این کمپین را ندارید');
            }

            // عدم اجازه ویرایش کمپین‌های فعال
            if (campaign.status === 'active' && updateData.status === 'paused') {
                // فقط اجازه توقف
            } else if (campaign.status !== 'draft') {
                throw new Error('فقط کمپین‌های در حالت پیش‌نویس قابل ویرایش هستند');
            }

            const { data: updatedCampaign, error } = await supabaseAdmin
                .from('campaigns')
                .update({
                    ...updateData,
                    updated_at: new Date().toISOString()
                })
                .eq('id', campaignId)
                .select()
                .single();

            if (error) throw error;

            return {
                success: true,
                campaign: updatedCampaign
            };

        } catch (error) {
            console.error('Update campaign error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // حذف کمپین
    static async deleteCampaign(campaignId, businessId) {
        try {
            // بررسی مالکیت
            const { data: campaign } = await supabase
                .from('campaigns')
                .select('business_id, status, budget, spent')
                .eq('id', campaignId)
                .single();

            if (!campaign || campaign.business_id !== businessId) {
                throw new Error('شما مجوز حذف این کمپین را ندارید');
            }

            // فقط کمپین‌های در حالت پیش‌نویس قابل حذف هستند
            if (campaign.status !== 'draft') {
                throw new Error('فقط کمپین‌های در حالت پیش‌نویس قابل حذف هستند');
            }

            // بازگشت بودجه به کیف پول
            if (campaign.budget > campaign.spent) {
                const remainingBudget = campaign.budget - campaign.spent;

                await supabaseAdmin
                    .from('wallets')
                    .update({
                        balance: supabase.raw(`balance + ${remainingBudget}`),
                        frozen_balance: supabase.raw(`frozen_balance - ${remainingBudget}`),
                        updated_at: new Date().toISOString()
                    })
                    .eq('owner_type', 'business')
                    .eq('owner_id', businessId);

                // ثبت تراکنش بازگشت بودجه
                await supabaseAdmin
                    .from('transactions')
                    .insert([{
                        from_type: 'campaign_budget',
                        from_id: campaignId,
                        to_type: 'business',
                        to_id: businessId,
                        amount: remainingBudget,
                        transaction_type: 'campaign_refund',
                        status: 'completed',
                        description: `بازگشت بودجه کمپین لغو شده`,
                        metadata: { campaign_id: campaignId }
                    }]);
            }

            // حذف کمپین
            const { error } = await supabaseAdmin
                .from('campaigns')
                .delete()
                .eq('id', campaignId);

            if (error) throw error;

            // کاهش تعداد کمپین‌های کسب‌وکار
            await supabaseAdmin
                .from('businesses')
                .update({
                    total_campaigns: supabase.raw('total_campaigns - 1'),
                    updated_at: new Date().toISOString()
                })
                .eq('id', businessId);

            return {
                success: true,
                message: 'کمپین با موفقیت حذف شد'
            };

        } catch (error) {
            console.error('Delete campaign error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // دریافت آمار کمپین
    static async getCampaignStats(campaignId, businessId) {
        try {
            const { data: campaign } = await supabase
                .from('campaigns')
                .select('*')
                .eq('id', campaignId)
                .eq('business_id', businessId)
                .single();

            if (!campaign) {
                throw new Error('کمپین یافت نشد');
            }

            // آمار مأموریت‌ها
            const { data: missions } = await supabase
                .from('missions')
                .select('id, completed_count, accepted_count')
                .eq('campaign_id', campaignId);

            // آمار اقدامات کاربران
            const { data: actions } = await supabase
                .from('user_actions')
                .select('status, created_at, amount')
                .eq('campaign_id', campaignId);

            // محاسبه آمار
            const stats = {
                campaign: {
                    budget: campaign.budget,
                    spent: campaign.spent,
                    remaining: campaign.budget - campaign.spent,
                    total_actions: campaign.total_actions,
                    completed_actions: campaign.completed_actions,
                    conversion_rate: campaign.total_actions > 0 ? 
                        ((campaign.completed_actions / campaign.total_actions) * 100).toFixed(2) : 0
                },
                missions: {
                    total: missions?.length || 0,
                    active: missions?.filter(m => m.is_active).length || 0,
                    total_accepted: missions?.reduce((sum, m) => sum + m.accepted_count, 0) || 0,
                    total_completed: missions?.reduce((sum, m) => sum + m.completed_count, 0) || 0
                },
                actions: {
                    total: actions?.length || 0,
                    pending: actions?.filter(a => a.status === 'pending').length || 0,
                    in_progress: actions?.filter(a => a.status === 'in_progress').length || 0,
                    completed: actions?.filter(a => a.status === 'completed').length || 0,
                    verified: actions?.filter(a => a.status === 'verified').length || 0,
                    paid: actions?.filter(a => a.status === 'paid').length || 0
                },
                roi: campaign.spent > 0 ? 
                    (((campaign.budget - campaign.spent) / campaign.spent) * 100).toFixed(2) : 0
            };

            // آمار روزانه
            const dailyStats = {};
            actions?.forEach(action => {
                const date = new Date(action.created_at).toLocaleDateString('fa-IR');
                if (!dailyStats[date]) {
                    dailyStats[date] = {
                        date,
                        actions: 0,
                        completed: 0,
                        amount: 0
                    };
                }
                dailyStats[date].actions++;
                if (action.status === 'verified' || action.status === 'paid') {
                    dailyStats[date].completed++;
                    dailyStats[date].amount += parseFloat(action.amount || 0);
                }
            });

            stats.daily_stats = Object.values(dailyStats).sort((a, b) => 
                new Date(b.date) - new Date(a.date)
            );

            return {
                success: true,
                stats
            };

        } catch (error) {
            console.error('Get campaign stats error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

module.exports = CampaignModel;
