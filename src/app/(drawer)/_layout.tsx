// file: src/app/(drawer)/_layout.tsx
import { Drawer } from 'expo-router/drawer';
import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

export default function DrawerLayout() {
  const [location, setLocation] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        let location = await Location.getCurrentPositionAsync({});
        setLocation(location);
        
        // Store location in AsyncStorage for access across the app
        await AsyncStorage.setItem('userLocation', JSON.stringify({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        }));
      } catch (error) {
        console.log('Error getting location:', error);
      }
    })();
  }, []);

  return (
    <Drawer
      screenOptions={{
        headerTintColor: '#007AFF',
        drawerActiveTintColor: '#007AFF',
      }}
    >
      <Drawer.Screen
        name="(tabs)"
        options={{
          drawerLabel: "Trang chủ",
          headerShown: false,
          drawerIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          )
        }}
      />
      <Drawer.Screen
        name="export-receipt"
        options={{
          drawerLabel: "Xuất hóa đơn",
          title: "Xuất hóa đơn",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="receipt-outline" size={size} color={color} />
          )
        }}
      />
      <Drawer.Screen
        name="my-location"
        options={{
          drawerLabel: "Vị trí của tôi",
          title: "Vị trí hiện tại",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="location-outline" size={size} color={color} />
          )
        }}
      />
      <Drawer.Screen
        name="statistic"
        options={{
          drawerLabel: "Thống kê",
          title: "Thống kê",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="stats-chart" size={size} color={color} />
          )
        }}
      />
      <Drawer.Screen
        name="history-location-login"
        options={{
          drawerLabel: "Lịch sử đăng nhập",
          title: "Lịch sử đăng nhập",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="time-outline" size={size} color={color} />
          )
        }}
      />
    </Drawer>
  );
}