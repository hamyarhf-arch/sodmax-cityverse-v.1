import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/main.css';
import '../../styles/animations.css';

const TransactionHistory = () => {
  const { user } = useAuth();
  
  const [transactions, setTransactions] = useState([
    {
      id: 1,
      type: 'برداشت تومان',
      amount: 50000,
      currency: 'تومان',
      status: 'موفق',
      date: 'امروز - ۱۴:۳۰',
      icon: 'fas fa-download',
      color: 'success',
      details: 'برداشت به حساب بانکی - کارت: ۶۲۱۹-۸۶۱۱-۲۳۴۵-۶۷۸۹'
    },
    {
      id: 2,
      type: 'ارتقاء ماینر',
      amount: -25000,
      currency: 'SOD',
      status: 'موفق',
      date: 'دیروز - ۱۰:۱۵',
      icon: 'fas fa-arrow-up',
      color: 'accent',
      details: 'ارتقاء ماینر به سطح ۶ - افزایش قدرت +۵'
    },
    {
      id: 3,
      type: 'استخراج دستی',
      amount: 180,
      currency: 'SOD',
      status: 'موفق',
      date: 'امروز - ۱۲:۴۵',
      icon: 'fas fa-hard-hat',
      color: 'primary',
      details: 'استخراج دستی از مرکز ماینینگ'
    },
    {
      id: 4,
      type: 'پاداش دعوت',
      amount: 1000,
      currency: 'تومان',
      status: 'موفق',
      date: '۲ روز پیش - ۰۹:۲۰',
      icon: 'fas fa-user-plus',
      color: 'secondary',
      details: 'پاداش دعوت دوست - کد دعوت: ALI123'
    },
    {
      id: 5,
      type: 'خرید SOD',
      amount: -50000,
      currency: 'تومان',
      status: 'موفق',
      date: '۳ روز پیش - ۱۶:۱۰',
      icon: 'fas fa-shopping-cart',
      color: 'info',
      details: 'خرید ۵۰,۰۰۰ SOD از بازار - نرخ: ۱ SOD = ۰.۰۰۱ تومان'
    },
    {
      id: 6,
      type: 'تبدیل ارز',
      amount: 50000,
      currency: 'SOD',
      status: 'موفق',
      date: '۴ روز پیش - ۱۱:۳۰',
      icon: 'fas fa-exchange-alt',
      color: 'warning',
      details: 'تبدیل ۵۰,۰۰۰ تومان به ۵۰,۰۰۰ SOD'
    },
    {
      id: 7,
      type: 'پاداش روزانه',
      amount: 1000,
      currency: 'تومان',
      status: 'موفق',
      date: '۵ روز پیش - ۰۸:۱۵',
      icon: 'fas fa-gift',
      color: 'success',
      details: 'پاداش ورود روزانه - روتین شماره ۷'
    },
    {
      id: 8,
      type: 'کارمزد تراکنش',
      amount: -3000,
      currency: 'تومان',
      status: 'موفق',
      date: '۱ هفته پیش - ۱۴:۰۰',
      icon: 'fas fa-percentage',
      color: 'error',
      details: 'کارمزد برداشت تومان - شماره تراکنش: TXN789012'
    }
  ]);

  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });

  const filteredTransactions = transactions.filter(transaction => {
    // فیلتر نوع
    if (filter !== 'all') {
      if (filter === 'income' && transaction.amount <= 0) return false;
      if (filter === 'expense' && transaction.amount >= 0) return false;
      if (filter === 'pending' && transaction.status !== 'در انتظار') return false;
      if (filter === 'failed' && transaction.status !== 'ناموفق') return false;
    }
    
    // فیلتر جستجو
    if (searchTerm && 
        !transaction.type.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !transaction.details.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // فیلتر تاریخ
    if (dateRange.start || dateRange.end) {
      // در اینجا می‌توانید منطق فیلتر تاریخ را پیاده‌سازی کنید
      return true;
    }
    
    return true;
  });

  const transactionStats = {
    total: transactions.length,
    income: transactions.filter(t => t.amount > 0).length,
    expense: transactions.filter(t => t.amount < 0).length,
    totalIncome: transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0),
    totalExpense: Math.abs(transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0)),
    pending: transactions.filter(t => t.status === 'در انتظار').length
  };

  const handleTransactionClick = (transaction) => {
    setSelectedTransaction(transaction);
    setShowDetailsModal(true);
  };

  const exportToCSV = () => {
    // شبیه‌سازی خروجی CSV
    const csvContent = "data:text/csv;charset=utf-8," 
      + "نوع,مبلغ,واحد,وضعیت,تاریخ,جزئیات\n"
      + transactions.map(t => 
          `${t.type},${t.amount},${t.currency},${t.status},${t.date},${t.details}`
        ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "transaction_history.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert('گزارش تراکنش‌ها با موفقیت دانلود شد!');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'موفق':
        return 'success';
      case 'در انتظار':
        return 'warning';
      case 'ناموفق':
        return 'error';
      default:
        return 'tertiary';
    }
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'برداشت تومان':
        return 'fas fa-download';
      case 'واریز تومان':
        return 'fas fa-upload';
      case 'خرید SOD':
        return 'fas fa-shopping-cart';
      case 'فروش SOD':
        return 'fas fa-coins';
      case 'استخراج':
        return 'fas fa-hard-hat';
      case 'پاداش':
        return 'fas fa-gift';
      case 'دعوت':
        return 'fas fa-user-plus';
      case 'تبدیل':
        return 'fas fa-exchange-alt';
      default:
        return 'fas fa-exchange-alt';
    }
  };

  return (
    <div className="transaction-history">
      {/* هدر و آمار */}
      <div className="card mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
          <div>
            <h2 className="text-2xl font-bold">تاریخچه تراکنش‌ها</h2>
            <div className="text-secondary mt-1">
              نمایش کلیه تراکنش‌های مالی حساب شما
            </div>
          </div>
          
          <div className="flex gap-4">
            <button 
              className="btn btn-outline"
              onClick={exportToCSV}
            >
              <i className="fas fa-download"></i>
              خروجی گزارش
            </button>
            <button className="btn btn-primary">
              <i className="fas fa-filter"></i>
              فیلتر پیشرفته
            </button>
          </div>
        </div>

        {/* آمار سریع */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-glass rounded-xl p-4">
            <div className="text-sm text-secondary mb-1">کل تراکنش‌ها</div>
            <div className="text-2xl font-bold">{transactionStats.total}</div>
            <div className="text-xs text-tertiary mt-1">
              {transactionStats.pending} در انتظار
            </div>
          </div>
          <div className="bg-glass rounded-xl p-4">
            <div className="text-sm text-secondary mb-1">کل دریافتی</div>
            <div className="text-2xl font-bold text-success">
              {transactionStats.totalIncome.toLocaleString('fa-IR')}
            </div>
            <div className="text-xs text-tertiary mt-1">
              تومان
            </div>
          </div>
          <div className="bg-glass rounded-xl p-4">
            <div className="text-sm text-secondary mb-1">کل پرداختی</div>
            <div className="text-2xl font-bold text-accent">
              {transactionStats.totalExpense.toLocaleString('fa-IR')}
            </div>
            <div className="text-xs text-tertiary mt-1">
              تومان
            </div>
          </div>
          <div className="bg-glass rounded-xl p-4">
            <div className="text-sm text-secondary mb-1">موجودی خالص</div>
            <div className="text-2xl font-bold text-primary">
              {(transactionStats.totalIncome - transactionStats.totalExpense).toLocaleString('fa-IR')}
            </div>
            <div className="text-xs text-tertiary mt-1">
              تومان
            </div>
          </div>
        </div>
      </div>

      {/* فیلترها */}
      <div className="card mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            <button
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'all' ? 'bg-primary text-white' : 'bg-glass hover:bg-glass/50'
              }`}
              onClick={() => setFilter('all')}
            >
              همه
            </button>
            <button
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'income' ? 'bg-success text-white' : 'bg-glass hover:bg-glass/50'
              }`}
              onClick={() => setFilter('income')}
            >
              دریافتی
            </button>
            <button
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'expense' ? 'bg-accent text-white' : 'bg-glass hover:bg-glass/50'
              }`}
              onClick={() => setFilter('expense')}
            >
              پرداختی
            </button>
            <button
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'pending' ? 'bg-warning text-white' : 'bg-glass hover:bg-glass/50'
              }`}
              onClick={() => setFilter('pending')}
            >
              در انتظار
            </button>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="جستجو در تراکنش‌ها..."
                className="form-input pr-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <i className="fas fa-search absolute right-3 top-1/2 transform -translate-y-1/2 text-tertiary"></i>
            </div>
            
            <select
              className="form-select w-40"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">همه وضعیت‌ها</option>
              <option value="income">دریافتی</option>
              <option value="expense">پرداختی</option>
              <option value="pending">در انتظار</option>
              <option value="failed">ناموفق</option>
            </select>
          </div>
        </div>
      </div>

      {/* لیست تراکنش‌ها */}
      <div className="card">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-6">📊</div>
            <h3 className="text-xl font-bold mb-4">هیچ تراکنشی یافت نشد</h3>
            <p className="text-secondary mb-6">
              {searchTerm ? 'هیچ تراکنشی با این مشخصات پیدا نشد.' : 'هنوز تراکنشی ثبت نشده است.'}
            </p>
            {!searchTerm && (
              <button className="btn btn-primary">
                <i className="fas fa-plus"></i>
                انجام اولین تراکنش
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTransactions.map((transaction, index) => (
              <div 
                key={transaction.id}
                className="flex items-center justify-between p-4 bg-glass rounded-xl hover:bg-glass/50 transition-colors cursor-pointer"
                onClick={() => handleTransactionClick(transaction)}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-center gap-4">
                  <div 
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      transaction.color === 'primary' ? 'bg-primary/20 text-primary' :
                      transaction.color === 'success' ? 'bg-success/20 text-success' :
                      transaction.color === 'accent' ? 'bg-accent/20 text-accent' :
                      transaction.color === 'secondary' ? 'bg-secondary/20 text-secondary' :
                      transaction.color === 'info' ? 'bg-info/20 text-info' :
                      transaction.color === 'warning' ? 'bg-warning/20 text-warning' :
                      'bg-error/20 text-error'
                    }`}
                  >
                    <i className={transaction.icon}></i>
                  </div>
                  
                  <div>
                    <div className="font-bold mb-1">{transaction.type}</div>
                    <div className="text-sm text-secondary">{transaction.date}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className={`px-3 py-1 rounded-full text-xs ${
                    getStatusColor(transaction.status) === 'success' ? 'bg-success/20 text-success' :
                    getStatusColor(transaction.status) === 'warning' ? 'bg-warning/20 text-warning' :
                    getStatusColor(transaction.status) === 'error' ? 'bg-error/20 text-error' :
                    'bg-tertiary/20 text-tertiary'
                  }`}>
                    {transaction.status}
                  </div>
                  
                  <div className="text-right">
                    <div className={`font-bold text-lg ${
                      transaction.amount > 0 ? 'text-success' : 'text-accent'
                    }`}>
                      {transaction.amount > 0 ? '+' : ''}{Math.abs(transaction.amount).toLocaleString('fa-IR')} {transaction.currency}
                    </div>
                    <div className="text-xs text-tertiary">
                      شناسه: TXN{transaction.id.toString().padStart(6, '0')}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* صفحه‌بندی */}
        {filteredTransactions.length > 0 && (
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-white/10">
            <div className="text-sm text-secondary">
              نمایش {Math.min(filteredTransactions.length, 10)} از {filteredTransactions.length} تراکنش
            </div>
            <div className="flex gap-2">
              <button className="btn btn-ghost btn-sm">
                <i className="fas fa-chevron-right"></i>
              </button>
              <button className="btn btn-ghost btn-sm">۱</button>
              <button className="btn btn-ghost btn-sm">۲</button>
              <button className="btn btn-ghost btn-sm">۳</button>
              <button className="btn btn-ghost btn-sm">
                <i className="fas fa-chevron-left"></i>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* نمودار تحلیل */}
      <div className="card mt-8">
        <h3 className="text-xl font-bold mb-6">📊 تحلیل ماهانه تراکنش‌ها</h3>
        
        <div className="h-64 flex items-end gap-2 mb-8">
          {Array.from({ length: 12 }).map((_, i) => {
            const monthNames = [
              'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
              'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
            ];
            const incomeHeight = 30 + Math.random() * 70;
            const expenseHeight = 20 + Math.random() * 60;
            
            return (
              <div key={i} className="flex-1 flex flex-col items-center">
                <div className="text-xs text-secondary mb-1">{monthNames[i]}</div>
                <div className="flex gap-1 w-full" style={{ height: '150px' }}>
                  <div 
                    className="flex-1 bg-gradient-to-t from-success to-success/50 rounded-t"
                    style={{ height: `${incomeHeight}%` }}
                    title={`دریافتی: ${Math.round(incomeHeight * 10000).toLocaleString('fa-IR')} تومان`}
                  ></div>
                  <div 
                    className="flex-1 bg-gradient-to-t from-accent to-accent/50 rounded-t"
                    style={{ height: `${expenseHeight}%` }}
                    title={`پرداختی: ${Math.round(expenseHeight * 10000).toLocaleString('fa-IR')} تومان`}
                  ></div>
                </div>
                <div className="text-xs text-secondary mt-1">
                  <div>دریافتی</div>
                  <div>پرداختی</div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-glass rounded-xl">
            <div className="text-sm text-secondary mb-1">میانگین دریافتی</div>
            <div className="text-lg font-bold text-success">۲۴,۵۰۰ تومان</div>
          </div>
          <div className="text-center p-4 bg-glass rounded-xl">
            <div className="text-sm text-secondary mb-1">میانگین پرداختی</div>
            <div className="text-lg font-bold text-accent">۱۸,۲۰۰ تومان</div>
          </div>
          <div className="text-center p-4 bg-glass rounded-xl">
            <div className="text-sm text-secondary mb-1">بیشترین تراکنش</div>
            <div className="text-lg font-bold text-primary">۵۰,۰۰۰ تومان</div>
          </div>
          <div className="text-center p-4 bg-glass rounded-xl">
            <div className="text-sm text-secondary mb-1">تعداد ماهانه</div>
            <div className="text-lg font-bold">۴۲</div>
          </div>
        </div>
      </div>

      {/* مودال جزئیات تراکنش */}
      {showDetailsModal && selectedTransaction && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-modal-fade-in">
          <div className="bg-bg-surface rounded-2xl p-8 max-w-md w-full mx-4 animate-modal-slide-up">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">جزئیات تراکنش</h3>
              <button 
                className="btn btn-ghost"
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedTransaction(null);
                }}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="space-y-6">
              {/* اطلاعات اصلی */}
              <div className="text-center">
                <div 
                  className={`w-20 h-20 rounded-2xl flex items-center justify-center text-2xl mb-4 mx-auto ${
                    selectedTransaction.color === 'primary' ? 'bg-primary/20 text-primary' :
                    selectedTransaction.color === 'success' ? 'bg-success/20 text-success' :
                    selectedTransaction.color === 'accent' ? 'bg-accent/20 text-accent' :
                    'bg-secondary/20 text-secondary'
                  }`}
                >
                  <i className={selectedTransaction.icon}></i>
                </div>
                
                <div className="text-2xl font-bold mb-2">{selectedTransaction.type}</div>
                <div className={`text-lg font-bold ${
                  selectedTransaction.amount > 0 ? 'text-success' : 'text-accent'
                }`}>
                  {selectedTransaction.amount > 0 ? '+' : ''}{Math.abs(selectedTransaction.amount).toLocaleString('fa-IR')} {selectedTransaction.currency}
                </div>
              </div>
              
              {/* جزئیات */}
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-secondary">شناسه تراکنش:</span>
                  <span className="font-mono">TXN{selectedTransaction.id.toString().padStart(6, '0')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary">تاریخ و زمان:</span>
                  <span className="font-bold">{selectedTransaction.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary">وضعیت:</span>
                  <span className={`px-3 py-1 rounded-full text-xs ${
                    getStatusColor(selectedTransaction.status) === 'success' ? 'bg-success/20 text-success' :
                    getStatusColor(selectedTransaction.status) === 'warning' ? 'bg-warning/20 text-warning' :
                    getStatusColor(selectedTransaction.status) === 'error' ? 'bg-error/20 text-error' :
                    'bg-tertiary/20 text-tertiary'
                  }`}>
                    {selectedTransaction.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary">نوع تراکنش:</span>
                  <span>{selectedTransaction.amount > 0 ? 'دریافتی' : 'پرداختی'}</span>
                </div>
              </div>
              
              {/* توضیحات */}
              <div className="bg-glass rounded-xl p-4">
                <div className="text-sm text-secondary mb-2">توضیحات:</div>
                <p className="text-sm">{selectedTransaction.details}</p>
              </div>
              
              {/* اقدامات */}
              <div className="flex gap-4">
                <button className="btn btn-outline flex-1">
                  <i className="fas fa-print"></i>
                  چاپ رسید
                </button>
                <button className="btn btn-primary flex-1">
                  <i className="fas fa-share-alt"></i>
                  اشتراک‌گذاری
                </button>
              </div>
              
              {/* گزارش مشکل */}
              {selectedTransaction.status !== 'موفق' && (
                <button className="btn btn-error btn-outline w-full">
                  <i className="fas fa-flag"></i>
                  گزارش مشکل در تراکنش
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* پنل پشتیبانی */}
      <div className="card mt-8 bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold mb-2">🤔 سوالی درباره تراکنش دارید؟</h3>
            <p className="text-secondary">
              تیم پشتیبانی مالی ما آماده پاسخگویی به سوالات شماست.
            </p>
          </div>
          <div className="flex gap-4">
            <button className="btn btn-primary">
              <i className="fas fa-headset"></i>
              پشتیبانی مالی
            </button>
            <button className="btn btn-outline">
              <i className="fas fa-question-circle"></i>
              راهنمای تراکنش‌ها
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionHistory;
