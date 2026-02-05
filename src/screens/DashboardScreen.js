import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboard, clearDashboard } from '../redux/slices/dashboardSlice';
import { logout } from '../redux/slices/authSlice';
import { clearOtp } from '../redux/slices/otpSlice';

import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
  StatusBar,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');
const CARD_MARGIN = 16;
const CARD_WIDTH = (width - CARD_MARGIN * 3) / 2;

const DashboardScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { token } = useSelector(state => state.otp);
  const { user, carousel, student, amount, color, loading, error } =
    useSelector(state => state.dashboard);

  console.log('color: ', color);

  const [refreshing, setRefreshing] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const firstLoad = useRef(true);

  // API call only on first mount
  useEffect(() => {
    if (token && firstLoad.current) {
      firstLoad.current = false;
      dispatch(fetchDashboard(token));
    }
  }, [dispatch, token]);

  // Auto-rotate carousel
  useEffect(() => {
    if (carousel && carousel.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex(prevIndex =>
          prevIndex === carousel.length - 1 ? 0 : prevIndex + 1,
        );
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [carousel]);

  // Pull to refresh API call
  const onRefresh = useCallback(async () => {
    setRefreshing(true);

    if (token) {
      await dispatch(fetchDashboard(token));
    }

    setRefreshing(false);
  }, [dispatch, token]);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await dispatch(logout());
            await dispatch(clearDashboard());

            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          },
        },
      ],
      { cancelable: true },
    );
  };

  const formatCurrency = value => {
    return `₹${value.toLocaleString('en-IN')}`;
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View
          style={[
            styles.loadingContainer,
            { backgroundColor: color || '#667eea' },
          ]}
        >
          <StatusBar
            barStyle="light-content"
            backgroundColor={color || '#667eea'}
            translucent={false}
          />

          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={styles.loadingText}>Loading Dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && !user) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View
          style={[
            styles.errorContainer,
            { backgroundColor: color || '#667eea' },
          ]}
        >
          <StatusBar
            barStyle="light-content"
            backgroundColor={color || '#667eea'}
            translucent={false}
          />

          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>{error}</Text>

          <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.mainContainer}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={color || '#667eea'}
          translucent={false}
        />

        {/* Header with Gradient */}
        <LinearGradient
          colors={[color || '#667eea', color ? `${color}dd` : '#764ba2']}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerContent}>
            <View style={styles.userInfo}>
              <View style={styles.avatarContainer}>
                <Text style={styles.avatarText}>
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </Text>
              </View>

              <View>
                <Text style={styles.welcomeText}>Welcome Back,</Text>
                <Text style={styles.userName}>{user?.name || 'User'}</Text>
                <Text style={styles.userId}>ID: {user?.userid}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <Text style={styles.logoutIcon}>🚪</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[color || '#667eea']}
              tintColor={color || '#667eea'}
              title="Pull to refresh"
              titleColor={color || '#667eea'}
            />
          }
        >
          {/* Carousel */}
          {carousel && carousel.length > 0 && (
            <View style={styles.carouselContainer}>
              <Image
                source={{ uri: carousel[currentImageIndex] }}
                style={styles.carouselImage}
                resizeMode="cover"
              />

              <View style={styles.carouselIndicator}>
                {carousel.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.dot,
                      index === currentImageIndex && styles.activeDot,
                      index === currentImageIndex && {
                        backgroundColor: color || '#667eea',
                      },
                    ]}
                  />
                ))}
              </View>
            </View>
          )}

          {/* Student Stats */}
          {student && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>📊 Student Statistics</Text>
                <Text style={styles.sectionSubtitle}>Current enrollment</Text>
              </View>

              <View style={styles.cardRow}>
                <LinearGradient
                  colors={['#4facfe', '#00f2fe']}
                  style={[styles.card, styles.gradientCard]}
                >
                  <View style={styles.cardIconContainer}>
                    <Text style={styles.cardEmoji}>👦</Text>
                  </View>

                  <Text style={styles.cardValue}>{student.Boy}</Text>
                  <Text style={styles.cardLabel}>Boys</Text>
                </LinearGradient>

                <LinearGradient
                  colors={['#f093fb', '#f5576c']}
                  style={[styles.card, styles.gradientCard]}
                >
                  <View style={styles.cardIconContainer}>
                    <Text style={styles.cardEmoji}>👧</Text>
                  </View>

                  <Text style={styles.cardValue}>{student.Girl}</Text>
                  <Text style={styles.cardLabel}>Girls</Text>
                </LinearGradient>
              </View>

              <LinearGradient
                colors={[color || '#667eea', color ? `${color}cc` : '#764ba2']}
                style={[styles.card, styles.gradientCard, styles.cardTotal]}
              >
                <View style={styles.cardIconContainer}>
                  <Text style={styles.cardEmoji}>👥</Text>
                </View>

                <Text style={styles.cardValue}>
                  {student.Boy + student.Girl}
                </Text>

                <Text style={styles.cardLabel}>Total Students</Text>
              </LinearGradient>
            </View>
          )}

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>

            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.actionCard}>
                <View
                  style={[styles.actionIcon, { backgroundColor: '#E3F2FD' }]}
                >
                  <Text style={styles.actionEmoji}>📝</Text>
                </View>
                <Text style={styles.actionText}>Attendance</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionCard}>
                <View
                  style={[styles.actionIcon, { backgroundColor: '#FCE4EC' }]}
                >
                  <Text style={styles.actionEmoji}>📊</Text>
                </View>
                <Text style={styles.actionText}>Reports</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionCard}>
                <View
                  style={[styles.actionIcon, { backgroundColor: '#F3E5F5' }]}
                >
                  <Text style={styles.actionEmoji}>📢</Text>
                </View>
                <Text style={styles.actionText}>Notices</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionCard}>
                <View
                  style={[styles.actionIcon, { backgroundColor: '#E8F5E9' }]}
                >
                  <Text style={styles.actionEmoji}>⚙️</Text>
                </View>
                <Text style={styles.actionText}>Settings</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },

  mainContainer: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },

  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },

  errorIcon: {
    fontSize: 64,
    marginBottom: 16,
  },

  errorText: {
    color: '#ffffff',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 24,
  },

  retryButton: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },

  retryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },

  header: {
    paddingTop: 16,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 8,
  },

  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },

  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },

  welcomeText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },

  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 2,
  },

  userId: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },

  logoutButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  logoutIcon: {
    fontSize: 24,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    padding: 16,
  },

  carouselContainer: {
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden',
  },

  carouselImage: {
    width: '100%',
    height: 200,
  },

  carouselIndicator: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },

  activeDot: {
    width: 24,
    backgroundColor: '#ffffff',
  },

  section: {
    marginBottom: 24,
  },

  sectionHeader: {
    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },

  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
  },

  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  card: {
    width: CARD_WIDTH,
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
  },

  gradientCard: {
    backgroundColor: 'transparent',
  },

  cardTotal: {
    width: '100%',
    marginTop: 16,
  },

  cardIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },

  cardEmoji: {
    fontSize: 32,
  },

  cardValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },

  cardLabel: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },

  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },

  actionCard: {
    width: (width - 48) / 4,
    alignItems: 'center',
    marginBottom: 16,
  },

  actionIcon: {
    width: 60,
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },

  actionEmoji: {
    fontSize: 28,
  },

  actionText: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default DashboardScreen;
