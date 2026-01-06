import React, { useState, useEffect } from 'react';
import './TransactionHistory.css';
import { getTransactionHistory, filterTransactions } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency, formatDate } from '../../utils/helpers';

const TransactionHistory = ({ filters, onFilterChange }) => {
  const { token } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 1
  });
  const [filterState, setFilterState] = useState({
    type: '',
    currency: '',
    status: '',
    dateFrom: '',
    dateTo: '',
    search: ''
  });

  useEffect(() => {
    fetchTransactions();
  }, [pagination.page, filters]);

  useEffect(() => {
    if (onFilterChange) {
      onFilterChange(filterState);
    }
  }, [filterState]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await getTransactionHistory(token, {
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
        ...filterState
      });
      
      if (response.success) {
        setTransactions(response.data.transactions);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilterState(prev => ({
      ...prev,
      [key]: value
    }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchTransactions();
  };

  const handleResetFilters = () => {
    setFilterState({
      type: '',
      currency: '',
      status: '',
      dateFrom: '',
      dateTo: '',
      search: ''
    });
    setPagination(prev => ({ ...prev, page: 1 }));
    if (onFilterChange) {
      onFilterChange({});
    }
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const getTransactionIcon = (type) => {
    const icons = {
      'استخراج': 'fa-hard-hat',
      'پاداش': 'fa-gift',
      'برداشت': 'fa-download',
      'تبدیل': 'fa-exchange-alt',
      'خرید': 'fa-shopping-cart',
      'فروش': 'fa-credit-card',
      'کمیسیون': 'fa-percentage',
      'دعوت': 'fa-user-plus',
      'شارژ': 'fa-bolt',
      'ارتقاء': 'fa-arrow-up'
    };
    return icons[type] || 'fa-exchange-alt';
  };

  const getTransactionColor = (type) => {
    const colors = {
      'استخراج': 'var(--primary)',
      'پاداش': 'var(--secondary)',
      'برداشت': 'var(--accent)',
      'تبدیل': 'var(--warning)',
      'خرید': 'var(--success)',
      'فروش': 'var(--error)',
      'دعوت': '#9b5de5'
    };
    return colors[type] || 'var(--text-secondary)';
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'موفق': { className: 'success', icon: 'fa-check-circle' },
      'در انتظار': { className: 'pending', icon: 'fa-clock' },
      'رد شده': { className: 'rejected', icon: 'fa-times-circle' },
      'در حال پردازش': { className: 'processing', icon: 'fa-spinner' },
      'لغو شده': { className: 'cancelled', icon: 'fa-ban' }
    };
    
    const config = statusConfig[status] || { className: 'default', icon: 'fa-question-circle' };
    
    return (
      <span className={`status-badge ${config.className}`}>
        <i className={`fas ${config.icon}`}></i>
        {status}
      </span>
    );
  };

  if (loading && transactions.length === 0) {
    return (
      <div className="transaction-container loading">
        <div className="loading-spinner"></div>
        <p>در حال بارگذاری تاریخچه تراکنش‌ها...</p>
      </div>
    );
  }

  return (
    <div className="transaction-container">
      <div className="transaction-header">
        <h2 className="transaction-title">📊 تاریخچه تراکنش‌ها</h2>
        <p className="transaction-subtitle">مشاهده و مدیریت تمام تراکنش‌های مالی شما</p>
      </div>

      {/* فیلترها */}
      <div className="transaction-filters">
        <form onSubmit={handleSearch} className="filter-form">
          <div className="filter-row">
            <div className="filter-group">
              <label>نوع تراکنش:</label>
              <select
                value={filterState.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="filter-select"
              >
                <option value="">همه</option>
                <option value="استخراج">استخراج</option>
                <option value="پاداش">پاداش</option>
                <option value="برداشت">برداشت</option>
                <option value="تبدیل">تبدیل</option>
                <option value="خرید">خرید</option>
                <option value="فروش">فروش</option>
                <option value="دعوت">دعوت</option>
              </select>
            </div>

            <div className="filter-group">
              <label>ارز:</label>
              <select
                value={filterState.currency}
                onChange={(e) => handleFilterChange('currency', e.target.value)}
                className="filter-select"
              >
                <option value="">همه</option>
                <option value="SOD">SOD</option>
                <option value="Toman">تومان</option>
                <option value="USDT">USDT</option>
                <option value="Busd">BUSD</option>
              </select>
            </div>

            <div className="filter-group">
              <label>وضعیت:</label>
              <select
                value={filterState.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="filter-select"
              >
                <option value="">همه</option>
                <option value="موفق">موفق</option>
                <option value="در انتظار">در انتظار</option>
                <option value="در حال پردازش">در حال پردازش</option>
                <option value="رد شده">رد شده</option>
              </select>
            </div>
          </div>

          <div className="filter-row">
            <div className="filter-group">
              <label>از تاریخ:</label>
              <input
                type="date"
                value={filterState.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="filter-input"
              />
            </div>

            <div className="filter-group">
              <label>تا تاریخ:</label>
              <input
                type="date"
                value={filterState.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="filter-input"
              />
            </div>

            <div className="filter-group search-group">
              <label>جستجو:</label>
              <div className="search-input-wrapper">
                <input
                  type="text"
                  value={filterState.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="جستجو در توضیحات..."
                  className="filter-input search-input"
                />
                <button type="submit" className="search-btn">
                  <i className="fas fa-search"></i>
                </button>
              </div>
            </div>
          </div>

          <div className="filter-actions">
            <button type="submit" className="btn-primary filter-btn">
              <i className="fas fa-filter"></i>
              اعمال فیلتر
            </button>
            <button 
              type="button" 
              className="btn-secondary filter-btn"
              onClick={handleResetFilters}
            >
              <i className="fas fa-redo"></i>
              بازنشانی فیلترها
            </button>
          </div>
        </form>
      </div>

      {/* آمار کلی */}
      <div className="transaction-stats">
        <div className="stat-card">
          <div className="stat-icon total">
            <i className="fas fa-list"></i>
          </div>
          <div className="stat-info">
            <div className="stat-value">{pagination.total}</div>
            <div className="stat-label">کل تراکنش‌ها</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon success">
            <i className="fas fa-check-circle"></i>
          </div>
          <div className="stat-info">
            <div className="stat-value">
              {transactions.filter(t => t.status === 'موفق').length}
            </div>
            <div className="stat-label">موفق</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon pending">
            <i className="fas fa-clock"></i>
          </div>
          <div className="stat-info">
            <div className="stat-value">
              {transactions.filter(t => t.status === 'در انتظار' || t.status === 'در حال پردازش').length}
            </div>
            <div className="stat-label">در حال بررسی</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon amount">
            <i className="fas fa-wallet"></i>
          </div>
          <div className="stat-info">
            <div className="stat-value">
              {formatCurrency(
                transactions
                  .filter(t => t.status === 'موفق' && t.amount > 0)
                  .reduce((sum, t) => sum + t.amount, 0),
                'تومان'
              )}
            </div>
            <div className="stat-label">کل واریزی‌ها</div>
          </div>
        </div>
      </div>

      {/* لیست تراکنش‌ها */}
      <div className="transaction-list">
        {transactions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <i className="fas fa-history"></i>
            </div>
            <h3>هیچ تراکنشی یافت نشد</h3>
            <p>با انجام فعالیت‌های مختلف، تراکنش‌های شما اینجا نمایش داده می‌شوند</p>
          </div>
        ) : (
          <>
            <div className="transaction-table">
              <div className="table-header">
                <div className="table-col type">نوع</div>
                <div className="table-col amount">مبلغ</div>
                <div className="table-col description">توضیحات</div>
                <div className="table-col date">تاریخ</div>
                <div className="table-col status">وضعیت</div>
                <div className="table-col actions">عملیات</div>
              </div>

              {transactions.map((transaction) => (
                <div 
                  key={transaction.id} 
                  className="table-row"
                  onClick={() => console.log('Transaction details:', transaction)}
                >
                  <div className="table-col type">
                    <div 
                      className="type-icon"
                      style={{ backgroundColor: getTransactionColor(transaction.type) }}
                    >
                      <i className={`fas ${getTransactionIcon(transaction.type)}`}></i>
                    </div>
                    <div className="type-info">
                      <div className="type-name">{transaction.type}</div>
                      <div className="type-currency">{transaction.currency}</div>
                    </div>
                  </div>

                  <div className="table-col amount">
                    <div className={`amount-value ${transaction.amount >= 0 ? 'positive' : 'negative'}`}>
                      {transaction.amount >= 0 ? '+' : ''}
                      {formatCurrency(Math.abs(transaction.amount), transaction.currency)}
                    </div>
                    {transaction.fee > 0 && (
                      <div className="amount-fee">
                        کارمزد: {formatCurrency(transaction.fee, transaction.currency)}
                      </div>
                    )}
                  </div>

                  <div className="table-col description">
                    <div className="description-text">{transaction.description}</div>
                    {transaction.referenceId && (
                      <div className="description-ref">
                        شماره پیگیری: {transaction.referenceId}
                      </div>
                    )}
                  </div>

                  <div className="table-col date">
                    <div className="date-text">{formatDate(transaction.createdAt)}</div>
                    <div className="date-time">
                      {new Date(transaction.createdAt).toLocaleTimeString('fa-IR')}
                    </div>
                  </div>

                  <div className="table-col status">
                    {getStatusBadge(transaction.status)}
                  </div>

                  <div className="table-col actions">
                    <button 
                      className="action-btn view"
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log('View transaction:', transaction);
                      }}
                    >
                      <i className="fas fa-eye"></i>
                    </button>
                    {transaction.status === 'در انتظار' && (
                      <button 
                        className="action-btn cancel"
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log('Cancel transaction:', transaction);
                        }}
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    )}
                    {transaction.receiptUrl && (
                      <button 
                        className="action-btn receipt"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(transaction.receiptUrl, '_blank');
                        }}
                      >
                        <i className="fas fa-receipt"></i>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* صفحه‌بندی */}
            {pagination.pages > 1 && (
              <div className="pagination">
                <button
                  className="pagination-btn prev"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                >
                  <i className="fas fa-chevron-right"></i>
                  قبلی
                </button>

                <div className="pagination-pages">
                  {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                    let pageNum;
                    if (pagination.pages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.page <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.page >= pagination.pages - 2) {
                      pageNum = pagination.pages - 4 + i;
                    } else {
                      pageNum = pagination.page - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        className={`pagination-page ${pagination.page === pageNum ? 'active' : ''}`}
                        onClick={() => handlePageChange(pageNum)}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  className="pagination-btn next"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                >
                  بعدی
                  <i className="fas fa-chevron-left"></i>
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* دانلود گزارش */}
      <div className="export-section">
        <div className="export-info">
          <i className="fas fa-file-export"></i>
          <div>
            <h4>گزارش تراکنش‌ها</h4>
            <p>می‌توانید تاریخچه تراکنش‌های خود را در قالب‌های مختلف دانلود کنید</p>
          </div>
        </div>
        <div className="export-buttons">
          <button className="export-btn pdf">
            <i className="fas fa-file-pdf"></i>
            PDF
          </button>
          <button className="export-btn excel">
            <i className="fas fa-file-excel"></i>
            Excel
          </button>
          <button className="export-btn csv">
            <i className="fas fa-file-csv"></i>
            CSV
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionHistory;
