import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function RegisterScreen() {
  const router = useRouter();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    if (!firstName || !lastName || !email || !password) {
      Alert.alert('⚠️ Error', 'Por favor completa todos los campos');
      return;
    }

    try {
      const res = await fetch('http://192.168.1.92:5000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, password }),
      });

      const data = await res.json();
      if (res.ok) {
        Alert.alert('✅ Registro exitoso');
        router.replace('/'); // Regresa a login o inicio
      } else {
        Alert.alert('⚠️ Error', data.message);
      }
    } catch (error) {
      Alert.alert('❌ Error', 'No se pudo conectar con el servidor');
    }
  };

  const goToLogin = () => {
    router.replace('/');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registro</Text>

      <TextInput
        style={styles.input}
        placeholder="Nombre"
        placeholderTextColor="#333"
        value={firstName}
        onChangeText={setFirstName}
      />
      <TextInput
        style={styles.input}
        placeholder="Apellido"
        placeholderTextColor="#333"
        value={lastName}
        onChangeText={setLastName}
      />
      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        placeholderTextColor="#333"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        placeholderTextColor="#333"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Button title="Registrarse" onPress={handleRegister} />

      <TouchableOpacity onPress={goToLogin} style={styles.goBackButton}>
        <Text style={styles.goBackText}>← Volver al inicio</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  input: {
    borderBottomWidth: 1,
    borderColor: '#aaa',
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  title: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginBottom: 24 },
  goBackButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  goBackText: {
    color: '#007AFF',
    fontSize: 16,
  },
});
