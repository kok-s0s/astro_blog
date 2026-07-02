import rss from '@astrojs/rss'

export async function GET(context) {
  const site = new URL(import.meta.env.BASE_URL || '/', context.site)
  const allPostModules = import.meta.glob('./posts/**/*.md', { eager: true })
  const posts = Object.values(allPostModules)
    .filter((post) => post.frontmatter?.title)
    .map((post) => ({
      title: post.frontmatter.title,
      pubDate: new Date(post.frontmatter.pubDate || post.frontmatter.updatedDate || '2020-01-01'),
      description: post.frontmatter.description || '',
      link: post.url || '/',
    }))
    .sort((a, b) => b.pubDate - a.pubDate)

  return rss({
    title: 'kok-s0s · 博客',
    description: '关于 C++、Qt、工具链和软件开发的技术文章',
    site,
    items: posts,
    customData: '<language>zh-cn</language>',
  })
}
