/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';
const basePath = isProd ? '/michael-doing-what-web' : '';

const nextConfig = {
  output: 'export',
  basePath,
  assetPrefix: isProd ? '/michael-doing-what-web/' : '',
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
