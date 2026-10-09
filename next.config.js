const path = require('path');

/*
 * next-intl 需要把 `next-intl/config` 指向请求配置文件。
 * 官方插件 next-intl/plugin 做的就是这件事，但它在加载时会 require @swc/core（仅供实验性的
 * 文案提取功能使用），本机环境下 swc 原生模块无法加载，因此这里手动配置等价的别名。
 * 若以后需要 messages extraction 等实验功能，再换回 createNextIntlPlugin()。
 */
const I18N_REQUEST = './src/i18n/request.ts';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  images: {
    formats: ['image/webp'],
  },
  // next dev --turbopack 使用（必须是相对路径）
  turbopack: {
    resolveAlias: {
      'next-intl/config': I18N_REQUEST,
    },
  },
  // 默认的 webpack 构建使用（必须是绝对路径）
  webpack(config) {
    config.resolve.alias['next-intl/config'] = path.resolve(__dirname, I18N_REQUEST);
    return config;
  },
};

module.exports = nextConfig;
