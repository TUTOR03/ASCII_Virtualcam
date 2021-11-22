const path = require('path')

module.exports = {
  plugins: ['@snowpack/plugin-react-refresh', '@snowpack/plugin-typescript'],
  packageOptions: {
    polyfillNode: true,
  },
  mount: {
    public: { url: '/', static: true },
    src: { url: '/dist' },
  },
  optimize: {
    bundle: true,
  },
  devOptions: {
    open: 'none',
  },
  alias: {
    '@components': path.join(__dirname, 'src/components'),
  },
  exclude: ['**/node_modules/**/*', '**/*.test.*'],
}
