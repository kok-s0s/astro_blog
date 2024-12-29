---
layout: ../../layouts/Post.astro
title: 'Qt Dev'
pubDate: 2024-08-06
description: '已经使用这门语言做过不少的项目了，写篇文章记录下一些'
author: 'kok-s0s'
image:
  url: '/images/qt_dev/qt.jpeg'
  alt: 'Qt'
tags: ['Qt', 'C++']
---

## 内存相关

### QPixmap 图像处理

`QPixmap` 这个类有个坑，如果传递的图片分辨率很高，其实例化后的对象会占用很大的内存。比如 7420 x 7074 分辨率的图片，内存占用会是 7420 x 7074 x 4 = 209,366,080 字节，约 200 MB。

### 如何避免这种问题？

- 最直接的，给图的人不能给这么高分辨率的图片。No No No！
- 或者开发人员手动 PS 改一下分辨率，但这样的话，会增加开发人员的工作量。
- 对于大图片，考虑裁剪或按需加载。

## Qt 机制

### 信号与槽

#### Simple


