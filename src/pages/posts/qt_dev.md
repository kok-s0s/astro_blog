---
layout: ../../layouts/Post.astro
title: 'Qt Dev'
pubDate: 2024-08-06
updatedDate: 2025-05-16
description: '已经使用这门语言做过不少的项目了，写篇文章记录下一些，好吧，直接贴和 GPT 问答过来了 ~~~'
author: 'kok-s0s'
image:
  url: '/images/qt_dev/qt.jpeg'
  alt: 'Qt'
tags: ['Qt', 'C++']
---

## 多线程操作数据而导致的奔溃问题

**多个线程访问同一份数据，其中至少一个线程进行修改操作，而没有任何同步保护。**

具体表现是：

- 一个定时任务不断读取某个数据容器；
- 同时，另一个线程（如回调、事件响应）会向该容器写入数据；
- 如果没有加锁，会导致程序偶发性崩溃或行为异常（例如：读到非法地址、越界、数据错乱等）。

---

### 为什么会崩溃？

即使操作的是一个“看起来稳定”的容器，只要是多线程访问，就可能存在：

- 写入时自动扩容，导致地址变更，另一个线程访问旧地址引发错误；
- 删除或插入元素，破坏容器结构；
- 写入时修改了共享内部状态，读线程看到不完整或未定义的数据。

这些都是典型的**数据竞争问题**，即便出错的概率不高，一旦出问题就是崩溃或严重 bug。

---

### 正确处理方式（通用）

#### 1. **先判断是否有线程交叉访问**

如果一个数据在多个执行路径中被访问（比如 UI 定时器、后台任务、事件回调），要假设它**有可能发生并发冲突**。

---

#### 2. **统一保护共享数据**

用一种**同步机制**（如互斥锁）来确保同一时间只有一个线程可以访问这个数据：

- 无论是读还是写，只要访问，就要加锁；
- 通常加锁逻辑应封装在类内部，不暴露给外部使用者；
- 推荐使用自动管理的锁工具，避免忘记释放锁。

---

#### 3. **加锁区域尽量小**

锁的作用范围只限定在：

> **访问或修改共享数据的那几行代码之内**。

避免在加锁期间做以下操作：

- 更新 UI；
- 写日志；
- 发信号；
- 网络或 I/O；
- 调用外部模块接口。

否则可能导致卡顿甚至死锁。

---

#### 4. **封装成复用结构（可选）**

如果有多个地方会遇到类似需求（比如线程安全的队列、列表、映射表），可以考虑封装成统一的线程安全容器类，例如：

- 支持线程安全的插入、读取、删除操作；
- 封装内部锁机制，避免重复写锁逻辑；
- 可以安全地在多个线程中共享使用。

---

### 以后遇到类似问题的标准流程

| 步骤                  | 操作建议                           |
| --------------------- | ---------------------------------- |
| ✅ 判断是否跨线程访问 | 多线程中共享数据需要重点关注       |
| ✅ 判断是否并发读写   | 即使只是偶尔写，也需保护           |
| ✅ 添加同步机制       | 使用锁机制保护数据一致性           |
| ✅ 避免锁内耗时操作   | 锁只保护数据，不要扩大作用范围     |
| ✅ 考虑封装复用       | 针对常见模式，统一封装为可复用结构 |

---

### 总结一句话

> **只要数据在多个线程间共享访问，就必须使用同步手段保护它的读写操作；否则，一定会在某个时机出现不可预期的错误。**

## QWidget::update() 奔溃问题

典型的“跨平台行为差异引发的非确定性崩溃”

**Windows 与 Linux 下 Qt 信号与槽执行时机、控件重绘机制以及内存分配行为存在差异。**

BUG 相关代码

```cpp
connect(ui->cmbWobjIndex, QOverload<int>::of(&QComboBox::currentIndexChanged), this, [this](int index) {
    ...
    this->update();
    ...
});
```

