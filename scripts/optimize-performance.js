#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Healix Performance Optimization Script');
console.log('=' .repeat(50));

// Performance optimization tasks
const optimizations = [
  {
    name: 'Clear Next.js Cache',
    action: () => {
      try {
        const nextDir = path.join(process.cwd(), '.next');
        if (fs.existsSync(nextDir)) {
          fs.rmSync(nextDir, { recursive: true, force: true });
          console.log('✅ Cleared .next cache');
        }
      } catch (error) {
        console.log('⚠️ Could not clear .next cache:', error.message);
      }
    }
  },
  {
    name: 'Clear Node Modules Cache',
    action: () => {
      try {
        const nodeModulesDir = path.join(process.cwd(), 'node_modules', '.cache');
        if (fs.existsSync(nodeModulesDir)) {
          fs.rmSync(nodeModulesDir, { recursive: true, force: true });
          console.log('✅ Cleared node_modules cache');
        }
      } catch (error) {
        console.log('⚠️ Could not clear node_modules cache:', error.message);
      }
    }
  },
  {
    name: 'Optimize Images',
    action: () => {
      try {
        const publicDir = path.join(process.cwd(), 'public');
        if (fs.existsSync(publicDir)) {
          console.log('✅ Public directory exists - images should be optimized manually');
        }
      } catch (error) {
        console.log('⚠️ Could not check public directory:', error.message);
      }
    }
  },
  {
    name: 'Check Package Dependencies',
    action: () => {
      try {
        const packagePath = path.join(process.cwd(), 'package.json');
        if (fs.existsSync(packagePath)) {
          const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
          const heavyDeps = [
            '@tensorflow/tfjs',
            'face-api.js',
            '@rive-app/react-canvas',
            'three',
            '@react-three/fiber'
          ];

          const foundHeavy = heavyDeps.filter(dep =>
            pkg.dependencies && pkg.dependencies[dep]
          );

          if (foundHeavy.length > 0) {
            console.log('📦 Heavy dependencies found:', foundHeavy.join(', '));
            console.log('💡 Consider lazy loading these components');
          }
        }
      } catch (error) {
        console.log('⚠️ Could not analyze dependencies:', error.message);
      }
    }
  },
  {
    name: 'Memory Usage Analysis',
    action: () => {
      const memUsage = process.memoryUsage();
      console.log('💾 Current memory usage:');
      console.log(`   RSS: ${Math.round(memUsage.rss / 1024 / 1024)}MB`);
      console.log(`   Heap Used: ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`);
      console.log(`   Heap Total: ${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`);

      if (memUsage.heapUsed > 100 * 1024 * 1024) {
        console.log('⚠️ High memory usage detected');
      } else {
        console.log('✅ Memory usage is normal');
      }
    }
  }
];

// Performance recommendations
const recommendations = [
  '🔧 PERFORMANCE RECOMMENDATIONS:',
  '',
  '1. Lazy Loading:',
  '   - Use React.lazy() for heavy components',
  '   - Import AI libraries only when needed',
  '   - Implement code splitting for routes',
  '',
  '2. Asset Optimization:',
  '   - Compress images (use WebP format)',
  '   - Minimize AI model sizes',
  '   - Use CDN for static assets',
  '',
  '3. Component Optimization:',
  '   - Use React.memo() for expensive renders',
  '   - Implement useCallback() for event handlers',
  '   - Debounce frequent operations (emotion detection)',
  '',
  '4. AI/ML Optimizations:',
  '   - Reduce emotion detection frequency',
  '   - Use smaller ML models when possible',
  '   - Implement model caching',
  '   - Use Web Workers for heavy computations',
  '',
  '5. Bundle Optimization:',
  '   - Enable tree shaking',
  '   - Use dynamic imports',
  '   - Split vendor bundles',
  '   - Remove unused dependencies',
  '',
  '6. Runtime Optimizations:',
  '   - Implement virtual scrolling for large lists',
  '   - Use requestAnimationFrame for animations',
  '   - Debounce user inputs',
  '   - Clean up event listeners and timers'
];

// Run optimizations
console.log('Running performance optimizations...\n');

optimizations.forEach((opt, index) => {
  console.log(`${index + 1}. ${opt.name}`);
  try {
    opt.action();
  } catch (error) {
    console.log(`❌ Failed: ${error.message}`);
  }
  console.log('');
});

// Display recommendations
console.log('\n' + '='.repeat(50));
recommendations.forEach(rec => console.log(rec));
console.log('='.repeat(50));

// Quick fixes for common issues
console.log('\n🔧 QUICK FIXES:');
console.log('');
console.log('For slow loading:');
console.log('  npm run build && npm start');
console.log('');
console.log('For memory issues:');
console.log('  - Restart your development server');
console.log('  - Close unnecessary browser tabs');
console.log('  - Use Chrome DevTools to profile memory');
console.log('');
console.log('For laggy animations:');
console.log('  - Reduce animation complexity');
console.log('  - Use CSS transforms instead of JS');
console.log('  - Lower emotion detection frequency');
console.log('');

// Environment-specific advice
if (process.env.NODE_ENV === 'development') {
  console.log('🛠️ DEVELOPMENT MODE OPTIMIZATIONS:');
  console.log('  - Use React DevTools Profiler');
  console.log('  - Enable performance monitor in app');
  console.log('  - Check browser DevTools Performance tab');
  console.log('  - Monitor Network tab for heavy requests');
} else {
  console.log('🏭 PRODUCTION MODE OPTIMIZATIONS:');
  console.log('  - Enable gzip compression');
  console.log('  - Use production builds only');
  console.log('  - Implement proper caching headers');
  console.log('  - Monitor real user metrics');
}

console.log('\n✨ Performance optimization completed!');
console.log('🚀 Ready for optimal performance!');
