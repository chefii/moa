/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // localhost
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '4000',
        pathname: '/uploads/**',
      },
      // 현재 IP 주소
      {
        protocol: 'http',
        hostname: '172.30.1.85',
        port: '4000',
        pathname: '/uploads/**',
      },
      // AWS S3
      {
        protocol: 'https',
        hostname: '*.amazonaws.com',
        pathname: '/**',
      },
      // Cloudinary
      {
        protocol: 'https',
        hostname: '*.cloudinary.com',
        pathname: '/**',
      },
      // Unsplash
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
    // 개발 환경에서 추가 설정 - 로컬 네트워크 허용
    ...(process.env.NODE_ENV === 'development' && {
      unoptimized: false,
      dangerouslyAllowSVG: true,
      contentDispositionType: 'attachment',
      contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    }),
  },
}

module.exports = nextConfig