### 1. Qt 在不同平台上控件行为细节不同（尤其是 `QComboBox`）

#### 在 **Windows** 下：

- `QComboBox::clear()` + `addItem()` 会**自动选中第一个条目**
- 但 **不会立即触发 `currentIndexChanged()`**（有一定延迟，或被 block）
- 所以连接的槽函数不会立即执行

#### 在 **Linux (特别是使用 X11 / Wayland)**：

- 由于 Qt 使用的是更原始的图形系统（非原生控件），重建 combo box 条目时**很可能立即触发 `currentIndexChanged()`**
- 这个时候的 lambda 会立即触发，**此时 UI 还在 rebuild，m_scene 中 item 也可能还未准备好或被清理中**

**→ 导致在 `update()` 时访问了一个不完整状态下的 QWidget，直接导致 `SIGSEGV`。**

---

### 2. 内存布局行为不同

Linux 下：

- Qt 和底层的 `glibc` 分配策略不同，释放内存后指针更容易变成“野指针”
- 内存没有被立即回收/置空，所以对已 delete 对象的访问行为**不是 crash 就是 UB（未定义行为）**

Windows 下：

- Visual C++ 的调试堆对 `delete` 后的指针有保护机制（如写入 `0xCCCCCCCC`）
- 很多时候访问了释放对象的成员，虽然是 bug，但会“默默通过”，甚至没立即崩溃

---

### 3. Qt 的 `QWidget::update()` 在 Linux 平台更加依赖底层绘图栈

Linux Qt 实现通常使用 `QXcbBackingStore`（X11）或 `QWaylandWindow`（Wayland）：

- 这些窗口系统比 Windows 的 GDI 更“原始”
- 如果触发 `update()` 的时候控件正在重建（尤其是 QGraphicsItem 在变更），很可能会造成 **绘图线程与 UI 操作冲突**

### 结论总结

| 平台    | 是否崩溃  | 原因                                                                         |
| ------- | --------- | ---------------------------------------------------------------------------- |
| Windows | ❌ 不崩溃 | `update()` 时对象虽然已析构，但未被立即访问或触发，行为未爆发                |
| Linux   | ✅ 崩溃   | `clear()` 导致 `currentIndexChanged()` 被立即触发，`update()` 引用到悬空对象 |

### 修复策略（跨平台安全）

`currentIndexChanged` 信号 --> `activated`

```cpp
connect(ui->cmbWobjIndex, QOverload<int>::of(&QComboBox::activated), ...);
```

最实用和简洁的规避方法，**推荐**。

#### 信号触发情况

| 情况                                        | `activated()` | `currentIndexChanged()` |
| ------------------------------------------- | ------------- | ----------------------- |
| 用户点击选择项                              | ✅ 是         | ✅ 是                   |
| 用户键盘选择项（确认）                      | ✅ 是         | ✅ 是                   |
| 程序调用 `setCurrentIndex()`                | ❌ 否         | ✅ 是                   |
| 执行 `clear()` / `addItem()` 导致选中项变化 | ❌ 否         | ✅ 是                   |

## QT qmake 如何做到和 CMake 一样简洁明了

在 Qt 项目开发中，`qmake` 虽然使用 `.pro` 文件看起来简单，但和现代的 `CMake` 相比，确实缺乏模块化、语义清晰、跨平台依赖自动化等特性。通过一些**结构优化和技巧**，可以让 qmake 的使用更接近 CMake 的整洁性和可维护性。

### 1. **使用 `.pri` 文件进行模块划分（类似 CMake 的 `add_subdirectory()`）**

将不同模块的源码、头文件、依赖、配置等放入各自的 `.pri` 文件，然后在主 `.pro` 中 `include()`：

```qmake
# main.pro
TEMPLATE = app
TARGET = my_app

include(src/core/core.pri)
include(src/gui/gui.pri)
```

例如 `core.pri`:

```qmake
HEADERS += \
    $$PWD/core.h

SOURCES += \
    $$PWD/core.cpp
```

