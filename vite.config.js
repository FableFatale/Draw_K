import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    target: 'es2020',
    // 优化构建性能
    minify: 'esbuild',
    sourcemap: false,
    // 代码分割优化
    rollupOptions: {
      input: './index.html',
      output: {
        manualChunks: {
          'echarts': ['echarts']
        }
      }
    }
  },
  server: {
    port: 3000,
    open: true,
    // 开发服务器优化
    hmr: {
      overlay: true
    }
  },
  resolve: {
    extensions: ['.js', '.ts', '.json'],
    // 添加路径别名，简化导入
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@utils': path.resolve(__dirname, 'src/utils'),
      '@styles': path.resolve(__dirname, 'src/styles')
    }
  },
  optimizeDeps: {
    include: ['echarts'],
    // 预构建优化
    force: false
  },
  esbuild: {
    target: 'es2020',
    // 移除 console 和 debugger（生产环境）
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : []
  },
  // CSS 优化
  css: {
    devSourcemap: true
  }
})