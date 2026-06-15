import { defineConfig, mergeConfig } from 'vitest/config';
import baseConfig from '@task-manager/vitest-config/node';

export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      name: 'shared',
    },
  })
);
