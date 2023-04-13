---
layout: ../../layouts/MarkdownPostLayout.astro
title: 'Astro 不错哟！'
pubDate: 2023-02-28
description: '一个生成器，支持 markdown，能自己写 css 改样式，而且构建非常非常模块化，岛屿的概念有意思，这技术超适合我这种喜欢用 markdwon 记录的人，更何况我还做过一段时间的切图仔，用的很轻松，这里写篇文章记录下构建过程，以及说些使用感受。'
author: 'kok-s0s'
image:
  url: '/images/astro.png'
  alt: 'Astro'
tags: ['Front-End']
---

> 先贴一个[官方教程](https://docs.astro.build/en/tutorial/0-introduction/)，本博客的搭建就是按照这个教程来的。

## Why Astro?

> [Why Astro?](https://docs.astro.build/en/concepts/why-astro/) - Astro 官方认为选择 Astro 这门技术的原因。

这门技术为一个静态网站生成器，能将 markdown 文件渲染成 HTML，类似的有很多（Hexo、Hugo 和 Jekyll 等等），只不过它的构建相较其它生成器来说更透明。

这个透明就是我更清楚其中的代码是怎么运行的。其它的生成器，前期一般只需设置好一些部署环境，然后部署即可运行。拿 [Hexo](https://hexo.io/zh-cn/docs/) 来说，作为内容创作者，仅需编写一些 markdown 文件，然后提交到 git 仓库，它会自动触发网页更新，markdown 被渲染为一个网页。这样的好处是，不需要关心网站的构建过程，只需要专注于内容的创作。

而 Astro