---

### 2. **使用变量封装通用配置（模拟 CMake 的函数/宏）**

```qmake
defineReplace(pkgConfigLibs) {
    return($$system(pkg-config --libs $$1))
}

LIBS += $$pkgConfigLibs(opencv4)
```

也可以写一个 `common.pri`：

```qmake
CONFIG += c++17
DEFINES += QT_DEPRECATED_WARNINGS
```

---

### 3. **简洁设置编译选项（兼容 MSVC / GCC）**

```qmake
QMAKE_CXXFLAGS += -Wall -Wextra
win32:QMAKE_CXXFLAGS += /permissive- /W4
```

或者放进一个 `compiler_settings.pri` 里全局引用。

---

### 4. **统一资源管理（类似 CMake `target_sources()`）**

```qmake
RESOURCES += resources/app.qrc
```

或封装在模块 `.pri` 文件中。

---

### 5. **借助工具生成 `.pro` 文件（类似自动化 `CMakeLists.txt`）**

可以写个 Python 脚本自动扫描目录，生成 `.pri` / `.pro` 文件结构，保持一致性。

---

### 6. **考虑迁移到 `qmake + cmake hybrid` 模式**

Qt 5.15+ 已原生支持 CMake，若项目逐渐增大，推荐迁移：

```cmake
find_package(Qt5 COMPONENTS Core Widgets REQUIRED)
target_link_libraries(my_app Qt5::Core Qt5::Widgets)
```

---

### 总结

| 功能     | qmake 实现方式       | 对应 CMake                     |
| -------- | -------------------- | ------------------------------ |
| 模块划分 | `.pri` + `include()` | `add_subdirectory()`           |
| 通用配置 | `common.pri`         | `include()`                    |
| 条件编译 | `win32:` 等          | `if(WIN32)`                    |
| 外部库   | `pkg-config` 调用    | `find_package()`               |
| 构建控制 | `CONFIG`, `DEFINES`  | `target_compile_definitions()` |

## Qt 应用在多语言环境下保持良好的 UI 体验

在多语言支持中，不同语言的文本长度可能会导致界面显示不全的问题，通常可以通过以下几种方式处理：

---

### **1. 使用 `QLayout` 自动调整布局**

Qt 的 `QLayout`（如 `QVBoxLayout`、`QHBoxLayout`、`QGridLayout`）可以自动调整控件大小，避免文本被裁剪。

✅ **解决方案**：

- **避免使用 `setFixedSize()`**，改用 `setMinimumSize()` 和 `setSizePolicy()`
- **使用 `QSizePolicy::Expanding` 让控件自动扩展**

**示例：**

```cpp
label->setSizePolicy(QSizePolicy::Expanding, QSizePolicy::Preferred);
```

这样，`label` 在需要时会自动扩展，而不会固定大小导致内容裁剪。

---

### **2. 让 `QLabel` 自动换行**

如果你的界面中有 `QLabel` 需要适应不同语言的文本长度，可以让它自动换行：

✅ **解决方案**：

```cpp
label->setWordWrap(true);
```

或者 QSS 方式：

```css
QLabel {
  qproperty-wordwrap: true;
}
```

这样，即使文本过长，也会自动换行显示，而不会被裁剪。

---

### **3. 适配不同语言的字体**

不同语言的字体可能宽度不一样，比如日语/中文比英文更紧凑，而德语单词通常较长。

✅ **解决方案**：

- **使用不同的字体**（例如 `Noto Sans` 系列支持多语言）
- **动态调整字体大小**

```cpp
if (currentLanguage == "zh") {
    label->setFont(QFont("Microsoft YaHei", 12));
} else if (currentLanguage == "en") {
    label->setFont(QFont("Arial", 11));
}
```

---

### **4. 允许 `QLabel` 省略超长文本**

