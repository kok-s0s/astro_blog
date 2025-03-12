---
layout: ../../layouts/Post.astro
title: 'Qt Dev'
pubDate: 2024-08-06
updatedDate: 2024-03-09
description: '已经使用这门语言做过不少的项目了，写篇文章记录下一些，好吧，直接贴和 GPT 问答过来了 ~~~'
author: 'kok-s0s'
image:
  url: '/images/qt_dev/qt.jpeg'
  alt: 'Qt'
tags: ['Qt', 'C++']
---

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

### QPixmap 图像处理

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
