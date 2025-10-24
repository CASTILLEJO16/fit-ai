import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function HistoryScreen() {
  const [scans, setScans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const USER_EMAIL = 'hola.@gamil.com'; // Cambia por el usuario real

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://192.168.1.98:5000/history?email=${USER_EMAIL}`);
      const data = await response.json();
      console.log('🔎 Resultado del backend:', data);

      const validScans = Array.isArray(data)
        ? data.filter(scan => scan.nutrition && typeof scan.nutrition === 'object')
        : [];

      setScans(validScans);
    } catch (error) {
      console.error('Error al obtener historial:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Recargar historial cada vez que se enfoca la pantalla
  useFocusEffect(
    useCallback(() => {
      fetchHistory();
    }, [])
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Historial de comidas</Text>

      {loading && <ActivityIndicator size="large" color="#0f0" />}

      {!loading && scans.length === 0 && (
        <Text style={styles.noDataText}>No hay comidas registradas.</Text>
      )}

      {scans.map((scan, index) => (
        <View key={index} style={styles.card}>
          <Image source={{ uri: scan.imageUrl }} style={styles.image} />
          <Text style={styles.food}>{scan.food?.toUpperCase()}</Text>
          <Text style={styles.nutritionText}>Calorías: {scan.nutrition.calories} kcal</Text>
          <Text style={styles.nutritionText}>Proteínas: {scan.nutrition.protein_g} g</Text>
          <Text style={styles.nutritionText}>Grasas: {scan.nutrition.fat_total_g} g</Text>
          <Text style={styles.nutritionText}>Carbohidratos: {scan.nutrition.carbohydrates_total_g} g</Text>
          <Text style={styles.nutritionText}>Fibra: {scan.nutrition.fiber_g} g</Text>
          <Text style={styles.nutritionText}>Azúcares: {scan.nutrition.sugar_g} g</Text>

          {/* ✅ Mostrar sugerencia del coach */}
          {scan.sugerencia && (
            <Text style={styles.suggestion}>💡 Sugerencia: {scan.sugerencia}</Text>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#121212',
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 20,
    color: '#0f0',
  },
  noDataText: {
    marginTop: 20,
    color: '#aaa',
    fontStyle: 'italic',
  },
  card: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    width: '100%',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#0f0',
  },
  food: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f0',
    marginBottom: 8,
  },
  nutritionText: {
    fontSize: 16,
    color: '#ddd',
    marginBottom: 4,
  },
  suggestion: {
    marginTop: 8,
    fontSize: 16,
    color: '#0ff',
    fontStyle: 'italic',
  },
});
