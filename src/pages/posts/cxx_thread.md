---
layout: ../../layouts/MarkdownPostLayout.astro
title: '造个 C++ 线程基类'
pubDate: 2023-03-24
description: '以剔除 Qt 的 QThread 为目标而诞生的项目。设计的线程基类能搭配有着类似 Qt 中信号与槽的机制来使用，且利用 C++ 的互斥量和条件变量，让函数能够同步或异步运行，这样派生类（某业务工作线程）能持有定时器（线程）来做些定时任务（异步）。'
author: 'kok-s0s'
image:
  url: '/images/space.jpg'
  alt: 'Space'
tags: ['C++', 'Test', 'Concurrent Programming']
---

> [cxx_thread](https://github.com/kok-s0s/cxx_thread)

## 起因

和 [记一次「 包轮子 」的经历](/posts/cxx_crud_file) 的起因一样，只不过这个项目是为了剔除 Qt 的 `QThread` 而诞生的。

## 拆分目标

**目标** -> 替换掉 `QThread`

### 分析下 [QThread](https://doc.qt.io/qt-6/qthread.html)

这里主要看 `QThread` 的使用方式，看它如何被使用的。

<details><summary>第一种示例代码</summary>

```cpp
class Worker : public QObject
{
    Q_OBJECT

public slots:
    void doWork(const QString &parameter) {
        QString result;
        /* ... here is the expensive or blocking operation ... */
        emit resultReady(result);
    }

signals:
    void resultReady(const QString &result);
};

class Controller : public QObject
{
    Q_OBJECT
    QThread workerThread;
public:
    Controller() {
        Worker *worker = new Worker;
        worker->moveToThread(&workerThread);
        connect(&workerThread, &QThread::finished, worker, &QObject::deleteLater);
        connect(this, &Controller::operate, worker, &Worker::doWork);
        connect(worker, &Worker::resultReady, this, &Controller::handleResults);
        workerThread.start();
    }
    ~Controller() {
        workerThread.quit();
        workerThread.wait();
    }
public slots:
    void handleResults(const QString &);
signals:
    void operate(const QString &);
};
```

</details>

第一种是在一个继承自 `QObject` 的子类中，将 `QThread` 作为成员变量 `workerThread`，用 `moveToThread()` 函数将该类所创建的对象移动到 `workerThread` 中，`connect()` 函数将信号与槽连接起来，在槽函数中编写需要在线程中处理的逻辑代码。然后再调用 `QThread` 的 `start()` 函数来启动 `workerThread`，这样槽函数就能在一个新的线程中运行。

<details><summary>第二种示例代码</summary>

```cpp
class WorkerThread : public QThread
{
    Q_OBJECT
    void run() override {
        QString result;
        /* ... here is the expensive or blocking operation ... */
        emit resultReady(result);
    }
signals:
    void resultReady(const QString &s);
};

void MyObject::startWorkInAThread()
{
    WorkerThread *workerThread = new WorkerThread(this);
    connect(workerThread, &WorkerThread::resultReady, this, &MyObject::handleResults);
    connect(workerThread, &WorkerThread::finished, workerThread, &QObject::deleteLater);
    workerThread->start();
}
```

</details>

第二种是写子类继承自 `QThread`，然后重写 `run()` 函数，这样就可以在 `run()` 函数中写线程的逻辑。

需要替换的 Qt 代码中使用 `QThread` 的方式为第一种。

---

> [Signals and Slots Across Threads](https://doc.qt.io/qt-6/threads-qobject.html#signals-and-slots-across-threads)

Qt 有提供一些信号与槽的连接选项 [`Qt::ConnectionType`](https://doc.qt.io/qt-6/qt.html#ConnectionType-enum)，这些选项能控制信号与槽的连接方式，比如是否是异步的，是否是阻塞的等等。

### 简单梳理需求

1. 信号与槽机制以及管理信号的消息队列（生产者和消费者）

2. 槽函数异步执行或同步执行

3. 线程能够持续运行，直至被销毁

## 实现需求

### 搜索资料并理解学习

> 抱着网上可能已经有现成解决方案的心态去互联网上搜索 /doge

[]()

### 信号与槽

Qt 信号与槽机制是一个信号对应一个槽函数。

这里可以考虑使用 `switch case` 判断语句和 `enum` 枚举类型将一个信号 Signal 与一个 Slot 槽函数对应起来。

设计时预期代码大致结构如下：

```cpp
void UserCustomFunction(std::shared_ptr<ThreadMsg> threadMsg) {
  switch (A_Signal) {
    case First_Signal: {
      FirstSlot();
      break;
    }
    case Second_Signal: {
      SecondSlot();
      break;
    }
  }
}
```
