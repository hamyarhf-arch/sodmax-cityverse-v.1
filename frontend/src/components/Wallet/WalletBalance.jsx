import React, { useState, useEffect } from 'react';
import './Wallet.css';
import { getWalletBalance, withdrawFunds, convertCurrency, getCurrencyRates } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency, formatNumber } from '../../utils/helpers';

const WalletBalance = ({ onTransaction }) => {
  const { user, token } = useAuth();
  const [balances, setBalances] = useState({
    SOD: 0,
    Toman: 0,
    USDT: 0,
    Busd: 0
  });
  const [loading, setLoading] = useState(true);
  const [withdrawModal, setWithdrawModal] = useState(false);
  const [convertModal, setConvertModal] = useState(false);
  const [rates, setRates] = useState({});
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawCurrency, setWithdrawCurrency] = useState('Toman');
  const [convertAmount, setConvertAmount] = useState('');
  const [fromCurrency, setFromCurrency] = useState('SOD');
  const [toCurrency, setToCurrency] = useState('Toman');

  useEffect(() => {
    fetchWalletData();
    fetchCurrencyRates();
  }, []);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      const response = await getWalletBalance(token);
      if (response.success) {
        setBalances(response.data.balances);
      }
    } catch (error) {
      console.error('Error fetching wallet data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrencyRates = async () => {
    try {
      const response = await getCurrencyRates();
      if (response.success) {
        setRates(response.data.rates);
      }
    } catch (error) {
      console.error('Error fetching currency rates:', error);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      alert('لطفاً مبلغ معتبر وارد کنید');
      return;
    }

    if (parseFloat(withdrawAmount) > balances[withdrawCurrency]) {
      alert(`موجودی ${withdrawCurrency} کافی نیست`);
      return;
    }

    try {
      const response = await withdrawFunds(token, {
        amount: parseFloat(withdrawAmount),
        currency: withdrawCurrency,
        walletAddress: user.walletAddress || ''
      });

      if (response.success) {
        alert('درخواست برداشت با موفقیت ثبت شد');
        setWithdrawModal(false);
        setWithdrawAmount('');
        fetchWalletData();
        if (onTransaction) onTransaction();
      } else {
        alert(response.message || 'خطا در ثبت درخواست برداشت');
      }
    } catch (error) {
      console.error('Withdraw error:', error);
      alert('خطا در ارتباط با سرور');
    }
  };

  const handleConvert = async () => {
    if (!convertAmount || parseFloat(convertAmount) <= 0) {
      alert('لطفاً مبلغ معتبر وارد کنید');
      return;
    }

    if (parseFloat(convertAmount) > balances[fromCurrency]) {
      alert(`موجودی ${fromCurrency} کافی نیست`);
      return;
    }

    const rateKey = `${fromCurrency}_TO_${toCurrency}`;
    if (!rates[rateKey]) {
      alert('نرخ تبدیل برای این ارزها یافت نشد');
      return;
    }

    try {
      const response = await convertCurrency(token, {
        amount: parseFloat(convertAmount),
        fromCurrency,
        toCurrency
      });

      if (response.success) {
        alert('تبدیل ارز با موفقیت انجام شد');
        setConvertModal(false);
        setConvertAmount('');
        fetchWalletData();
        if (onTransaction) onTransaction();
      } else {
        alert(response.message || 'خطا در تبدیل ارز');
      }
    } catch (error) {
      console.error('Convert error:', error);
      alert('خطا در ارتباط با سرور');
    }
  };

  const calculateConvertedAmount = () => {
    if (!convertAmount || parseFloat(convertAmount) <= 0) return '0';
    
    const rateKey = `${fromCurrency}_TO_${toCurrency}`;
    if (!rates[rateKey]) return 'نرخ نامشخص';
    
    const converted = parseFloat(convertAmount) * rates[rateKey];
    return formatNumber(converted, 2);
  };

  if (loading) {
    return (
      <div className="wallet-container loading">
        <div className="loading-spinner"></div>
        <p>در حال بارگذاری اطلاعات کیف پول...</p>
      </div>
    );
  }

  return (
    <div className="wallet-container">
      <div className="wallet-header">
        <h2 className="wallet-title">💰 کیف پول چند ارزی</h2>
        <p className="wallet-subtitle">مدیریت موجودی و تراکنش‌های مالی</p>
      </div>

      <div className="balances-grid">
        <div className="balance-card sod">
          <div className="balance-icon">
            <i className="fas fa-coins"></i>
          </div>
          <div className="balance-info">
            <div className="balance-amount">{formatNumber(balances.SOD)}</div>
            <div className="balance-currency">SOD</div>
          </div>
          <div className="balance-value">
            ≈ {formatCurrency(balances.SOD * (rates.SOD_TO_Toman || 1), 'تومان')}
          </div>
        </div>

        <div className="balance-card toman">
          <div className="balance-icon">
            <i className="fas fa-money-bill-wave"></i>
          </div>
          <div className="balance-info">
            <div className="balance-amount">{formatNumber(balances.Toman)}</div>
            <div className="balance-currency">تومان</div>
          </div>
          <div className="balance-value">
            ≈ {formatCurrency(balances.Toman / (rates.USDT_TO_Toman || 300000), 'USDT')}
          </div>
        </div>

        <div className="balance-card usdt">
          <div className="balance-icon">
            <i className="fab fa-usd"></i>
          </div>
          <div className="balance-info">
            <div className="balance-amount">{formatNumber(balances.USDT, 2)}</div>
            <div className="balance-currency">USDT</div>
          </div>
          <div className="balance-value">
            ≈ {formatCurrency(balances.USDT * (rates.USDT_TO_Toman || 300000), 'تومان')}
          </div>
        </div>

        <div className="balance-card busd">
          <div className="balance-icon">
            <i className="fab fa-btc"></i>
          </div>
          <div className="balance-info">
            <div className="balance-amount">{formatNumber(balances.Busd, 2)}</div>
            <div className="balance-currency">BUSD</div>
          </div>
          <div className="balance-value">
            ≈ {formatCurrency(balances.Busd * (rates.Busd_TO_Toman || 300000), 'تومان')}
          </div>
        </div>
      </div>

      <div className="wallet-actions">
        <button 
          className="wallet-btn withdraw"
          onClick={() => setWithdrawModal(true)}
        >
          <i className="fas fa-download"></i>
          برداشت
        </button>
        
        <button 
          className="wallet-btn convert"
          onClick={() => setConvertModal(true)}
        >
          <i className="fas fa-exchange-alt"></i>
          تبدیل
        </button>
        
        <button 
          className="wallet-btn history"
          onClick={() => onTransaction && onTransaction('history')}
        >
          <i className="fas fa-history"></i>
          تاریخچه
        </button>
      </div>

      {/* مودال برداشت */}
      {withdrawModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>برداشت وجه</h3>
              <button 
                className="modal-close"
                onClick={() => setWithdrawModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>ارز مورد نظر:</label>
                <select 
                  value={withdrawCurrency}
                  onChange={(e) => setWithdrawCurrency(e.target.value)}
                  className="form-select"
                >
                  <option value="Toman">تومان</option>
                  <option value="USDT">USDT</option>
                  <option value="Busd">BUSD</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>مبلغ برداشت:</label>
                <div className="input-with-suffix">
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="مبلغ را وارد کنید"
                    className="form-input"
                  />
                  <span className="input-suffix">{withdrawCurrency}</span>
                </div>
                <small className="form-help">
                  موجودی قابل برداشت: {formatNumber(balances[withdrawCurrency])} {withdrawCurrency}
                </small>
              </div>
              
              <div className="form-group">
                <label>آدرس کیف پول:</label>
                <input
                  type="text"
                  value={user.walletAddress || ''}
                  placeholder="آدرس کیف پول خود را وارد کنید"
                  className="form-input"
                  readOnly
                />
                <small className="form-help">
                  برای تغییر آدرس کیف پول به تنظیمات پروفایل مراجعه کنید
                </small>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn-secondary"
                onClick={() => setWithdrawModal(false)}
              >
                انصراف
              </button>
              <button 
                className="btn-primary"
                onClick={handleWithdraw}
              >
                تأیید برداشت
              </button>
            </div>
          </div>
        </div>
      )}

      {/* مودال تبدیل ارز */}
      {convertModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>تبدیل ارز</h3>
              <button 
                className="modal-close"
                onClick={() => setConvertModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="modal-body">
              <div className="convert-form">
                <div className="convert-row">
                  <div className="form-group">
                    <label>از:</label>
                    <select 
                      value={fromCurrency}
                      onChange={(e) => setFromCurrency(e.target.value)}
                      className="form-select"
                    >
                      <option value="SOD">SOD</option>
                      <option value="Toman">تومان</option>
                      <option value="USDT">USDT</option>
                      <option value="Busd">BUSD</option>
                    </select>
                  </div>
                  
                  <div className="convert-arrow">
                    <i className="fas fa-exchange-alt"></i>
                  </div>
                  
                  <div className="form-group">
                    <label>به:</label>
                    <select 
                      value={toCurrency}
                      onChange={(e) => setToCurrency(e.target.value)}
                      className="form-select"
                    >
                      <option value="Toman">تومان</option>
                      <option value="SOD">SOD</option>
                      <option value="USDT">USDT</option>
                      <option value="Busd">BUSD</option>
                    </select>
                  </div>
                </div>
                
                <div className="form-group">
                  <label>مبلغ:</label>
                  <div className="input-with-suffix">
                    <input
                      type="number"
                      value={convertAmount}
                      onChange={(e) => setConvertAmount(e.target.value)}
                      placeholder="مبلغ را وارد کنید"
                      className="form-input"
                    />
                    <span className="input-suffix">{fromCurrency}</span>
                  </div>
                  <small className="form-help">
                    موجودی: {formatNumber(balances[fromCurrency])} {fromCurrency}
                  </small>
                </div>
                
                <div className="convert-result">
                  <div className="result-label">مبلغ دریافتی:</div>
                  <div className="result-value">
                    {calculateConvertedAmount()} {toCurrency}
                  </div>
                  <div className="result-rate">
                    نرخ: ۱ {fromCurrency} = {rates[`${fromCurrency}_TO_${toCurrency}`] || '?'} {toCurrency}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn-secondary"
                onClick={() => setConvertModal(false)}
              >
                انصراف
              </button>
              <button 
                className="btn-primary"
                onClick={handleConvert}
              >
                تأیید تبدیل
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletBalance;
