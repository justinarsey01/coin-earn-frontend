import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { Colors } from '../constants/Colors';

type Props = {
  canClaim: boolean;
  onPress: () => void;
  timeLeft: number; // seconds
};

export default function AnimatedCircle({ canClaim, onPress, timeLeft }: Props) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.6);

  useEffect(() => {
    if (canClaim) {
      // Soft pulse animation when ready to claim
      scale.value = withRepeat(
        withSequence(
          withTiming(1.08, { duration: 900, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
      opacity.value = withRepeat(
        withSequence(
          withTiming(0.9, { duration: 900 }),
          withTiming(0.5, { duration: 900 })
        ),
        -1,
        true
      );
    } else {
      scale.value = withTiming(1);
      opacity.value = withTiming(0.4);
    }
  }, [canClaim]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  // Format seconds → HH:MM:SS
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m
      .toString()
      .padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.wrapper}>
      {/* Outer glow ring */}
      <Animated.View style={[styles.outerRing, animatedStyle]} />

      {/* Main circle button */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        disabled={!canClaim}
        style={[
          styles.circle,
          { backgroundColor: canClaim ? Colors.primary : '#94A3B8' },
        ]}
      >
        {canClaim ? (
          <>
            <Text style={styles.mainText}>TAP</Text>
            <Text style={styles.subText}>TO MINE</Text>
          </>
        ) : (
          <>
            <Text style={styles.countdownLabel}>Next claim in</Text>
            <Text style={styles.countdown}>{formatTime(timeLeft)}</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 280,
  },
  outerRing: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    borderWidth: 8,
    borderColor: Colors.primary,
  },
  circle: {
    width: 220,
    height: 220,
    borderRadius: 110,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 10,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
  },
  mainText: {
    color: Colors.white,
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: 2,
  },
  subText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
    opacity: 0.9,
  },
  countdownLabel: {
    color: Colors.white,
    fontSize: 14,
    marginBottom: 6,
  },
  countdown: {
    color: Colors.white,
    fontSize: 28,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
});