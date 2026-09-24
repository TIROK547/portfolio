const editorHost = [{ type: 'host', value: 'blogs\\..*' }];

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  serverExternalPackages: ['better-sqlite3'],
  eslint: {
    ignoreDuringBuilds: true,
  },
  // blogs.tirok.ir serves the editor from /admin/* without showing the prefix.
  // Access control for both hosts lives in middleware.ts.
  async rewrites() {
    return {
      beforeFiles: [
        { source: '/', has: editorHost, destination: '/admin' },
        { source: '/login', has: editorHost, destination: '/admin/login' },
        { source: '/posts/:path*', has: editorHost, destination: '/admin/posts/:path*' },
        { source: '/projects', has: editorHost, destination: '/admin/projects' },
        { source: '/projects/:path*', has: editorHost, destination: '/admin/projects/:path*' },
      ],
    };
  },
};

module.exports = nextConfig;
