---
title: 'Developing a VS Code Extension for a Language'
description: 'A VS Code extension that provides code formatting and syntax highlighting for a robot language.'
---

> For any language, the distribution of spaces and blank lines is truly an art of arrangement.

[repo](https://github.com/kok-s0s/rlang)

I had never developed a VS Code plugin before, so I originally planned to write an article to record the process.

After actually writing the code, I found that current VS Code plugin development is mainly about configuration and handling different kinds of input. Compared with the plugin development I touched in college, it is much simpler. As long as there is not too much complex business logic, it is a straightforward thing.

[Extension API](https://code.visualstudio.com/api)

---

## Background

To make robots move, different vendors often provide their own programming languages. But when end users actually use such a language, most of them do not program professionally. They usually understand the meaning of each statement through the manual, write some programs according to the actual working conditions, and stop once the program can run. The readability of the code is often not good.

Sometimes I receive projects sent by technical support. I usually use VS Code to inspect the code files, and the readability of these projects is generally poor.

So I wanted to build a support extension for this Robot Language in the VS Code ecosystem.

## Features

- Syntax highlighting that adapts to the current VS Code theme
  - Custom field highlighting is supported, and colors can be configured
- Code formatting that follows the language specification

![](/images/vscode_extension/00.png)

![](/images/vscode_extension/01.png)

![](/images/vscode_extension/02.png)

