import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs
    
      screenOptions={{
        headerShown: false,
        headerStyle: {
          backgroundColor: '#1E1E1E', // Barra superior (header) oscura
        },
        headerTintColor: '#0f0', // Texto del header en verde neón
        tabBarStyle: {
          backgroundColor: '#1E1E1E', // Fondo oscuro de la barra inferior
          borderTopColor: '#333',     // Línea superior tenue
        },
        tabBarActiveTintColor: '#0f0',     // Íconos activos en verde
        tabBarInactiveTintColor: '#888',   // Íconos inactivos en gris
      }}
    >
      <Tabs.Screen
        name="scan"
        options={{
          title: 'Escanear',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="camera" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'Historial',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
