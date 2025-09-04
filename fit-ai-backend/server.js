const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const { ClarifaiStub, grpc } = require('clarifai-nodejs-grpc');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const app = express();
const PORT = process.env.PORT || 5000;

// --- Validar variables necesarias ---
if (!process.env.MONGO_URI || !process.env.CLARIFAI_PAT) {
  console.error('❌ Faltan variables en .env (MONGO_URI o CLARIFAI_PAT)');
  process.exit(1);
}

// --- Middlewares ---
app.use(cors());
app.use(express.json());

// --- MongoDB ---
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Conectado a MongoDB Atlas'))
  .catch((err) => console.error('❌ Error al conectar a MongoDB:', err));

// --- Modelos ---
const User = mongoose.model('User', new mongoose.Schema({
  firstName: { type: String, required: true },  
  lastName: { type: String, required: true }, 
  email: { type: String, required: true, unique: true },  
  password: { type: String, required: true }
}));

const FoodScan = mongoose.model('FoodScan', new mongoose.Schema({
  email: String,
  imageUrl: String,
  food: String,
  nutrition: Object,
  date: { type: Date, default: Date.now }
}));

// --- Autenticación ---
app.post('/register', async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ message: 'Faltan datos requeridos' });
  }

  try {
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'El correo ya está registrado' });

    const newUser = new User({ firstName, lastName, email, password });
    await newUser.save();
    res.status(201).json({ message: 'Usuario registrado correctamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error al registrar usuario', error: err.message });
  }
});


app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'Correo o contraseña incorrectos' });
    }
    // Devuelve datos básicos (sin contraseña)
    res.status(200).json({ 
      message: 'Inicio de sesión exitoso',
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Error al iniciar sesión', error: err.message });
  }
});


// --- Clarifai ---
const PAT = process.env.CLARIFAI_PAT;
const USER_ID = 'clarifai';
const APP_ID = 'main';
const MODEL_ID = 'food-item-recognition';
const MODEL_VERSION_ID = '1d5fd481e0cf4826aa72ec3ff049e044';

const stub = ClarifaiStub.grpc();
const metadata = new grpc.Metadata();
metadata.set("authorization", "Key " + PAT);

// --- Análisis ---
app.post('/analyze-nutrition', async (req, res) => {
  const { imageUrl } = req.body;
  if (!imageUrl) return res.status(400).json({ error: 'Falta imageUrl en el body' });

  try {
    const clarifaiResponse = await new Promise((resolve, reject) => {
      stub.PostModelOutputs(
        {
          user_app_id: { user_id: USER_ID, app_id: APP_ID },
          model_id: MODEL_ID,
          version_id: MODEL_VERSION_ID,
          inputs: [{ data: { image: { url: imageUrl, allow_duplicate_url: true } } }],
        },
        metadata,
        (err, response) => {
          if (err) reject(err);
          else if (response.status.code !== 10000) reject(new Error(response.status.description));
          else resolve(response);
        }
      );
    });

    const concepts = clarifaiResponse.outputs[0].data.concepts;
    if (!concepts || concepts.length === 0) {
      return res.status(404).json({ error: 'No se pudo identificar alimento' });
    }

    const topConcept = concepts[0].name;

    const calorieNinjasRes = await fetch(`https://api.calorieninjas.com/v1/nutrition?query=${encodeURIComponent(topConcept)}`, {
      headers: { 'X-Api-Key': process.env.CALORIE_NINJAS_API_KEY },
    });

    const calorieNinjasData = await calorieNinjasRes.json();

    if (!calorieNinjasRes.ok || !calorieNinjasData.items || calorieNinjasData.items.length === 0) {
      return res.status(404).json({ error: 'No se encontraron datos nutricionales para el alimento: ' + topConcept });
    }

    res.json({
      food: topConcept,
      confidence: concepts[0].value,
      nutrition: calorieNinjasData.items[0],
    });

  } catch (error) {
    console.error('Error en /analyze-nutrition:', error);
    res.status(500).json({ error: error.message || 'Error interno del servidor' });
  }
});

// --- Guardar escaneo ---
app.post('/save-scan', async (req, res) => {
  const { email, imageUrl, food, nutrition } = req.body;

  if (!email || !imageUrl || !food || !nutrition) {
    return res.status(400).json({ error: 'Faltan datos para guardar el escaneo' });
  }

  try {
    const scan = new FoodScan({ email, imageUrl, food, nutrition });
    await scan.save();
    res.status(201).json({ message: 'Escaneo guardado correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al guardar historial', details: err.message });
  }
});

// --- Obtener historial ---
app.get('/history', async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ error: 'Falta el email' });

  try {
    const scans = await FoodScan.find({ email }).sort({ date: -1 });
    res.json( scans );  // ✅ Esto es lo que espera el frontend
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener historial', message: err.message });
  }
});

// --- Inicio del servidor ---
app.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en http://192.168.1.92:${PORT}`);
});
