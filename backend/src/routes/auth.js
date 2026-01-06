// 📁 backend/src/routes/auth.js
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const UserModel = require('../models/User');
const BusinessModel = require('../models/Business');

// اعتبارسنجی شماره موبایل ایرانی
const validateIranianPhone = (value) => {
    const iranRegex = /^09[0-9]{9}$/;
    if (!iranRegex.test(value)) {
        throw new Error('شماره موبایل معتبر وارد کنید (مثال: 09123456789)');
    }
    return true;
};

// 🔐 ثبت‌نام کاربر عادی
router.post('/register', [
    body('phone').custom(validateIranianPhone),
    body('name').isLength({ min: 2 }).withMessage('نام باید حداقل ۲ کاراکتر باشد'),
    body('password').isLength({ min: 6 }).withMessage('رمز عبور باید حداقل ۶ کاراکتر باشد'),
    body('referral_code').optional().isString()
], async (req, res) => {
    try {
        // بررسی خطاهای اعتبارسنجی
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        
        const { phone, name, password, referral_code } = req.body;
        
        // ثبت کاربر
        const result = await UserModel.register({
            phone,
            name,
            password,
            referred_by_code: referral_code
        });
        
        if (!result.success) {
            return res.status(400).json(result);
        }
        
        // ارسال پاداش به معرف (اگر وجود دارد)
        if (result.referredBy) {
            // این بخش در مراحل بعدی پیاده‌سازی می‌شود
            console.log(`User ${phone} registered with referral`);
        }
        
        res.status(201).json({
            success: true,
            message: 'حساب کاربری با موفقیت ایجاد شد',
            user: result.user,
            token: result.token
        });
        
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            error: 'خطای سرور'
        });
    }
});

// 🔐 ورود کاربر
router.post('/login', [
    body('phone').custom(validateIranianPhone),
    body('password').notEmpty().withMessage('رمز عبور الزامی است')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        
        const { phone, password } = req.body;
        
        const result = await UserModel.login(phone, password);
        
        if (!result.success) {
            return res.status(401).json(result);
        }
        
        res.json({
            success: true,
            message: 'ورود موفق',
            user: result.user,
            token: result.token
        });
        
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: 'خطای سرور'
        });
    }
});

// 🏢 ثبت‌نام کسب‌وکار
router.post('/business/register', [
    body('phone').custom(validateIranianPhone),
    body('password').isLength({ min: 6 }),
    body('name').isLength({ min: 2 }),
    body('business_name').isLength({ min: 2 }),
    body('business_type').isIn(['فروشگاهی', 'خدماتی', 'تولیدی', 'دیگر']),
    body('manager_name').isLength({ min: 2 }),
    body('tax_code').optional().isString()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        
        const result = await BusinessModel.register(req.body);
        
        if (!result.success) {
            return res.status(400).json(result);
        }
        
        res.status(201).json({
            success: true,
            message: 'حساب کسب‌وکار با موفقیت ایجاد شد',
            business: result.business,
            user: result.user,
            token: result.token
        });
        
    } catch (error) {
        console.error('Business registration error:', error);
        res.status(500).json({
            success: false,
            error: 'خطای سرور'
        });
    }
});

// 🔑 بررسی وضعیت احراز هویت
router.get('/me', async (req, res) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.json({
                authenticated: false,
                user: null
            });
        }
        
        // تأیید توکن
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // دریافت اطلاعات کاربر
        const { supabase } = require('../config/supabase');
        const { data: user } = await supabase
            .from('users')
            .select('id, phone, name, user_type, level, avatar_url')
            .eq('id', decoded.userId)
            .single();
        
        if (!user) {
            return res.json({
                authenticated: false,
                user: null
            });
        }
        
        // اگر کاربر کسب‌وکار است، اطلاعات کسب‌وکار را هم بگیر
        let business = null;
        if (user.user_type === 'business') {
            const { data: businessData } = await supabase
                .from('businesses')
                .select('*')
                .eq('user_id', user.id)
                .single();
            business = businessData;
        }
        
        res.json({
            authenticated: true,
            user,
            business
        });
        
    } catch (error) {
        res.json({
            authenticated: false,
            user: null
        });
    }
});

module.exports = router;
