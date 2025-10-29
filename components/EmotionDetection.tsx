"use client";

import React, { useState, useEffect } from 'react';
import { Brain, Heart, Smile, Frown, Meh } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface EmotionResult {
  dominant_emotion: string;
  confidence: number;
  all_emotions: Record<string, number>;
}

interface EmotionDetectionProps {
  onEmotionDetected?: (emotion: EmotionResult) => void;
  autoAnalyze?: boolean;
}

export default function EmotionDetection({ onEmotionDetected, autoAnalyze = false }: EmotionDetectionProps) {
  const [text, setText] = useState('');
  const [emotion, setEmotion] = useState<EmotionResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [emotionHistory, setEmotionHistory] = useState<EmotionResult[]>([]);

  const emotionIcons: Record<string, React.ReactNode> = {
    joy: <Smile className="h-5 w-5 text-yellow-500" />,
    sadness: <Frown className="h-5 w-5 text-blue-500" />,
    anger: <Frown className="h-5 w-5 text-red-500" />,
    fear: <Meh className="h-5 w-5 text-purple-500" />,
    surprise: <Smile className="h-5 w-5 text-green-500" />,
    disgust: <Frown className="h-5 w-5 text-brown-500" />,
    neutral: <Meh className="h-5 w-5 text-gray-500" />
  };

  const emotionColors: Record<string, string> = {
    joy: 'bg-yellow-100 border-yellow-300',
    sadness: 'bg-blue-100 border-blue-300',
    anger: 'bg-red-100 border-red-300',
    fear: 'bg-purple-100 border-purple-300',
    surprise: 'bg-green-100 border-green-300',
    disgust: 'bg-orange-100 border-orange-300',
    neutral: 'bg-gray-100 border-gray-300'
  };

  const analyzeEmotion = async () => {
    if (!text.trim()) return;

    setIsAnalyzing(true);
    try {
      // Try backend emotion detection first
      const response = await fetch('/api/emotion-detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });

      if (response.ok) {
        const result = await response.json();
        setEmotion(result);
        setEmotionHistory(prev => [result, ...prev.slice(0, 9)]);
        onEmotionDetected?.(result);
      } else {
        // Fallback to client-side emotion analysis
        const fallbackResult = analyzeFallbackEmotion(text);
        setEmotion(fallbackResult);
        setEmotionHistory(prev => [fallbackResult, ...prev.slice(0, 9)]);
        onEmotionDetected?.(fallbackResult);
      }
    } catch (error) {
      console.error('Emotion analysis error:', error);
      // Use fallback emotion detection
      const fallbackResult = analyzeFallbackEmotion(text);
      setEmotion(fallbackResult);
      setEmotionHistory(prev => [fallbackResult, ...prev.slice(0, 9)]);
      onEmotionDetected?.(fallbackResult);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzeFallbackEmotion = (inputText: string): EmotionResult => {
    const lowerText = inputText.toLowerCase();
    
    // Simple keyword-based emotion detection
    const emotionKeywords = {
      joy: ['happy', 'excited', 'great', 'amazing', 'wonderful', 'fantastic', 'good', 'love', 'joy', 'smile'],
      sadness: ['sad', 'depressed', 'down', 'upset', 'crying', 'tears', 'lonely', 'empty', 'hopeless'],
      anger: ['angry', 'mad', 'furious', 'annoyed', 'frustrated', 'hate', 'rage', 'irritated'],
      fear: ['scared', 'afraid', 'anxious', 'worried', 'nervous', 'panic', 'terrified', 'frightened'],
      surprise: ['surprised', 'shocked', 'amazed', 'wow', 'incredible', 'unbelievable'],
      disgust: ['disgusted', 'gross', 'awful', 'terrible', 'horrible', 'nasty']
    };

    const scores: Record<string, number> = {
      joy: 0,
      sadness: 0,
      anger: 0,
      fear: 0,
      surprise: 0,
      disgust: 0,
      neutral: 0.1
    };

    // Count keyword matches
    Object.entries(emotionKeywords).forEach(([emotion, keywords]) => {
      keywords.forEach(keyword => {
        if (lowerText.includes(keyword)) {
          scores[emotion] += 0.2;
        }
      });
    });

    // Normalize scores
    const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
    if (totalScore > 0) {
      Object.keys(scores).forEach(emotion => {
        scores[emotion] = scores[emotion] / totalScore;
      });
    }

    const dominantEmotion = Object.entries(scores).reduce((a, b) => 
      scores[a[0]] > scores[b[0]] ? a : b
    )[0];

    return {
      dominant_emotion: dominantEmotion,
      confidence: scores[dominantEmotion],
      all_emotions: scores
    };
  };

  useEffect(() => {
    if (autoAnalyze && text.trim() && text.length > 10) {
      const timer = setTimeout(() => {
        analyzeEmotion();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [text, autoAnalyze]);

  const getEmotionAdvice = (dominantEmotion: string): string => {
    const advice = {
      joy: "It's wonderful that you're feeling positive! Consider sharing this joy with others or engaging in activities that maintain this mood.",
      sadness: "It's okay to feel sad sometimes. Consider talking to someone you trust, engaging in gentle self-care, or trying a mood-lifting activity.",
      anger: "Anger is a normal emotion. Try deep breathing, physical exercise, or expressing your feelings in a healthy way like journaling.",
      fear: "Fear can be overwhelming. Practice grounding techniques, talk to someone supportive, or consider what specific steps might help you feel safer.",
      surprise: "Surprise can be exciting or unsettling. Take a moment to process what happened and how you feel about it.",
      disgust: "These feelings are valid. Consider what might help you feel more comfortable or whether you need to address the source of these feelings.",
      neutral: "A neutral emotional state can be peaceful. This might be a good time for reflection or planning positive activities."
    };

    return advice[dominantEmotion as keyof typeof advice] || advice.neutral;
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Emotion Detection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Textarea
              placeholder="Share what's on your mind... I'll analyze the emotions in your text."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          
          <Button 
            onClick={analyzeEmotion}
            disabled={!text.trim() || isAnalyzing}
            className="w-full"
          >
            {isAnalyzing ? 'Analyzing...' : 'Analyze Emotions'}
          </Button>

          {emotion && (
            <div className={`p-4 rounded-lg border-2 ${emotionColors[emotion.dominant_emotion] || 'bg-gray-100 border-gray-300'}`}>
              <div className="flex items-center gap-2 mb-2">
                {emotionIcons[emotion.dominant_emotion] || emotionIcons.neutral}
                <h3 className="font-semibold capitalize">
                  {emotion.dominant_emotion} ({(emotion.confidence * 100).toFixed(1)}% confidence)
                </h3>
              </div>
              
              <p className="text-sm text-gray-700 mb-3">
                {getEmotionAdvice(emotion.dominant_emotion)}
              </p>

              <div className="space-y-2">
                <h4 className="text-sm font-medium">All Detected Emotions:</h4>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(emotion.all_emotions)
                    .sort(([,a], [,b]) => b - a)
                    .map(([emotionName, score]) => (
                      <div key={emotionName} className="flex justify-between text-sm">
                        <span className="capitalize">{emotionName}:</span>
                        <span>{(score * 100).toFixed(1)}%</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {emotionHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Emotion History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {emotionHistory.map((hist, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    {emotionIcons[hist.dominant_emotion]}
                    <span className="capitalize text-sm">{hist.dominant_emotion}</span>
                  </div>
                  <span className="text-sm text-gray-600">
                    {(hist.confidence * 100).toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
