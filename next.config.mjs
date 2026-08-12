/** @type {import('next').NextConfig} */
const nextConfig = {
  // experimental: {
  //   typedRoutes: true
  // }
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'aotznnppnuozfegnhtuv.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;
