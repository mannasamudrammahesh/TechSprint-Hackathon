"use client";

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { TrendingUp, Calendar, Brain, Heart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface MoodEntry {
  date: string;
  mood: number;
  emotion: string;
  notes?: string;
}

interface ProgressData {
  week: string;
  anxiety: number;
  depression: number;
  stress: number;
  sleep: number;
}

interface EmotionDistribution {
  emotion: string;
  count: number;
  color: string;
}

export default function DataVisualization() {
  const [timeRange, setTimeRange] = useState('week');
  const [moodData, setMoodData] = useState<MoodEntry[]>([]);
  const [progressData, setProgressData] = useState<ProgressData[]>([]);
  const [emotionData, setEmotionData] = useState<EmotionDistribution[]>([]);

  // Sample data - in production, this would come from your backend
  useEffect(() => {
    // Generate sample mood data
    const generateMoodData = () => {
      const data: MoodEntry[] = [];
      const emotions = ['joy', 'sadness', 'anxiety', 'calm', 'excited', 'stressed'];
      const colors = ['#FFD700', '#4169E1', '#FF6347', '#32CD32', '#FF69B4', '#FFA500'];
      
      for (let i = 30; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        data.push({
          date: date.toISOString().split('T')[0],
          mood: Math.floor(Math.random() * 10) + 1,
          emotion: emotions[Math.floor(Math.random() * emotions.length)]
        });
      }
      
      setMoodData(data);

      // Generate emotion distribution
      const emotionCounts: Record<string, number> = {};
      data.forEach(entry => {
        emotionCounts[entry.emotion] = (emotionCounts[entry.emotion] || 0) + 1;
      });

      const emotionDistribution: EmotionDistribution[] = Object.entries(emotionCounts).map(([emotion, count], index) => ({
        emotion,
        count,
        color: colors[index % colors.length]
      }));

      setEmotionData(emotionDistribution);
    };

    // Generate sample progress data
    const generateProgressData = () => {
      const data: ProgressData[] = [];
      const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
      
      weeks.forEach(week => {
        data.push({
          week,
          anxiety: Math.floor(Math.random() * 40) + 30,
          depression: Math.floor(Math.random() * 35) + 25,
          stress: Math.floor(Math.random() * 45) + 35,
          sleep: Math.floor(Math.random() * 30) + 60
        });
      });
      
      setProgressData(data);
    };

    generateMoodData();
    generateProgressData();
  }, []);

  const getFilteredMoodData = () => {
    const now = new Date();
    let daysBack = 7;
    
    switch (timeRange) {
      case 'week':
        daysBack = 7;
        break;
      case 'month':
        daysBack = 30;
        break;
      case '3months':
        daysBack = 90;
        break;
      default:
        daysBack = 7;
    }
    
    const cutoffDate = new Date();
    cutoffDate.setDate(now.getDate() - daysBack);
    
    return moodData.filter(entry => new Date(entry.date) >= cutoffDate);
  };

  const calculateAverageMood = () => {
    const filteredData = getFilteredMoodData();
    if (filteredData.length === 0) return 0;
    
    const sum = filteredData.reduce((acc, entry) => acc + entry.mood, 0);
    return (sum / filteredData.length).toFixed(1);
  };

  const getMoodTrend = () => {
    const filteredData = getFilteredMoodData();
    if (filteredData.length < 2) return 'stable';
    
    const firstHalf = filteredData.slice(0, Math.floor(filteredData.length / 2));
    const secondHalf = filteredData.slice(Math.floor(filteredData.length / 2));
    
    const firstAvg = firstHalf.reduce((acc, entry) => acc + entry.mood, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((acc, entry) => acc + entry.mood, 0) / secondHalf.length;
    
    const diff = secondAvg - firstAvg;
    
    if (diff > 0.5) return 'improving';
    if (diff < -0.5) return 'declining';
    return 'stable';
  };

  const chartData = getFilteredMoodData().map(entry => ({
    date: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    mood: entry.mood,
    emotion: entry.emotion
  }));

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <TrendingUp className="h-6 w-6" />
          Mental Health Progress
        </h2>
        
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Last Week</SelectItem>
            <SelectItem value="month">Last Month</SelectItem>
            <SelectItem value="3months">Last 3 Months</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Average Mood
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{calculateAverageMood()}/10</div>
            <div className={`text-sm ${getMoodTrend() === 'improving' ? 'text-green-600' : getMoodTrend() === 'declining' ? 'text-red-600' : 'text-gray-600'}`}>
              {getMoodTrend() === 'improving' && '↗ Improving'}
              {getMoodTrend() === 'declining' && '↘ Needs attention'}
              {getMoodTrend() === 'stable' && '→ Stable'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Tracking Days
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getFilteredMoodData().length}</div>
            <div className="text-sm text-gray-600">
              {timeRange === 'week' ? 'This week' : timeRange === 'month' ? 'This month' : 'Last 3 months'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Most Common Emotion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">
              {emotionData.length > 0 ? emotionData.reduce((a, b) => a.count > b.count ? a : b).emotion : 'N/A'}
            </div>
            <div className="text-sm text-gray-600">
              Dominant this period
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mood Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Mood Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 10]} />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="mood" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  dot={{ fill: '#8884d8', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Emotion Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Emotion Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={emotionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ emotion, percent }) => `${emotion} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {emotionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Progress Metrics */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Weekly Progress Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="anxiety" fill="#FF6B6B" name="Anxiety Level" />
                <Bar dataKey="depression" fill="#4ECDC4" name="Depression Level" />
                <Bar dataKey="stress" fill="#45B7D1" name="Stress Level" />
                <Bar dataKey="sleep" fill="#96CEB4" name="Sleep Quality" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Insights & Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {getMoodTrend() === 'improving' && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="font-medium text-green-800">🎉 Great Progress!</div>
                <div className="text-green-700 text-sm">Your mood has been improving. Keep up the good work with your current strategies!</div>
              </div>
            )}
            
            {getMoodTrend() === 'declining' && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="font-medium text-yellow-800">⚠️ Attention Needed</div>
                <div className="text-yellow-700 text-sm">Your mood trend shows some decline. Consider reaching out to a mental health professional or trying new coping strategies.</div>
              </div>
            )}

            {emotionData.length > 0 && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="font-medium text-blue-800">📊 Emotion Pattern</div>
                <div className="text-blue-700 text-sm">
                  Your most frequent emotion is "{emotionData.reduce((a, b) => a.count > b.count ? a : b).emotion}". 
                  This can help guide your self-care activities and therapy focus.
                </div>
              </div>
            )}

            <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="font-medium text-purple-800">💡 Tip</div>
              <div className="text-purple-700 text-sm">
                Regular mood tracking helps identify patterns and triggers. Try to log your mood at the same time each day for more accurate insights.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
