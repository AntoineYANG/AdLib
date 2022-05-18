/**
 * @type {import('webpack-dev-server').Configuration['proxy']}
 */
const proxyConfig = {
  '/audio-upload': 'http://localhost:4000/'
};

module.exports = proxyConfig;
