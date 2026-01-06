import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Easing,
} from 'react-native';
import LottieView from 'lottie-react-native';

// Constants
import Colors from '../../constants/Colors';
import Layout from '../../constants/Layout';

const LoadingSpinner = ({
  size = 'medium',
  color,
  text,
  fullScreen = false,
  type = 'spinner',
  style,
  textStyle,
}) => {
  const spinValue = new Animated.Value(0);

  React.useEffect(() => {
    if (type === 'pulse') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(spinValue, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(spinValue, {
            toValue: 0,
            duration: 800,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [type]);

  const getSize = () => {
    switch (size) {
      case 'small': return 20;
      case 'medium': return 36;
      case 'large': return 60;
      case 'xlarge': return 80;
      default: return 36;
    }
  };

  const getColor = () => {
    return color || Colors.primary;
  };

  const scale = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1.2],
  });

  const renderLoader = () => {
    switch (type) {
      case 'dots':
        return (
          <LottieView
            source={require('../../assets/animations/dots-loading.json')}
            autoPlay
            loop
            style={{ width: getSize() * 2, height: getSize() }}
          />
        );
      
      case 'pulse':
        return (
          <Animated.View style={{ transform: [{ scale }] }}>
            <View style={[styles.pulseCircle, { 
              width: getSize(), 
              height: getSize(),
              backgroundColor: getColor(),
            }]} />
          </Animated.View>
        );
      
      case 'wave':
        return (
          <LottieView
            source={require('../../assets/animations/wave-loading.json')}
            autoPlay
            loop
            style={{ width: getSize() * 3, height: getSize() }}
          />
        );
      
      case 'mining':
        return (
          <LottieView
            source={require('../../assets/animations/mining-loading.json')}
            autoPlay
            loop
            style={{ width: getSize() * 2, height: getSize() * 2 }}
          />
        );
      
      default: // spinner
        return (
          <ActivityIndicator
            size={size === 'small' ? 'small' : 'large'}
            color={getColor()}
          />
        );
    }
  };

  const containerStyle = [
    styles.container,
    fullScreen && styles.fullScreen,
    style,
  ];

  return (
    <View style={containerStyle}>
      {renderLoader()}
      {text && (
        <Text style={[styles.text, { color: getColor() }, textStyle]}>
          {text}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Layout.spacing.lg,
  },
  fullScreen: {
    flex: 1,
    backgroundColor: Colors.bgPrimary,
  },
  pulseCircle: {
    borderRadius: Layout.borderRadius.round,
    opacity: 0.7,
  },
  text: {
    marginTop: Layout.spacing.md,
    fontSize: Layout.fontSize.sm,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default LoadingSpinner;
