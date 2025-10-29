/**
 * Script to download face-api.js models
 * Run with: node scripts/download-face-api-models.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const MODELS_DIR = path.join(__dirname, '..', 'public', 'models');
const BASE_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js-models/master';

const MODELS = [
  // Tiny Face Detector (lightweight, fast)
  'tiny_face_detector_model-weights_manifest.json',
  'tiny_face_detector_model-shard1',
  
  // Face Landmarks
  'face_landmark_68_model-weights_manifest.json',
  'face_landmark_68_model-shard1',
  
  // Face Recognition
  'face_recognition_model-weights_manifest.json',
  'face_recognition_model-shard1',
  'face_recognition_model-shard2',
  
  // Face Expressions (for emotion detection)
  'face_expression_model-weights_manifest.json',
  'face_expression_model-shard1',
];

// Create models directory if it doesn't exist
if (!fs.existsSync(MODELS_DIR)) {
  fs.mkdirSync(MODELS_DIR, { recursive: true });
  console.log(`✅ Created directory: ${MODELS_DIR}`);
}

// Download a single file
function downloadFile(filename) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(MODELS_DIR, filename);
    
    // Skip if file already exists
    if (fs.existsSync(filePath)) {
      console.log(`⏭️  Skipping ${filename} (already exists)`);
      resolve();
      return;
    }

    const url = `${BASE_URL}/${filename}`;
    const file = fs.createWriteStream(filePath);

    console.log(`⬇️  Downloading ${filename}...`);

    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${filename}: ${response.statusCode}`));
        return;
      }

      response.pipe(file);

      file.on('finish', () => {
        file.close();
        console.log(`✅ Downloaded ${filename}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filePath, () => {});
      reject(err);
    });
  });
}

// Download all models
async function downloadAllModels() {
  console.log('🚀 Starting face-api.js models download...\n');

  try {
    for (const model of MODELS) {
      await downloadFile(model);
    }
    console.log('\n✅ All models downloaded successfully!');
    console.log(`📁 Models location: ${MODELS_DIR}`);
  } catch (error) {
    console.error('\n❌ Error downloading models:', error.message);
    process.exit(1);
  }
}

downloadAllModels();
