import MyHeader from '@/components/header';
import { Slot } from 'expo-router';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <View style={{ flex: 1 }}>
        <MyHeader />
        <Slot />
      </View>
    </SafeAreaProvider>
  );
}