如果希望文本超出控件范围时显示省略号（`...`），可以使用 `setElideMode()`（仅适用于 `QLabel` 或 `QPushButton` 这样的控件）。

✅ **解决方案**：

```cpp
label->setTextFormat(Qt::PlainText);
label->setSizePolicy(QSizePolicy::Expanding, QSizePolicy::Preferred);
QFontMetrics metrics(label->font());
QString elidedText = metrics.elidedText(longText, Qt::ElideRight, label->width());
label->setText(elidedText);
```

**QSS 方式**：

```css
QLabel {
  text-overflow: ellipsis;
}
```

---

### **5. 预留足够空间，并使用 `setMinimumWidth()`**

如果某些语言的文本普遍较长，可以为 `QLabel`、`QPushButton` 预留更大的 `minimumWidth`，例如：

```cpp
if (currentLanguage == "de") {
    label->setMinimumWidth(200);
} else {
    label->setMinimumWidth(150);
}
```

这样，德语界面自动比英文或中文界面更宽一些，避免内容溢出。

---

### **6. 允许界面伸缩**

可以设置 `QWidget` 的 `setMinimumSize()`，让整个界面可以伸缩，以适应不同语言的长度：

```cpp
this->setMinimumSize(800, 600);
```

配合 `QLayout`，界面可以自动调整大小，而不是固定尺寸导致显示不全。

---

### **7. 让 `QPushButton` 自适应文本**

如果按钮的文本因语言不同而长度不同，`QPushButton` 可能显示不全。可以使用 `adjustSize()` 让按钮自动适应内容：

```cpp
button->adjustSize();
```

**或者使用 `QSizePolicy`**：

```cpp
button->setSizePolicy(QSizePolicy::Expanding, QSizePolicy::Preferred);
```

---

### **8. 适配不同语言的 QSS**

如果你使用 QSS，可以针对不同语言加载不同的样式：

```cpp
QString qssFile = (currentLanguage == "zh") ? ":/styles/style_zh.qss" : ":/styles/style_en.qss";
loadQss(qssFile);
```

---

### **总结**

| 问题                         | 解决方案                                                                                   |
| ---------------------------- | ------------------------------------------------------------------------------------------ |
| 文字过长超出控件             | `setWordWrap(true)`（自动换行）或 `elidedText()`（省略号）                                 |
| 控件尺寸固定导致内容被裁剪   | 使用 `QSizePolicy::Expanding` 让控件自适应                                                 |
| 按钮文本过长显示不全         | `button->adjustSize();` 或 `setSizePolicy(QSizePolicy::Expanding, QSizePolicy::Preferred)` |
| 不同语言字体不同影响布局     | `label->setFont(QFont(...))` 适配不同语言的字体                                            |
| 整个窗口固定大小导致排版问题 | `setMinimumSize()` 允许窗口适应内容                                                        |

## 有弹窗保持界面响应

在 Qt 中，如果你需要在 **显示进度条** 时 **禁止用户点击界面**，但仍然让界面保持响应（即不阻塞事件循环），可以采用 **模态对话框** 或 **禁用主窗口输入** 的方式：

---

### **方法 1：使用 `QProgressDialog` 并设为模态**

Qt 提供了 `QProgressDialog` 组件，它可以在任务进行时 **自动显示** 进度条，并且可以设置为 **模态（Modal）**，禁止用户与主窗口交互。

```cpp
QProgressDialog progress("正在处理数据...", "取消", 0, 100, this);
progress.setWindowModality(Qt::ApplicationModal); // 设为应用级模态，禁止操作其他窗口
progress.setCancelButton(nullptr); // 移除取消按钮，防止用户中途取消
progress.show();

for (int i = 0; i <= 100; ++i) {
    QThread::sleep(1);  // 模拟任务耗时
    progress.setValue(i);
    QApplication::processEvents(); // 处理事件循环，保证 UI 更新
}
```

✅ **优点**：

