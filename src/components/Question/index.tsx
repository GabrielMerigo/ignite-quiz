import Animated from 'react-native-reanimated';
import { Text } from 'react-native';

import { Option } from '../Option';
import { styles } from './styles';
import { GestureDetector, PanGesture } from 'react-native-gesture-handler';

type QuestionProps = {
  title: string;
  alternatives: string[];
}

type Props = {
  animatedStyle: object[];
  question: QuestionProps;
  alternativeSelected?: number | null;
  setAlternativeSelected?: (value: number) => void;
  onPan: PanGesture;
}

export function Question({ animatedStyle, onPan, question, alternativeSelected, setAlternativeSelected }: Props) {

  return (
    <GestureDetector gesture={onPan}>
      <Animated.View style={[styles.container, ...animatedStyle]}>
        <Text style={styles.title}>
          {question.title}
        </Text>

        {
          question.alternatives.map((alternative, index) => (
            <Option
              key={index}
              title={alternative}
              checked={alternativeSelected === index}
              onPress={() => setAlternativeSelected && setAlternativeSelected(index)}
            />
            ))
        }
      </Animated.View>
    </GestureDetector>
  );
}