---
layout: ../../layouts/Post.astro
title: '软件奔溃排查记录'
pubDate: 2025-07-07
updatedDate: 2025-07-07
description: '近两月和这个杆上了，估摸 Q3 还得和它 Battle N 回。'
author: 'kok-s0s'
image:
  url: '/images/crash_investigation_record/R-C.jpg'
  alt: 'ERROR'
tags: ['Qt', 'C++', 'Software']
---

## Qt 中滥用 `QCoreApplication::processEvents()` 引发崩溃

## 代码介绍

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
[E|07/02 16:55:41.093]0             0x41d830 ./imolProgram() [0x41d830]
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

## 崩溃现场还原

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

## 问题根因剖析

调用 `QCoreApplication::processEvents()` 相当于强制 Qt **提前处理一轮主事件循环**，但：

- 主线程正在执行路径校验逻辑
- 而主事件循环中可能还有：

  - UI 被关闭的事件
  - 控件的删除
  - 数据模型的修改、信号触发

一旦触发类似 `QAbstractItemView::dataChanged()`，但视图或模型已无效，就会出现 **不可控的访问空指针或野指针**，导致程序直接挂掉。

## 正确做法

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

## 教训总结

| 错误操作                                               | 后果                                                                               |
| ------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| 在主线程中直接调用 `QCoreApplication::processEvents()` | Qt 主事件循环乱入，可能在你意想不到的时候发出信号、修改模型、销毁 UI，最终导致崩溃 |
| 没有检查模型、UI 控件是否有效                          | 引发 `QAbstractItemView::dataChanged()` 崩溃等问题                                 |
| 没有使用异步任务拆分耗时处理                           | 线程卡顿 / UI 卡死 / 崩溃                                                          |

> ❗ `processEvents()` 并不是“万能润滑剂”，它更像是一个危险的开关：开得好，程序不卡；开不好，程序直接炸。

## 衍生

| 场景                  | 推荐方式                                         |
| --------------------- | ------------------------------------------------ |
| 防止 UI 卡顿          | 用 `QTimer` 拆分任务                             |
| 任务耗时长            | 搬到 `QThread` 线程处理，UI 主线程只更新界面     |
| 必须等待但不想卡住 UI | `QEventLoop + QTimer::singleShot()` 控制处理时间 |
