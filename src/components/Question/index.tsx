import Animated from 'react-native-reanimated';
import { View, Text } from 'react-native';

import { Option } from '../Option';
import { styles } from './styles';

type QuestionProps = {
  title: string;
  alternatives: string[];
}

type Props = {
  animatedStyle: {
    transform: {
      translateX: number;
    }[];
  }
  question: QuestionProps;
  alternativeSelected?: number | null;
  setAlternativeSelected?: (value: number) => void;
}

export function Question({ animatedStyle, question, alternativeSelected, setAlternativeSelected }: Props) {
  return (
    <Animated.View style={[styles.container, animatedStyle]}>
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
  );
}