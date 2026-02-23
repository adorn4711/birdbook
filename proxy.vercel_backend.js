const bypassSecret = process.env.VERCEL_BYPASS_SECRET ?? '';
const bypassHeaders = bypassSecret
  ? {
      'x-vercel-protection-bypass': bypassSecret,
      'x-vercel-set-bypass-cookie': 'true',
    }
  : {};

module.exports = {
  '/api': {
    target: 'https://googlesheetbackend-git-dev-adorn4711s-projects.vercel.app',
    secure: true,
    changeOrigin: true,
    logLevel: 'debug',
    headers: bypassHeaders,
    pathRewrite: {
      '^/api': '',
    },
  },
};
