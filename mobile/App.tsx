import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import InspectionListScreen from './src/screens/InspectionListScreen';
import InspectionFormScreen from './src/screens/InspectionFormScreen';
import CameraScreen from './src/screens/CameraScreen';
import BarcodeScannerScreen from './src/screens/BarcodeScannerScreen';
import OfflineSyncScreen from './src/screens/OfflineSyncScreen';
import SettingsScreen from './src/screens/SettingsScreen';

// Contexts
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { OfflineProvider } from './src/contexts/OfflineContext';

// Types
import { RootStackParamList, TabParamList } from './src/types/navigation';

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

// Custom theme
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#1976d2',
    accent: '#03dac4',
    background: '#f5f5f5',
    surface: '#ffffff',
    error: '#b00020',
    text: '#000000',
    onSurface: '#000000',
    disabled: '#bdbdbd',
    placeholder: '#9e9e9e',
    backdrop: 'rgba(0, 0, 0, 0.5)',
  },
};

// Tab Navigator
function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.disabled,
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="view-dashboard" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Inspections"
        component={InspectionListScreen}
        options={{
          tabBarLabel: 'Inspeções',
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="clipboard-check" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Sync"
        component={OfflineSyncScreen}
        options={{
          tabBarLabel: 'Sincronizar',
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="sync" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Configurações',
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="cog" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Stack Navigator
function AppNavigator() {
  const { isAuthenticated } = useAuth();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {!isAuthenticated ? (
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : (
        <>
          <Stack.Screen name="Main" component={TabNavigator} />
          <Stack.Screen 
            name="InspectionForm" 
            component={InspectionFormScreen}
            options={{
              headerShown: true,
              title: 'Nova Inspeção',
            }}
          />
          <Stack.Screen 
            name="Camera" 
            component={CameraScreen}
            options={{
              headerShown: true,
              title: 'Câmera',
            }}
          />
          <Stack.Screen 
            name="BarcodeScanner" 
            component={BarcodeScannerScreen}
            options={{
              headerShown: true,
              title: 'Scanner',
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

// Tab Bar Icon Component
function TabBarIcon({ name, color, size }: { name: string; color: string; size: number }) {
  return (
    <TabBarIcon 
      name={name as any} 
      size={size} 
      color={color} 
    />
  );
}

// Main App Component
export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <AuthProvider>
          <OfflineProvider>
            <NavigationContainer>
              <AppNavigator />
              <StatusBar style="auto" />
            </NavigationContainer>
          </OfflineProvider>
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
