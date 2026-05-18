import MyFooter from '@/components/footer';
import MyHeader from '@/components/header';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '../context/AuthContext';


export default function RootLayout() {
  return (
    <AuthProvider>
      <SafeAreaProvider>
        <StatusBar style="dark" backgroundColor="#ffffff" />
        <View style={{ flex: 1 }}>
          <MyHeader />
          <Stack screenOptions={{ headerShown: false }}/>
          <MyFooter />
        </View>
      </SafeAreaProvider>
    </AuthProvider>
  );
}