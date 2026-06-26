/** @type {import('next').NextConfig} */

// For GitHub Pages "project sites" the app is served from
// https://<user>.github.io/<repo>, so assets must be prefixed with "/<repo>".
// Set NEXT_PUBLIC_BASE_PATH="/your-repo-name" before building in that case.
// Leave it unset for user/org pages or custom domains served from the root.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''

const nextConfig = {
  // Emit a fully standalone static site into the `out/` folder.
  output: 'export',
  // Static export cannot use the Next.js image optimizer (no server).
  images: {
    unoptimized: true,
  },
  // Generate `path/index.html` files so links work without a server rewrite.
  trailingSlash: true,
  basePath: basePath || undefined,
  assetPrefix: basePath || undefined,
}

export default nextConfig
