import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import { Layout, Menu, Card, Button, List, Tag, Spin, message } from 'antd';
import {
  DashboardOutlined,
  MissionOutlined,
  LoginOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import './App.css';

// ==================== راه‌اندازی کلاینت Supabase ====================
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const { Header, Content, Sider } = Layout;

function App() {
  const [user, setUser] = useState(null);
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // ==================== اثرات اولیه ====================
  // بررسی وضعیت لاگین کاربر
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    checkUser();
    // گوش دادن به تغییرات وضعیت احراز هویت
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // دریافت ماموریت‌ها از API بک‌اند
  useEffect(() => {
    fetchMissions();
  }, []);

  // ==================== توابع اصلی ====================
  const fetchMissions = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/missions`);
      setMissions(response.data.missions || []);
    } catch (error) {
      console.error('خطا در دریافت ماموریت‌ها:', error);
      message.error('دریافت ماموریت‌ها با مشکل مواجه شد.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    // ورود با Magic Link (ایمیل) - ساده و امن برای MVP
    const email = prompt('لطفاً ایمیل خود را برای ورود وارد کنید:');
    if (!email) return;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true }
    });
    if (error) {
      message.error(`خطای ورود: ${error.message}`);
    } else {
      message.success('لینک ورود به ایمیل شما ارسال شد! لطفاً ایمیل خود را بررسی کنید.');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    message.success('با موفقیت خارج شدید.');
  };

  const handleStartMission = async (missionId) => {
    if (!user) {
      message.warning('برای شروع ماموریت ابتدا وارد شوید.');
      return;
    }
    try {
      // گرفتن توکن دسترسی کاربر
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const response = await axios.post(
        `${API_BASE_URL}/missions/${missionId}/start`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      message.success(response.data.message || 'ماموریت شروع شد!');
      fetchMissions(); // بروزرسانی لیست
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'خطا در شروع ماموریت';
      message.error(errorMsg);
    }
  };

  // ==================== کامپوننت صفحات ====================
  const DashboardPage = () => (
    <div>
      <h1>داشبورد CityVerse 🎮</h1>
      <p>به پلتفرم بازی‌محور اقتصادی خوش آمدید. ماموریت‌ها را انجام دهید و درآمد کسب کنید!</p>
      <div style={{ marginTop: '20px' }}>
        <Card title="وضعیت شما" bordered={false}>
          <p><strong>کاربر:</strong> {user ? user.email : 'میهمان'}</p>
          <p><strong>تعداد ماموریت‌های موجود:</strong> {missions.length}</p>
          <Button type="primary" onClick={fetchMissions}>بروزرسانی لیست</Button>
        </Card>
      </div>
    </div>
  );

  const MissionsPage = () => (
    <div>
      <h1>ماموریت‌های فعال 🎯</h1>
      <p>ماموریتی را انتخاب کنید، انجام دهید و پاداش دریافت کنید.</p>
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>
      ) : (
        <List
          itemLayout="vertical"
          dataSource={missions}
          renderItem={(mission) => (
            <List.Item
              key={mission.id}
              actions={[
                <Tag color="blue">{mission.action_type}</Tag>,
                <Tag color="green">{mission.reward.toLocaleString()} تومان</Tag>,
                <Button type="primary" onClick={() => handleStartMission(mission.id)}>
                  شروع ماموریت
                </Button>
              ]}
            >
              <List.Item.Meta
                title={mission.title}
                description={`کمپین: ${mission.campaign?.title} | کسب‌وکار: ${mission.campaign?.business?.name}`}
              />
              {mission.description}
              <br />
              <small>📋 {mission.instructions}</small>
              {mission.action_url && (
                <div style={{ marginTop: '8px' }}>
                  <a href={mission.action_url} target="_blank" rel="noopener noreferrer">
                    🔗 لینک مرتبط با ماموریت
                  </a>
                </div>
              )}
            </List.Item>
          )}
        />
      )}
    </div>
  );

  // ==================== رندر اصلی ====================
  return (
    <Router>
      <Layout style={{ minHeight: '100vh' }}>
        <Sider breakpoint="lg" collapsedWidth="0">
          <div className="logo" style={{ color: 'white', padding: '16px', textAlign: 'center', fontSize: '18px', fontWeight: 'bold' }}>
            🏙️ CityVerse
          </div>
          <Menu theme="dark" mode="inline" defaultSelectedKeys={['1']}>
            <Menu.Item key="1" icon={<DashboardOutlined />}>
              <Link to="/">داشبورد</Link>
            </Menu.Item>
            <Menu.Item key="2" icon={<MissionOutlined />}>
              <Link to="/missions">ماموریت‌ها</Link>
            </Menu.Item>
            <Menu.Item
              key="3"
              icon={user ? <LogoutOutlined /> : <LoginOutlined />}
              onClick={user ? handleLogout : handleLogin}
            >
              {user ? 'خروج' : 'ورود / ثبت‌نام'}
            </Menu.Item>
          </Menu>
        </Sider>
        <Layout>
          <Header style={{ background: '#fff', padding: '0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>پلتفرم کسب درآمد بازی‌محور</h2>
            <div>
              {user ? (
                <span>خوش آمدید، <strong>{user.email}</strong></span>
              ) : (
                <Button type="primary" onClick={handleLogin}>ورود به سیستم</Button>
              )}
            </div>
          </Header>
          <Content style={{ margin: '20px' }}>
            <div className="site-layout-background" style={{ padding: 24, minHeight: 360 }}>
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/missions" element={<MissionsPage />} />
              </Routes>
            </div>
          </Content>
        </Layout>
      </Layout>
    </Router>
  );
}

export default App;
