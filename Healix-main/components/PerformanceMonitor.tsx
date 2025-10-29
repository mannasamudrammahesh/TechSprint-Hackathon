"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Monitor, Cpu, HardDrive, Zap, Eye, EyeOff } from "lucide-react";

interface PerformanceMetrics {
  fps: number;
  memory: number;
  loadTime: number;
  renderTime: number;
  componentsCount: number;
  timestamp: number;
}

const PerformanceMonitor: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 0,
    memory: 0,
    loadTime: 0,
    renderTime: 0,
    componentsCount: 0,
    timestamp: Date.now(),
  });

  const [history, setHistory] = useState<PerformanceMetrics[]>([]);

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animationId: number;

    const measurePerformance = () => {
      const currentTime = performance.now();
      frameCount++;

      // Calculate FPS every second
      if (currentTime - lastTime >= 1000) {
        const fps = Math.round(frameCount * 1000 / (currentTime - lastTime));

        // Get memory usage (if available)
        const memory = (performance as any).memory
          ? Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024)
          : 0;

        // Get page load time
        const loadTime = performance.timing
          ? performance.timing.loadEventEnd - performance.timing.navigationStart
          : 0;

        // Estimate render time
        const renderStart = performance.now();
        const div = document.createElement('div');
        document.body.appendChild(div);
        document.body.removeChild(div);
        const renderTime = performance.now() - renderStart;

        // Count DOM elements as proxy for component count
        const componentsCount = document.querySelectorAll('*').length;

        const newMetrics: PerformanceMetrics = {
          fps,
          memory,
          loadTime,
          renderTime: Math.round(renderTime * 100) / 100,
          componentsCount,
          timestamp: currentTime,
        };

        setMetrics(newMetrics);

        // Keep last 30 measurements for history
        setHistory(prev => [...prev.slice(-29), newMetrics]);

        frameCount = 0;
        lastTime = currentTime;
      }

      animationId = requestAnimationFrame(measurePerformance);
    };

    if (isVisible) {
      animationId = requestAnimationFrame(measurePerformance);
    }

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isVisible]);

  const getPerformanceStatus = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return "default";
    if (value <= thresholds.warning) return "secondary";
    return "destructive";
  };

  const getFPSStatus = (fps: number) => {
    if (fps >= 50) return "default";
    if (fps >= 30) return "secondary";
    return "destructive";
  };

  const averageFPS = history.length > 0
    ? Math.round(history.reduce((sum, m) => sum + m.fps, 0) / history.length)
    : 0;

  const averageMemory = history.length > 0
    ? Math.round(history.reduce((sum, m) => sum + m.memory, 0) / history.length)
    : 0;

  // Toggle visibility
  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsVisible(true)}
          size="sm"
          variant="outline"
          className="bg-black/80 text-white border-gray-600 hover:bg-black/90"
        >
          <Monitor className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80">
      <Card className="bg-black/90 text-white border-gray-600 shadow-xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              Performance Monitor
            </CardTitle>
            <Button
              onClick={() => setIsVisible(false)}
              size="sm"
              variant="ghost"
              className="text-white hover:bg-gray-700"
            >
              <EyeOff className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* FPS */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-400" />
              <span className="text-sm">FPS</span>
            </div>
            <div className="flex gap-2">
              <Badge variant={getFPSStatus(metrics.fps)}>
                {metrics.fps}
              </Badge>
              <span className="text-xs text-gray-400">
                Avg: {averageFPS}
              </span>
            </div>
          </div>

          {/* Memory */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-blue-400" />
              <span className="text-sm">Memory</span>
            </div>
            <div className="flex gap-2">
              <Badge variant={getPerformanceStatus(metrics.memory, { good: 50, warning: 100 })}>
                {metrics.memory}MB
              </Badge>
              <span className="text-xs text-gray-400">
                Avg: {averageMemory}MB
              </span>
            </div>
          </div>

          {/* Render Time */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-green-400" />
              <span className="text-sm">Render</span>
            </div>
            <Badge variant={getPerformanceStatus(metrics.renderTime, { good: 5, warning: 16 })}>
              {metrics.renderTime}ms
            </Badge>
          </div>

          {/* Component Count */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-purple-400" />
              <span className="text-sm">DOM Elements</span>
            </div>
            <Badge variant={getPerformanceStatus(metrics.componentsCount, { good: 1000, warning: 2000 })}>
              {metrics.componentsCount}
            </Badge>
          </div>

          {/* Load Time */}
          {metrics.loadTime > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Page Load</span>
              <Badge variant={getPerformanceStatus(metrics.loadTime, { good: 2000, warning: 5000 })}>
                {Math.round(metrics.loadTime / 1000)}s
              </Badge>
            </div>
          )}

          {/* Performance Tips */}
          <div className="pt-2 border-t border-gray-700">
            <div className="text-xs text-gray-400 space-y-1">
              {metrics.fps < 30 && (
                <div className="text-red-400">⚠️ Low FPS detected</div>
              )}
              {metrics.memory > 100 && (
                <div className="text-yellow-400">⚠️ High memory usage</div>
              )}
              {metrics.renderTime > 16 && (
                <div className="text-orange-400">⚠️ Slow rendering</div>
              )}
              {metrics.componentsCount > 2000 && (
                <div className="text-blue-400">ℹ️ High DOM complexity</div>
              )}
              {metrics.fps >= 50 && metrics.memory < 50 && metrics.renderTime < 5 && (
                <div className="text-green-400">✅ Optimal performance</div>
              )}
            </div>
          </div>

          {/* Mini Chart */}
          {history.length > 5 && (
            <div className="pt-2 border-t border-gray-700">
              <div className="text-xs text-gray-400 mb-2">FPS History</div>
              <div className="flex items-end gap-1 h-8">
                {history.slice(-20).map((h, i) => (
                  <div
                    key={i}
                    className={`flex-1 rounded-t ${
                      h.fps >= 50 ? 'bg-green-500' :
                      h.fps >= 30 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ height: `${Math.max(2, (h.fps / 60) * 100)}%` }}
                    title={`${h.fps} FPS`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="pt-2 border-t border-gray-700 flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 text-xs"
              onClick={() => {
                // Force garbage collection if available
                if ((window as any).gc) {
                  (window as any).gc();
                } else {
                  // Fallback: create and remove elements to trigger cleanup
                  const temp = [];
                  for (let i = 0; i < 1000; i++) {
                    temp.push(document.createElement('div'));
                  }
                  temp.length = 0;
                }
                console.log('Performance cleanup attempted');
              }}
            >
              🗑️ Clean
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 text-xs"
              onClick={() => {
                console.log('Performance Metrics:', {
                  current: metrics,
                  history: history.slice(-10),
                  average: { fps: averageFPS, memory: averageMemory }
                });
              }}
            >
              📊 Log
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceMonitor;
