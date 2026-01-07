require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

// ==================== راه‌اندازی اولیه ====================
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// اتصال به Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// ==================== Middleware اعتبارسنجی ====================
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // فرمت: Bearer <token>

  if (!token) {
    return res.status(401).json({ error: 'دسترسی غیرمجاز. توکن ارائه نشده است.' });
  }

  try {
    // بررسی توکن با Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) throw new Error('توکن نامعتبر است.');
    
    // اضافه کردن اطلاعات کاربر به درخواست
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'توکن نامعتبر یا منقضی شده است.' });
  }
};

// ==================== مسیرهای اصلی API ====================

// 1. تست سلامت سرور
app.get('/api/health', (req, res) => {
  res.json({ status: '✅ سرور CityVerse فعال است.', timestamp: new Date().toISOString() });
});

// 2. دریافت تمام ماموریت‌های فعال (عمومی)
app.get('/api/missions', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('missions')
      .select(`
        id, title, description, instructions, action_type, action_url, reward,
        campaign:campaigns ( title, business:businesses ( name ) )
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ missions: data });
  } catch (error) {
    console.error('خطا در دریافت ماموریت‌ها:', error);
    res.status(500).json({ error: 'خطای داخلی سرور.' });
  }
});

// 3. ایجاد یک کمپین جدید (نیاز به احراز هویت)
app.post('/api/campaigns', authenticateToken, async (req, res) => {
  try {
    const { title, description, budget_total, start_date, end_date } = req.body;
    const userId = req.user.id;

    // 1. ابتدا کسب‌وکار کاربر را پیدا کن
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('id')
      .eq('owner_id', userId)
      .single();

    if (businessError || !business) {
      return res.status(400).json({ error: 'شما هیچ کسب‌وکاری برای ایجاد کمپین ندارید.' });
    }

    // 2. کمپین جدید را ایجاد کن
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .insert([{
        business_id: business.id,
        title,
        description,
        budget_total,
        start_date,
        end_date,
        status: 'draft'
      }])
      .select()
      .single();

    if (campaignError) throw campaignError;
    res.status(201).json({ message: 'کمپین با موفقیت ایجاد شد.', campaign });

  } catch (error) {
    console.error('خطا در ایجاد کمپین:', error);
    res.status(500).json({ error: 'خطای داخلی سرور.' });
  }
});

// 4. شروع یک ماموریت توسط کاربر (نیاز به احراز هویت)
app.post('/api/missions/:missionId/start', authenticateToken, async (req, res) => {
  try {
    const { missionId } = req.params;
    const userId = req.user.id;

    // 1. بررسی وجود و فعال بودن ماموریت
    const { data: mission, error: missionError } = await supabase
      .from('missions')
      .select('id, max_completions, current_completions')
      .eq('id', missionId)
      .eq('is_active', true)
      .single();

    if (missionError || !mission) {
      return res.status(404).json({ error: 'ماموریت یافت نشد یا غیرفعال است.' });
    }

    // 2. بررسی محدودیت تکرار
    if (mission.max_completions && mission.current_completions >= mission.max_completions) {
      return res.status(400).json({ error: 'سقف تکرار این ماموریت پر شده است.' });
    }

    // 3. بررسی اینکه کاربر قبلاً این ماموریت را نگرفته باشد
    const { data: existingUserMission, error: checkError } = await supabase
      .from('user_missions')
      .select('id, status')
      .eq('user_id', userId)
      .eq('mission_id', missionId)
      .maybeSingle();

    if (existingUserMission) {
      return res.status(400).json({ error: `شما قبلاً این ماموریت را گرفته‌اید. وضعیت: ${existingUserMission.status}` });
    }

    // 4. ایجاد رکورد user_missions
    const { data: userMission, error: insertError } = await supabase
      .from('user_missions')
      .insert([{
        user_id: userId,
        mission_id: missionId,
        status: 'started',
        started_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (insertError) throw insertError;
    res.json({ message: 'ماموریت با موفقیت شروع شد.', userMission });

  } catch (error) {
    console.error('خطا در شروع ماموریت:', error);
    res.status(500).json({ error: 'خطای داخلی سرور.' });
  }
});

// ==================== راه‌اندازی سرور ====================
app.listen(PORT, () => {
  console.log(`🚀 سرور بک‌اند CityVerse روی پورت ${PORT} اجرا شد.`);
  console.log(`📡 آدرس سلامت: http://localhost:${PORT}/api/health`);
});
