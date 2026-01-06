// 📁 backend/src/middleware/auth.js
const jwt = require('jsonwebtoken');
const { supabase } = require('../config/supabase');

// Middleware برای احراز هویت
const authenticate = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'لطفاً وارد شوید'
            });
        }
        
        // تأیید توکن
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // بررسی وجود کاربر در دیتابیس
        const { data: user, error } = await supabase
            .from('users')
            .select('id, phone, user_type, name, level')
            .eq('id', decoded.userId)
            .single();
        
        if (error || !user) {
            return res.status(401).json({
                success: false,
                error: 'کاربر یافت نشد'
            });
        }
        
        // اضافه کردن اطلاعات کاربر به request
        req.user = user;
        req.userId = user.id;
        req.userType = user.user_type;
        
        next();
        
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                error: 'توکن نامعتبر'
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                error: 'توکن منقضی شده است'
            });
        }
        
        console.error('Auth middleware error:', error);
        return res.status(500).json({
            success: false,
            error: 'خطای سرور'
        });
    }
};

// Middleware برای بررسی نوع کاربر
const requireUserType = (...allowedTypes) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'لطفاً وارد شوید'
            });
        }
        
        if (!allowedTypes.includes(req.user.user_type)) {
            return res.status(403).json({
                success: false,
                error: 'دسترسی غیرمجاز'
            });
        }
        
        next();
    };
};

// Middleware برای بررسی مالکیت کسب‌وکار
const requireBusinessOwner = async (req, res, next) => {
    try {
        if (req.user.user_type !== 'business') {
            return res.status(403).json({
                success: false,
                error: 'فقط صاحبان کسب‌وکار می‌توانند به این بخش دسترسی داشته باشند'
            });
        }
        
        // بررسی اینکه کاربر واقعاً صاحب کسب‌وکار است
        const { data: business, error } = await supabase
            .from('businesses')
            .select('id')
            .eq('user_id', req.user.id)
            .single();
        
        if (error || !business) {
            return res.status(403).json({
                success: false,
                error: 'شما کسب‌وکاری ندارید'
            });
        }
        
        req.businessId = business.id;
        next();
        
    } catch (error) {
        console.error('Business owner middleware error:', error);
        return res.status(500).json({
            success: false,
            error: 'خطای سرور'
        });
    }
};

module.exports = {
    authenticate,
    requireUserType,
    requireBusinessOwner
};
