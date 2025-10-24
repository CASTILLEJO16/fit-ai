import { Picker } from "@react-native-picker/picker";
import { RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

// Rutas y parámetros de navegación
type RootStackParamList = {
  Home: undefined;
  Register: undefined; // ya no necesitamos email aquí
};

type RegisterScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Register">;
  route: RouteProp<RootStackParamList, "Register">;
};

export default function Register({ navigation }: RegisterScreenProps) {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    age: "",
    gender: "",
    height: "",
    weight: "",
    activity: "",
    goal: "",
    diet: "",
    allergies: "",
  });

  const handleChange = (key: keyof typeof form, value: string) => {
    setForm({ ...form, [key]: value });
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch("http://192.168.1.98:5000/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (response.ok) {
        Alert.alert("✅ Registro exitoso", "Tu perfil personalizado se ha creado correctamente");
        navigation.navigate("Home");
      } else {
        Alert.alert("⚠️ Error", "No se pudo completar el registro");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("❌ Error de conexión");
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 30 }}>
      <Text style={styles.title}>Registro y Perfil de Objetivo</Text>

      {/* Nombre */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Nombre</Text>
        <TextInput
          style={styles.input}
          placeholder="Tu nombre"
          onChangeText={(v) => handleChange("firstName", v)}
        />
      </View>

      {/* Apellido */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Apellido</Text>
        <TextInput
          style={styles.input}
          placeholder="Tu apellido"
          onChangeText={(v) => handleChange("lastName", v)}
        />
      </View>

      {/* Email */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Correo electrónico</Text>
        <TextInput
          style={styles.input}
          placeholder="ejemplo@mail.com"
          keyboardType="email-address"
          autoCapitalize="none"
          onChangeText={(v) => handleChange("email", v)}
        />
      </View>

      {/* Contraseña */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Contraseña</Text>
        <TextInput
          style={styles.input}
          placeholder="******"
          secureTextEntry
          onChangeText={(v) => handleChange("password", v)}
        />
      </View>

      {/* Edad */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Edad</Text>
        <TextInput
          keyboardType="numeric"
          style={styles.input}
          placeholder="Ej: 25"
          onChangeText={(v) => handleChange("age", v)}
        />
      </View>

      {/* Género */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Género</Text>
        <View style={styles.pickerWrapper}>
          <Picker selectedValue={form.gender} onValueChange={(v) => handleChange("gender", v)}>
            <Picker.Item label="Masculino" value="Masculino" />
            <Picker.Item label="Femenino" value="Femenino" />
          </Picker>
        </View>
      </View>

      {/* Altura */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Altura (cm)</Text>
        <TextInput
          keyboardType="numeric"
          style={styles.input}
          placeholder="Ej: 175"
          onChangeText={(v) => handleChange("height", v)}
        />
      </View>

      {/* Peso */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Peso (kg)</Text>
        <TextInput
          keyboardType="numeric"
          style={styles.input}
          placeholder="Ej: 70"
          onChangeText={(v) => handleChange("weight", v)}
        />
      </View>

      {/* Nivel de actividad */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Nivel de actividad</Text>
        <View style={styles.pickerWrapper}>
          <Picker selectedValue={form.activity} onValueChange={(v) => handleChange("activity", v)}>
            <Picker.Item label="Sedentario" value="Sedentario" />
            <Picker.Item label="Moderado" value="Moderado" />
            <Picker.Item label="Activo" value="Activo" />
          </Picker>
        </View>
      </View>

      {/* Objetivo */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Objetivo</Text>
        <View style={styles.pickerWrapper}>
          <Picker selectedValue={form.goal} onValueChange={(v) => handleChange("goal", v)}>
            <Picker.Item label="Bajar de peso" value="Bajar de peso" />
            <Picker.Item label="Mantener peso" value="Mantener peso" />
            <Picker.Item label="Aumentar masa muscular" value="Aumentar masa muscular" />
          </Picker>
        </View>
      </View>

      {/* Tipo de dieta */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Tipo de dieta</Text>
        <View style={styles.pickerWrapper}>
          <Picker selectedValue={form.diet} onValueChange={(v) => handleChange("diet", v)}>
            <Picker.Item label="Balanceada" value="Balanceada" />
            <Picker.Item label="Vegetariana" value="Vegetariana" />
            <Picker.Item label="Keto" value="Keto" />
          </Picker>
        </View>
      </View>

      {/* Alergias */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Alimentos o alergias</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: maní, gluten..."
          onChangeText={(v) => handleChange("allergies", v)}
        />
      </View>

      {/* Botón */}
      <TouchableOpacity onPress={handleSubmit} style={styles.button}>
        <Text style={styles.buttonText}>Registrarme y Guardar Perfil</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// Estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: "#1e2020ff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 20,
    color: "#28d61bff",
    textAlign: "center",
  },
  fieldContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: "#06d70aff",
  },
  input: {
    backgroundColor: "#f5efefff",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#10e117ff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  pickerWrapper: {
    backgroundColor: "#7ab476ff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#1ae40bff",
    overflow: "hidden",
  },
  button: {
    backgroundColor: "#4CAF50",
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 20,
    shadowColor: "#20d826ff",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 16,
  },
});
