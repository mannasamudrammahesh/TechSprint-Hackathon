"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  Target, 
  TrendingUp, 
  Award,
  Star,
  Zap,
  CheckCircle,
  Info
} from 'lucide-react';
import { motion } from 'framer-motion';

interface ExerciseScoreCardProps {
  totalPoints: number;
  accuracy: number;
  consistency: number;
  reps: number;
  grade: 'S' | 'A' | 'B' | 'C' | 'D';
  feedback: string;
  bonusPoints: number;
}

export default function ExerciseScoreCard({
  totalPoints,
  accuracy,
  consistency,
  reps,
  grade,
  feedback,
  bonusPoints
}: ExerciseScoreCardProps) {
  
  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'S': return 'from-yellow-400 via-orange-500 to-red-500';
      case 'A': return 'from-blue-400 via-purple-500 to-pink-500';
      case 'B': return 'from-green-400 via-emerald-500 to-teal-500';
      case 'C': return 'from-cyan-400 via-blue-500 to-indigo-500';
      case 'D': return 'from-gray-400 via-gray-500 to-gray-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getGradeEmoji = (grade: string) => {
    switch (grade) {
      case 'S': return '🏆';
      case 'A': return '⭐';
      case 'B': return '💎';
      case 'C': return '✨';
      case 'D': return '💪';
      default: return '🎯';
    }
  };

  const getGradeTitle = (grade: string) => {
    switch (grade) {
      case 'S': return 'LEGENDARY';
      case 'A': return 'OUTSTANDING';
      case 'B': return 'EXCELLENT';
      case 'C': return 'GOOD';
      case 'D': return 'KEEP PRACTICING';
      default: return 'COMPLETE';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="overflow-hidden border-2 shadow-2xl">
        {/* Grade Header */}
        <div className={`bg-gradient-to-r ${getGradeColor(grade)} p-6 text-white text-center`}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="text-8xl mb-2"
          >
            {getGradeEmoji(grade)}
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-black mb-2"
          >
            GRADE {grade}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xl font-semibold"
          >
            {getGradeTitle(grade)}
          </motion.p>
        </div>

        <CardContent className="p-6 space-y-6">
          {/* Total Points */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-3 mb-2">
              <Trophy className="h-8 w-8 text-yellow-500" />
              <span className="text-5xl font-black bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
                {totalPoints}
              </span>
              <Trophy className="h-8 w-8 text-yellow-500" />
            </div>
            <p className="text-lg font-semibold text-gray-600">Total Performance Points</p>
            {bonusPoints > 0 && (
              <Badge variant="secondary" className="mt-2">
                <Zap className="h-3 w-3 mr-1" />
                +{bonusPoints} Bonus Points
              </Badge>
            )}
          </motion.div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-3 gap-4">
            {/* Accuracy */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-center"
            >
              <div className="bg-blue-50 rounded-lg p-4">
                <Target className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                <div className="text-2xl font-bold text-blue-600">{Math.round(accuracy)}%</div>
                <div className="text-xs text-gray-600 mt-1">Accuracy</div>
                <Progress value={accuracy} className="h-2 mt-2" />
              </div>
            </motion.div>

            {/* Consistency */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="text-center"
            >
              <div className="bg-green-50 rounded-lg p-4">
                <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-600" />
                <div className="text-2xl font-bold text-green-600">{Math.round(consistency)}%</div>
                <div className="text-xs text-gray-600 mt-1">Consistency</div>
                <Progress value={consistency} className="h-2 mt-2" />
              </div>
            </motion.div>

            {/* Reps */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="text-center"
            >
              <div className="bg-purple-50 rounded-lg p-4">
                <Award className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                <div className="text-2xl font-bold text-purple-600">{reps}</div>
                <div className="text-xs text-gray-600 mt-1">Repetitions</div>
                <div className="flex justify-center gap-1 mt-2">
                  {[...Array(Math.min(reps, 5))].map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-purple-600 text-purple-600" />
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Feedback */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 border-2 border-indigo-200"
          >
            <div className="flex items-start gap-3">
              <CheckCircle className="h-6 w-6 text-indigo-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-indigo-900 mb-1">Performance Feedback</h3>
                <p className="text-indigo-700">{feedback}</p>
              </div>
            </div>
          </motion.div>

          {/* Point Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="bg-gray-50 rounded-lg p-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <Info className="h-5 w-5 text-gray-600" />
              <h3 className="font-bold text-gray-900">Point Breakdown</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Base Score (Reps × 10):</span>
                <span className="font-semibold">{reps * 10} pts</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Accuracy Bonus:</span>
                <span className="font-semibold text-blue-600">
                  {accuracy >= 95 ? '+100' : accuracy >= 90 ? '+80' : accuracy >= 85 ? '+60' : accuracy >= 80 ? '+40' : accuracy >= 75 ? '+25' : accuracy >= 70 ? '+15' : '+0'} pts
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Reps Bonus:</span>
                <span className="font-semibold text-green-600">
                  {reps >= 20 ? '+80' : reps >= 15 ? '+60' : reps >= 12 ? '+45' : reps >= 10 ? '+30' : reps >= 7 ? '+20' : reps >= 5 ? '+10' : '+0'} pts
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Consistency Bonus:</span>
                <span className="font-semibold text-purple-600">
                  {consistency >= 95 ? '+70' : consistency >= 90 ? '+55' : consistency >= 85 ? '+40' : consistency >= 80 ? '+30' : consistency >= 75 ? '+20' : consistency >= 70 ? '+10' : '+0'} pts
                </span>
              </div>
              {accuracy >= 95 && reps >= 15 && consistency >= 90 && (
                <div className="flex justify-between border-t pt-2">
                  <span className="text-gray-600 font-semibold">🏆 Perfect Performance:</span>
                  <span className="font-bold text-yellow-600">+50 pts</span>
                </div>
              )}
              <div className="flex justify-between border-t-2 border-gray-300 pt-2 font-bold text-lg">
                <span>Total Points:</span>
                <span className="text-yellow-600">{totalPoints} pts</span>
              </div>
            </div>
          </motion.div>

          {/* Grade Requirements */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="text-center text-sm text-gray-600"
          >
            <p className="font-semibold mb-2">Grade Requirements:</p>
            <div className="flex justify-center gap-2 flex-wrap">
              <Badge variant={grade === 'S' ? 'default' : 'outline'}>S: 250+</Badge>
              <Badge variant={grade === 'A' ? 'default' : 'outline'}>A: 200-249</Badge>
              <Badge variant={grade === 'B' ? 'default' : 'outline'}>B: 150-199</Badge>
              <Badge variant={grade === 'C' ? 'default' : 'outline'}>C: 100-149</Badge>
              <Badge variant={grade === 'D' ? 'default' : 'outline'}>D: &lt;100</Badge>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
