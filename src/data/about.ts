export const selfInfo = [
  '习惯用目标驱动自己，把一件事拆成可执行的步骤，逐步推进到完成',
  '目前在一家机械臂公司从事客户端应用开发，所在行业是制造业。日常用 C/C++ 写性能敏感的核心逻辑，用 Qt 构建桌面 GUI，用 Python 处理自动化脚本和工具链',
  '对语言没有偏执，选什么取决于要解决什么问题、有多少时间解决——工具服务于目标',
  '在 Agent 编码工具普及的当下，把 AI 当结对编程的搭档，但最终的设计判断和代码审查还是自己来',
  '离不开 Code Format，Code Review 是团队开发里最有价值的环节',
]

export const skills = ['英语', '信息检索与甄别', '文档阅读能力', '程序调试能力', '复盘总结能力', '善用 AI Agent 辅助编码', '能将业务需求翻译成技术需求', '跨领域沟通（软件 × 机械）']

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
  { status: true, name: '《Designing Data-Intensive Application》', description: '不懂数据库的全栈工程师不是好架构师' },
  { status: true, name: '《Crafting Interpreters》', description : '搁置，需有实际项目做验证'},
  { status: true, name: '《活文档 与代码共同演进》', description: '浅读，不推荐！' },
  { status: true, name: '《重构 改善既有代码的设计》', description: '翻完，推荐！' },
  { status: true, name: '《Clean C++》', description: '读完且记录，推荐！' },
  { status: true, name: '《Linux Shell 脚本攻略》', description: '看一半弃了，用 ChatGPT 生成脚本嘎嘎香！' }
]

export const selfInfoEn = [
  'I like to drive myself with clear goals: break work into executable steps, then move steadily toward completion.',
  'I currently build client-side applications at a robotics company in the manufacturing industry. My daily work involves C/C++ for performance-sensitive logic, Qt for desktop GUI, and Python for automation scripts and tooling.',
  'I am pragmatic about programming languages. The right choice depends on the problem, the constraints, and the time available.',
  'I use AI coding agents as pair-programming partners, while keeping final design judgment and code review in my own hands.',
  'Code formatting and code review are two habits I value highly in team development.',
]

export const skillsEn = [
  'English communication',
  'Information search and validation',
  'Technical documentation reading',
  'Program debugging',
  'Postmortem and reflection',
  'AI-assisted coding',
  'Translating business needs into technical requirements',
  'Cross-domain communication between software and robotics',
]

export const reposEn = [
  {
    name: 'terminal tools',
    link: 'https://repos-kok-s0s.netlify.app/',
    description:
      'Small terminal tools built for my own workflow. They are not technically complex, but they make daily work more efficient and keep me writing code regularly.',
  },
  {
    name: 'cxx_crud_file',
    link: 'https://github.com/kok-s0s/cxx_crud_file',
    description:
      'A C++ project created to replace Qt-dependent file and data utilities. It uses UString, filesystem, and small file abstractions for JSON, INI, binary, text, and BMP file handling.',
  },
  {
    name: 'cxx_thread',
    link: 'https://github.com/kok-s0s/cxx_thread',
    description:
      'A modern C++ thread abstraction designed to replace Qt QThread in selected scenarios, with synchronization primitives and a signal-slot-like usage style.',
  },
  {
    name: 'flutter_ffi_opencv',
    link: 'https://github.com/kok-s0s/flutter_ffi_opencv',
    description:
      'A Flutter FFI experiment that connects Dart code with existing C/C++ modules, making native functionality available to Flutter applications.',
  },
  {
    name: 'socket_qt_dotNet',
    link: 'https://github.com/kok-s0s/socket_qt_dotNet',
    description: 'A socket communication demo between a Qt application and a C# application.',
  },
]

export const booksReadEn = [
  { status: true, name: 'Designing Data-Intensive Applications', description: 'A strong systems and architecture book.' },
  { status: true, name: 'Crafting Interpreters', description: 'Paused until I have a practical project to apply it.' },
  { status: true, name: 'Living Documentation', description: 'Lightly read; not strongly recommended.' },
  { status: true, name: 'Refactoring', description: 'Finished; recommended.' },
  { status: true, name: 'Clean C++', description: 'Finished and documented; recommended.' },
  { status: true, name: 'Linux Shell Scripting Cookbook', description: 'Stopped halfway; AI tools cover many of my scripting needs now.' },
]