- `setWindowModality(Qt::ApplicationModal)` 可以完全屏蔽用户输入，同时允许 UI 更新。
- 通过 `QApplication::processEvents()` 保持事件循环，确保 UI **不卡死**。

---

### **方法 2：使用 `setEnabled(false)` 禁用主窗口**

如果你不想使用模态对话框，也可以直接 **禁用主窗口**，但保持 UI 继续刷新。

```cpp
this->setEnabled(false);  // 禁用整个窗口，防止用户操作
QProgressDialog progress("处理中，请稍候...", nullptr, 0, 100, this);
progress.setWindowModality(Qt::WindowModal);  // 设为窗口级模态
progress.show();

for (int i = 0; i <= 100; ++i) {
    QThread::sleep(1);
    progress.setValue(i);
    QApplication::processEvents(); // 继续处理 UI 事件
}

this->setEnabled(true); // 处理完成后恢复交互
```

✅ **优点**：

- `this->setEnabled(false)` 禁止所有控件的输入，用户不能点击主窗口的按钮、输入框等。
- `QApplication::processEvents()` 确保进度条 **不卡 UI**。
- 任务完成后，`setEnabled(true)` 让窗口恢复正常交互。

---

### **方法 3：使用 `QEventLoop` 创建局部事件循环**

如果你的任务是异步的（比如后台线程），你可以用 `QEventLoop` 来控制界面更新：

```cpp
this->setEnabled(false);
QProgressDialog progress("请稍等...", nullptr, 0, 0, this);
progress.setWindowModality(Qt::ApplicationModal);
progress.show();

// 运行局部事件循环，保证 UI 响应
QEventLoop loop;
QTimer::singleShot(3000, &loop, SLOT(quit())); // 模拟耗时操作，3 秒后退出
loop.exec();

this->setEnabled(true);
```

✅ **优点**：

- `QEventLoop` 创建 **局部事件循环**，不会阻塞整个应用，但仍能响应 UI 事件。
- `QTimer::singleShot()` 代替 `sleep()`，避免主线程卡死。

---

### **方法 4：使用 `QThread` 在后台执行任务**

如果任务特别耗时，最好 **放到子线程**，避免阻塞 UI 线程：

```cpp
class WorkerThread : public QThread {
    void run() override {
        for (int i = 0; i <= 100; ++i) {
            QThread::sleep(1); // 模拟耗时任务
            emit progressUpdated(i);
        }
    }
signals:
    void progressUpdated(int value);
};

// 主窗口代码
this->setEnabled(false);
QProgressDialog progress("处理中...", nullptr, 0, 100, this);
progress.setWindowModality(Qt::ApplicationModal);
progress.show();

WorkerThread *worker = new WorkerThread;
connect(worker, &WorkerThread::progressUpdated, &progress, &QProgressDialog::setValue);
connect(worker, &WorkerThread::finished, [&]() {
    this->setEnabled(true);
    progress.close();
});

worker->start();
```

✅ **优点**：

- `QThread` 让任务运行在后台，主线程不会被阻塞，UI **完全流畅**。
- 进度条 **不会卡住**，可以实时更新。

---

### **总结**

| 方式                                  | 适用场景 | UI 是否卡死 | 适用任务         |
| ------------------------------------- | -------- | ----------- | ---------------- |
| `QProgressDialog + processEvents()`   | 短任务   | ❌ 不卡 UI  | 简单任务         |
| `setEnabled(false) + processEvents()` | 短任务   | ❌ 不卡 UI  | 控制整个窗口禁用 |
| `QEventLoop`                          | 异步任务 | ❌ 不卡 UI  | 适用于定时操作   |
| `QThread`                             | 长任务   | ✅ 完全不卡 | 适用于复杂计算   |

如果你的任务**特别耗时**，推荐 **方法 4（QThread）**，否则 **方法 1 或 2** 也能满足需求。

## 保持界面响应

`QCoreApplication::processEvents();` 主要用于在事件循环（Event Loop）中手动处理待处理的事件，通常用于以下情况：

