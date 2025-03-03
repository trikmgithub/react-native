// file: src/app/(drawer)/(tabs)/_layout.tsx
import { Tabs } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import { DrawerToggleButton } from '@react-navigation/drawer';

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: 'Sản phẩm 🛒',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="fast-food-outline" size={size} color={color} />
          ),
          headerLeft: () => <DrawerToggleButton />
        }} 
      />
      <Tabs.Screen 
        name="orders" 
        options={{ 
          title: 'Đơn hàng',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list-outline" size={size} color={color} />
          ),
          headerLeft: () => <DrawerToggleButton />
        }} 
      />
    </Tabs>
  );
}