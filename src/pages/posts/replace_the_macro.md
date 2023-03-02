---
layout: ../../layouts/MarkdownPostLayout.astro
title: 'Python -- 用 #ifndef 替换 #pragma once'
pubDate: 2023-03-02
description: '需要重复处理的文件过多了，就别 Ctrl C、Ctrl V 了,写点 Python 最合适了。'
author: 'kok-s0s'
image:
  url: '/images/python_code.jpeg'
  alt: 'Python Code'
tags: ['C++', 'Python', 'Cross-platform']
---

## 代码背景

`#pragma once` 和 `#ifndef` 都可用于防止头文件被两次编译。

不过 `#pragma once` 是依托微软编译器來使用，不支持跨平台。

`#ifndef` 的写法是 `C++` 标准支持的，能够跨平台使用。

因此用 `#ifndef` 來替换掉原先代码中存在的 `#pragma once`。

## 用用 Python 利器

一般处理多文本文件，我就会分成两块：

1. 遍历多文件，这里即 `traverse_directory`，目录遍历文件的代码可复用；
2. 文件文本处理，这里即 `replace_the_marco`，文本处理的代码根据需求來做修改；

```python
import os


def replace_the_marco(cur_file_name: str) -> bool:
    flag: bool = False

    basename: str = os.path.basename(cur_file_name)
    file_name: str = basename.split(".")[0].upper()
    suffix: str = basename.split(".")[1].upper()
    macro: str = file_name + "_" + suffix + "_"
    first_sentence: str = "#ifndef " + macro
    second_sentence: str = "#define " + macro
    third_sentence: str = "#endif // " + macro

    lines: list[str] = []

    with open(cur_file_name, mode="r", encoding="utf-8") as file:
        index: int = 0  # 只找前三行
        for line in file:
            temp_item: str = line.strip()

            if index < 3:
                if temp_item == "#pragma once":
                    flag = True
            else:
                break

            index = index + 1
            lines.append(line)
        file.close()
    if flag:
        print("\nModify the macro for " + basename + "!\n")
        with open(cur_file_name, mode="w", encoding="utf-8") as file:
            for line in lines:
                if "#pragma once" in line:
                    file.write("%s\n" % first_sentence)
                    file.write("%s\n" % second_sentence)
                else:
                    file.write("%s" % line)

            file.write("\n%s\n" % third_sentence)
            file.close()
    else:
        print("The " + basename + " does not need to be modified!\n")

    return flag


def traverse_directory(cur_dir: str):
    for cur_dir_item in os.listdir(cur_dir):
        cur_path_name: str = cur_dir + "/" + cur_dir_item

        if cur_dir_item[-3:] == "hpp" or cur_dir_item[-1:] == "h":
            replace_the_marco(cur_path_name)
        elif os.path.isdir(cur_path_name):
            traverse_directory(cur_path_name)


if __name__ == "__main__":
    folder_absolute_path: str = ""
    traverse_directory(folder_absolute_path)
```
