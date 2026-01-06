// 📁 backend/src/models/User.js
const { supabase, supabaseAdmin } = require('../config/supabase');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class UserModel {
    // ثبت‌نام کاربر جدید
    static async register(userData) {
        const { phone, name, password, referred_by_code = null } = userData;
        
        try {
            // بررسی تکراری نبودن شماره موبایل
            const { data: existingUser } = await supabase
                .from('users')
                .select('id')
                .eq('phone', phone)
                .single();
            
            if (existingUser) {
                throw new Error('این شماره موبایل قبلاً ثبت‌نام کرده است');
            }
            
            // هش کردن رمز عبور
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(password, salt);
            
            // پیدا کردن معرف (اگر کد دعوت وارد شده)
            let referredBy = null;
            if (referred_by_code) {
                const { data: referrer } = await supabase
                    .from('users')
                    .select('id')
                    .eq('referral_code', referred_by_code)
                    .single();
                
                if (referrer) {
                    referredBy = referrer.id;
                }
            }
            
            // ایجاد کاربر جدید
            const { data: newUser, error } = await supabaseAdmin
                .from('users')
                .insert([{
                    phone,
                    name,
                    password_hash: passwordHash,
                    user_type: 'user',
                    referred_by: referredBy,
                    level: 1,
                    experience_points: 0,
                    mining_power: 5,
                    mining_multiplier: 1.0,
                    auto_mining: false,
                    total_earned: 0
                }])
                .select()
                .single();
            
            if (error) throw error;
            
            // ایجاد رکورد دعوت (اگر معرف دارد)
            if (referredBy) {
                await supabaseAdmin
                    .from('referrals')
                    .insert([{
                        referrer_id: referredBy,
                        referred_id: newUser.id,
                        status: 'pending',
                        reward_paid: false
                    }]);
            }
            
            // ایجاد توکن JWT
            const token = jwt.sign(
                { 
                    userId: newUser.id,
                    userType: newUser.user_type,
                    phone: newUser.phone 
                },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRE }
            );
            
            // حذف فیلدهای حساس
            const { password_hash, ...userWithoutPassword } = newUser;
            
            return {
                success: true,
                user: userWithoutPassword,
                token,
                referredBy: referredBy ? true : false
            };
            
        } catch (error) {
            console.error('User registration error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    // ورود کاربر
    static async login(phone, password) {
        try {
            // پیدا کردن کاربر
            const { data: user, error } = await supabaseAdmin
                .from('users')
                .select('*')
                .eq('phone', phone)
                .single();
            
            if (error || !user) {
                throw new Error('شماره موبایل یا رمز عبور اشتباه است');
            }
            
            // بررسی رمز عبور
            const isValidPassword = await bcrypt.compare(password, user.password_hash);
            if (!isValidPassword) {
                throw new Error('شماره موبایل یا رمز عبور اشتباه است');
            }
            
            // به‌روزرسانی آخرین ورود
            await supabaseAdmin
                .from('users')
                .update({ last_login: new Date().toISOString() })
                .eq('id', user.id);
            
            // مدیریت استریک روزانه
            await this.updateDailyStreak(user.id);
            
            // ایجاد توکن JWT
            const token = jwt.sign(
                { 
                    userId: user.id,
                    userType: user.user_type,
                    phone: user.phone 
                },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRE }
            );
            
            // حذف فیلدهای حساس
            const { password_hash, ...userWithoutPassword } = user;
            
            return {
                success: true,
                user: userWithoutPassword,
                token
            };
            
        } catch (error) {
            console.error('User login error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    // به‌روزرسانی استریک روزانه
    static async updateDailyStreak(userId) {
        const today = new Date().toISOString().split('T')[0];
        
        const { data: streak } = await supabase
            .from('daily_streaks')
            .select('*')
            .eq('user_id', userId)
            .single();
        
        if (!streak) {
            // ایجاد استریک جدید
            await supabaseAdmin
                .from('daily_streaks')
                .insert([{
                    user_id: userId,
                    current_streak: 1,
                    longest_streak: 1,
                    last_login_date: today,
                    total_logins: 1
                }]);
        } else {
            const lastLogin = new Date(streak.last_login_date);
            const daysDiff = Math.floor((new Date() - lastLogin) / (1000 * 60 * 60 * 24));
            
            let newStreak = streak.current_streak;
            if (daysDiff === 1) {
                // ادامه استریک
                newStreak += 1;
            } else if (daysDiff > 1) {
                // شکستن استریک
                newStreak = 1;
            }
            
            await supabaseAdmin
                .from('daily_streaks')
                .update({
                    current_streak: newStreak,
                    longest_streak: Math.max(streak.longest_streak, newStreak),
                    last_login_date: today,
                    total_logins: streak.total_logins + 1,
                    updated_at: new Date().toISOString()
                })
                .eq('id', streak.id);
        }
    }
    
    // دریافت پروفایل کاربر
    static async getProfile(userId) {
        try {
            const { data: user, error } = await supabase
                .from('users')
                .select(`
                    *,
                    wallet: wallets(*)
                `)
                .eq('id', userId)
                .single();
            
            if (error) throw error;
            
            // دریافت آمار اضافی
            const { data: stats } = await supabase
                .from('user_dashboard_view')
                .select('*')
                .eq('id', userId)
                .single();
            
            const { password_hash, ...userWithoutPassword } = user;
            
            return {
                success: true,
                user: {
                    ...userWithoutPassword,
                    stats: stats || {}
                }
            };
            
        } catch (error) {
            console.error('Get profile error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    // به‌روزرسانی پروفایل
    static async updateProfile(userId, updateData) {
        try {
            const { data: updatedUser, error } = await supabaseAdmin
                .from('users')
                .update({
                    ...updateData,
                    updated_at: new Date().toISOString()
                })
                .eq('id', userId)
                .select()
                .single();
            
            if (error) throw error;
            
            const { password_hash, ...userWithoutPassword } = updatedUser;
            
            return {
                success: true,
                user: userWithoutPassword
            };
            
        } catch (error) {
            console.error('Update profile error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    // جستجوی کاربر با کد دعوت
    static async findByReferralCode(code) {
        const { data: user } = await supabase
            .from('users')
            .select('id, name, phone, level')
            .eq('referral_code', code)
            .single();
        
        return user;
    }
    
    // افزایش XP کاربر
    static async addExperience(userId, xp) {
        try {
            // دریافت کاربر فعلی
            const { data: user } = await supabase
                .from('users')
                .select('experience_points, level')
                .eq('id', userId)
                .single();
            
            if (!user) throw new Error('User not found');
            
            // محاسبه سطح جدید
            const newXp = user.experience_points + xp;
            const newLevel = this.calculateLevel(newXp);
            const leveledUp = newLevel > user.level;
            
            // به‌روزرسانی کاربر
            const { data: updatedUser, error } = await supabaseAdmin
                .from('users')
                .update({
                    experience_points: newXp,
                    level: newLevel,
                    updated_at: new Date().toISOString()
                })
                .eq('id', userId)
                .select()
                .single();
            
            if (error) throw error;
            
            return {
                success: true,
                leveledUp,
                oldLevel: user.level,
                newLevel,
                xpGained: xp,
                totalXp: newXp
            };
            
        } catch (error) {
            console.error('Add experience error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    // محاسبه سطح براساس XP
    static calculateLevel(xp) {
        if (xp >= 10000) return 5;
        if (xp >= 6000) return 4;
        if (xp >= 3000) return 3;
        if (xp >= 1000) return 2;
        return 1;
    }
    
    // دریافت لیست زیرمجموعه‌ها
    static async getReferrals(userId) {
        try {
            const { data: referrals, error } = await supabase
                .from('referrals')
                .select(`
                    *,
                    referred_user: users!referred_id(name, phone, created_at, level)
                `)
                .eq('referrer_id', userId)
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            
            return {
                success: true,
                referrals: referrals || []
            };
            
        } catch (error) {
            console.error('Get referrals error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

module.exports = UserModel;
