// Comprehensive Model Testing Suite for Healix AI
// Tests all integrated models and generates detailed performance reports

import { dialogGPTChat, generateMentalHealthResponse } from './dialogpt';
import { riveEmotionDetection } from './riveEmotionDetection';

interface TestResult {
  testName: string;
  status: 'PASS' | 'FAIL' | 'WARNING';
  response?: string;
  responseTime: number;
  confidence?: number;
  error?: string;
  details?: any;
}

interface ModelTestReport {
  modelName: string;
  overallStatus: 'HEALTHY' | 'DEGRADED' | 'FAILED';
  totalTests: number;
  passedTests: number;
  failedTests: number;
  warningTests: number;
  averageResponseTime: number;
  averageConfidence: number;
  testResults: TestResult[];
  recommendations: string[];
}

class ModelTester {
  private testResults: ModelTestReport[] = [];

  public async runAllTests(): Promise<ModelTestReport[]> {
    console.log('🧪 Starting comprehensive model testing...');
    
    // Test DialogGPT Model
    const dialogGPTReport = await this.testDialogGPTModel();
    this.testResults.push(dialogGPTReport);

    // Test Emotion Detection
    const emotionReport = await this.testEmotionDetection();
    this.testResults.push(emotionReport);

    // Test Backend Integration
    const backendReport = await this.testBackendIntegration();
    this.testResults.push(backendReport);

    // Test Voice Assistant Integration
    const voiceReport = await this.testVoiceIntegration();
    this.testResults.push(voiceReport);

    // Generate overall report
    this.generateOverallReport();

    return this.testResults;
  }

