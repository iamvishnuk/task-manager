import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@task-manager/ui', '@task-manager/shared'],
  output: 'standalone'
};

export default nextConfig;
