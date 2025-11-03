/** @type {import('next').NextConfig} */
const nextConfig = {
  i18n: {
    locales: ["en", "ur"], // 🌍 جتنی زبانیں چاہیے
    defaultLocale: "en", // 🇬🇧 ڈیفالٹ زبان
  },

  experimental: {
    serverActions: true,
  },

  eslint: {
    // ✅ Ignore ESLint errors during production builds
    ignoreDuringBuilds: true,
  },

  typescript: {
    // ✅ Ignore TypeScript type errors during production builds
    ignoreBuildErrors: true,
  },

  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,DELETE,PATCH,POST,PUT" },
          {
            key: "Access-Control-Allow-Headers",
            value:
              "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;