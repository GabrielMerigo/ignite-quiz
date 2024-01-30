import { Text } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';

import { styles } from './styles';

type OptionProps = {
  checked: boolean;
  title: string;
}

export function Option({ checked, title }: OptionProps) {

  return (
    <TouchableOpacity
      onPress={() => {}}
      style={
        [
          styles.container,
          checked && styles.checked
        ]
      }
    >
      <Text style={styles.title}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}