/**
 * Helper script to download the Teddy Rive file
 * 
 * Note: This is a placeholder script. You'll need to manually download
 * the file from the Rive community.
 * 
 * Steps:
 * 1. Visit: https://rive.app/community/1689-login-form-with-teddy/
 * 2. Click "Download" or "Open in Editor"
 * 3. Save the file as "login-teddy.riv"
 * 4. Place it in the public/ directory
 */

const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'public');
const targetFile = path.join(publicDir, 'login-teddy.riv');

console.log('🐻 Teddy Rive File Setup');
console.log('========================\n');

if (fs.existsSync(targetFile)) {
  console.log('✅ login-teddy.riv already exists in public/ directory');
  console.log('   You\'re all set!\n');
} else {
  console.log('❌ login-teddy.riv not found in public/ directory\n');
  console.log('📥 Please download the file manually:');
  console.log('   1. Visit: https://rive.app/community/1689-login-form-with-teddy/');
  console.log('   2. Download the Rive file');
  console.log('   3. Save it as "login-teddy.riv"');
  console.log('   4. Place it in the public/ directory\n');
  console.log('💡 Alternative: You can use any Rive file with a compatible state machine');
  console.log('   See ANIMATED_LOGIN_SETUP.md for details\n');
}

// Check if bear.riv exists as a fallback
const bearFile = path.join(publicDir, 'bear.riv');
if (fs.existsSync(bearFile)) {
  console.log('ℹ️  Note: You have bear.riv in your public/ directory');
  console.log('   If it has a compatible state machine, you can use it by updating');
  console.log('   the src path in AnimatedLoginForm.tsx and AnimatedSignUpForm.tsx\n');
}
