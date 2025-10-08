import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import { resolve } from 'path';

export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');
  
  // Security headers for production
  const securityHeaders = mode === 'production' ? {
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), camera=(), microphone=(), usb=(), magnetometer=(), accelerometer=(), gyroscope=()',
  } : {};

  return {
    // Make env variables available to the client
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'import.meta.env.VITE_API_BASE_URL': JSON.stringify(env.VITE_API_BASE_URL || 'http://localhost:8080'),
      '__APP_VERSION__': JSON.stringify(env.VITE_APP_VERSION || '1.0.0'),
      '__BUILD_TIME__': JSON.stringify(new Date().toISOString()),
    },
    
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
        '@components': path.resolve(__dirname, 'components'),
        '@services': path.resolve(__dirname, 'services'), 
        '@types': path.resolve(__dirname, 'types'),
        '@utils': path.resolve(__dirname, 'utils'),
        '@hooks': path.resolve(__dirname, 'hooks'),
        '@context': path.resolve(__dirname, 'context'),
        '@pages': path.resolve(__dirname, 'pages'),
      }
    },
    
    server: {
      port: parseInt(env.VITE_PORT || '5173'),
      host: env.VITE_HOST === 'true' || mode === 'development',
      open: env.VITE_OPEN === 'true' || mode === 'development',
      https: env.VITE_HTTPS_REQUIRED === 'true' && mode === 'production',
      headers: securityHeaders,
      // CORS configuration for development
      cors: {
        origin: mode === 'development' ? true : [
          'https://admision.mtn.cl',
          'https://admin.mtn.cl', 
          'https://auth.mtn.cl'
        ],
        credentials: true,
      },
    },
    
    preview: {
      port: 4173,
      host: true,
      headers: securityHeaders,
    },
    
    build: {
      // Security and performance optimizations
      minify: mode === 'production' ? 'terser' : false,
      sourcemap: env.VITE_SOURCE_MAPS === 'true',
      rollupOptions: {
        output: {
          // Chunking strategy for better caching
          manualChunks: {
            vendor: ['react', 'react-dom'],
            router: ['react-router-dom'],
            ui: ['@heroicons/react', 'lucide-react'],
            utils: ['axios', 'xlsx'],
          },
        },
        // External dependencies (if any)
        external: mode === 'production' ? [] : [],
      },
      // Output directory
      outDir: 'dist',
      assetsDir: 'assets',
      // Clear the output directory before building
      emptyOutDir: true,
      // Performance budget warnings
      chunkSizeWarningLimit: 1000,
      // Terser optimization options
      terserOptions: mode === 'production' ? {
        compress: {
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ['console.log', 'console.info', 'console.debug'],
        },
        mangle: {
          safari10: true,
        },
        format: {
          comments: false,
        },
      } : undefined,
    },
    
    // Environment-specific optimizations
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        'axios',
        '@heroicons/react',
      ],
      exclude: mode === 'development' ? [] : [],
    },
    
    // Chilean timezone handling
    esbuild: {
      define: {
        global: 'globalThis',
      },
      // Drop console and debugger in production
      drop: mode === 'production' ? ['console', 'debugger'] : [],
    },
    
    // CSS configuration
    css: {
      devSourcemap: mode === 'development',
      preprocessorOptions: {
        scss: {
          additionalData: `
            $primary-color: ${env.VITE_BRAND_PRIMARY || '#1e40af'};
            $secondary-color: ${env.VITE_BRAND_SECONDARY || '#dc2626'};
            $timezone: '${env.VITE_TIMEZONE || 'America/Santiago'}';
          `
        }
      }
    },
    
    // Plugin configuration (add any needed plugins here)
    plugins: [
      // React plugin would go here if using @vitejs/plugin-react
    ],
    
    // Test configuration (if using Vitest)
    test: {
      environment: 'jsdom',
      setupFiles: './tests/setup.ts',
      globals: true,
    },
  };
});
