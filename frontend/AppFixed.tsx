import { registerRootComponent } from 'expo';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import screens
import { HomeScreen } from './src/screens/HomeScreen';
import { SetupScreen } from './src/screens/SetupScreen';
import { TabooTurnIntroScreen } from './src/screens/TabooTurnIntroScreen';
import { TabooGameScreen } from './src/screens/TabooGameScreen';
import { SpyfallRoleScreen } from './src/screens/SpyfallRoleScreen';

const Stack = createNativeStackNavigator();

// Main App Component
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
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default registerRootComponent(App);
