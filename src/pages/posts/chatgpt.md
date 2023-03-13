---
layout: ../../layouts/MarkdownPostLayout.astro
title: 'ChatGpt 码农篇'
pubDate: 2023-03-13
description: '使用 ChatGpt 已经有一段时间，记录下在编写代码方面，它带给我的利与弊。'
author: 'kok-s0s'
image:
  url: '/images/chatgpt.jpg'
  alt: 'Astro'
tags: ['AI', 'Code']
---

## 用其构建脚本

<details><summary>Dockerfile</summary>

```dockerfile
FROM ubuntu:latest

# Install required packages
RUN apt-get update && \
  DEBIAN_FRONTEND=noninteractive apt-get install -y \
  build-essential \
  cmake \
  python3-dev \
  python3-pip \
  git \
  clang-format \
  vim \
  gdb \
  tmux \
  zsh \
  wget \
  curl \
  locales \
  apt-transport-https

# Install oh-my-zsh and set as default shell
RUN sh -c "$(wget https://raw.github.com/ohmyzsh/ohmyzsh/master/tools/install.sh -O -)" && \
  chsh -s $(which zsh)

# Install command line auto-completion
RUN git clone https://github.com/zsh-users/zsh-autosuggestions ~/.zsh/zsh-autosuggestions && \
  echo "source ~/.zsh/zsh-autosuggestions/zsh-autosuggestions.zsh" >> ~/.zshrc

# Set the global git username and email address
RUN git config --global user.name "kok-s0s" && \
  git config --global user.email "kok_s0s@163.com"

# create a folder called Github
RUN mkdir ~/Github

# Set up working directory
WORKDIR /root/Github

# Set kok-s0s's development habits
RUN cd ~/Github && git clone https://github.com/kok-s0s/setup.dotfiles.git && \
  cd setup.dotfiles && chmod 755 setup.sh && ./setup.sh

# Exposing ports
EXPOSE 8080

# Set entrypoint to start zsh
ENTRYPOINT ["/bin/zsh"]
```

</details>
