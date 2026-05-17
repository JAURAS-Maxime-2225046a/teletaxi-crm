import nextConfig from 'eslint-config-next/core-web-vitals';

const config = [
  { ignores: ['src-tauri/target/**', 'out/**', '.next/**', 'mockups_originaux/**'] },
  ...nextConfig,
];

export default config;