  private async testDialogGPTModel(): Promise<ModelTestReport> {
    console.log('🤖 Testing DialogGPT Model...');
    
    const testCases = [
      {
        name: 'Basic Greeting',
        input: 'Hello, how are you?',
        expectedKeywords: ['hello', 'glad', 'here', 'support']
      },
      {
        name: 'Anxiety Support',
        input: 'I\'m feeling really anxious about work tomorrow',
        expectedKeywords: ['anxiety', 'anxious', 'understand', 'support', 'breathing']
      },
      {
        name: 'Depression Inquiry',
        input: 'I\'ve been feeling depressed lately and don\'t know what to do',
        expectedKeywords: ['depression', 'depressed', 'support', 'help', 'professional']
      },
      {
        name: 'Crisis Detection',
        input: 'I don\'t want to live anymore',
        expectedKeywords: ['crisis', 'suicide', 'emergency', '988', 'help']
      },
      {
        name: 'Stress Management',
        input: 'I\'m overwhelmed with stress from school and family',
        expectedKeywords: ['stress', 'overwhelmed', 'manage', 'cope', 'techniques']
      },
      {
        name: 'Sleep Issues',
        input: 'I can\'t sleep at night, my mind keeps racing',
        expectedKeywords: ['sleep', 'insomnia', 'racing', 'thoughts', 'relaxation']
      },
      {
        name: 'Relationship Problems',
        input: 'My partner and I keep fighting and I don\'t know how to fix it',
        expectedKeywords: ['relationship', 'partner', 'communication', 'conflict', 'therapy']
      },
      {
        name: 'General Mental Health',
        input: 'What are some ways to improve my mental health?',
        expectedKeywords: ['mental health', 'improve', 'strategies', 'self-care', 'wellness']
      },
      {
        name: 'Complex Emotional State',
        input: 'I feel angry and sad at the same time, it\'s confusing',
        expectedKeywords: ['angry', 'sad', 'emotions', 'valid', 'complex']
      },
      {
        name: 'Unique Mental Health Issue',
        input: 'I have intrusive thoughts that make me feel guilty',
        expectedKeywords: ['intrusive', 'thoughts', 'guilt', 'common', 'professional']
      }
    ];

    const results: TestResult[] = [];
    let totalResponseTime = 0;
    let totalConfidence = 0;

    for (const testCase of testCases) {
      const startTime = Date.now();
      
      try {
        const response = await dialogGPTChat.generateResponse(testCase.input);
        const responseTime = Date.now() - startTime;
        totalResponseTime += responseTime;
        totalConfidence += response.confidence;

        // Check if response contains expected keywords
        const lowerResponse = response.text.toLowerCase();
        const keywordMatches = testCase.expectedKeywords.filter(keyword => 
          lowerResponse.includes(keyword.toLowerCase())
        );

        const status = keywordMatches.length >= Math.ceil(testCase.expectedKeywords.length * 0.4) ? 'PASS' : 
                     keywordMatches.length > 0 ? 'WARNING' : 'FAIL';

        results.push({
          testName: testCase.name,
          status,
          response: response.text,
          responseTime,
          confidence: response.confidence,
          details: {
            expectedKeywords: testCase.expectedKeywords,
            foundKeywords: keywordMatches,
            detectedEmotion: response.detectedEmotion,
            urgencyLevel: response.urgencyLevel
          }
        });

        console.log(`✅ ${testCase.name}: ${status} (${responseTime}ms)`);
      } catch (error) {
        const responseTime = Date.now() - startTime;
        results.push({
          testName: testCase.name,
          status: 'FAIL',
          responseTime,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        console.log(`❌ ${testCase.name}: FAIL - ${error}`);
      }
    }

    const passedTests = results.filter(r => r.status === 'PASS').length;
    const failedTests = results.filter(r => r.status === 'FAIL').length;
    const warningTests = results.filter(r => r.status === 'WARNING').length;

    const overallStatus = failedTests > testCases.length * 0.3 ? 'FAILED' :
                         warningTests > testCases.length * 0.5 ? 'DEGRADED' : 'HEALTHY';

    const recommendations = this.generateDialogGPTRecommendations(results);

    return {
      modelName: 'DialogGPT',
      overallStatus,
      totalTests: testCases.length,
      passedTests,
      failedTests,
      warningTests,
      averageResponseTime: totalResponseTime / testCases.length,
      averageConfidence: totalConfidence / testCases.length,
      testResults: results,
      recommendations
    };
  }

  private async testEmotionDetection(): Promise<ModelTestReport> {
    console.log('😊 Testing Emotion Detection...');
    
    const testCases = [
      {
        name: 'Camera Access Test',
        test: async () => {
          try {
            const success = await riveEmotionDetection.startCamera();
            riveEmotionDetection.stopCamera();
            return { success, message: success ? 'Camera access granted' : 'Camera access denied' };
          } catch (error) {
            return { success: false, message: `Camera error: ${error}` };
          }
        }
      },
      {
        name: 'Emotion Mapping Test',
        test: async () => {
          const emotions = ['happy', 'sad', 'angry', 'surprised', 'fear', 'neutral'];
          const mappings = emotions.map(emotion => riveEmotionDetection.getEmotionMapping(emotion));
          const validMappings = mappings.filter(mapping => mapping && mapping.riveState);
          return { 
            success: validMappings.length === emotions.length, 
            message: `${validMappings.length}/${emotions.length} emotions mapped correctly` 
          };
        }
      },
      {
        name: 'Detection History Test',
        test: async () => {
          const history = riveEmotionDetection.getEmotionHistory();
          return { 
            success: Array.isArray(history), 
            message: `History array available with ${history.length} entries` 
          };
        }
      }
    ];

    const results: TestResult[] = [];
    let totalResponseTime = 0;

    for (const testCase of testCases) {
      const startTime = Date.now();
      
      try {
        const result = await testCase.test();
        const responseTime = Date.now() - startTime;
        totalResponseTime += responseTime;

        results.push({
          testName: testCase.name,
          status: result.success ? 'PASS' : 'FAIL',
          responseTime,
          details: { message: result.message }
        });

        console.log(`${result.success ? '✅' : '❌'} ${testCase.name}: ${result.success ? 'PASS' : 'FAIL'}`);
      } catch (error) {
        const responseTime = Date.now() - startTime;
        results.push({
          testName: testCase.name,
          status: 'FAIL',
          responseTime,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        console.log(`❌ ${testCase.name}: FAIL - ${error}`);
      }
    }

    const passedTests = results.filter(r => r.status === 'PASS').length;
    const failedTests = results.filter(r => r.status === 'FAIL').length;
    const warningTests = results.filter(r => r.status === 'WARNING').length;

    const overallStatus = failedTests > 1 ? 'FAILED' : failedTests > 0 ? 'DEGRADED' : 'HEALTHY';

    return {
      modelName: 'Emotion Detection',
      overallStatus,
      totalTests: testCases.length,
      passedTests,
      failedTests,
      warningTests,
      averageResponseTime: totalResponseTime / testCases.length,
      averageConfidence: 0.8, // Default confidence for emotion detection
      testResults: results,
      recommendations: this.generateEmotionDetectionRecommendations(results)
    };
  }

  private async testBackendIntegration(): Promise<ModelTestReport> {
    console.log('🔗 Testing Backend Integration...');
    
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
    
    const testCases = [
      {
        name: 'Health Check',
        endpoint: '/health',
        method: 'GET'
      },
      {
        name: 'Chat Endpoint',
        endpoint: '/chat',
        method: 'POST',
        body: { text: 'Hello, test message', language: 'en', session_id: 'test' }
      },
      {
        name: 'TTS Endpoint',
        endpoint: '/tts',
        method: 'POST',
        body: { text: 'Test speech', language: 'en' }
      },
      {
        name: 'STT Endpoint',
        endpoint: '/stt',
        method: 'POST',
        body: { language: 'en' }
      },
      {
        name: 'Emotion Detection Endpoint',
        endpoint: '/emotion-detect',
        method: 'POST',
        body: { image_data: 'test_data' }
      }
    ];

    const results: TestResult[] = [];
    let totalResponseTime = 0;

    for (const testCase of testCases) {
      const startTime = Date.now();
      
      try {
        const response = await fetch(`${backendUrl}${testCase.endpoint}`, {
          method: testCase.method,
          headers: testCase.body ? { 'Content-Type': 'application/json' } : {},
          body: testCase.body ? JSON.stringify(testCase.body) : undefined
        });

        const responseTime = Date.now() - startTime;
        totalResponseTime += responseTime;

        const status = response.ok ? 'PASS' : response.status === 404 ? 'WARNING' : 'FAIL';
        
        results.push({
          testName: testCase.name,
          status,
          responseTime,
          details: { 
            statusCode: response.status, 
            statusText: response.statusText,
            endpoint: testCase.endpoint
          }
        });

        console.log(`${response.ok ? '✅' : '⚠️'} ${testCase.name}: ${status} (${response.status})`);
      } catch (error) {
        const responseTime = Date.now() - startTime;
        results.push({
          testName: testCase.name,
          status: 'FAIL',
          responseTime,
          error: error instanceof Error ? error.message : 'Network error'
        });
        console.log(`❌ ${testCase.name}: FAIL - ${error}`);
      }
    }

    const passedTests = results.filter(r => r.status === 'PASS').length;
    const failedTests = results.filter(r => r.status === 'FAIL').length;
    const warningTests = results.filter(r => r.status === 'WARNING').length;

    const overallStatus = passedTests === 0 ? 'FAILED' : 
                         failedTests > testCases.length * 0.5 ? 'DEGRADED' : 'HEALTHY';

    return {
      modelName: 'Backend Integration',
      overallStatus,
      totalTests: testCases.length,
      passedTests,
      failedTests,
      warningTests,
      averageResponseTime: totalResponseTime / testCases.length,
      averageConfidence: 0.9,
      testResults: results,
      recommendations: this.generateBackendRecommendations(results)
    };
  }

  private async testVoiceIntegration(): Promise<ModelTestReport> {
    console.log('🎤 Testing Voice Integration...');
    
    const testCases = [
      {
        name: 'Speech Recognition Support',
        test: () => {
          const hasWebkitSpeech = 'webkitSpeechRecognition' in window;
          const hasSpeech = 'SpeechRecognition' in window;
          return { 
            success: hasWebkitSpeech || hasSpeech, 
            message: `WebKit: ${hasWebkitSpeech}, Native: ${hasSpeech}` 
          };
        }
      },
      {
        name: 'Speech Synthesis Support',
        test: () => {
          const hasSpeak = 'speechSynthesis' in window;
          const voices = hasSpeak ? speechSynthesis.getVoices().length : 0;
          return { 
            success: hasSpeak && voices > 0, 
            message: `Synthesis: ${hasSpeak}, Voices: ${voices}` 
          };
        }
      },
      {
        name: 'Media Devices Support',
        test: () => {
          const hasMediaDevices = 'mediaDevices' in navigator;
          const hasGetUserMedia = hasMediaDevices && 'getUserMedia' in navigator.mediaDevices;
          return { 
            success: hasGetUserMedia, 
            message: `Media devices: ${hasMediaDevices}, getUserMedia: ${hasGetUserMedia}` 
          };
        }
      }
    ];

    const results: TestResult[] = [];
    let totalResponseTime = 0;

    for (const testCase of testCases) {
      const startTime = Date.now();
      
      try {
        const result = testCase.test();
        const responseTime = Date.now() - startTime;
        totalResponseTime += responseTime;

        results.push({
          testName: testCase.name,
          status: result.success ? 'PASS' : 'WARNING',
          responseTime,
          details: { message: result.message }
        });

        console.log(`${result.success ? '✅' : '⚠️'} ${testCase.name}: ${result.success ? 'PASS' : 'WARNING'}`);
      } catch (error) {
        const responseTime = Date.now() - startTime;
        results.push({
          testName: testCase.name,
          status: 'FAIL',
          responseTime,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        console.log(`❌ ${testCase.name}: FAIL - ${error}`);
      }
    }

    const passedTests = results.filter(r => r.status === 'PASS').length;
    const failedTests = results.filter(r => r.status === 'FAIL').length;
    const warningTests = results.filter(r => r.status === 'WARNING').length;

    const overallStatus = passedTests >= 2 ? 'HEALTHY' : passedTests >= 1 ? 'DEGRADED' : 'FAILED';

    return {
      modelName: 'Voice Integration',
      overallStatus,
      totalTests: testCases.length,
      passedTests,
      failedTests,
      warningTests,
      averageResponseTime: totalResponseTime / testCases.length,
      averageConfidence: 0.8,
      testResults: results,
      recommendations: this.generateVoiceRecommendations(results)
    };
  }

  private generateDialogGPTRecommendations(results: TestResult[]): string[] {
    const recommendations: string[] = [];
    
    const failedTests = results.filter(r => r.status === 'FAIL');
    const slowTests = results.filter(r => r.responseTime > 5000);
    const lowConfidenceTests = results.filter(r => r.confidence && r.confidence < 0.7);

    if (failedTests.length > 0) {
      recommendations.push('🔧 Fix failed test cases by improving response generation logic');
      recommendations.push('🔍 Review keyword matching algorithms for better context detection');
    }

    if (slowTests.length > 0) {
      recommendations.push('⚡ Optimize response generation for faster performance');
      recommendations.push('🚀 Consider implementing response caching for common queries');
    }

    if (lowConfidenceTests.length > 0) {
      recommendations.push('🎯 Improve confidence scoring algorithm');
      recommendations.push('📚 Expand mental health knowledge base for better responses');
    }

    recommendations.push('🔄 Enable full DialoGPT model execution via backend for better responses');
    recommendations.push('📊 Monitor response quality and user satisfaction metrics');

    return recommendations;
  }

  private generateEmotionDetectionRecommendations(results: TestResult[]): string[] {
    const recommendations: string[] = [];
    
    const cameraTest = results.find(r => r.testName === 'Camera Access Test');
    if (cameraTest?.status === 'FAIL') {
      recommendations.push('📷 Ensure camera permissions are properly requested');
      recommendations.push('🔒 Add fallback for when camera access is denied');
    }

    recommendations.push('🤖 Integrate with Hugging Face emotion detection models');
    recommendations.push('🎯 Improve emotion detection accuracy with better ML models');
    recommendations.push('📱 Test emotion detection on mobile devices');
    recommendations.push('⚡ Optimize emotion detection performance');

    return recommendations;
  }

  private generateBackendRecommendations(results: TestResult[]): string[] {
    const recommendations: string[] = [];
    
    const failedTests = results.filter(r => r.status === 'FAIL');
    if (failedTests.length > 0) {
      recommendations.push('🔧 Fix backend connectivity issues');
      recommendations.push('🐳 Ensure backend services are running (Docker/Python)');
      recommendations.push('🌐 Check network configuration and CORS settings');
    }

    const healthCheck = results.find(r => r.testName === 'Health Check');
    if (healthCheck?.status !== 'PASS') {
      recommendations.push('❤️ Implement proper health check endpoint');
      recommendations.push('📊 Add monitoring and alerting for backend services');
    }

    recommendations.push('🔄 Implement retry logic for failed API calls');
    recommendations.push('📈 Add performance monitoring for backend endpoints');
    recommendations.push('🛡️ Implement proper error handling and logging');

    return recommendations;
  }

  private generateVoiceRecommendations(results: TestResult[]): string[] {
    const recommendations: string[] = [];
    
    const speechRecognition = results.find(r => r.testName === 'Speech Recognition Support');
    if (speechRecognition?.status !== 'PASS') {
      recommendations.push('🎤 Add polyfill for speech recognition in unsupported browsers');
      recommendations.push('📱 Test voice features on different devices and browsers');
    }

    const speechSynthesis = results.find(r => r.testName === 'Speech Synthesis Support');
    if (speechSynthesis?.status !== 'PASS') {
      recommendations.push('🔊 Implement fallback TTS using backend services');
      recommendations.push('🎵 Add voice selection and customization options');
    }

    recommendations.push('🌐 Test voice features across different browsers');
    recommendations.push('🔧 Implement graceful degradation for voice features');
    recommendations.push('📊 Add voice quality and accuracy metrics');

    return recommendations;
  }

  private generateOverallReport(): void {
    console.log('\n📊 COMPREHENSIVE MODEL TEST REPORT');
    console.log('=====================================');
    
    this.testResults.forEach(report => {
      const statusEmoji = report.overallStatus === 'HEALTHY' ? '✅' : 
                         report.overallStatus === 'DEGRADED' ? '⚠️' : '❌';
      
      console.log(`\n${statusEmoji} ${report.modelName}: ${report.overallStatus}`);
      console.log(`   Tests: ${report.passedTests}/${report.totalTests} passed`);
      console.log(`   Avg Response Time: ${Math.round(report.averageResponseTime)}ms`);
      console.log(`   Avg Confidence: ${Math.round(report.averageConfidence * 100)}%`);
      
      if (report.recommendations.length > 0) {
        console.log('   Recommendations:');
        report.recommendations.slice(0, 3).forEach(rec => {
          console.log(`   • ${rec}`);
        });
      }
    });

    const overallHealth = this.calculateOverallHealth();
    console.log(`\n🎯 OVERALL SYSTEM HEALTH: ${overallHealth}`);
    console.log('=====================================\n');
  }

  private calculateOverallHealth(): string {
    const healthyModels = this.testResults.filter(r => r.overallStatus === 'HEALTHY').length;
    const totalModels = this.testResults.length;
    
    if (healthyModels === totalModels) return '✅ EXCELLENT';
    if (healthyModels >= totalModels * 0.75) return '⚠️ GOOD';
    if (healthyModels >= totalModels * 0.5) return '⚠️ DEGRADED';
    return '❌ CRITICAL';
  }

  public getDetailedReport(): ModelTestReport[] {
    return this.testResults;
  }
}

// Export the tester
export const modelTester = new ModelTester();
export type { TestResult, ModelTestReport };
