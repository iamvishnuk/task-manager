import type { UserConfig } from '@commitlint/types';

const config: UserConfig = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [
      2,
      'always',
      [
        'web',
        'api',
        'ui',
        'supabase',
        'types',
        'eslint-config',
        'typescript-config',
        'root',
        'deps',
        'ci'
      ]
    ],
    'scope-empty': [1, 'never'],
    'header-max-length': [2, 'always', 150],
    'subject-case': [0]
  }
};

export default config;
