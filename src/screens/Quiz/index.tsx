import { useEffect, useState } from 'react';
import { Alert, BackHandler, Text, View } from 'react-native';

import { useNavigation, useRoute } from '@react-navigation/native';

import { styles } from './styles';
import { Audio } from 'expo-av';
import { QUIZ } from '../../data/quiz';
import { historyAdd } from '../../storage/quizHistoryStorage';

import { Loading } from '../../components/Loading';
import { Question } from '../../components/Question';
import { QuizHeader } from '../../components/QuizHeader';
import { ConfirmButton } from '../../components/ConfirmButton';
import { OutlineButton } from '../../components/OutlineButton';
import Animated, { Extrapolate, interpolate, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming, runOnJS } from 'react-native-reanimated';
import { ProgressBar } from '../../components/ProgressBar';
import { THEME } from '../../styles/theme';
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import { OverlayFeedback } from '../../components/OverlayFeedback';
import * as Haptics from 'expo-haptics'

interface Params {
  id: string;
}

type QuizProps = typeof QUIZ[0];

const CARD_SKIP_AREA = (-200);

export function Quiz() {
  const [points, setPoints] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [quiz, setQuiz] = useState<QuizProps>({} as QuizProps);
  const [statusReply, setStatusReply] = useState({ value: 0 });
  const [alternativeSelected, setAlternativeSelected] = useState<null | number>(null);

  const offset = useSharedValue(0);
  const scrollY = useSharedValue(0);
  const cardPosition = useSharedValue(0);

  const { navigate } = useNavigation();

  const route = useRoute();
  const { id } = route.params as Params;

  function handleSkipConfirm() {
    Alert.alert('Pular', 'Deseja realmente pular a questão?', [
      { text: 'Sim', onPress: () => handleNextQuestion() },
      { text: 'Não', onPress: () => { } }
    ]);
  }

  async function playSound(isCorrect: boolean) {
    const file = isCorrect ? require('../../assets/correct.mp3') : require('../../assets/wrong.mp3');

    const {sound} = await Audio.Sound.createAsync(file, { shouldPlay: true });

    await sound.setPositionAsync(0);
    await sound.playAsync();
  }

  async function handleFinished() {
    await historyAdd({
      id: new Date().getTime().toString(),
      title: quiz.title,
      level: quiz.level,
      points,
      questions: quiz.questions.length
    });

    navigate('finish', {
      points: String(points),
      total: String(quiz.questions.length),
    });
  }

  function handleNextQuestion() {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(prevState => prevState + 1)
    } else {
      handleFinished();
    }
  }

  async function handleConfirm() {
    if (alternativeSelected === null) {
      return handleSkipConfirm();
    }

    if (quiz.questions[currentQuestion].correct === alternativeSelected) {
      setStatusReply({ value: 1 });
      await playSound(true);
      setPoints(prevState => prevState + 1);
    }else{
      setStatusReply({ value: 2 });
      await playSound(false)
      shakeAnimation();
    }

    
    setAlternativeSelected(null);
  }

  function handleStop() {
    Alert.alert('Parar', 'Deseja parar agora?', [
      {
        text: 'Não',
        style: 'cancel',
      },
      {
        text: 'Sim',
        style: 'destructive',
        onPress: () => navigate('home')
      },
    ]);

    return true;
  }

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: offset.value }],
  }));

  async function shakeAnimation() {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

    const OFFSET = 5;
    const TIME = 100;

    offset.value = withSequence(
      withTiming(-OFFSET, { duration: TIME / 2 }),
      withRepeat(withTiming(OFFSET, { duration: TIME }), 5, true),
      withTiming(0, { duration: TIME / 2 })
    );
  }

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    }
  });

  const isLongPressed = useSharedValue(false);

  const fixedProgressBarStyles= useAnimatedStyle(() => {
    return {
      zIndex: 1,
      position: 'absolute',
      paddingTop: 50,
      backgroundColor: THEME.COLORS.GREY_500,
      width: '110%',
      left: '-5%',
      opacity: interpolate(scrollY.value, [50, 90], [0, 1], Extrapolate.CLAMP),
      transform: [
        { translateY: interpolate(scrollY.value, [50, 100], [-40, 0], Extrapolate.CLAMP) }
      ]
    };
  });

  const headerStyles = useAnimatedStyle(() => {
    return {
      opacity: interpolate(scrollY.value, [70, 90], [1, 0], Extrapolate.CLAMP)
    }
  })

  const dragStyles = useAnimatedStyle(() => {
    const CARD_INCLINATION = 10;
    const rotateZ = cardPosition.value / CARD_INCLINATION;

    return {
      transform: [
        { translateX: cardPosition.value },
        { rotateZ: `${rotateZ}deg` }
    ]
    }
  })


  useEffect(() => {
    const quizSelected = QUIZ.filter(item => item.id === id)[0];
    setQuiz(quizSelected);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (quiz.questions) {
      handleNextQuestion();
    }
  }, [points]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleStop);

    return () => backHandler.remove();
  }, [])
  

  if (isLoading) {
    return <Loading />
  }

  const onLongPress = Gesture.LongPress()
    .minDuration(200)
    .onStart(() => {
      isLongPressed.value = true;
    });

  const onPan = Gesture.Pan()
    .manualActivation(true)
    .onTouchesMove((event, stateManager) => {
      if (isLongPressed.value) {
        stateManager.activate();
      } else {
        stateManager.fail();
      }
    })
    .onUpdate((event) => {
      const moveToLeft = event.translationX < 0;

      if (moveToLeft) {
        cardPosition.value = event.translationX;
      }
    })
    .onEnd((event) => {
      if(event.translationX < CARD_SKIP_AREA){
        runOnJS(handleSkipConfirm)();
      }

      cardPosition.value = withTiming(0);
    })
    .onTouchesUp(() => {
      isLongPressed.value = false;
    });


  return (
    <View style={styles.container}>
      <OverlayFeedback status={statusReply} />
      <Animated.View style={fixedProgressBarStyles}>
        <Text style={styles.title}>{quiz.title}</Text>

        <ProgressBar 
          total={quiz.questions.length} 
          current={currentQuestion + 1} 
        />
      </Animated.View>


      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.question}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        
        <Animated.View style={[styles.header, headerStyles]}>
          <QuizHeader
            title={quiz.title}
            currentQuestion={currentQuestion + 1}
            totalOfQuestions={quiz.questions.length}
          />
        </Animated.View>
        
        <GestureDetector gesture={Gesture.Simultaneous(onLongPress, onPan)} key={quiz.questions[currentQuestion].title}>
          <Question
            onPan={onPan}
            animatedStyle={[style, dragStyles]}
            question={quiz.questions[currentQuestion]}
            alternativeSelected={alternativeSelected}
            setAlternativeSelected={setAlternativeSelected}
          />
        </GestureDetector>
      

        <View style={styles.footer}>
          <OutlineButton title="Parar" onPress={handleStop} />
          <ConfirmButton onPress={handleConfirm} />
        </View>
      </Animated.ScrollView>
    </View >
  );
}