### **作用**

1. **保持界面响应**
   在耗时的操作（如文件 IO、计算、网络请求等）中调用 `processEvents()` 可以让 Qt 处理窗口事件，防止界面卡死。例如：

```cpp
for (int i = 0; i < 100; ++i) {
    doHeavyTask();  // 耗时任务
    QCoreApplication::processEvents();  // 处理 UI 事件，保持界面响应
}
```

如果不调用 `processEvents()`，整个任务完成前 UI 界面可能会卡死。

2. **执行挂起的事件**
   在某些情况下，事件可能不会立即被处理，比如：

   - `QTimer` 触发的超时事件
   - `QSocketNotifier` 的信号
   - `QMetaObject::invokeMethod` 的 `QueuedConnection`
     调用 `processEvents()` 让它们立即执行，而不必等到事件循环返回。

3. **用于阻塞式等待时处理事件**
   如果某个函数需要等待一段时间（例如等待某个信号触发），可以在 `while` 循环里调用 `processEvents()` 以避免阻塞整个 GUI：

```cpp
QElapsedTimer timer;
timer.start();
while (timer.elapsed() < 3000) { // 等待 3 秒
    QCoreApplication::processEvents();
}
```

这样可以在等待的同时，让窗口仍然能够响应用户输入。

### **常见问题**

- **可能引发重入问题**  
  如果在处理某些事件（如 `mousePressEvent()`）时调用 `processEvents()`，可能会导致事件被重新进入执行，从而引发不可预测的行为。

- **可能导致性能问题**  
  如果在耗时任务的循环中频繁调用 `processEvents()`，可能会导致 CPU 资源浪费。因此可以使用 `QEventLoop::processEvents(QEventLoop::ExcludeUserInputEvents);` 避免过多处理用户输入事件。

### **替代方案**

- **使用 `QTimer` 或 `QThread` 进行异步处理**  
  耗时操作应该放在 **后台线程** 中，而不是主线程 `processEvents()` 里。例如：

```cpp
QTimer::singleShot(0, this, &MyClass::doHeavyTask);
```

或者：

```cpp
QThread* thread = QThread::create(&doHeavyTask);
thread->start();
```

### **总结**

✅ **适用场景**

- 需要在长时间任务中保持 UI 响应
- 需要立即处理挂起的事件
- 需要在阻塞等待时响应其他事件

❌ **不建议**

- 在主线程频繁调用，影响性能
- 在某些回调函数中使用，可能导致重入问题

更推荐使用 **事件驱动编程** 或 **多线程** 方式来解决 GUI 卡顿问题，而不是频繁调用 `processEvents()`。

## QPixmap 图像处理

`QPixmap` 这个类有个坑，如果传递的图片分辨率很高，其实例化后的对象会占用很大的内存。比如 7420 x 7074 分辨率的图片，内存占用会是 7420 x 7074 x 4 = 209,366,080 字节，约 200 MB。

### 如何避免这种问题？

- 最直接的，给图的人不能给这么高分辨率的图片。No No No！
- 或者开发人员手动 PS 改一下分辨率，但这样的话，会增加开发人员的工作量。
- 对于大图片，考虑裁剪或按需加载。

## 翻译工作

在 Qt C++ 客户端开发中，翻译（国际化）通常使用 **Qt Linguist** 工具链，包括 `.ts`、`.qm` 文件，配合 `tr()` 函数实现。要高效地更新和迭代翻译，以下是推荐的流程：

---

### **1. 翻译的基本流程**

1. **标记可翻译字符串**
   - 在 C++ 代码中，所有需要翻译的字符串都使用 `tr()` 包装：

```cpp
QLabel *label = new QLabel(tr("Hello, World!"));
```

- 在 Qt UI 设计文件（.ui）中的文本默认可翻译，不需要手动 `tr()`。

