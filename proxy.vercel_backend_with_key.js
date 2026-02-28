
module.exports = {
  '/api': {
    target: 'https://googlesheetbackend-git-dev-adorn4711s-projects.vercel.app',
    secure: true,
    changeOrigin: true,
    logLevel: 'debug',
    pathRewrite: {
      '^/api': '',
    },
  },
};
