import { View } from 'react-native';

import { styles } from './styles';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useEffect } from 'react';

interface Props {
  total: number;
  current: number;
}

export function ProgressBar({ total, current }: Props) {
  const percentage = Math.round((current / total) * 100);
  const progress = useSharedValue(percentage);
  
  useEffect(() => {
    progress.value = withTiming(percentage, {
      duration: 500,
    });
  }, [percentage])

  const animatedProgressStyle = useAnimatedStyle(() => {
    return {
      width: `${progress.value}%`
    }
  })

  return (
    <View style={styles.track}>
      <Animated.View style={[styles.progress, animatedProgressStyle]} />
    </View>
  );
}