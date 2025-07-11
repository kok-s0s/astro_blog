---
layout: ../../layouts/Post.astro
title: '软件奔溃排查记录'
pubDate: 2025-07-07
updatedDate: 2025-07-11
description: '近两月和这个杆上了，估摸 Q3 还得和它 Battle N 回。'
author: 'kok-s0s'
image:
  url: '/images/crash_investigation_record/R-C.jpg'
  alt: 'ERROR'
tags: ['Qt', 'C++', 'Software']
---

## 事件循环异常

> Qt 中滥用 `QCoreApplication::processEvents()` 引发崩溃

`QCoreApplication::processEvents()` 作用是：立即处理当前事件队列中的所有待处理事件（如 GUI 更新、信号槽调用、定时器事件等），避免界面假死。

### 代码介绍

在一个路径校验函数中，为了避免 UI 卡顿，在主线程里，这个路径校验循环中调用了：

```cpp
QCoreApplication::processEvents();  // 处理事件，避免界面假死
```

初衷很简单：希望用户在等待过程（校验同步处理且耗时）中界面不要“卡死”，能显示日志、响应按钮等操作。

但实际运行中，程序出现了 **随机崩溃**，并且崩溃点并不在 `processEvents()` 行，而是类似下面的调用栈：

```bash
[E|07/02 16:55:41.072]Signal[6] arrive, will shutdown system and dump stack info
[E|07/02 16:55:41.073]Write codedump failed, reason:-1
[E|07/02 16:55:41.092]-------------------Back Trace Info-------------------
[E|07/02 16:55:41.093]1         0x7f819d37d0 __kernel_rt_sigreturn + 0
[E|07/02 16:55:41.093]2         0x7f7fe46d78 gsignal + 224
[E|07/02 16:55:41.093]3         0x7f7fe33aac abort + 276
[E|07/02 16:55:41.094]4         0x7f7fe80f40 /lib/aarch64-linux-gnu/libc.so.6(+0x6df40) [0x7f7fe80f40]
[E|07/02 16:55:41.094]5         0x7f7fe88344 /lib/aarch64-linux-gnu/libc.so.6(+0x75344) [0x7f7fe88344]
[E|07/02 16:55:41.094]6         0x7f7fe89c90 /lib/aarch64-linux-gnu/libc.so.6(+0x76c90) [0x7f7fe89c90]
[E|07/02 16:55:41.095]7         0x7f81328490 /lib/aarch64-linux-gnu/libQt5Widgets.so.5(+0x3bf490) [0x7f81328490]
[E|07/02 16:55:41.095]8         0x7f8132972c QAbstractItemView::dataChanged(QModelIndex const&, QModelIndex const&, QVector<int> const&) + 340
[E|07/02 16:55:41.096]9         0x7f8132bc2c /lib/aarch64-linux-gnu/libQt5Widgets.so.5(+0x3c2c2c) [0x7f8132bc2c]
[E|07/02 16:55:41.096]10        0x7f80563608 QObject::event(QEvent*) + 512
[E|07/02 16:55:41.097]11        0x7f81109420 QWidget::event(QEvent*) + 568
[E|07/02 16:55:41.097]12        0x7f811a87b4 QFrame::event(QEvent*) + 44
[E|07/02 16:55:41.098]13        0x7f811ab404 QAbstractScrollArea::event(QEvent*) + 588
[E|07/02 16:55:41.098]14        0x7f8132f89c QAbstractItemView::event(QEvent*) + 308
[E|07/02 16:55:41.099]15        0x7f810c74ac QApplicationPrivate::notify_helper(QObject*, QEvent*) + 92
[E|07/02 16:55:41.099]16        0x7f810d0ad8 QApplication::notify(QObject*, QEvent*) + 336
[E|07/02 16:55:41.100]17        0x7f80535c0c QCoreApplication::notifyInternal2(QObject*, QEvent*) + 380
[E|07/02 16:55:41.100]18        0x7f80538b80 QCoreApplicationPrivate::sendPostedEvents(QObject*, int, QThreadData*) + 360
[E|07/02 16:55:41.101]19        0x7f80591d20 /lib/aarch64-linux-gnu/libQt5Core.so.5(+0x2c7d20) [0x7f80591d20]
[E|07/02 16:55:41.101]20        0x7f7f53494c g_main_context_dispatch + 636
[E|07/02 16:55:41.101]21        0x7f7f534bbc /lib/aarch64-linux-gnu/libglib-2.0.so.0(+0x51bbc) [0x7f7f534bbc]
[E|07/02 16:55:41.102]22        0x7f7f534c5c g_main_context_iteration + 52
[E|07/02 16:55:41.102]23        0x7f805911cc QEventDispatcherGlib::processEvents(QFlags<QEventLoop::ProcessEventsFlag>) + 84
```

