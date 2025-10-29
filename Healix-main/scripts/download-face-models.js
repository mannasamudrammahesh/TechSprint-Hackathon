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
  console.log('📁 Created models directory');
}

console.log('🚀 Starting face-api.js models download...');
console.log(`📍 Target directory: ${modelsDir}`);
console.log(`📦 Downloading ${modelFiles.length} model files...`);
console.log('');

let completed = 0;
let failed = 0;

function downloadFile(filename) {
  return new Promise((resolve, reject) => {
    const url = baseUrl + filename;
    const filepath = path.join(modelsDir, filename);

    // Check if file already exists
    if (fs.existsSync(filepath)) {
      console.log(`⏭️  ${filename} - Already exists, skipping`);
      completed++;
      resolve();
      return;
    }

    console.log(`⬇️  ${filename} - Starting download...`);

    const request = https.get(url, (response) => {
      // Check if response is successful
      if (response.statusCode !== 200) {
        console.error(`❌ ${filename} - HTTP ${response.statusCode}`);
        failed++;
        reject(new Error(`HTTP ${response.statusCode}`));
        return;
      }

      const fileStream = fs.createWriteStream(filepath);

      // Track download progress
      const totalSize = parseInt(response.headers['content-length'], 10);
      let downloadedSize = 0;

      response.on('data', (chunk) => {
        downloadedSize += chunk.length;
        if (totalSize) {
          const progress = ((downloadedSize / totalSize) * 100).toFixed(1);
          process.stdout.write(`\r   📈 ${filename} - ${progress}% (${Math.round(downloadedSize/1024)}KB/${Math.round(totalSize/1024)}KB)`);
        }
      });

      response.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        console.log(`\n✅ ${filename} - Download complete!`);
        completed++;
        resolve();
      });

      fileStream.on('error', (err) => {
        console.error(`\n❌ ${filename} - File write error:`, err.message);
        failed++;
        // Clean up partial file
        if (fs.existsSync(filepath)) {
          fs.unlinkSync(filepath);
        }
        reject(err);
      });

    }).on('error', (err) => {
      console.error(`❌ ${filename} - Network error:`, err.message);
      failed++;
      // Clean up partial file
      const filepath = path.join(modelsDir, filename);
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
      reject(err);
    });

    // Set timeout for requests
    request.setTimeout(30000, () => {
      request.destroy();
      console.error(`❌ ${filename} - Download timeout`);
      failed++;
      reject(new Error('Download timeout'));
    });
  });
}

// Download all models sequentially to avoid overwhelming the server
async function downloadAllModels() {
  console.log('⏰ Starting sequential download...\n');

  for (const filename of modelFiles) {
    try {
      await downloadFile(filename);
      // Small delay between downloads
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`💥 Failed to download ${filename}:`, error.message);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 DOWNLOAD SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Successfully downloaded: ${completed}/${modelFiles.length}`);
  console.log(`❌ Failed downloads: ${failed}/${modelFiles.length}`);

  if (completed === modelFiles.length) {
    console.log('🎉 All models downloaded successfully!');
    console.log('');
    console.log('📋 Next Steps:');
    console.log('1. Run: npm run dev');
    console.log('2. Navigate to: /emotion-test');
    console.log('3. Test emotion detection with your camera');
    console.log('4. Check console for "Face detection models loaded successfully"');
  } else if (failed > 0) {
    console.log('⚠️  Some models failed to download.');
    console.log('💡 Tips:');
    console.log('- Check your internet connection');
    console.log('- Run the script again (existing files will be skipped)');
    console.log('- Try downloading manually from GitHub');
    console.log('- Alternatively, use CDN loading by updating modelNetUrl in realEmotionDetection.ts');
  }

  // Verify installation
  console.log('\n🔍 Verifying installation...');
  const existingFiles = fs.readdirSync(modelsDir);
  const missingFiles = modelFiles.filter(file => !existingFiles.includes(file));

  if (missingFiles.length === 0) {
    console.log('✅ All required model files are present');

    // Calculate total size
    let totalSize = 0;
    existingFiles.forEach(file => {
      const filepath = path.join(modelsDir, file);
      if (fs.existsSync(filepath)) {
        totalSize += fs.statSync(filepath).size;
      }
    });

    console.log(`📏 Total model size: ${Math.round(totalSize / 1024 / 1024 * 100) / 100} MB`);
  } else {
    console.log('❌ Missing files:');
    missingFiles.forEach(file => console.log(`   - ${file}`));
  }

  console.log('\n🚀 Ready to start emotion detection!');
}

// Handle process interruption
process.on('SIGINT', () => {
  console.log('\n\n🛑 Download interrupted by user');
  console.log(`📊 Progress: ${completed}/${modelFiles.length} completed`);
  process.exit(0);
});

// Start the download process
downloadAllModels().catch((error) => {
  console.error('\n💥 Fatal error during download:', error);
  process.exit(1);
});
