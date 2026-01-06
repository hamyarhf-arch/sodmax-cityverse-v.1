const { supabase, supabaseAdmin } = require('../config/supabase');
const bcrypt = require('bcryptjs');

class BusinessModel {
    // ثبت‌نام کسب‌وکار جدید
    static async register(businessData) {
        const {
            phone,
            password,
            name,
            business_name,
            business_type,
            manager_name,
            tax_code = null
        } = businessData;

        try {
            // 1. بررسی تکراری نبودن شماره موبایل
            const { data: existingUser } = await supabase
                .from('users')
                .select('id')
                .eq('phone', phone)
                .single();

            if (existingUser) {
                throw new Error('این شماره موبایل قبلاً ثبت‌نام کرده است');
            }

            // 2. هش کردن رمز عبور
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(password, salt);

            // 3. ایجاد کاربر کسب‌وکار
            const { data: newUser, error: userError } = await supabaseAdmin
                .from('users')
                .insert([{
                    phone,
                    name,
                    password_hash: passwordHash,
                    user_type: 'business',
                    level: 1,
                    experience_points: 0
                }])
                .select()
                .single();

            if (userError) throw userError;

            // 4. ایجاد رکورد کسب‌وکار
            const { data: newBusiness, error: businessError } = await supabaseAdmin
                .from('businesses')
                .insert([{
                    user_id: newUser.id,
                    business_name,
                    business_type,
                    manager_name,
                    tax_code,
                    verified: false,
                    total_spent: 0,
                    total_campaigns: 0
                }])
                .select()
                .single();

            if (businessError) throw businessError;

            // 5. ایجاد کیف پول کسب‌وکار
            const { error: walletError } = await supabaseAdmin
                .from('wallets')
                .insert([{
                    owner_type: 'business',
                    owner_id: newBusiness.id,
                    balance: 0,
                    currency: 'IRT'
                }]);

            if (walletError) throw walletError;

            // 6. ایجاد توکن JWT
            const jwt = require('jsonwebtoken');
            const token = jwt.sign(
                {
                    userId: newUser.id,
                    userType: newUser.user_type,
                    phone: newUser.phone
                },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRE }
            );

            // 7. حذف فیلد حساس
            const { password_hash, ...userWithoutPassword } = newUser;

            return {
                success: true,
                user: userWithoutPassword,
                business: newBusiness,
                token
            };

        } catch (error) {
            console.error('Business registration error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // دریافت اطلاعات کسب‌وکار
    static async getBusiness(userId) {
        try {
            const { data: business, error } = await supabase
                .from('businesses')
                .select(`
                    *,
                    wallet: wallets(*)
                `)
                .eq('user_id', userId)
                .single();

            if (error) throw error;

            // دریافت آمار کسب‌وکار
            const { data: stats } = await supabase
                .from('business_dashboard_view')
                .select('*')
                .eq('id', business.id)
                .single();

            return {
                success: true,
                business: {
                    ...business,
                    stats: stats || {}
                }
            };

        } catch (error) {
            console.error('Get business error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // به‌روزرسانی اطلاعات کسب‌وکار
    static async updateBusiness(businessId, updateData) {
        try {
            const { data: updatedBusiness, error } = await supabaseAdmin
                .from('businesses')
                .update({
                    ...updateData,
                    updated_at: new Date().toISOString()
                })
                .eq('id', businessId)
                .select()
                .single();

            if (error) throw error;

            return {
                success: true,
                business: updatedBusiness
            };

        } catch (error) {
            console.error('Update business error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // تأیید کسب‌وکار
    static async verifyBusiness(businessId, documents) {
        try {
            const { data: verifiedBusiness, error } = await supabaseAdmin
                .from('businesses')
                .update({
                    verified: true,
                    verification_documents: documents,
                    verified_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .eq('id', businessId)
                .select()
                .single();

            if (error) throw error;

            return {
                success: true,
                business: verifiedBusiness
            };

        } catch (error) {
            console.error('Verify business error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // دریافت کمپین‌های کسب‌وکار
    static async getCampaigns(businessId, filters = {}) {
        try {
            let query = supabase
                .from('campaigns')
                .select('*')
                .eq('business_id', businessId)
                .order('created_at', { ascending: false });

            // اعمال فیلترها
            if (filters.status) {
                query = query.eq('status', filters.status);
            }

            if (filters.campaign_type) {
                query = query.eq('campaign_type', filters.campaign_type);
            }

            if (filters.limit) {
                query = query.limit(filters.limit);
            }

            if (filters.offset) {
                query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
            }

            const { data: campaigns, error } = await query;

            if (error) throw error;

            return {
                success: true,
                campaigns: campaigns || [],
                total: campaigns ? campaigns.length : 0
            };

        } catch (error) {
            console.error('Get business campaigns error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // دریافت آمار مالی کسب‌وکار
    static async getFinancialStats(businessId, period = 'monthly') {
        try {
            const startDate = this.getPeriodStartDate(period);

            const { data: transactions, error } = await supabase
                .from('transactions')
                .select('amount, transaction_type, created_at')
                .eq('from_type', 'business')
                .eq('from_id', businessId)
                .gte('created_at', startDate)
                .order('created_at', { ascending: false });

            if (error) throw error;

            const stats = {
                total_spent: 0,
                total_earned: 0,
                total_commissions: 0,
                daily_stats: []
            };

            // محاسبه آمار
            transactions.forEach(tx => {
                if (tx.transaction_type === 'campaign_spend' || tx.transaction_type === 'mission_reward') {
                    stats.total_spent += parseFloat(tx.amount);
                } else if (tx.transaction_type === 'commission') {
                    stats.total_commissions += parseFloat(tx.amount);
                }

                // گروه‌بندی روزانه
                const date = new Date(tx.created_at).toLocaleDateString('fa-IR');
                const existingDay = stats.daily_stats.find(d => d.date === date);

                if (existingDay) {
                    existingDay.amount += parseFloat(tx.amount);
                    existingDay.count++;
                } else {
                    stats.daily_stats.push({
                        date,
                        amount: parseFloat(tx.amount),
                        count: 1
                    });
                }
            });

            stats.total_earned = stats.total_spent - stats.total_commissions;
            stats.roi = stats.total_spent > 0 ? 
                ((stats.total_earned / stats.total_spent) * 100).toFixed(2) : 0;

            return {
                success: true,
                stats,
                period
            };

        } catch (error) {
            console.error('Get financial stats error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // محاسبه تاریخ شروع بر اساس دوره
    static getPeriodStartDate(period) {
        const now = new Date();
        switch (period) {
            case 'daily':
                return new Date(now.setHours(0, 0, 0, 0));
            case 'weekly':
                return new Date(now.setDate(now.getDate() - 7));
            case 'monthly':
                return new Date(now.setMonth(now.getMonth() - 1));
            case 'yearly':
                return new Date(now.setFullYear(now.getFullYear() - 1));
            default:
                return new Date(now.setMonth(now.getMonth() - 1));
        }
    }
}

module.exports = BusinessModel;
