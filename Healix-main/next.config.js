/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Performance optimizations
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },

  images: {
    unoptimized: false, // Enable image optimization for better performance
    remotePatterns: [
      {
        protocol: "https",
        hostname: "uploadthing.com",
      },
      {
        protocol: "https",
        hostname: "utfs.io",
      },
      {
        protocol: "https",
        hostname: "replicate.com",
      },
      {
        protocol: "https",
        hostname: "replicate.delivery",
      },
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },

  // Enable modern bundling features
  modularizeImports: {
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{kebabCase member}}',
    },
    '@radix-ui/react-icons': {
      transform: '@radix-ui/react-icons/dist/{{member}}',
    },
  },

  experimental: {
    // Ensure output file tracing roots at this project only
    outputFileTracingRoot: __dirname,
    // Performance optimizations
    optimizeCss: true,
    optimizePackageImports: [
      "lucide-react",
      "@radix-ui/react-icons",
      "framer-motion",
    ],
  },

  // Webpack optimizations for AI libraries
  webpack: (config, { isServer }) => {
    // Optimize for AI/ML libraries
    config.externals = config.externals || [];

    if (!isServer) {
      // Client-side optimizations
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };

      // Chunk splitting for better caching
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks.cacheGroups,
          ai: {
            name: "ai-libraries",
            chunks: "all",
            test: /[\\/]node_modules[\\/](@tensorflow|face-api\.js|@mediapipe)[\\/]/,
            priority: 30,
            reuseExistingChunk: true,
          },
          animations: {
            name: "animation-libraries",
            chunks: "all",
            test: /[\\/]node_modules[\\/](framer-motion|@rive-app)[\\/]/,
            priority: 25,
            reuseExistingChunk: true,
          },
        },
      };
    }

    return config;
  },

  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