这类栈结构非常隐晦，让人误以为是 UI 或模型的 bug。深入排查之后才发现，**根因竟然就是这一行 `processEvents()` 的调用！**

### 崩溃现场还原

路径校验函数大致如下：

```cpp
bool ProgrammingPage::checkPointPath() {
    ...
    foreach (auto point, m_teaching_points) {
        ...
        QCoreApplication::processEvents();  // 防止UI卡顿
    }
    ...
}
```

当某些 UI 或模型（如 `QTableView`, `QStandardItemModel`）在这期间恰好被修改或关闭时，Qt 主事件循环会尝试发出如 `dataChanged()` 等信号，这些信号若对应的控件或模型已销毁，就会导致 Qt 崩溃。

经典的 **“事件重入 + 对象提前销毁”** 问题！

### 问题根因剖析

调用 `QCoreApplication::processEvents()` 相当于强制 Qt **提前处理一轮主事件循环**，但：

- 主线程正在执行路径校验逻辑
- 而主事件循环中可能还有：

  - UI 被关闭的事件
  - 控件的删除
  - 数据模型的修改、信号触发

一旦触发类似 `QAbstractItemView::dataChanged()`，但视图或模型已无效，就会出现 **不可控的访问空指针或野指针**，导致程序直接挂掉。

### 正确做法

**❶ 避免使用 `processEvents()`** ——特别是在循环或逻辑中！

如果只是为了不卡 UI，推荐改为异步调度：

```cpp
// 使用 QTimer 逐个检查点位
QTimer::singleShot(0, this, &ProgrammingPage::checkNextPoint);
```

**❷ 需要处理事件时，限定处理时间**

```cpp
QEventLoop loop;
QTimer::singleShot(10, &loop, &QEventLoop::quit);  // 只处理10ms事件
loop.exec();
```

这样就不会无限执行主事件循环，避免过早触发 UI 事件。

**❸ 任何调用 UI 的地方都要确保：**

- 所涉及的 UI 控件、数据模型仍然有效
- 线程安全（避免 UI 线程外调用）
- 如果是自定义模型或控件，信号连接方式也要注意使用 `Qt::QueuedConnection` 避免重入

### 教训总结

| 错误操作                                               | 后果                                                                               |
| ------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| 在主线程中直接调用 `QCoreApplication::processEvents()` | Qt 主事件循环乱入，可能在你意想不到的时候发出信号、修改模型、销毁 UI，最终导致崩溃 |
| 没有检查模型、UI 控件是否有效                          | 引发 `QAbstractItemView::dataChanged()` 崩溃等问题                                 |
| 没有使用异步任务拆分耗时处理                           | 线程卡顿 / UI 卡死 / 崩溃                                                          |

> ❗ `processEvents()` 并不是“万能润滑剂”，它更像是一个危险的开关：开得好，程序不卡；开不好，程序直接炸。

### 衍生

| 场景                  | 推荐方式                                         |
| --------------------- | ------------------------------------------------ |
| 防止 UI 卡顿          | 用 `QTimer` 拆分任务                             |
| 任务耗时长            | 搬到 `QThread` 线程处理，UI 主线程只更新界面     |
| 必须等待但不想卡住 UI | `QEventLoop + QTimer::singleShot()` 控制处理时间 |

## 空指针访问（Null Pointer）

### 崩溃背景

部分指针的初始化依赖于配置文件或外部条件，一旦初始化失败或返回空值，而后续代码未进行空指针检查便直接访问该指针，极易触发崩溃。

### 崩溃栈示例

```bash
[E|06/25 22:02:30.710]1         0x7f7a10e6c0 __kernel_rt_sigreturn + 0
[E|06/25 22:02:30.710]2         0x7f76cc94d8 raise + 176
```

