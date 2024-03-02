/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_FRONTEND_BASE_URL: process.env.FRONTEND_BASE_URL,
  }
};

export default nextConfig;
