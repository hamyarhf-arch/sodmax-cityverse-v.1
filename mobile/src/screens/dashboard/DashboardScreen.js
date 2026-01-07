[file name]: mobile/src/screens/mining/MiningScreen.js
[file content begin]
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useTheme } from '@context/ThemeContext';
import { useApp } from '@context/AppContext';
import { useMining } from '@context/MiningContext';
import Header from '@components/common/Header';
import Card from '@components/ui/Card';
import Button from '@components/ui/Button';
import MiningButton from '@components/mining/MiningButton';
import UpgradeCard from '@components/mining/UpgradeCard';
import LoadingSpinner from '@components/ui/LoadingSpinner';

const MiningScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { user, formatNumber } = useApp();
  const { 
    isMining, 
    isAutoMining, 
    miningMultiplier,
    handleManualMine,
    toggleAutoMining,
    activateMiningBoost,
    upgradeMiner 
  } = useMining();

  const miningStats = [
    { id: 1, label: 'قدرت فعلی', value: `${(user?.miningPower || 5) * miningMultiplier}x`, color: theme.colors.primary },
    { id: 2, label: 'امروز', value: formatNumber(user?.todayEarned || 0), color: theme.colors.secondary },
    { id: 3, label: 'کل استخراج', value: formatNumber(user?.totalMined || 0), color: theme.colors.accent },
  ];

  const handleUpgrade = async () => {
    const success = await upgradeMiner();
    if (success) {
      // Success handled by context
    }
  };

  const handleBoost = async () => {
    const success = await activateMiningBoost();
    if (success) {
      // Success handled by context
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header
        title="مرکز استخراج"
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
        rightIcon="bar-chart-2"
        onRightPress={() => navigation.navigate('MiningStats')}
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Mining Center */}
        <Card style={styles.miningCenterCard}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            ⚡ مرکز استخراج SOD
          </Text>
          
          <View style={styles.miningButtonContainer}>
            <MiningButton
              onMine={handleManualMine}
              showEffects={true}
            />
          </View>

          <View style={styles.miningStats}>
            {miningStats.map((stat) => (
              <View key={stat.id} style={styles.miningStatItem}>
                <Text style={[styles.miningStatValue, { color: stat.color }]}>
                  {stat.value}
                </Text>
                <Text style={[styles.miningStatLabel, { color: theme.colors.secondary }]}>
                  {stat.label}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.miningControls}>
            <Button
              title={isAutoMining ? 'متوقف کردن' : 'استخراج خودکار'}
              onPress={toggleAutoMining}
              type={isAutoMining ? 'primary' : 'outline'}
              icon={isAutoMining ? 'pause-circle' : 'play-circle'}
              style={styles.controlButton}
            />
            
            <Button
              title={`بوست x${miningMultiplier}`}
              onPress={handleBoost}
              type={miningMultiplier > 1 ? 'success' : 'outline'}
              icon="zap"
              style={styles.controlButton}
              disabled={miningMultiplier > 1}
            />
          </View>
        </Card>

        {/* Miner Upgrade */}
        <UpgradeCard
          currentLevel={user?.level || 1}
          currentPower={user?.miningPower || 5}
          nextPower={(user?.miningPower || 5) + 5}
          upgradeCost={50000}
          currentBalance={user?.sodBalance || 0}
          onUpgrade={handleUpgrade}
          style={styles.upgradeCard}
        />

        {/* Mining History */}
        <Card style={styles.historyCard}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            📊 تاریخچه استخراج
          </Text>
          
          <View style={styles.historyItems}>
            <View style={styles.historyItem}>
              <Text style={[styles.historyLabel, { color: theme.colors.secondary }]}>
                امروز
              </Text>
              <Text style={[styles.historyValue, { color: theme.colors.primary }]}>
                +{formatNumber(user?.todayEarned || 0)} SOD
              </Text>
            </View>
            
            <View style={styles.historyItem}>
              <Text style={[styles.historyLabel, { color: theme.colors.secondary }]}>
                دیروز
              </Text>
              <Text style={[styles.historyValue, { color: theme.colors.secondary }]}>
                +3,210 SOD
              </Text>
            </View>
            
            <View style={styles.historyItem}>
              <Text style={[styles.historyLabel, { color: theme.colors.secondary }]}>
                هفته جاری
              </Text>
              <Text style={[styles.historyValue, { color: theme.colors.secondary }]}>
                +15,840 SOD
              </Text>
            </View>
            
            <View style={styles.historyItem}>
              <Text style={[styles.historyLabel, { color: theme.colors.secondary }]}>
                بهترین روز
              </Text>
              <Text style={[styles.historyValue, { color: theme.colors.accent }]}>
                +4,500 SOD
              </Text>
            </View>
          </View>
        </Card>

        {/* Tips */}
        <Card style={styles.tipsCard}>
          <Text style={[styles.tipsTitle, { color: theme.colors.text }]}>
            💡 نکات استخراج
          </Text>
          
          <View style={styles.tipItem}>
            <Text style={[styles.tipNumber, { color: theme.colors.primary }]}>
              ۱
            </Text>
            <Text style={[styles.tipText, { color: theme.colors.secondary }]}>
              هر ۵ ثانیه استخراج خودکار انجام می‌شود
            </Text>
          </View>
          
          <View style={styles.tipItem}>
            <Text style={[styles.tipNumber, { color: theme.colors.primary }]}>
              ۲
            </Text>
            <Text style={[styles.tipText, { color: theme.colors.secondary }]}>
              با دعوت دوستان، قدرت استخراج افزایش می‌یابد
            </Text>
          </View>
          
          <View style={styles.tipItem}>
            <Text style={[styles.tipNumber, { color: theme.colors.primary }]}>
              ۳
            </Text>
            <Text style={[styles.tipText, { color: theme.colors.secondary }]}>
              بوست استخراج را فعال کنید تا ۳ برابر بیشتر دریافت کنید
            </Text>
          </View>
        </Card>
      </ScrollView>

      {isMining && <LoadingSpinner message="در حال استخراج..." />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  miningCenterCard: {
    marginBottom: 16,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  miningButtonContainer: {
    marginBottom: 24,
  },
  miningStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 24,
  },
  miningStatItem: {
    alignItems: 'center',
  },
  miningStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  miningStatLabel: {
    fontSize: 12,
  },
  miningControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  controlButton: {
    width: '48%',
  },
  upgradeCard: {
    marginBottom: 16,
  },
  historyCard: {
    marginBottom: 16,
  },
  historyItems: {
    marginTop: 12,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  historyLabel: {
    fontSize: 14,
  },
  historyValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  tipsCard: {
    marginBottom: 30,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tipNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 12,
    marginTop: 2,
  },
  tipText: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
});

export default MiningScreen;
[file content end]
