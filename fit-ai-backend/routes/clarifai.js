const express = require('express');
const router = express.Router();
const { ClarifaiStub, grpc } = require('clarifai-nodejs-grpc');

// Configura el PAT desde .env
const PAT = process.env.CLARIFAI_PAT;
const USER_ID = 'clarifai';
const APP_ID = 'main';
const MODEL_ID = 'food-item-recognition';
const MODEL_VERSION_ID = '1d5fd481e0cf4826aa72ec3ff049e044';

const stub = ClarifaiStub.grpc();
const metadata = new grpc.Metadata();
metadata.set("authorization", "Key " + PAT);

router.post('/analyze', async (req, res) => {
  const { imageUrl } = req.body;

  stub.PostModelOutputs(
    {
      user_app_id: {
        user_id: USER_ID,
        app_id: APP_ID,
      },
      model_id: MODEL_ID,
      version_id: MODEL_VERSION_ID,
      inputs: [
        {
          data: {
            image: {
              url: imageUrl,
              allow_duplicate_url: true,
            },
          },
        },
      ],
    },
    metadata,
    (err, response) => {
      if (err) {
        console.error('Error al conectar con Clarifai:', err);
        return res.status(500).json({ error: 'Error al conectar con Clarifai' });
      }

      if (response.status.code !== 10000) {
        console.error('Error de Clarifai:', response.status.description);
        return res.status(500).json({ error: 'Error de Clarifai' });
      }

      const concepts = response.outputs[0].data.concepts;
      res.json({ concepts });
    }
  );
});

module.exports = router;
