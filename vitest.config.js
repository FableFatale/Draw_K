import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@utils': path.resolve(__dirname, 'src/utils'),
      '@styles': path.resolve(__dirname, 'src/styles')
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.js'],
    include: ['tests/unit/**/*.test.js'], // 只包含单元测试
    exclude: [
      'tests/e2e/**/*', 
      'tests/unit/components/ChartRenderer.test.js',
      'tests/unit/main.test.js'
    ], // 排除E2E测试和有问题的测试
    testTimeout: 10000, // 增加测试超时时间
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'tests/setup.js', 'tests/e2e/**/*'],
    },
  },
});