### 根因分析

* 指针未初始化或初始化失败（例如读取配置文件失败）
* 编码时未对指针使用前进行判空处理
* 日志缺失导致排查成本高

### 正确做法

* 强制要求指针使用前进行 `nullptr` 检查
* 所有动态配置项初始化失败时应立即打日志并返回错误码
* 使用智能指针（如 `QSharedPointer`）或 Qt 的 `QPointer` 进行管理，增强鲁棒性

## 槽函数访问已释放对象

### 崩溃背景

QObject 连接信号槽后，如果被连接对象被销毁但信号仍然触发，就会访问到已释放的内存，导致程序崩溃。

### 典型案例

```cpp
connect(button, &QPushButton::clicked, this, &MyWidget::onClicked);
// 若 this 提前 delete，但 signal 仍触发，访问非法
```

### 根因分析

* 信号槽之间未绑定生命周期
* 对象已被 `delete`，信号触发时仍调用旧槽函数
* 没有使用 Qt 提供的对象生命周期管理机制

### 正确做法

* 所有 QObject 建议使用 `QObject::deleteLater()` 延迟销毁，确保事件处理完再释放
* 使用 `QPointer` 检查槽接收者是否已释放
* Qt 默认的 `AutoConnection` 会在多线程中自动使用队列连接，增强安全性

## 跨线程 UI 操作

### 崩溃背景

Qt 中 GUI 控件必须运行在主线程，如果从工作线程访问 UI，会立即引发未定义行为甚至崩溃。

### 典型案例

```cpp
void* run() {
  ui->label->setText("thread text");  // 非法访问 GUI 控件
}
```

### 根因分析

* 子线程访问主线程构造的控件
* 没有通过信号槽或事件投递机制实现跨线程通信
* 对象未正确通过 `moveToThread()` 移交线程归属权

### 正确做法

* 所有 UI 控件操作必须在主线程中执行
* 工作线程通过信号槽机制（带 `Qt::QueuedConnection`）通知 UI 更新
* 非 UI 组件使用 `moveToThread()` 完整迁移其线程归属

## UI 控件未初始化 / 被销毁

### 崩溃背景

未调用 `setupUi()` 或控件未成功添加到布局中，或通过 `findChild()` 获取控件失败返回 `nullptr`，但后续仍继续访问，导致程序崩溃。

### 根因分析

* `.ui` 文件未正确加载
* 控件名不匹配，导致 `findChild()` 查找失败
* 控件已经被销毁，但外部仍尝试访问

### 正确做法

* 所有控件使用前必须检查是否为空（`if (!ptr)`）
* 确保正确调用 `setupUi(this)` 初始化界面
* 使用 `Q_ASSERT` 在调试模式中验证控件有效性

## 未处理的异常

### 崩溃背景

Qt 默认不启用 C++ 异常处理机制（尤其在 GUI 主线程），一旦抛出异常但未被捕获，将导致程序直接中止。

### 根因分析

* 第三方库内部抛出异常未 try-catch 捕获
* 主线程中直接使用 `throw` 抛出
* 缺乏全局异常处理机制

### 正确做法

* 不建议在 Qt GUI 程序中使用异常作为控制流
* 如果必须使用，需在主函数增加全局异常捕获

```cpp
int main(int argc, char *argv[]) {
  try {
    QApplication app(argc, argv);
    MainWindow w;
    w.show();
    return app.exec();
  } catch (std::exception &e) {
    qCritical() << "Unhandled exception:" << e.what();
    return -1;
  }
}
```

## QTimer/QThread 生命周期错位

### 崩溃背景

在使用定时器或线程时，如果其父对象未绑定或生命周期不一致，极易导致对象提前销毁，后续触发事件访问到悬空对象而崩溃。

### 根因分析

* 创建 QTimer/QThread 时未设定 parent
* 线程中创建 QObject 派生类但未 moveToThread
* 对象销毁后仍有事件未处理完

### 正确做法

* 创建 `QObject` 派生类时，始终指定 `parent`
* 在线程中使用定时器时，确保定时器归属线程正确：

```cpp
timer->moveToThread(workerThread);
```

* 使用 `QThread::quit()` + `wait()` 安全退出线程
* 所有 QObject 派生类在退出前调用 `deleteLater()` 而非直接 `delete`

