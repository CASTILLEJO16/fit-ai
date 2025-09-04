const fetch = require('node-fetch');
require('dotenv').config();

const CLARIFAI_API_URL = 'https://api.clarifai.com/v2/models/food-item-recognition/outputs';
const PAT = process.env.CLARIFAI_PAT;

async function analyzeImage(imageUrl) {
  const response = await fetch(CLARIFAI_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Key ${PAT}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: [
        {
          data: {
            image: {
              url: imageUrl,
            },
          },
        },
      ],
    }),
  });

  const data = await response.json();

  if (!data.outputs || !data.outputs[0].data.concepts) {
    throw new Error('Clarifai no devolvió resultados válidos.');
  }

  return data.outputs[0].data.concepts;
}

module.exports = analyzeImage;
