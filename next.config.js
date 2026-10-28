/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // o knex carrega todos os dialetos dinamicamente; mantendo-o como pacote
    // externo o webpack nao tenta resolver oracledb, mariadb, pg, etc.
    serverComponentsExternalPackages: ['knex', 'mysql2', 'bcryptjs'],
  },
  webpack(config, { isServer }) {
    if (isServer) {
      config.externals = [...(config.externals || []), 'knex', 'mysql2'];
    }
    return config;
  },
};

module.exports = nextConfig;
