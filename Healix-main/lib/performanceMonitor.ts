export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number> = new Map();
  private constructor() {}
  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }
  startMeasure(name: string) {
    if (typeof window !== 'undefined' && window.performance) {
      performance.mark(`${name}-start`);
      this.metrics.set(`${name}-start`, Date.now());
    }
  }
  endMeasure(name: string) {
    if (typeof window !== 'undefined' && window.performance) {
      performance.mark(`${name}-end`);
      try {
        performance.measure(name, `${name}-start`, `${name}-end`);
        const measure = performance.getEntriesByName(name)[0];
        if (process.env.NODE_ENV === 'development') {
          console.log(`⚡ Performance: ${name} took ${measure.duration.toFixed(2)}ms`);
        }
        performance.clearMarks(`${name}-start`);
        performance.clearMarks(`${name}-end`);
        performance.clearMeasures(name);
        return measure.duration;
      } catch (error) {
        console.warn(`Failed to measure ${name}:`, error);
      }
    }
    return 0;
  }
  logWebVitals(metric: any) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 Web Vital - ${metric.name}:`, {
        value: metric.value,
        rating: metric.rating,
        delta: metric.delta
      });
    }
  }
  logRouteChange(url: string, duration: number) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔄 Route change to ${url} took ${duration.toFixed(2)}ms`);
    }
  }
  getSummary() {
    if (typeof window !== 'undefined' && window.performance) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        domInteractive: navigation.domInteractive - navigation.fetchStart,
        firstPaint: this.getFirstPaint(),
        firstContentfulPaint: this.getFirstContentfulPaint()
      };
    }
    return null;
  }
  private getFirstPaint(): number {
    const paintEntries = performance.getEntriesByType('paint');
    const fp = paintEntries.find(entry => entry.name === 'first-paint');
    return fp ? fp.startTime : 0;
  }
  private getFirstContentfulPaint(): number {
    const paintEntries = performance.getEntriesByType('paint');
    const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    return fcp ? fcp.startTime : 0;
  }
}
export function useMeasureRender(componentName: string) {
  if (typeof window !== 'undefined') {
    const monitor = PerformanceMonitor.getInstance();
    monitor.startMeasure(`render-${componentName}`);
    return () => {
      monitor.endMeasure(`render-${componentName}`);
    };
  }
  return () => {};
}
export async function measureAsync<T>(
  name: string,
  operation: () => Promise<T>
): Promise<T> {
  const monitor = PerformanceMonitor.getInstance();
  monitor.startMeasure(name);
  try {
    const result = await operation();
    monitor.endMeasure(name);
    return result;
  } catch (error) {
    monitor.endMeasure(name);
    throw error;
  }
}
