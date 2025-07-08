---
layout: ../../layouts/Post.astro
title: '为一门语言开发一个 VSCode 插件'
pubDate: 2025-06-17
updatedDate: 2025-07-08
description: '具备 Code Format 以及 语法高亮等功能'
author: 'kok-s0s'
image:
  url: '/images/vscode_extension/vscode.jpg'
  alt: 'VSCode'
tags: ['Extension', 'TypeScript']
---

> 无论什么语言，空格和空行的分布真是一门排列的艺术。

[repo](https://github.com/kok-s0s/rlang)

原本从来没有开发过 VSCode Plugin，还想着写篇文章记录下。

但实际编码下来，现在的 VSCode Plugin 开发重点在于配置以及各种输入的处理，比我大学时期接触的插件开发简单多了，不涉及过多复杂的业务处理的话，就是很简单直接的事情。

[Extension API](https://code.visualstudio.com/api)

---

## 开发背景

想要让机器人运动，各家都有自己的一门编程语言，但是实际使用者使用这门语言的时候，绝大多数终端用户并不会编程，只是简单通过手册了解了下各语句的意义，以及结合实际工况所需编写了一些程序，基本能跑就完事了，代码没有任何可读性可言。

有时候拿到技术支持发过来的工程，个人一般使用 VSCode 去查看代码文件，普遍拿到的工程可读性很差。

就想着在 VSCode 生态为这门 Robot Language 语言做一个 Support 插件。

## 功能

- 语法高亮 - 自适应 VSCode 主题
  - 支持自定义字段高亮，颜色可设定
- 代码格式化 - 符合该语言规范

![](/images/vscode_extension/00.png)

![](/images/vscode_extension/01.png)

![](/images/vscode_extension/02.png)
