/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    esmExternals: true
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false
      };
    }
    return config;
  },
  // Add these options
  output: 'standalone',
  transpilePackages: [
    '@solana/web3.js',
    '@coral-xyz/anchor',
    '@solana-agent-kit/plugin-blinks',
    '@solana-agent-kit/plugin-defi',
    '@solana-agent-kit/plugin-misc',
    '@solana-agent-kit/plugin-nft',
    '@solana-agent-kit/plugin-token',
    'solana-agent-kit'
  ]
};

export default nextConfig;