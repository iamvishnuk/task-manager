import { defineConfig, mergeConfig } from 'vitest/config';
import baseConfig from '@task-manager/vitest-config/web';
import path from 'path';

export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      name: 'web'
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './')
      }
    }
  })
);
