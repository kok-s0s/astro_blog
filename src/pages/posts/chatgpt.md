---
layout: ../../layouts/MarkdownPostLayout.astro
title: 'ChatGPT'
pubDate: 2023-03-31
description: '使用 ChatGPT 已经有一段时间，用文字记录点东西。'
author: 'kok-s0s'
image:
  url: '/images/chatgpt.jpg'
  alt: 'ChatGpt'
tags: ['AI', 'Future']
---

> 水篇博文 /doge。

开头挂个教程

- [Learning Prompt](https://learningprompt.wiki/)

开头挂几个视频链接

- [使用 ChatGPT 的一些例子](https://exchange.scale.com/public/videos/llm-prompt-engineering-and-rlhf-history-and-techniques-2023-03-09)
- [超级小華](https://www.bilibili.com/video/BV1nM411M7LQ/?spm_id_from=333.1007.tianma.2-1-4.click&vd_source=185b9722c87eb76ed0f36d4e932d1a6a)
- [不高兴就喝水](https://www.bilibili.com/video/BV19M4y1d77m/?spm_id_from=333.1007.tianma.1-2-2.click&vd_source=185b9722c87eb76ed0f36d4e932d1a6a)

---

个人感觉，如果说互联网的出现，将知识从 “实体” 形式转换为 “数字” 形式存储起来，让人们相较过往，更容易接触到各种各样的知识。那么，ChatGPT 这种可对话的 AI，很容易地将知识做一个整合，将整合的内容再反馈给提问者。

> [Web Searching Skills](https://www.graniteschools.org/edtech/tip/information-and-media-literacy-skills/web-search-skills/)

过往，一般（说我自己），在计算机方面打算做一个小玩具（桌面计时器啦），会组合几个搜索的关键词，去 Google 上搜索，然后再从搜索结果中找到自己想要的答案。整个过程会花费掉一些时间，而且，搜索结果中的内容，往往不是自己想要的，还需要再花费一些时间去过滤掉不想要的内容。最终还要我自己整合出我所需要的信息。

但现在，我可以直接描述我打算做一个什么东西，ChatGPT 会给我一些尽可能接近的回答，我再继续追问，ChatGPT 返回的答案，会越来越接近我想要的答案。这个过程，相较我自己去搜索，会更加快速。

但我对于 ChatGPT 返回的回答，其所述说的知识准确性也是需要再三确认的。记住，最终做判断还是我们人类本身，AI 只是辅助我们做决策。

---

![](/images/use_chatgpt.jpg)

网络上有关 ChatGPT 这类 AI 的应用有很多视频或文章，基本现在各大资讯渠道有关这方面的资讯应该不少。我这里只介绍我个人所用到的，谈谈使用感受。

## Easy

### 生成配置环境教程

太爽了，说清楚你什么系统（最好能说版本号就说），你要做什么事情，做这个事情大概会安装什么，做个甲方，给 ChatGPT 提需求，ChatGPT 就能从训练的数据（无数前人配置环境踩过的坑）中找到适合你的配置环境教程。当你想去学习某些新技术，很难再卡在配置环境那一环节了。

> 小白入门新技术，输出 “Hello World！”。

### 生成目标脚本

年初，还打算自我增值，学一波 Linux 下的 [shell 脚本知识](https://github.com/kok-s0s/_script)，ChatGPT 一出，我已经失去继续学习的欲望。我只要面向 ChatGPT 编程即可。而且本身 shell 脚本的很多知识就很模块化，将各种 shell 命令根据你所描述的需求去组合并不是一件难事（对 ChatGPT 而言）。不仅是 shell，对于 Python 这门脚本语言来说，ChatGPT 也能生成目标脚本去处理一些文本数据或者做一些自动化操作。

### 生成函数（函数式编程）

> 函数式编程中的函数 == 真正的数学函数，其引用透明，即只要使用相同的输入调用函数，将始终得到相同的输出。

这类函数让 ChatGPT 生成真是嘎嘎简单。只要你描述清楚你的需求，ChatGPT 就能生成你想要的函数。

这是我重新拾起 C++ 开发 5 个月后写的一个字符串分割函数（网上找了一份 Linux 下 C 语言，加了个 Windows 的版本，测试能跑就没管了）。

```cpp
std::vector<std::string> split(const std::string &data,
                               const std::string &separator) {
  std::vector<std::string> result;
  if (data == "") return result;

#if defined(_MSC_VER)
  char *next_token = NULL;
  char *token =
      strtok_s((char *)data.c_str(), separator.c_str(), &next_token);
  while (token) {
    result.push_back(token);
    token = strtok_s(NULL, separator.c_str(), &next_token);
  }
#elif defined(__GNUC__)
  char *token = strtok((char *)data.c_str(), separator.c_str());
  while (token) {
    result.push_back(token);
    token = strtok(NULL, separator.c_str());
  }
#endif

  return result;
}
```

这是 ChatGPT 生成的函数，我只是把我上面写的这个函数丢给它，让它帮我优化，就返回一个十分简练的函数，一对比，就很不错。ChatGPT 非常适合写这种和业务逻辑无关的函数。毕竟网络上的相关实现，想来这么多年也是积攒了不少。

```cpp
std::vector<std::string> split(const std::string &data,
                               const std::string &separator) {
  std::vector<std::string> result;
  std::stringstream ss(data);
  std::string item;
  while (std::getline(ss, item, separator[0])) {
    result.push_back(item);
  }
  return result;
}
```

### 数学计算（问的别太夸张）

感觉，就我大学学过的数学相关的知识（高数、线性代数和概率论等等），ChatGPT 都能给我很好的回答。当然，也有可能是因为我所需解决的数学问题相较来说还蛮普通。问的时候最好别想着只要个结果，最好要让它把全部推导过程说清楚，否则那个可信度，自行根据自己的数学知识再做判断。

### 单元测试（TDD）

> TDD（Test-Driven Development）是一种软件开发过程，它是由 Kent Beck 在 1999 年提出的。TDD 是一种通过编写测试来驱动开发的过程。在 TDD 过程中，开发者先编写一个失败的单元测试，然后编写一些代码来使单元测试通过，最后重构代码。

接上面的函数式编程，其引用透明的特性，ChatGPT 很容易根据这些函数编写对应的单元测试，测试函数的输入输出是否符合预期。

## Still Hard

### 复杂一点点的业务逻辑

这方面，ChatGPT 还是有点弱，即使你自认为能描述清楚你的业务需求，ChatGPT 也不一定能给你一个满意的答案。毕竟业务这种东西本身就带有主观性，而且，ChatGPT 是通过大量的数据训练出来的一种产物，ChatGPT 本身带的客观性相较来说还是蛮强的。所以，即使 ChatGPT 能生成一些代码，还是需要你自己去根据业务的实际情况去做些调整。

这里放一个我在做的文件读写工具的[链接](https://github.com/kok-s0s/cxx_crud_file)，ChatGPT 能帮我编写不错的文件读写代码（文件读写相关的代码网络上太多了），但是它不理解我在文件读写之上，根据所需的业务代码而确定的接口，那个工具是为了替换 Qt 代码而创建的，但要确保接口（返回值与传递参数）不变，要不然到时整体代码的改动会很大，改的很累。即使我把这个接口规范丢给 ChatGPT，它也不能给我一个满意的答案。这一块还是需要我自己去做调整。

## End

ChatGPT 的出现，让我感觉这是一个新的 Apple 时刻（iPhone 触屏手机的出现）。未来，使用 ChatGPT 这类 AI 会越来越普遍，而且，这类 AI 会越来越智能。总之，还蛮期待，这会发展成什么样子。

> 这篇文章会持续更新，看看 ChatGPT 还能做些什么。
