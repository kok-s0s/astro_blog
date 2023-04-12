---
layout: ../../layouts/MarkdownPostLayout.astro
title: '造个 C++ 线程基类'
pubDate: 2023-03-24
description: '以剔除 Qt 的 QThread 为目标而诞生的项目。设计的线程基类有着类似 Qt 中信号与槽机制，且利用 C++ 的互斥量和条件变量，让槽函数能够异步或同步运行，这样派生类能构建个定时器来做定时任务。'
author: 'kok-s0s'
image:
  url: '/images/space.jpg'
  alt: 'Space'
tags: ['C++', 'Test', 'Concurrent Programming']
---

> [cxx_thread](https://github.com/kok-s0s/cxx_thread)

## 起因

和 [记一次「 包轮子 」的经历](/posts/cxx_crud_file) 的起因一样，只不过这个项目是为了剔除 Qt 的 `QThread` 而诞生的。

## 如何设计

### 先明确需求

目标 -> 替换掉 `QThread`
