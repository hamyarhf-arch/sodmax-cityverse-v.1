// mobile/src/screens/dashboard/DashboardScreen.js
import React, { useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { FontAwesome5, FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';
import { MiningContext } from '../../context/MiningContext';
import { WalletContext } from '../../context/WalletContext';
import Header from '../../components/common/Header';
import StatCard from '../../components/dashboard/StatCard';
import MiningCard from '../../components/dashboard/MiningCard';
import QuickAction from '../../components/dashboard/QuickAction';

export default function DashboardScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const { miningPower, todayEarned, totalMined } = useContext(MiningContext);
  const { sodBalance, tomanBalance, referralCount } = useContext(WalletContext);

  const quickActions = [
    {
      title: 'برداشت',
      icon: 'download',
      color: '#00D4AA',
      onPress: () => navigation.navigate('Wallet'),
    },
    {
      title: 'دعوت',
      icon: 'user-plus',
      color: '#0066FF',
      onPress: () => navigation.navigate('Invite'),
    },
    {
      title: 'پاداش',
      icon: 'gift',
      color: '#FFD700',
      onPress: () => navigation.navigate('Rewards'),
    },
    {
      title: 'پروفایل',
      icon: 'user',
      color: '#FF6B35',
      onPress: () => navigation.navigate('Profile'),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="داشبورد"
        rightIcon="bell"
        onRightPress={() => navigation.navigate('Support')}
      />
      
      <ScrollView style={styles.scrollView}>
        {/* آمار سریع */}
        <View style={styles.statsContainer}>
          <StatCard
            title="SOD"
            value={sodBalance.toLocaleString('fa-IR')}
            icon="coins"
            color="#0066FF"
            onPress={() => navigation.navigate('Wallet')}
          />
          <StatCard
            title="تومان"
            value={tomanBalance.toLocaleString('fa-IR')}
            icon="money-bill-wave"
            color="#00D4AA"
            onPress={() => navigation.navigate('Wallet')}
          />
          <StatCard
            title="زیرمجموعه"
            value={referralCount.toString()}
            icon="users"
            color="#FF6B35"
            onPress={() => navigation.navigate('Invite')}
          />
        </View>

        {/* مرکز استخراج */}
        <MiningCard
          miningPower={miningPower}
          todayEarned={todayEarned}
          totalMined={totalMined}
          onPressMine={() => navigation.navigate('Mining')}
          onPressBoost={() => navigation.navigate('Mining')}
          onPressUpgrade={() => navigation.navigate('Mining')}
        />

        {/* اقدامات سریع */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>اقدامات سریع</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action, index) => (
              <QuickAction
                key={index}
                title={action.title}
                icon={action.icon}
                color={action.color}
                onPress={action.onPress}
              />
            ))}
          </View>
        </View>

        {/* مأموریت‌های فعال */}
        <View style={styles.missionsContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>مأموریت‌های فعال</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Missions')}>
              <Text style={styles.seeAllText}>مشاهده همه</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.missionCard}>
            <View style={styles.missionHeader}>
              <Text style={styles.missionName}>۱۰۰ کلیک در بازی</Text>
              <Text style={styles.missionReward}>+۵۰۰ تومان</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '45%' }]} />
            </View>
            <Text style={styles.progressText}>۴۵/۱۰۰</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0f1c',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 16,
  },
  quickActionsContainer: {
    marginTop: 24,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  missionsContainer: {
    marginTop: 32,
    marginBottom: 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    color: '#0066FF',
    fontSize: 14,
    fontWeight: '600',
  },
  missionCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  missionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  missionName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  missionReward: {
    backgroundColor: '#00D4AA',
    color: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    fontSize: 12,
    fontWeight: '700',
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#0066FF',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 11,
    color: '#9ca3af',
    textAlign: 'left',
  },
});
