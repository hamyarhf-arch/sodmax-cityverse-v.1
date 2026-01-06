
## ۷. ❌ `frontend/src/pages/AdminPanel.jsx`

```javascript:frontend/src/pages/AdminPanel.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/UI/Toast';
import { 
  getAdminStats, 
  getAllUsers, 
  getAllBusinesses, 
  getAllTransactions,
  updateUserStatus,
  updateBusinessStatus,
  processWithdrawal,
  getSystemSettings,
  updateSystemSettings
} from '../services/api';
import '../styles/AdminPanel.css';

const AdminPanel = () => {
  const navigate = useNavigate();
  const { user, token, isAdmin } = useAuth();
  const toast = useToast();
  
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBusinesses: 0,
    totalTransactions: 0,
    totalVolume: 0,
    pendingWithdrawals: 0,
    activeCampaigns: 0
  });
  
  const [users, setUsers] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [systemSettings, setSystemSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    dateFrom: '',
    dateTo: ''
  });

  // بررسی دسترسی ادمین
  useEffect(() => {
    if (!user || !isAdmin) {
      toast.error('دسترسی غیرمجاز', 'شما به این صفحه دسترسی ندارید');
      navigate('/dashboard');
    }
  }, [user, isAdmin, navigate, toast]);

  useEffect(() => {
    if (isAdmin) {
      loadAdminData();
    }
  }, [isAdmin, activeTab]);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      
      const [statsData, usersData, businessesData, transactionsData, settingsData] = await Promise.all([
        getAdminStats(token),
        getAllUsers(token, { page: 1, limit: 50 }),
        getAllBusinesses(token, { page: 1, limit: 50 }),
        getAllTransactions(token, { page: 1, limit: 100 }),
        getSystemSettings(token)
      ]);

      if (statsData.success) setStats(statsData.data);
      if (usersData.success) setUsers(usersData.data.users);
      if (businessesData.success) setBusinesses(businessesData.data.businesses);
      if (transactionsData.success) setTransactions(transactionsData.data.transactions);
      if (settingsData.success) setSystemSettings(settingsData.data.settings);

      // فیلتر کردن برداشت‌های در انتظار
      const pendingWithdrawals = transactionsData.data.transactions.filter(
        t => t.type === 'برداشت' && t.status === 'در انتظار'
      );
      setWithdrawals(pendingWithdrawals);

    } catch (error) {
      console.error('Error loading admin data:', error);
      toast.error('خطا در بارگذاری داده‌ها');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUserStatus = async (userId, newStatus) => {
    try {
      const response = await updateUserStatus(token, userId, { status: newStatus });
      if (response.success) {
        toast.success('وضعیت کاربر به‌روز شد');
        loadAdminData();
      }
    } catch (error) {
      toast.error('خطا در به‌روزرسانی وضعیت کاربر');
    }
  };

  const handleUpdateBusinessStatus = async (businessId, newStatus) => {
    try {
      const response = await updateBusinessStatus(token, businessId, { status: newStatus });
      if (response.success) {
        toast.success('وضعیت کسب‌وکار به‌روز شد');
        loadAdminData();
      }
    } catch (error) {
      toast.error('خطا در به‌روزرسانی وضعیت کسب‌وکار');
    }
  };

  const handleProcessWithdrawal = async (transactionId, action) => {
    try {
      const response = await processWithdrawal(token, transactionId, { action });
      if (response.success) {
        toast.success(`برداشت ${action === 'approve' ? 'تأیید' : 'رد'} شد`);
        loadAdminData();
      }
    } catch (error) {
      toast.error('خطا در پردازش برداشت');
    }
  };

  const handleUpdateSetting = async (key, value) => {
    try {
      const response = await updateSystemSettings(token, { [key]: value });
      if (response.success) {
        toast.success('تنظیمات به‌روز شد');
        setSystemSettings(prev => ({ ...prev, [key]: value }));
      }
    } catch (error) {
      toast.error('خطا در به‌روزرسانی تنظیمات');
    }
  };

  const handleExportData = (type) => {
    // شبیه‌سازی export داده‌ها
    toast.info(`در حال تولید گزارش ${type}...`);
    setTimeout(() => {
      toast.success(`گزارش ${type} با موفقیت ایجاد شد`);
    }, 2000);
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>در حال بارگذاری پنل مدیریت...</p>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      {/* هدر */}
      <header className="admin-header">
        <div className="admin-header-content">
          <h1 className="admin-title">🛡️ پنل مدیریت SODmAX</h1>
          <div className="admin-user-info">
            <span className="user-role">مدیر سیستم</span>
            <span className="user-name">{user?.name}</span>
          </div>
        </div>
      </header>

      {/* تب‌ها */}
      <div className="admin-tabs">
        <button 
          className={`admin-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <i className="fas fa-chart-pie"></i>
          داشبورد
        </button>
        <button 
          className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <i className="fas fa-users"></i>
          کاربران
          <span className="tab-badge">{stats.totalUsers}</span>
        </button>
        <button 
          className={`admin-tab ${activeTab === 'businesses' ? 'active' : ''}`}
          onClick={() => setActiveTab('businesses')}
        >
          <i className="fas fa-building"></i>
          کسب‌وکارها
          <span className="tab-badge">{stats.totalBusinesses}</span>
        </button>
        <button 
          className={`admin-tab ${activeTab === 'transactions' ? 'active' : ''}`}
          onClick={() => setActiveTab('transactions')}
        >
          <i className="fas fa-exchange-alt"></i>
          تراکنش‌ها
          <span className="tab-badge">{stats.totalTransactions}</span>
        </button>
        <button 
          className={`admin-tab ${activeTab === 'withdrawals' ? 'active' : ''}`}
          onClick={() => setActiveTab('withdrawals')}
        >
          <i className="fas fa-download"></i>
          برداشت‌ها
          <span className="tab-badge warning">{stats.pendingWithdrawals}</span>
        </button>
        <button 
          className={`admin-tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <i className="fas fa-cog"></i>
          تنظیمات
        </button>
        <button 
          className={`admin-tab ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          <i className="fas fa-chart-bar"></i>
          گزارشات
        </button>
      </div>

      {/* محتوا */}
      <div className="admin-content">
        {/* داشبورد */}
        {activeTab === 'dashboard' && (
          <div className="dashboard-content">
            <div className="stats-grid">
              <div className="stat-card primary">
                <div className="stat-icon">
                  <i className="fas fa-users"></i>
                </div>
                <div className="stat-info">
                  <div className="stat-value">{stats.totalUsers.toLocaleString('fa-IR')}</div>
                  <div className="stat-label">کل کاربران</div>
                </div>
                <div className="stat-change positive">
                  <i className="fas fa-arrow-up"></i>
                  ۱۲٪+
                </div>
              </div>

              <div className="stat-card success">
                <div className="stat-icon">
                  <i className="fas fa-building"></i>
                </div>
                <div className="stat-info">
                  <div className="stat-value">{stats.totalBusinesses.toLocaleString('fa-IR')}</div>
                  <div className="stat-label">کسب‌وکارها</div>
                </div>
                <div className="stat-change positive">
                  <i className="fas fa-arrow-up"></i>
                  ۸٪+
                </div>
              </div>

              <div className="stat-card warning">
                <div className="stat-icon">
                  <i className="fas fa-exchange-alt"></i>
                </div>
                <div className="stat-info">
                  <div className="stat-value">{stats.totalTransactions.toLocaleString('fa-IR')}</div>
                  <div className="stat-label">تراکنش‌ها</div>
                </div>
                <div className="stat-change positive">
                  <i className="fas fa-arrow-up"></i>
                  ۲۳٪+
                </div>
              </div>

              <div className="stat-card accent">
                <div className="stat-icon">
                  <i className="fas fa-wallet"></i>
                </div>
                <div className="stat-info">
                  <div className="stat-value">{stats.totalVolume.toLocaleString('fa-IR')}</div>
                  <div className="stat-label">حجم معاملات (تومان)</div>
                </div>
                <div className="stat-change positive">
                  <i className="fas fa-arrow-up"></i>
                  ۴۵٪+
                </div>
              </div>
            </div>

            <div className="charts-grid">
              <div className="chart-card">
                <h3 className="chart-title">📈 رشد کاربران</h3>
                <div className="chart-placeholder">
                  {/* در اینجا چارت واقعی قرار می‌گیرد */}
                  <div className="chart-bars">
                    {[65, 80, 75, 90, 85, 95, 100].map((height, index) => (
                      <div 
                        key={index} 
                        className="chart-bar" 
                        style={{ height: `${height}%` }}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="chart-card">
                <h3 className="chart-title">💰 تراکنش‌ها</h3>
                <div className="chart-placeholder">
                  <div className="chart-pie">
                    <div className="pie-segment" style={{ '--percent': '40' }}></div>
                    <div className="pie-segment" style={{ '--percent': '30' }}></div>
                    <div className="pie-segment" style={{ '--percent': '20' }}></div>
                    <div className="pie-segment" style={{ '--percent': '10' }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="recent-activity">
              <h3 className="activity-title">⚡ فعالیت‌های اخیر</h3>
              <div className="activity-list">
                {transactions.slice(0, 10).map((transaction, index) => (
                  <div key={index} className="activity-item">
                    <div className="activity-icon">
                      <i className={`fas ${transaction.icon || 'fa-exchange-alt'}`}></i>
                    </div>
                    <div className="activity-details">
                      <div className="activity-text">{transaction.type}</div>
                      <div className="activity-meta">
                        {transaction.amount.toLocaleString('fa-IR')} {transaction.currency}
                        <span className="activity-time">{transaction.date}</span>
                      </div>
                    </div>
                    <div className={`activity-status ${transaction.status}`}>
                      {transaction.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* مدیریت کاربران */}
        {activeTab === 'users' && (
          <div className="users-content">
            <div className="content-header">
              <h2 className="content-title">👥 مدیریت کاربران</h2>
              <div className="content-actions">
                <div className="search-box">
                  <input
                    type="text"
                    placeholder="جستجو کاربر..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                  />
                  <i className="fas fa-search search-icon"></i>
                </div>
                <button className="btn-primary">
                  <i className="fas fa-plus"></i>
                  کاربر جدید
                </button>
              </div>
            </div>

            <div className="users-table">
              <div className="table-header">
                <div className="table-col">کاربر</div>
                <div className="table-col">شماره</div>
                <div className="table-col">سطح</div>
                <div className="table-col">موجودی</div>
                <div className="table-col">تاریخ عضویت</div>
                <div className="table-col">وضعیت</div>
                <div className="table-col">عملیات</div>
              </div>

              {users.map((userItem) => (
                <div key={userItem.id} className="table-row">
                  <div className="table-col user-info">
                    <div className="user-avatar">
                      {userItem.name?.charAt(0) || 'ع'}
                    </div>
                    <div className="user-details">
                      <div className="user-name">{userItem.name}</div>
                      <div className="user-email">{userItem.email || 'ندارد'}</div>
                    </div>
                  </div>
                  <div className="table-col">{userItem.phone}</div>
                  <div className="table-col">
                    <span className="level-badge">سطح {userItem.level}</span>
                  </div>
                  <div className="table-col">
                    <div className="balance-info">
                      <div className="balance-sod">{userItem.sodBalance?.toLocaleString('fa-IR')} SOD</div>
                      <div className="balance-toman">{userItem.tomanBalance?.toLocaleString('fa-IR')} تومان</div>
                    </div>
                  </div>
                  <div className="table-col">{userItem.joinDate}</div>
                  <div className="table-col">
                    <span className={`status-badge ${userItem.status}`}>
                      {userItem.status === 'active' ? 'فعال' : 
                       userItem.status === 'suspended' ? 'تعلیق' : 
                       userItem.status === 'pending' ? 'در انتظار' : 'نامشخص'}
                    </span>
                  </div>
                  <div className="table-col">
                    <div className="action-buttons">
                      <button 
                        className="action-btn view"
                        onClick={() => navigate(`/user/${userItem.id}`)}
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                      <button 
                        className="action-btn edit"
                        onClick={() => navigate(`/admin/user/edit/${userItem.id}`)}
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      {userItem.status === 'active' ? (
                        <button 
                          className="action-btn suspend"
                          onClick={() => handleUpdateUserStatus(userItem.id, 'suspended')}
                        >
                          <i className="fas fa-ban"></i>
                        </button>
                      ) : (
                        <button 
                          className="action-btn activate"
                          onClick={() => handleUpdateUserStatus(userItem.id, 'active')}
                        >
                          <i className="fas fa-check"></i>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* مدیریت کسب‌وکارها */}
        {activeTab === 'businesses' && (
          <div className="businesses-content">
            <div className="content-header">
              <h2 className="content-title">🏢 مدیریت کسب‌وکارها</h2>
              <div className="content-actions">
                <div className="search-box">
                  <input
                    type="text"
                    placeholder="جستجو کسب‌وکار..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                  />
                  <i className="fas fa-search search-icon"></i>
                </div>
                <select 
                  className="filter-select"
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                >
                  <option value="">همه وضعیت‌ها</option>
                  <option value="active">فعال</option>
                  <option value="pending">در انتظار</option>
                  <option value="suspended">تعلیق</option>
                </select>
              </div>
            </div>

            <div className="businesses-grid">
              {businesses.map((business) => (
                <div key={business.id} className="business-card">
                  <div className="business-header">
                    <div className="business-logo">
                      {business.name?.charAt(0) || 'ک'}
                    </div>
                    <div className="business-info">
                      <h3 className="business-name">{business.name}</h3>
                      <div className="business-category">{business.category}</div>
                    </div>
                    <span className={`status-badge ${business.status}`}>
                      {business.status === 'active' ? 'فعال' : 
                       business.status === 'pending' ? 'در انتظار' : 'تعلیق'}
                    </span>
                  </div>
                  
                  <div className="business-details">
                    <div className="detail-item">
                      <i className="fas fa-user"></i>
                      <span>مالک: {business.ownerName}</span>
                    </div>
                    <div className="detail-item">
                      <i className="fas fa-phone"></i>
                      <span>{business.phone}</span>
                    </div>
                    <div className="detail-item">
                      <i className="fas fa-calendar"></i>
                      <span>عضویت: {business.joinDate}</span>
                    </div>
                    <div className="detail-item">
                      <i className="fas fa-wallet"></i>
                      <span>بودجه: {business.budget?.toLocaleString('fa-IR')} تومان</span>
                    </div>
                  </div>

                  <div className="business-actions">
                    <button 
                      className="btn-secondary"
                      onClick={() => navigate(`/business/${business.id}`)}
                    >
                      مشاهده
                    </button>
                    <div className="status-actions">
                      {business.status === 'pending' && (
                        <>
                          <button 
                            className="btn-success"
                            onClick={() => handleUpdateBusinessStatus(business.id, 'active')}
                          >
                            تأیید
                          </button>
                          <button 
                            className="btn-danger"
                            onClick={() => handleUpdateBusinessStatus(business.id, 'rejected')}
                          >
                            رد
                          </button>
                        </>
                      )}
                      {business.status === 'active' && (
                        <button 
                          className="btn-warning"
                          onClick={() => handleUpdateBusinessStatus(business.id, 'suspended')}
                        >
                          تعلیق
                        </button>
                      )}
                      {business.status === 'suspended' && (
                        <button 
                          className="btn-success"
                          onClick={() => handleUpdateBusinessStatus(business.id, 'active')}
                        >
                          فعال‌سازی
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* مدیریت برداشت‌ها */}
        {activeTab === 'withdrawals' && (
          <div className="withdrawals-content">
            <div className="content-header">
              <h2 className="content-title">💰 مدیریت برداشت‌ها</h2>
              <div className="content-stats">
                <div className="stat-item">
                  <div className="stat-label">در انتظار:</div>
                  <div className="stat-value warning">{stats.pendingWithdrawals}</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">مبلغ کل:</div>
                  <div className="stat-value">
                    {withdrawals.reduce((sum, w) => sum + w.amount, 0).toLocaleString('fa-IR')} تومان
                  </div>
                </div>
              </div>
            </div>

            <div className="withdrawals-table">
              <div className="table-header">
                <div className="table-col">کاربر</div>
                <div className="table-col">مبلغ</div>
                <div className="table-col">شماره کارت</div>
                <div className="table-col">تاریخ درخواست</div>
                <div className="table-col">وضعیت</div>
                <div className="table-col">عملیات</div>
              </div>

              {withdrawals.length === 0 ? (
                <div className="empty-state">
                  <i className="fas fa-check-circle"></i>
                  <p>هیچ درخواست برداشت در انتظاری وجود ندارد</p>
                </div>
              ) : (
                withdrawals.map((withdrawal) => (
                  <div key={withdrawal.id} className="table-row">
                    <div className="table-col">
                      <div className="user-with-avatar">
                        <div className="avatar-small">
                          {withdrawal.userName?.charAt(0) || 'ع'}
                        </div>
                        <div className="user-name">{withdrawal.userName}</div>
                      </div>
                    </div>
                    <div className="table-col">
                      <div className="amount-cell">
                        <div className="amount-value">{withdrawal.amount.toLocaleString('fa-IR')}</div>
                        <div className="amount-currency">{withdrawal.currency}</div>
                      </div>
                    </div>
                    <div className="table-col">
                      <div className="card-number">
                        **** **** **** {withdrawal.cardNumber?.slice(-4) || '****'}
                      </div>
                    </div>
                    <div className="table-col">{withdrawal.date}</div>
                    <div className="table-col">
                      <span className="status-badge pending">در انتظار</span>
                    </div>
                    <div className="table-col">
                      <div className="withdrawal-actions">
                        <button 
                          className="btn-success"
                          onClick={() => handleProcessWithdrawal(withdrawal.id, 'approve')}
                        >
                          <i className="fas fa-check"></i>
                          تأیید
                        </button>
                        <button 
                          className="btn-danger"
                          onClick={() => handleProcessWithdrawal(withdrawal.id, 'reject')}
                        >
                          <i className="fas fa-times"></i>
                          رد
                        </button>
                        <button 
                          className="btn-secondary"
                          onClick={() => navigate(`/admin/withdrawal/${withdrawal.id}`)}
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* تنظیمات سیستم */}
        {activeTab === 'settings' && (
          <div className="settings-content">
            <div className="content-header">
              <h2 className="content-title">⚙️ تنظیمات سیستم</h2>
              <p className="content-subtitle">مدیریت تنظیمات کلی پلتفرم</p>
            </div>

            <div className="settings-tabs">
              <button className="settings-tab active">عمومی</button>
              <button className="settings-tab">مالی</button>
              <button className="settings-tab">امنیتی</button>
              <button className="settings-tab">استخراج</button>
              <button className="settings-tab">دعوت</button>
            </div>

            <div className="settings-form">
              <div className="setting-group">
                <h3 className="setting-title">📊 تنظیمات عمومی</h3>
                
                <div className="setting-item">
                  <label className="setting-label">
                    <i className="fas fa-globe"></i>
                    نام پلتفرم
                  </label>
                  <input
                    type="text"
                    value={systemSettings.platformName || 'SODmAX CityVerse'}
                    onChange={(e) => handleUpdateSetting('platformName', e.target.value)}
                    className="setting-input"
                  />
                </div>

                <div className="setting-item">
                  <label className="setting-label">
                    <i className="fas fa-bolt"></i>
                    نرخ پایه استخراج (SOD/کلیک)
                  </label>
                  <input
                    type="number"
                    value={systemSettings.baseMiningRate || 5}
                    onChange={(e) => handleUpdateSetting('baseMiningRate', parseInt(e.target.value))}
                    className="setting-input"
                    min="1"
                    max="100"
                  />
                </div>

                <div className="setting-item">
                  <label className="setting-label">
                    <i className="fas fa-gift"></i>
                    پاداش ثبت‌نام (SOD)
                  </label>
                  <input
                    type="number"
                    value={systemSettings.signupBonus || 1000}
                    onChange={(e) => handleUpdateSetting('signupBonus', parseInt(e.target.value))}
                    className="setting-input"
                    min="0"
                    max="10000"
                  />
                </div>
              </div>

              <div className="setting-group">
                <h3 className="setting-title">💰 تنظیمات مالی</h3>
                
                <div className="setting-item">
                  <label className="setting-label">
                    <i className="fas fa-download"></i>
                    حداقل برداشت (تومان)
                  </label>
                  <input
                    type="number"
                    value={systemSettings.minWithdrawal || 10000}
                    onChange={(e) => handleUpdateSetting('minWithdrawal', parseInt(e.target.value))}
                    className="setting-input"
                    min="1000"
                    max="1000000"
                  />
                </div>

                <div className="setting-item">
                  <label className="setting-label">
                    <i className="fas fa-percentage"></i>
                    کارمزد برداشت (%)
                  </label>
                  <input
                    type="number"
                    value={systemSettings.withdrawalFee || 2.5}
                    onChange={(e) => handleUpdateSetting('withdrawalFee', parseFloat(e.target.value))}
                    className="setting-input"
                    min="0"
                    max="10"
                    step="0.1"
                  />
                </div>

                <div className="setting-item">
                  <label className="setting-label">
                    <i className="fas fa-money-bill-wave"></i>
                    نرخ تبدیل SOD به تومان
                  </label>
                  <input
                    type="number"
                    value={systemSettings.sodToTomanRate || 0.01}
                    onChange={(e) => handleUpdateSetting('sodToTomanRate', parseFloat(e.target.value))}
                    className="setting-input"
                    min="0.001"
                    max="1"
                    step="0.001"
                  />
                </div>
              </div>

              <div className="setting-group">
                <h3 className="setting-title">🤝 تنظیمات دعوت</h3>
                
                <div className="setting-item">
                  <label className="setting-label">
                    <i className="fas fa-user-plus"></i>
                    پاداش دعوت سطح ۱ (تومان)
                  </label>
                  <input
                    type="number"
                    value={systemSettings.referralBonusLevel1 || 1000}
                    onChange={(e) => handleUpdateSetting('referralBonusLevel1', parseInt(e.target.value))}
                    className="setting-input"
                    min="0"
                    max="5000"
                  />
                </div>

                <div className="setting-item">
                  <label className="setting-label">
                    <i className="fas fa-user-friends"></i>
                    پاداش دعوت سطح ۲ (تومان)
                  </label>
                  <input
                    type="number"
                    value={systemSettings.referralBonusLevel2 || 500}
                    onChange={(e) => handleUpdateSetting('referralBonusLevel2', parseInt(e.target.value))}
                    className="setting-input"
                    min="0"
                    max="2500"
                  />
                </div>

                <div className="setting-item">
                  <label className="setting-label">
                    <i className="fas fa-users"></i>
                    پاداش دعوت سطح ۳ (تومان)
                  </label>
                  <input
                    type="number"
                    value={systemSettings.referralBonusLevel3 || 250}
                    onChange={(e) => handleUpdateSetting('referralBonusLevel3', parseInt(e.target.value))}
                    className="setting-input"
                    min="0"
                    max="1000"
                  />
                </div>
              </div>

              <div className="setting-actions">
                <button className="btn-primary">
                  <i className="fas fa-save"></i>
                  ذخیره همه تغییرات
                </button>
                <button className="btn-secondary">
                  <i className="fas fa-undo"></i>
                  بازنشانی
                </button>
              </div>
            </div>
          </div>
        )}

        {/* گزارشات */}
        {activeTab === 'reports' && (
          <div className="reports-content">
            <div className="content-header">
              <h2 className="content-title">📊 گزارشات و تحلیل‌ها</h2>
              <div className="report-period">
                <select className="period-select">
                  <option>امروز</option>
                  <option>دیروز</option>
                  <option selected>هفته جاری</option>
                  <option>ماه جاری</option>
                  <option>۳ ماه گذشته</option>
                  <option>سال جاری</option>
                  <option>همه زمان</option>
                </select>
              </div>
            </div>

            <div className="reports-grid">
              <div className="report-card">
                <h3 className="report-title">📈 گزارش مالی</h3>
                <div className="report-stats">
                  <div className="report-stat">
                    <div className="stat-label">کل درآمد</div>
                    <div className="stat-value">۱۲۴,۵۰۰,۰۰۰ تومان</div>
                  </div>
                  <div className="report-stat">
                    <div className="stat-label">کل هزینه</div>
                    <div className="stat-value">۸۹,۳۰۰,۰۰۰ تومان</div>
                  </div>
                  <div className="report-stat">
                    <div className="stat-label">سود خالص</div>
                    <div className="stat-value success">۳۵,۲۰۰,۰۰۰ تومان</div>
                  </div>
                </div>
                <button 
                  className="btn-secondary"
                  onClick={() => handleExportData('مالی')}
                >
                  <i className="fas fa-file-export"></i>
                  دانلود Excel
                </button>
              </div>

              <div className="report-card">
                <h3 className="report-title">👥 گزارش کاربران</h3>
                <div className="report-stats">
                  <div className="report-stat">
                    <div className="stat-label">ثبت‌نام جدید</div>
                    <div className="stat-value">۱,۲۴۵ کاربر</div>
                  </div>
                  <div className="report-stat">
                    <div className="stat-label">فعال</div>
                    <div className="stat-value">۸,۹۲۰ کاربر</div>
                  </div>
                  <div className="report-stat">
                    <div className="stat-label">نرخ نگهداری</div>
                    <div className="stat-value success">۷۴.۵٪</div>
                  </div>
                </div>
                <button 
                  className="btn-secondary"
                  onClick={() => handleExportData('کاربران')}
                >
                  <i className="fas fa-file-export"></i>
                  دانلود PDF
                </button>
              </div>

              <div className="report-card">
                <h3 className="report-title">🏢 گزارش کسب‌وکار</h3>
                <div className="report-stats">
                  <div className="report-stat">
                    <div className="stat-label">کمپین‌های فعال</div>
                    <div className="stat-value">۱۲۴ کمپین</div>
                  </div>
                  <div className="report-stat">
                    <div className="stat-label">بودجه کل</div>
                    <div className="stat-value">۲.۵ میلیارد تومان</div>
                  </div>
                  <div className="report-stat">
                    <div className="stat-label">میانگین ROI</div>
                    <div className="stat-value success">۲۳.۴٪</div>
                  </div>
                </div>
                <button 
                  className="btn-secondary"
                  onClick={() => handleExportData('کسب‌وکار')}
                >
                  <i className="fas fa-file-export"></i>
                  دانلود CSV
                </button>
              </div>

              <div className="report-card">
                <h3 className="report-title">⚡ گزارش استخراج</h3>
                <div className="report-stats">
                  <div className="report-stat">
                    <div className="stat-label">SOD استخراج شده</div>
                    <div className="stat-value">۱۲۴.۵ میلیون</div>
                  </div>
                  <div className="report-stat">
                    <div className="stat-label">کاربران فعال</div>
                    <div className="stat-value">۵,۶۷۰ کاربر</div>
                  </div>
                  <div className="report-stat">
                    <div className="stat-label">میانگین روزانه</div>
                    <div className="stat-value">۴۵۰,۰۰۰ SOD</div>
                  </div>
                </div>
                <button 
                  className="btn-secondary"
                  onClick={() => handleExportData('استخراج')}
                >
                  <i className="fas fa-file-export"></i>
                  دانلود گزارش
                </button>
              </div>
            </div>

            <div className="report-charts">
              <div className="chart-container">
                <h3 className="chart-title">📊 تحلیل ترافیک</h3>
                <div className="chart-placeholder large">
                  <div className="traffic-chart">
                    {[30, 45, 60, 75, 90, 85, 70, 65, 80, 95, 85, 100].map((height, index) => (
                      <div 
                        key={index} 
                        className="traffic-bar" 
                        style={{ height: `${height}%` }}
                      >
                        <div className="bar-value">{height}%</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
