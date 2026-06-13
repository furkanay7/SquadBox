import { registerRootComponent } from 'expo';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { HomeScreen } from './src/screens/HomeScreen';
import { SetupScreen } from './src/screens/SetupScreen';
import { TabooTurnIntroScreen } from './src/screens/TabooTurnIntroScreen';
import { TabooGameScreen } from './src/screens/TabooGameScreen';
import { SpyfallRoleScreen } from './src/screens/SpyfallRoleScreen';
import { WhoIsItScreen } from './src/screens/WhoIsItScreen';
import { TrueFalseScreen } from './src/screens/TrueFalseScreen';
import { CategoryGameScreen } from './src/screens/CategoryGameScreen';

const Stack = createNativeStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#0F172A' },
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Setup" component={SetupScreen} />
        <Stack.Screen name="TabooTurnIntro" component={TabooTurnIntroScreen} />
        <Stack.Screen name="TabooGame" component={TabooGameScreen} />
        <Stack.Screen name="SpyfallRole" component={SpyfallRoleScreen} />
        <Stack.Screen name="WhoIsIt" component={WhoIsItScreen} />
        <Stack.Screen name="TrueFalse" component={TrueFalseScreen} />
        <Stack.Screen name="CategoryGame" component={CategoryGameScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default registerRootComponent(App);