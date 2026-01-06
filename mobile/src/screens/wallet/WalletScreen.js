// mobile/src/screens/wallet/WalletScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

// کامپوننت‌های UI
import LoadingSpinner, { PageLoader } from '../../components/ui/LoadingSpinner';
import Button, { PrimaryButton, SecondaryButton, SuccessButton } from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import BalanceCard from '../../components/wallet/BalanceCard';
import TransactionItem from '../../components/wallet/TransactionItem';
import { useTheme } from '../../context/ThemeContext';

const { width } = Dimensions.get('window');

const WalletScreen = () => {
  const { user } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();
  const theme = useTheme();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [balances, setBalances] = useState({
    sod: 0,
    toman: 0,
    usdt: 0,
  });
  const [transactions, setTransactions] = useState([]);
  const [selectedCurrency, setSelectedCurrency] = useState('sod');
  const [stats, setStats] = useState({
    totalEarned: 0,
    totalWithdrawn: 0,
    pendingWithdrawals: 0,
  });

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    try {
      setLoading(true);
      
      // بارگذاری موازی داده‌ها
      const [balanceRes, transactionsRes, statsRes] = await Promise.all([
        api.wallet.getBalance(user.id),
        api.wallet.getTransactionHistory(user.id, 10, 0),
        api.wallet.getStats(user.id),
      ]);

      if (balanceRes.success) {
        setBalances(balanceRes.data);
      }

      if (transactionsRes.success) {
        setTransactions(transactionsRes.data);
      }

      if (statsRes.success) {
        setStats(statsRes.data);
      }
    } catch (error) {
      console.error('Error loading wallet data:', error);
      showError('خطا در بارگذاری اطلاعات کیف پول');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadWalletData();
  };

  const handleWithdraw = (currency) => {
    showInfo(`صفحه برداشت ${currency === 'sod' ? 'SOD' : currency === 'toman' ? 'تومان' : 'USDT'} به زودی فعال خواهد شد`);
  };

  const handleBuySod = () => {
    showInfo('صفحه خرید SOD به زودی فعال خواهد شد');
  };

  const handleConvert = () => {
    showInfo('صفحه تبدیل ارز به زودی فعال خواهد شد');
  };

  const handleTransactionPress = (transaction) => {
    showInfo(
      `تراکنش: ${transaction.type}\nمبلغ: ${transaction.amount.toLocaleString('fa-IR')} ${transaction.currency}\nتاریخ: ${transaction.date}\nوضعیت: ${transaction.status}`,
      'info'
    );
  };

  const formatCurrency = (amount, currency) => {
    const formatted = amount.toLocaleString('fa-IR');
    
    switch (currency) {
      case 'sod':
        return `${formatted} SOD`;
      case 'toman':
        return `${formatted} تومان`;
      case 'usdt':
        return `${formatted} USDT`;
      default:
        return formatted;
    }
  };

  const getCurrencyIcon = (currency) => {
    switch (currency) {
      case 'sod':
        return 'coins';
      case 'toman':
        return 'money-bill-wave';
      case 'usdt':
        return 'dollar-sign';
      default:
        return 'wallet';
    }
  };

  const getCurrencyColor = (currency) => {
    switch (currency) {
      case 'sod':
        return theme.colors.primary;
      case 'toman':
        return theme.colors.success;
      case 'usdt':
        return '#3b82f6';
      default:
        return theme.colors.text;
    }
  };

  if (loading && !refreshing) {
    return <PageLoader text="در حال بارگذاری کیف پول..." />;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* هدر کیف پول */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
              کیف پول چند ارزی
            </Text>
            <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
              مدیریت موجودی و تراکنش‌ها
            </Text>
          </View>
        </View>

        {/* کارت موجودی‌ها */}
        <Card style={styles.balancesCard}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
            موجودی‌ها
          </Text>

          <View style={styles.balancesGrid}>
            <BalanceCard
              title="SOD"
              amount={balances.sod}
              formattedAmount={formatCurrency(balances.sod, 'sod')}
              icon="coins"
              color={getCurrencyColor('sod')}
              onPress={() => setSelectedCurrency('sod')}
              selected={selectedCurrency === 'sod'}
            />

            <BalanceCard
              title="تومان"
              amount={balances.toman}
              formattedAmount={formatCurrency(balances.toman, 'toman')}
              icon="money-bill-wave"
              color={getCurrencyColor('toman')}
              onPress={() => setSelectedCurrency('toman')}
              selected={selectedCurrency === 'toman'}
            />

            <BalanceCard
              title="USDT"
              amount={balances.usdt}
              formattedAmount={formatCurrency(balances.usdt, 'usdt')}
              icon="dollar-sign"
              color={getCurrencyColor('usdt')}
              onPress={() => setSelectedCurrency('usdt')}
              selected={selectedCurrency === 'usdt'}
            />
          </View>

          {/* دکمه‌های عملیات */}
          <View style={styles.actionsRow}>
            <SuccessButton
              title="برداشت"
              onPress={() => handleWithdraw(selectedCurrency)}
              icon="download"
              style={styles.actionButton}
            />
            
            <SecondaryButton
              title="خرید SOD"
              onPress={handleBuySod}
              icon="shopping-cart"
              style={styles.actionButton}
            />
            
            <PrimaryButton
              title="تبدیل"
              onPress={handleConvert}
              icon="exchange-alt"
              style={styles.actionButton}
            />
          </View>
        </Card>

        {/* آمار */}
        <Card style={styles.statsCard}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
            آمار کلی
          </Text>

          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.primary }]}>
                {formatCurrency(stats.totalEarned, 'toman')}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                درآمد کل
              </Text>
            </View>

            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.success }]}>
                {formatCurrency(stats.totalWithdrawn, 'toman')}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                برداشت شده
              </Text>
            </View>

            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.warning }]}>
                {formatCurrency(stats.pendingWithdrawals, 'toman')}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                در انتظار
              </Text>
            </View>
          </View>
        </Card>

        {/* آخرین تراکنش‌ها */}
        <Card style={styles.transactionsCard}>
          <View style={styles.transactionsHeader}>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
              آخرین تراکنش‌ها
            </Text>
            
            <Button
              title="مشاهده همه"
              onPress={() => showInfo('صفحه تاریخچه تراکنش‌ها به زودی فعال خواهد شد')}
              variant="ghost"
              size="small"
              textStyle={{ color: theme.colors.primary, fontSize: 12 }}
            />
          </View>

          {transactions.length === 0 ? (
            <View style={styles.emptyTransactions}>
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                هنوز تراکنشی ثبت نشده است
              </Text>
              <Text style={[styles.emptySubtext, { color: theme.colors.textTertiary }]}>
                پس از انجام تراکنش، تاریخچه اینجا نمایش داده می‌شود
              </Text>
            </View>
          ) : (
            <View style={styles.transactionsList}>
              {transactions.slice(0, 5).map((transaction) => (
                <TransactionItem
                  key={transaction.id}
                  transaction={transaction}
                  onPress={() => handleTransactionPress(transaction)}
                />
              ))}
            </View>
          )}
        </Card>

        {/* اطلاعات حساب */}
        <Card style={styles.accountInfoCard}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
            اطلاعات حساب
          </Text>

          <View style={styles.infoList}>
            <View style={styles.infoItem}>
              <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
                شماره حساب
              </Text>
              <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                {user.id.toString().padStart(10, '0')}
              </Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
                وضعیت حساب
              </Text>
              <View style={styles.statusBadge}>
                <View style={[styles.statusDot, { backgroundColor: theme.colors.success }]} />
                <Text style={[styles.statusText, { color: theme.colors.success }]}>
                  فعال
                </Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
                سطح اعتبار
              </Text>
              <Text style={[styles.infoValue, { color: theme.colors.primary }]}>
                سطح {user.level}
              </Text>
            </View>
          </View>
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0f1c',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 40,
    paddingBottom: 10,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  balancesCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 16,
  },
  balancesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  actionButton: {
    flex: 1,
  },
  statsCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  transactionsCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
  },
  transactionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTransactions: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 12,
    textAlign: 'center',
  },
  transactionsList: {
    gap: 8,
  },
  accountInfoCard: {
    marginHorizontal: 16,
    marginBottom: 32,
    padding: 20,
  },
  infoList: {
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default WalletScreen;
