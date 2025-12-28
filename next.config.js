/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['images.unsplash.com'],
  },
  // Three.js compatibility for Vercel deployment
  webpack: (config, { isServer }) => {
    // Handle Three.js modules
    config.module.rules.push({
      test: /\.(glsl|vs|fs|vert|frag)$/,
      use: ['raw-loader', 'glslify-loader'],
    });

    // Fix for Three.js in server-side rendering
    if (isServer) {
      config.externals.push({
        'three': 'three',
        '@react-three/fiber': '@react-three/fiber',
        '@react-three/drei': '@react-three/drei'
      });
    }

    return config;
  },
  // Transpile Three.js modules
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei'],
  // Experimental features for better compatibility
  experimental: {
    esmExternals: 'loose'
  }
}

module.exports = nextConfig