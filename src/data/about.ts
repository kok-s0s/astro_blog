export const selfInfo = [
  '在程序开发，更喜欢给自己制定一个目标来驱动自己逐步完成它',
  '并没有特别讨厌或者很喜欢的语言，在过往一年中，最常用的是 C++ 和 Qt 这两门语言。现在对于各种语言的态度，更多是看要去解决什么样的问题，以及有多少时间去解决这个问题，根据这两点去选择合适的语言来解决问题',
  '有点喜欢 Python 和 Shell 语言，能在工作中节省些许时间',
  '离不开 Code Format',
  '团队开发最喜欢 Code Review 环节',
]

export const skills = ['英语', '网络搜索技巧', '文档阅读能力', '程序调试能力', '复盘总结能力', '会和 ChatGPT 聊天 /doge', '能将业务需求翻译成技术需求']

export const repos = [
  {
    name: 'terminal tools',
    link: 'https://repos-kok-s0s.netlify.app/',
    description:
      '为自己做的一些终端下使用的工具，并无太多技术含量。不过为自己做的小工具，能帮助我自己提高处理事情的效率，还蛮有点成就感的。此外，常写代码，以防手生。',
  },
  {
    name: 'cxx_crud_file',
    link: 'https://github.com/kok-s0s/cxx_crud_file',
    description: `以剔除 Qt 代码（读写功能和数据结构）为目标而诞生的项目。用 UString 替换掉 QString 类型，用 filesystem 库编写个
      UFile 基类，基于它衍生出 JsonFile、IniFile 来替换掉 Qt 的 QJson 和 QSetting 类；用衍生出的 BinFile、TxtFile 和
      BmpFile 来处理二进制文件、文本文件和 bmp 文件。`,
  },
  {
    name: 'cxx_thread',
    link: 'https://github.com/kok-s0s/cxx_thread',
    description: `以剔除 Qt 的 QThread 为目标而诞生的项目。设计的线程基类能搭配类似 Qt 中的信号与槽机制来使用，且利用现代 C++
      提供的互斥量和条件变量，让函数能够同步或异步运行，这样派生类（某业务工作线程）能持有定时器（线程）来做些定时任务（异步）。`,
  },
  {
    name: 'flutter_ffi_opencv',
    link: 'https://github.com/kok-s0s/flutter_ffi_opencv',
    description: `使用 flutter 生态的 FFI 库，可以轻松地将 Dart 代码与现有的 C/C++ 库进行交互，无需编写任何桥接代码，制成 flutter
      生态下的一个插件，这样 flutter 应用就能接入用 C/C++ 所编写的功能模块。`,
  },
  {
    name: 'socket_qt_dotNet',
    link: 'https://github.com/kok-s0s/socket_qt_dotNet',
    description: `使用 Socket 通信技术，实现 Qt 应用和 C# 应用的通信。`,
  },
]

export const booksRead = [
  { status: false, name: 'Crafting Interpreters', description : '刚开始！'},
  { status: true, name: '活文档 与代码共同演进', description: '浅读，不推荐！' },
  { status: true, name: '重构 改善既有代码的设计', description: '翻完，推荐！' },
  { status: true, name: 'Clean C++', description: '读完且记录，推荐！' },
  { status: true, name: 'Linux Shell 脚本攻略', description: '看一半弃了，用 ChatGPT 生成脚本嘎嘎香！' }
]
