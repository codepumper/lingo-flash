import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;


const isProd = process.env.NODE_ENV === 'production'

module.exports = {
	basePath: isProd ? '/<repository-name>' : '',
	assetPrefix: isProd ? '/<repository-name>/' : '',
}
