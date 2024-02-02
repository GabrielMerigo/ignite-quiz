import { useWindowDimensions } from "react-native"
import { BlurMask, Canvas, Rect } from '@shopify/react-native-skia'
import Animated, { Easing, useSharedValue, withSequence, withTiming, useAnimatedStyle } from "react-native-reanimated"
import { THEME } from "../../styles/theme";
import { useEffect } from "react";

const STATUS = ['transparent', THEME.COLORS.BRAND_LIGHT, THEME.COLORS.DANGER_LIGHT];

type OverlayFeedbackProps = {
  status: { value: number };
}

export function OverlayFeedback({ status}: OverlayFeedbackProps) {
  const opacity = useSharedValue(0);
  const color = STATUS[status.value];
  const { height, width } = useWindowDimensions();

  const styledAnimated = useAnimatedStyle(() => {
    return {
      opacity: opacity.value
    }
  })

  useEffect(() => {
    opacity.value = withSequence(
      withTiming(1, { duration:400, easing: Easing.bounce }),
      withTiming(0)
    );
  }, [status])


  return (
    <Animated.View style={[{ height, width, position: 'absolute'}, styledAnimated]}>
      <Canvas style={{ flex: 1 }}>
        <Rect 
          x={0}
          y={0}
          width={width}
          height={height}
          color={color}
        >
          <BlurMask blur={7000} style="solid"/>
        </Rect>
      </Canvas>
    </Animated.View>
  )
}