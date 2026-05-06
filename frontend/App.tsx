import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet, View } from 'react-native';

// Simple Screens
import { HomeScreen } from './src/screens/HomeScreen';
import { SetupScreenSimple as SetupScreen } from './src/screens/SetupScreenSimple';
import { TabooGameScreenSimple as TabooGameScreen } from './src/screens/TabooGameScreenSimple';
import { SpyfallRoleScreenSimple as SpyfallRoleScreen } from './src/screens/SpyfallRoleScreenSimple';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <View style={styles.container}>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#0F172A' },
          }}
        >
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Setup" component={SetupScreen} />
          <Stack.Screen name="TabooGame" component={TabooGameScreen} />
          <Stack.Screen name="SpyfallRole" component={SpyfallRoleScreen} />
        </Stack.Navigator>
      </View>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
});