2. **生成翻译源文件（.ts）**
   - 运行 `lupdate`，扫描项目中的 `tr()` 调用，生成或更新 `.ts` 翻译文件：

```sh
lupdate MyProject.pro
```

- 这样 `.ts` 文件会包含所有未翻译的文本。

3. **翻译（使用 Qt Linguist 或编辑 .ts）**

   - 使用 Qt Linguist GUI 进行翻译，或手动编辑 `.ts` 文件（XML 格式）。

4. **编译翻译文件**
   - 运行 `lrelease`，将 `.ts` 转换为 `.qm`（二进制格式）：

```sh
lrelease MyProject.pro
```

- 这样应用程序才能加载翻译。

5. **加载翻译**
   - 在应用启动时加载 `.qm` 文件：

```cpp
QTranslator translator;
if (translator.load("zh_CN.qm")) {
    qApp->installTranslator(&translator);
}
```

- UI 组件的 `tr()` 会自动使用翻译后的文本。

---

### **2. 高效更新和迭代翻译的方法**

要高效维护和更新翻译，建议采用以下策略：

#### **（1）避免手动管理 `.ts` 文件**

- **使用 `lupdate` 自动更新**，不要手动修改 `.ts`，避免漏掉新增文本：

```sh
lupdate MyProject.pro
```

- 只在 Qt Linguist 中编辑翻译，而不是 `.ts` 原文件。

#### **（2）自动化翻译流程**

- 在 CI/CD 中自动执行 `lupdate` 和 `lrelease`，确保每次构建时翻译都是最新的：

```sh
lupdate MyProject.pro && lrelease MyProject.pro
```

- 可以在 `pro` 文件中添加 `TRANSLATIONS` 变量，自动管理 `.ts` 文件：

```pro
TRANSLATIONS = translations/zh_CN.ts translations/en_US.ts
```

#### **（3）动态加载语言**

- 允许用户切换语言，而无需重启应用：

```cpp
void changeLanguage(const QString &lang) {
    static QTranslator translator;
    qApp->removeTranslator(&translator);
    if (translator.load(lang + ".qm")) {
        qApp->installTranslator(&translator);
    }
}
```

- 这样可以即时预览翻译效果，减少调试时间。

#### **（4）使用翻译管理平台**

- 如果团队协作开发，可以使用 **Crowdin**、**Transifex** 或 **Weblate** 来管理 `.ts` 文件。
- 这些工具支持在线翻译和版本控制，提高团队效率。

#### **（5）对翻译条目做版本管理**

- 将 `.ts` 文件纳入 Git，确保每次提交前 `lupdate` 处理最新的字符串。
- 例如：

```sh
git add translations/*.ts
git commit -m "Update translations"
```

#### **（6）想要在生成的 .ts 文件中不显示 location 字段的数据**

修改 `.pro` 文件，在项目的 `.pro` 文件中添加：

```pro
lupdate_only {
    CONFIG += lrelease_no_location
}
```

---

### **3. 避免的坑**

- **忘记运行 `lupdate`**，导致新增的 `tr()` 字符串没有出现在 `.ts` 文件里。
- **不使用 `tr()`**，导致字符串不会被翻译。
- **`.qm` 版本不匹配**，如果 `.qm` 不是最新的，翻译不会生效，确保每次构建都运行 `lrelease`。
- **Qt UI 设计文件（.ui）中直接写死文本**，导致无法翻译，应该在 `QObject::tr()` 作用域下定义文本。

---

### **4. 总结**

✅ **标准化流程**：`tr()` → `lupdate` → Qt Linguist → `lrelease` → `QTranslator`  
✅ **自动化**：CI/CD 脚本更新 `.ts`，管理 `.qm`，减少手动操作  
✅ **团队协作**：Git 版本管理 + 在线翻译平台  
✅ **动态加载翻译**：让用户即时切换语言，无需重启应用

这样可以最大程度地提高 Qt C++ 应用的国际化效率，减少维护成本！
