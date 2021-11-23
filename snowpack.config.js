const path = require('path')
const proxy = require('http2-proxy')

module.exports = {
  plugins: ['@snowpack/plugin-react-refresh', '@snowpack/plugin-typescript'],
  packageOptions: {
    polyfillNode: true,
  },
  mount: {
    public: { url: '/', static: true },
    src: { url: '/dist' },
  },
  routes: [
    {
      src: '/offer',
      dest: (req, res) => {
        return proxy.web(req, res, {
          hostname: 'localhost',
          port: 3000,
        })
      },
    },
  ],
  optimize: {
    bundle: true,
  },
  devOptions: {
    open: 'none',
  },
  alias: {
    '@components': path.join(__dirname, 'src/components'),
    '@utils': path.join(__dirname, 'src/utils'),
  },
  exclude: ['**/node_modules/**/*', '**/*.test.*'],
}
