import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@task-manager/ui', '@task-manager/shared']
};

export default nextConfig;
