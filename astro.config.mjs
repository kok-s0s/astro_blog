import { defineConfig } from 'astro/config'

// https://astro.build/config
import preact from '@astrojs/preact'
import sitemap from '@astrojs/sitemap'

import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'

const site = process.env.SITE || 'https://kok-s0s.github.io'
const base = (process.env.BASE_PATH || '').replace(/\/$/, '')

function prefixRootPaths() {
  const prefix = base

  return (tree) => {
    if (!prefix) return

    const visit = (node) => {
      if (node?.properties) {
        for (const prop of ['href', 'src']) {
          const value = node.properties[prop]
          if (typeof value === 'string' && value.startsWith('/') && !value.startsWith('//')) {
            node.properties[prop] = `${prefix}${value}`
          }
        }
      }

      if (Array.isArray(node?.children)) {
        node.children.forEach(visit)
      }
    }

    visit(tree)
  }
}

// https://astro.build/config
export default defineConfig({
  site,
  base,
  integrations: [preact(), sitemap()],
  markdown: {
    // Can be 'shiki' (default), 'prism' or false to disable highlighting
    syntaxHighlight: 'prism',
    remarkPlugins: [remarkMath],
    rehypePlugins: [[rehypeKatex, { strict: false }], prefixRootPaths],
  },
})
