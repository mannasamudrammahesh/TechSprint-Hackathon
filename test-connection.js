#!/usr/bin/env node

/**
 * Healix Connection Test Script
 * Tests the connection between frontend and backend
 */

const https = require('https');
const http = require('http');

// Test configuration
const BACKEND_URL = 'http://127.0.0.1:8000';
const FRONTEND_URL = 'http://localhost:3000';

console.log('🔍 Healix Connection Diagnostic Tool');
console.log('=====================================\n');

async function testBackendDirect() {
  console.log('1. Testing direct backend connection...');
  
  try {
    const response = await fetch(`${BACKEND_URL}/health`);
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Backend is healthy');
      console.log(`   Status: ${data.status}`);
      console.log(`   Models loaded: ${data.models_loaded}`);
      console.log(`   Chat available: ${data.available_features.chat}`);
    } else {
      console.log('❌ Backend returned error:', response.status);
    }
  } catch (error) {
    console.log('❌ Cannot connect to backend:', error.message);
    console.log('   Make sure backend is running: cd backend && python main.py');
    return false;
  }
  
  return true;
}

async function testBackendChat() {
  console.log('\n2. Testing backend chat endpoint...');
  
  try {
    const response = await fetch(`${BACKEND_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: 'Hello, this is a test message',
        session_id: 'diagnostic_test',
        language: 'en'
      })
    });
    
    const data = await response.json();
    
    if (response.ok && data.reply) {
      console.log('✅ Chat endpoint working');
      console.log(`   Response preview: ${data.reply.substring(0, 80)}...`);
    } else {
      console.log('❌ Chat endpoint failed:', data);
    }
  } catch (error) {
    console.log('❌ Chat test failed:', error.message);
    return false;
  }
  
  return true;
}

async function testFrontendAPI() {
  console.log('\n3. Testing frontend API route...');
  
  try {
    const response = await fetch(`${FRONTEND_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Hello, this is a test through frontend API',
        sessionId: 'diagnostic_test'
      })
    });
    
    const data = await response.json();
    
    if (response.ok && data.text && !data.error) {
      console.log('✅ Frontend API route working');
      console.log(`   Response preview: ${data.text.substring(0, 80)}...`);
    } else {
      console.log('❌ Frontend API route failed:', data);
    }
  } catch (error) {
    console.log('❌ Frontend API test failed:', error.message);
    console.log('   Make sure frontend is running: cd Healix-main && npm run dev');
    return false;
  }
  
  return true;
}

async function runDiagnostics() {
  const backendOk = await testBackendDirect();
  
  if (backendOk) {
    await testBackendChat();
    await testFrontendAPI();
  }
  
  console.log('\n📋 Diagnostic Summary:');
  console.log('======================');
  console.log('If all tests pass ✅, your chatbot should work!');
  console.log('If any test fails ❌, check the error messages above.');
  console.log('\nCommon fixes:');
  console.log('• Backend not running: cd backend && python main.py');
  console.log('• Frontend not running: cd Healix-main && npm run dev');
  console.log('• Port mismatch: Check .env.local has correct BACKEND_URL');
  console.log('• API key issues: Check backend/.env has GEMINI_API_KEY');
}

// Add fetch polyfill for older Node.js versions
if (!global.fetch) {
  global.fetch = require('node-fetch');
}

runDiagnostics().catch(console.error);