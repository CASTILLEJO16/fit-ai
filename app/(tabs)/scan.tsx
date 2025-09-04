import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function ScanScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dkgheoxg5/upload';
  const UPLOAD_PRESET = 'fitai_preset';

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setImage(uri);
      await uploadAndAnalyze(uri);
    }
  };

  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setImage(uri);
      await uploadAndAnalyze(uri);
    }
  };

  const uploadAndAnalyze = async (imageUri: string) => {
    try {
      setLoading(true);
      setResult(null);

      const formData = new FormData();
      formData.append('file', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'photo.jpg',
      } as any);
      formData.append('upload_preset', UPLOAD_PRESET);

      const cloudRes = await fetch(CLOUDINARY_URL, {
        method: 'POST',
        body: formData,
      });

      const cloudData = await cloudRes.json();

      if (!cloudData.secure_url) throw new Error('Error al subir imagen a Cloudinary');

      const analyzeRes = await fetch('http://192.168.1.92:5000/analyze-nutrition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: cloudData.secure_url }),
      });

      const analyzeData = await analyzeRes.json();

      if (!analyzeRes.ok) {
        throw new Error(analyzeData.error || 'Error en análisis');
      }

      setResult(analyzeData);

      await fetch('http://192.168.1.92:5000/save-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'hola.@gamil.com',
          imageUrl: cloudData.secure_url,
          food: analyzeData.food,
          nutrition: analyzeData.nutrition,
        }),
      });
    } catch (error: any) {
      alert(error.message || 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Escanea tu comida</Text>

      {image && <Image source={{ uri: image }} style={styles.image} />}

      {loading && <ActivityIndicator size="large" color="#0f0" />}

      {result && (
        <View style={styles.resultContainer}>
          <Text style={styles.foodName}>{result.food.toUpperCase()}</Text>
          <Text style={styles.confidence}>Confianza: {(result.confidence * 100).toFixed(2)}%</Text>

          <Text style={styles.nutritionTitle}>Información Nutricional (por 100g):</Text>

          {result.nutrition.calories !== undefined && (
            <Text style={styles.nutritionText}>Calorías: {result.nutrition.calories} kcal</Text>
          )}
          {result.nutrition.protein_g !== undefined && (
            <Text style={styles.nutritionText}>Proteínas: {result.nutrition.protein_g} g</Text>
          )}
          {result.nutrition.fat_total_g !== undefined && (
            <Text style={styles.nutritionText}>Grasas totales: {result.nutrition.fat_total_g} g</Text>
          )}
          {result.nutrition.carbohydrates_total_g !== undefined && (
            <Text style={styles.nutritionText}>Carbohidratos: {result.nutrition.carbohydrates_total_g} g</Text>
          )}
          {result.nutrition.fiber_g !== undefined && (
            <Text style={styles.nutritionText}>Fibra: {result.nutrition.fiber_g} g</Text>
          )}
          {result.nutrition.sugar_g !== undefined && (
            <Text style={styles.nutritionText}>Azúcares: {result.nutrition.sugar_g} g</Text>
          )}
        </View>
      )}

      <TouchableOpacity style={styles.button} onPress={pickImage} disabled={loading}>
        <Text style={styles.buttonText}>Elegir desde galería</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={takePhoto} disabled={loading}>
        <Text style={styles.buttonText}>Tomar una foto</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#121212', // fondo oscuro minimalista
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 3,
    color: '#ffffff',
  },
  image: {
    width: 220,
    height: 220,
    borderRadius: 12,
    marginVertical: 20,
    borderWidth: 1,
    borderColor: '#444',
  },
  resultContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    width: '85%',
  },
  foodName: {
    fontWeight: '700',
    fontSize: 22,
    marginBottom: 6,
    color: '#0f0',
    textAlign: 'center',
  },
  confidence: {
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 10,
    fontStyle: 'italic',
  },
  nutritionTitle: {
    fontWeight: '600',
    marginBottom: 8,
    fontSize: 18,
    color: '#0f0',
    textAlign: 'center',
  },
  nutritionText: {
    fontSize: 16,
    color: '#ddd',
    marginBottom: 4,
  },
  button: {
    backgroundColor: '#0f0',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginVertical: 8,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#121212',
    fontSize: 16,
    fontWeight: '600',
  },
});
