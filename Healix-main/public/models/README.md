# Face-API.js Models for Emotion Detection

This directory contains the machine learning models required for facial emotion detection using face-api.js.

## 🎯 **Required Models**

The following model files are needed for the MoodPet emotion mirroring feature:

### Core Detection Models:
- **tiny_face_detector_model-weights_manifest.json**
- **tiny_face_detector_model-shard1**
- **face_landmark_68_model-weights_manifest.json**
- **face_landmark_68_model-shard1**
- **face_recognition_model-weights_manifest.json**
- **face_recognition_model-shard1**
- **face_recognition_model-shard2**

### Emotion Detection Model:
- **face_expression_model-weights_manifest.json**
- **face_expression_model-shard1**

## 📥 **How to Download Models**

### Option 1: Automatic Download Script
```bash
# Run from the project root
node scripts/download-face-models.js
```

### Option 2: Manual Download
1. Visit: https://github.com/justadudewhohacks/face-api.js/tree/master/weights
2. Download all the files listed above
3. Place them in `/public/models/` directory

### Option 3: CDN Loading (Alternative)
If you prefer CDN loading, update the model path in `realEmotionDetection.ts`:
```typescript
private modelNetUrl = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';
```

## 🚀 **Quick Setup**

### Step 1: Download Models
Create a script to download all required models:

```javascript
// scripts/download-face-models.js
const https = require('https');
const fs = require('fs');
const path = require('path');

const baseUrl = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/';
const modelsDir = path.join(__dirname, '..', 'public', 'models');

const modelFiles = [
  'tiny_face_detector_model-weights_manifest.json',
  'tiny_face_detector_model-shard1',
  'face_landmark_68_model-weights_manifest.json', 
  'face_landmark_68_model-shard1',
  'face_recognition_model-weights_manifest.json',
  'face_recognition_model-shard1',
  'face_recognition_model-shard2',
  'face_expression_model-weights_manifest.json',
  'face_expression_model-shard1'
];

// Create models directory if it doesn't exist
if (!fs.existsSync(modelsDir)) {
  fs.mkdirSync(modelsDir, { recursive: true });
}

console.log('📥 Downloading face-api.js models...');

modelFiles.forEach((filename) => {
  const url = baseUrl + filename;
  const filepath = path.join(modelsDir, filename);
  
  https.get(url, (response) => {
    const fileStream = fs.createWriteStream(filepath);
    response.pipe(fileStream);
    
    fileStream.on('finish', () => {
      fileStream.close();
      console.log(`✅ Downloaded: ${filename}`);
    });
  }).on('error', (err) => {
    console.error(`❌ Error downloading ${filename}:`, err.message);
  });
});
```

### Step 2: Verify Installation
After downloading, your `/public/models/` directory should look like:

```
/public/models/
├── tiny_face_detector_model-weights_manifest.json
├── tiny_face_detector_model-shard1
├── face_landmark_68_model-weights_manifest.json
├── face_landmark_68_model-shard1
├── face_recognition_model-weights_manifest.json
├── face_recognition_model-shard1
├── face_recognition_model-shard2
├── face_expression_model-weights_manifest.json
└── face_expression_model-shard1
```

### Step 3: Test Model Loading
Visit the emotion test page to verify models are loading correctly:
- Navigate to `/emotion-test`
- Check the console for "Face detection models loaded successfully"
- Test emotion detection with your camera

## 🔧 **Model Details**

### Tiny Face Detector
- **Size**: ~190KB
- **Purpose**: Fast face detection
- **Performance**: Optimized for real-time detection

### Face Landmark 68
- **Size**: ~350KB  
- **Purpose**: 68-point facial landmark detection
- **Use**: Face alignment and feature extraction

### Face Expression Model
- **Size**: ~310KB
- **Purpose**: 7-emotion classification
- **Emotions**: happy, sad, angry, surprised, fearful, disgusted, neutral

## 📊 **Performance & Optimization**

### Model Loading Time:
- **Total Size**: ~1.2MB
- **Loading Time**: 2-5 seconds (depending on connection)
- **Caching**: Models are cached after first load

### Detection Performance:
- **Frame Rate**: 1-2 FPS (emotion detection)
- **Accuracy**: 70-85% depending on lighting and face angle
- **Latency**: ~200-500ms per detection

### Optimization Tips:
1. **Preload models** on app startup
2. **Cache models** in browser storage
3. **Reduce detection frequency** (1-2 seconds interval)
4. **Use smaller video resolution** (640x480)

## 🐛 **Troubleshooting**

### Models Not Loading?
```javascript
// Check if models directory exists
console.log('Models directory:', '/public/models/');

// Verify model URLs
const modelUrl = window.location.origin + '/models/';
console.log('Model URL:', modelUrl);

// Check network requests in browser dev tools
```

### Face Detection Failing?
- Ensure good lighting conditions
- Face should be clearly visible
- Camera resolution should be adequate
- Check browser camera permissions

### Poor Emotion Accuracy?
- Improve lighting conditions  
- Look directly at camera
- Make clear facial expressions
- Ensure face fills adequate portion of frame

## 🔒 **Privacy & Security**

- **Local Processing**: All emotion detection happens locally
- **No Data Upload**: Facial data never leaves the browser
- **Model Caching**: Models cached locally for better performance
- **HTTPS Required**: Camera access requires secure connection

## 📱 **Browser Compatibility**

### Supported:
- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

### Not Supported:
- Internet Explorer
- Older mobile browsers
- Browsers without WebGL support

## 🚀 **Alternative Models**

If face-api.js models don't work well, consider these alternatives:

### MediaPipe Face Detection:
```javascript
import { FaceDetection } from '@mediapipe/face_detection';
```

### TensorFlow.js Models:
```javascript  
import * as tf from '@tensorflow/tfjs';
// Load custom emotion detection model
const model = await tf.loadLayersModel('/models/emotion-model.json');
```

### OpenCV.js:
```javascript
// For advanced computer vision tasks
import cv from 'opencv.js';
```

## 📚 **Resources**

- **Face-API.js Documentation**: https://github.com/justadudewhohacks/face-api.js
- **Model Training Guide**: https://github.com/justadudewhohacks/face-api.js/tree/master/examples
- **Browser Compatibility**: https://caniuse.com/webgl
- **WebRTC Support**: https://caniuse.com/stream

## 🔄 **Updates**

When updating face-api.js:
1. Check for new model versions
2. Update model URLs if changed
3. Test compatibility with existing code
4. Update this documentation

---

**Status**: ⚠️ Models need to be downloaded before emotion detection works
**Priority**: High - Required for MoodPet emotion mirroring feature
**Last Updated**: Current build