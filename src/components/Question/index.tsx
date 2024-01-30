import Animated, { runOnJS } from 'react-native-reanimated';
import { Text } from 'react-native';

import { Option } from '../Option';
import { styles } from './styles';
import { Gesture, GestureDetector, PanGesture } from 'react-native-gesture-handler';

type QuestionProps = {
  title: string;
  alternatives: string[];
}

type Props = {
  animatedStyle: object[];
  question: QuestionProps;
  alternativeSelected?: number | null;
  setAlternativeSelected: (value: number) => void;
  onPan: PanGesture;
}

export function Question({ animatedStyle, question, alternativeSelected, setAlternativeSelected }: Props) {
  
  return (
    <Animated.View style={[styles.container, ...animatedStyle]}>
      <Text style={styles.title}>
        {question.title}
      </Text>

      {
        question.alternatives.map((alternative, index) => (
          <GestureDetector 
            key={index}
            gesture={Gesture
              .Tap()
              .onEnd(() => {
                runOnJS(setAlternativeSelected)(index)
              })}
          >
            <Option
              key={index}
              title={alternative}
              checked={alternativeSelected === index}
            />
          </GestureDetector>
        ))
      }
    </Animated.View>
  );
}