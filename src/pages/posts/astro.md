---
layout: ../../layouts/MarkdownPostLayout.astro
title: 'Astro'
pubDate: 2023-02-28
description: '一个生成器，支持 markdown，能自己写 css 改样式，而且构建非常非常模块化，岛屿的概念有意思，这技术超适合我这种喜欢用 markdwon 记录的人，更何况我还做过一段时间的切图仔，用的很轻松，这里写篇文章记录下构建过程，以及说些使用感受。'
author: 'kok-s0s'
image:
  url: '/images/astro/astro.png'
  alt: 'Astro'
tags: ['Front-End']
---

> 先贴一个[官方教程](https://docs.astro.build/en/tutorial/0-introduction/)，本博客的搭建就是按照这个教程来的。

## Why Astro?

> [Why Astro?](https://docs.astro.build/en/concepts/why-astro/) - Astro 官方认为选择 Astro 这门技术的原因。

这门技术为一个静态网站生成器，能将 markdown 文件渲染成 HTML，类似的有很多（Hexo、Hugo 和 Jekyll 等等），只不过它的构建相较其它生成器来说更透明。

这个透明就是我更清楚其中的代码是怎么运行的。其它的生成器，前期一般只需设置好一些部署环境，选择一个主题，然后部署即可运行。拿 [Hexo](https://hexo.io/zh-cn/docs/) 来说，作为内容创作者，仅需编写一些 markdown 文件，然后提交到 git 仓库，它会自动触发网页更新，markdown 被渲染为一个网页。这样的好处是，不需要关心网站的构建过程，只需要专注于内容的创作。

而 Astro 的构建，就是一个完整的前端项目。

<details><summary>本博客的项目结构</summary>

```bash
.
├── public
│   ├── css
│   └── images
├── src
│   ├── components
│   ├── layouts
│   ├── pages
│   ├── scripts
│   └── styles
├── astro.config.mjs
├── package.json
└── tsconfig.json
```

</details>

- `public`：存放静态资源，如图片、css 等。
- `src`：存放源代码。
  - `components`：存放组件。
  - `layouts`：存放布局。
  - `pages`：存放页面。
  - `scripts`：存放脚本。
  - `styles`：存放样式。
- `astro.config.mjs`：Astro 配置文件。
- `package.json`：项目配置文件。
- `tsconfig.json`：TypeScript 配置文件。

项目结构和一般的前端项目没什么太大的差别，但用 Astro 创建的项目，支持将 markdown 文件渲染成 HTML，且有路由功能，就都无需额外安装插件去满足这些功能。

这就是我看重它的地方，开箱即用。将 Astro 技术用于开发博客这类网站，能渲染 markdown 文件，相较其它的前端模板，能省去很多事；Astro 能根据文件的存放位置自动生成相应的路由，做导航功能就会很方便。

且 Astro 提到的 Astro 群岛（又称组件群岛）概念蛮有意思。

![island](/images/astro/island.png)

**看图说话** - Astro 只会渲染变化的地方，不变的地方就仍是保持不变。各个模块之间的关系，就像是群岛，各岛屿之间互不干扰。按 Astro 官方的说法，这样的设计能够提高网站的性能。

其实我搭建的这博客网站体量还是太小了，感受不出用 Astro 所搭建的网站相比其它前端框架/生成器所搭建的网站有什么性能上的提升，但这个岛屿的概念还是很有意思的。/doge

> 更多详情请参考[官方文档](https://docs.astro.build/zh-cn/concepts/islands/)。

## 我用了这门技术的哪些东西

> 本博客源码 - [astro_blog](https://github.com/kok-s0s/astro_blog)

**Astro 考虑很全**，我用的很少（按需使用），文档不错。

### markdown

不仅能将 markdown 渲染成网页，Astro 还支持[语法高亮](https://docs.astro.build/zh-cn/guides/markdown-content/#%E8%AF%AD%E6%B3%95%E9%AB%98%E4%BA%AE)（内置支持 Shiki 和 Prism），本博客用的是 prism 语法高亮模块，主题用的 `nord`。

还有很多[其它功能](https://docs.astro.build/zh-cn/guides/markdown-content/)： 草稿功能、渲染 mdx 文件和[内容集合](https://docs.astro.build/zh-cn/guides/content-collections/)（多语言或拼接信息）等等，我都没用到。/doge

### 路由

> Astro 的**路由基于文件**，它根据项目的 src/pages 目录中的文件结构来生成你的构建链接。当一个文件被添加到 src/pages 目录中，它将自动基于文件名生成与之对应的路由。-- [官方文档](https://docs.astro.build/zh-cn/core-concepts/routing/)

我博客的标签页面就有用到其中的动态路由。

<details><summary>代码</summary>

```javascript
export async function getStaticPaths() {
  const projectPosts = await Astro.glob('../posts/*.md')
  const cleanCxxPosts = await Astro.glob('../posts/clean_cxx/*.md')
  const cxxCreationalPatternsPosts = await Astro.glob('../posts/cxx_design_patterns/creational_patterns/*.md')
  const cxxStructuralPatternsPosts = await Astro.glob('../posts/cxx_design_patterns/structural_patterns/*.md')
  const cxxBehavioralPatternsPosts = await Astro.glob('../posts/cxx_design_patterns/behavioral_patterns/*.md')
  const projectTags = [...new Set(projectPosts.map((post) => post.frontmatter.tags).flat())]
  const cleanCxxTags = [...new Set(cleanCxxPosts.map((post) => post.frontmatter.tags).flat())]
  const cxxCreationalPatternsTags = [...new Set(cxxCreationalPatternsPosts.map((post) => post.frontmatter.tags).flat())]
  const cxxStructuralPatternsTags = [...new Set(cxxStructuralPatternsPosts.map((post) => post.frontmatter.tags).flat())]
  const cxxBehavioralPatternsTags = [...new Set(cxxBehavioralPatternsPosts.map((post) => post.frontmatter.tags).flat())]
  const uniqueTags = [
    ...new Set([
      ...projectTags,
      ...cleanCxxTags,
      ...cxxCreationalPatternsTags,
      ...cxxStructuralPatternsTags,
      ...cxxBehavioralPatternsTags,
    ]),
  ]
  const allPosts = projectPosts
    .concat(cleanCxxPosts)
    .concat(cxxCreationalPatternsPosts)
    .concat(cxxStructuralPatternsPosts)
    .concat(cxxBehavioralPatternsPosts)

  return uniqueTags.map((tag) => {
    const filteredPosts = allPosts.filter((post) => post.frontmatter.tags.includes(tag))
    return {
      params: { tag },
      props: { posts: filteredPosts },
    }
  })
}

const { tag } = Astro.params
const { posts } = Astro.props
```

</details>

这里的 `tag` 由外部传入，经过 `getStaticPaths` 函数处理，得到 `tag` 对应的 `posts`，再利用该数据，展示所有属于该 `tag` 的博文。

很容易的就有一个标签页面以及各个标签的详情页面。

### `.astro`

Astro 有自己的一种文件类型 `.astro`，可以在其中像类似 `.vue` 一样，写 HTML、CSS、JS。

且 Astro 支持集成其它框架（如 React、Vue、Svelte 等），这样就可以在 `.astro` 文件中使用其它框架的组件。

但我没用，我这博客感觉前端三剑客（HTML、CSS、Vanilla JS）就够用了。

## End

Astro 这门技术**以内容为中心**，用来做博客很方便（毕竟其官方教程就是教如何用其技术做一个博客）。

起初写篇文章还想夸赞下这门技术，但自己仔细 code review 自己的代码，以及更认真看官方文档，发现也才用了 Astro 一小部分的功能，很难客观评价说这门技术的优劣。

不过使用下来的感受，还是很不错的，值得推荐。
