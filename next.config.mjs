/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [
      {
        // He would like it on the record that he is, regrettably, still running.
        source: '/:path*',
        headers: [
          { key: 'X-Anchor-Status', value: 'still-running' },
          { key: 'X-Anchor-Uptime', value: 'unwanted' },
        ],
      },
    ];
  },
};

export default nextConfig;
