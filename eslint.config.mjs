/** @type {import("eslint").Linter.Config[]} */
export default [
  {
    ignores: [
      '**/node_modules/**',
      '**/.next/**',
      '**/dist/**',
      '**/.turbo/**',
      '**/coverage/**',
      'pnpm-lock.yaml'
    ]
  }
];
