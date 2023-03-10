---
layout: ../../layouts/MarkdownPostLayout.astro
title: '记一次「 包轮子 」的经历'
pubDate: 2023-03-02
description: '重新拾起 C++ 开发已经有 8 个月了'
author: 'kok-s0s'
image:
  url: '/images/rocket.jpg'
  alt: 'Rocket'
tags: ['C++', 'Test', 'Cross-platform']
---

> [cxx_crud_file](https://github.com/kok-s0s/cxx_crud_file)

## 起因

被分配一个任务，用现今的 C++ 标准改写一个原先用 Qt 编写的代码。就是要去除掉那些 Q 开头的代码（QString、QVariant、QSetting 和 QFile 等等）。

重新用 C++ 标准改写的这份代码，扩展性就会更强，当然 Qt 的生态也不错，不过业务需求如此罢了，不展开具体内容。

## 开始「 包轮子 」

### 测试驱动开发

> Test-Driven Development (TDD)
>
> [VSCode | CMake | C++ | TDD](https://vscode-cmake-cxx-tdd.netlify.app)

整个项目使用 GoogleTest 来做单元测试，开发过程中，先编写测试用例，然后再编写代码，最后再运行测试用例，看看是否通过，不通过，则修改代码，直到通过为止。



### TxtFile

### IniFile

### JsonFile

### DatFile

### BmpFile

### ImgFile

## 小造轮子

### UString

## 借轮子

### Variant

## Filesystem library

### UFile

## End
