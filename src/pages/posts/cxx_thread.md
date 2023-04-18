---
layout: ../../layouts/MarkdownPostLayout.astro
title: '造个 C++ 线程基类'
pubDate: 2023-03-24
description: '以剔除 Qt 的 QThread 为目标而诞生的项目。设计的线程基类能搭配类似 Qt 中的信号与槽机制来使用，且利用现代 C++ 提供的互斥量和条件变量，让函数能够同步或异步运行，这样派生类（某业务工作线程）能持有定时器（线程）来做些定时任务（异步）。'
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

需要剔除 QThread 的代码中使用方式为第一种。

> [Signals and Slots Across Threads](https://doc.qt.io/qt-6/threads-qobject.html#signals-and-slots-across-threads)

Qt 有提供一些信号与槽的连接选项 [`Qt::ConnectionType`](https://doc.qt.io/qt-6/qt.html#ConnectionType-enum)，这些选项能控制信号与槽的连接方式，比如是否是异步的，是否是阻塞的等等。

### 简单梳理需求

1. 信号与槽机制以及管理信号的消息队列（要有生产者和消费者）

2. 槽函数 Async 异步执行或 Sync 同步执行

3. 线程能够持续运行，直至被销毁

## 实现需求

### 搜索资料并理解学习

> 抱着网上可能已经有现成解决方案的心态去互联网上搜索 /doge

- [sigslot](https://github.com/palacaze/sigslot) -- 提供了如何处理参数传递的思路

- [std::static_pointer_cast](https://en.cppreference.com/w/cpp/memory/shared_ptr/pointer_cast) -- 转换类型的方法

- [Concurrency support library](https://en.cppreference.com/w/cpp/thread) -- 有关 C++ 并行（多线程）开发知识，这里主要用到 `std::thread`、`std::mutex` 和 `std::condition_variable` 。

### 信号与槽机制

看看需要剔除 `QThread` 的那份代码，业务线程自创建后便持续存在，等待着主线程发送一个指令（即调用业务线程的公有成员函数），当业务线程接受到主线程某一个指令后，业务线程能根据该指令（被调用的公有函数内部再调用 `emit` 发送信号函数）去处理相对应的业务逻辑（调用对应的槽函数）。

这样梳理下，即需要有一张关系映射表去将主线程要调用的指令函数和对应的业务逻辑关联起来，即业务线程内部有一张将信号与槽函数关联起来的表。

那时立马想到的是维护一个 `std::map` 数据结构，即 `std::map<Signal, Slot>`，其中 `Signal` 为整型，`Slot` 为对应的槽函数，这样就能将一个信号与一个槽函数对应起来，但是需要考虑到函数参数传递的问题，以及可能一个信号会对应到多个槽函数的情况，会要把 `Slot` 设置成一个容器去包含多个槽函数，又要考虑到函数执行顺序的问题，这样就会变得很复杂。

那就换个思路，既然是要将信号与槽函数关联起来，先得有信号 ID 和槽函数。

那么继承基类 `ThreadBase` 而派生的业务线程类中必须要有定义信号和槽函数。

这里用 `enum` 枚举类型定义 Signal 信号，一般如下：

```cpp
enum Signal : int {
  SayHello_Signal,
  SayGoodBye_Signal,
  WillDo_Signal,
  PlanToDo_Signal,
  AskAQuestion_Signal,
  GetAQuestion_Signal,
  AnswerAQuestion_Signal,
  GetAAnswer_Signal,
  WantToSleep_Signal,
  DestroyTimer_Signal
};
```

设计一个结构体来存储信号以及需要携带的参数数据，命名为 `SignalMsg` ，如下：

```cpp
struct SignalMsg {
 public:
  SignalMsg(int signal, std::shared_ptr<void> msg)
      : _signal(signal), _msg(msg) {}

  int GetSignal() const { return _signal; }
  std::shared_ptr<void> GetMsg() const { return _msg; }

 private:
  int _signal = -1;            // -1: destroy thread
  std::shared_ptr<void> _msg;  // data required by the slot function
};
```

在派生类中根据信号与其对应的槽函数所需参数来编写些公有成员函数，让主线程能够通过调用这些公有成员函数来发送消息（信号与参数数据），示例代码如下：

```cpp
void Human::SendWillDoSignal(const std::string& doWhat) {
  std::shared_ptr<std::string> msgData = std::make_shared<std::string>(doWhat);
  std::shared_ptr<SignalMsg> signalMsg = std::make_shared<SignalMsg>(
      WillDo_Signal, std::static_pointer_cast<void>(msgData));
  SendSlotFuncSyncRunMsg(std::move(signalMsg));
}

void Human::SendPlanToDoSignal(const Plan& plan) {
  std::shared_ptr<Plan> msgData = std::make_shared<Plan>(plan);
  std::shared_ptr<SignalMsg> signalMsg = std::make_shared<SignalMsg>(
      PlanToDo_Signal, std::static_pointer_cast<void>(msgData));
  SendSlotFuncSyncRunMsg(std::move(signalMsg));
}
```

这里使用 `std::static_pointer_cast` 将其它类型的智能指针转换成 `std::shared_ptr<void>` 类型的智能指针，便于后续的参数传递。

而槽函数的就一般会在命名后面加上个 `Slot` 后缀以区别其它函数，如 `SayHelloSlot()` 。

在一个名为 `UserCustomFunction` 函数使用 `switch case` 判断语句和 `enum` 枚举类型将信号 Signal 与 Slot 槽函数对应起来。

`UserCustomFunction` 函数为 `ThreadBase` 基类的纯虚函数，需要在派生类中实现。

示例代码如下：

```cpp
// Human.h
virtual void UserCustomFunction(std::shared_ptr<SignalMsg> signalMsg) override;

// Human.cpp
void UserCustomFunction(std::shared_ptr<SignalMsg> signalMsg) {
  switch (signalMsg->GetSignal()) {
    case SayHello_Signal: {
      SayHelloSlot();
      break;
    }
    case SayGoodBye_Signal: {
      SayGoodByeSlot();
      break;
    }
    case WillDo_Signal: {
      std::string doWhat =
          *(std::static_pointer_cast<std::string>(signalMsg->GetMsg()));
      WillDoSlot(doWhat);
      break;
    }
    case PlanToDo_Signal: {
      auto plan = *(std::static_pointer_cast<Plan>(signalMsg->GetMsg()));
      PlanToDoSlot(plan);
      break;
    }
    ......
    ......
    ......
  }
}
```

该函数接受一个 `SignalMsg` 类型的参数，即信号以及携带的参数数据。根据 Siganl 信号的值，去调用对应的槽函数。

这里使用了 `std::static_pointer_cast` 函数将 `std::shared_ptr<void>` 类型的参数数据转换成对应的类型，再将参数数据传递给槽函数去处理。

而 `UserCustomFunction` 函数的调用则是在 `ThreadBase` 基类的 `Process` 函数中，如下：

```cpp
void ThreadBase::Process() {
  std::shared_ptr<SignalMsg> signalMsg;

  while (1) {
    {
      // get signal msg
    }

    if (signalMsg->GetSignal() == DestroyThread_Signal) break;

    UserCustomFunction(signalMsg);
  }
}
```

`Process` 函数为一个 `while` 循环，用 `std::thread` 类型创建一个线程时绑定该 `Process` 函数，这样该业务线程就能持续运行，就解决掉上述需求中的[第三点](#简单梳理需求)。

---

OK，这样生产者和消费者就有了。

生产者就是主线程，通过调用业务线程提供的公有成员函数来发送信号与参数数据。

消费者就是业务线程，在 `Process` 函数获取到消息，传递给 `UserCustomFunction` 函数，再由 `UserCustomFunction` 函数调用对应的槽函数。

这样就实现了主线程与业务线程的通信。

之后就需要有一个消息队列维护这些消息，这里使用 `std::queue` 类型来存储消息 `std::shared_ptr<SignalMsg>` 。

通用的变量和函数都放在 `ThreadBase` 基类中，如下：

```cpp
class ThreadBase {
  .....
  .....
  .....

 protected:
  /// Build the relationship between the signal and the slot function
  virtual void UserCustomFunction(std::shared_ptr<SignalMsg> signalMsg) = 0;

 private:
  /// Process the message queue
  void Process();

 private:
  const int DestroyThread_Signal = -1;

 private:
  std::unique_ptr<std::thread> _thread;
  std::queue<std::shared_ptr<SignalMsg>> _signalMsgQueue;
};
```

`Process` 函数也演变成如下：

```cpp
void ThreadBase::Process() {
  std::shared_ptr<SignalMsg> signalMsg;

  while (1) {
    {
      if (_signalMsgQueue.empty()) continue;
      signalMsg = std::move(_signalMsgQueue.front());
      _signalMsgQueue.pop();
    }

    if (signalMsg->GetSignal() == DestroyThread_Signal) break;

    UserCustomFunction(signalMsg);
  }
}
```

### 槽函数异步执行或同步执行

业务线程可以持有定时器（线程）去做定时任务（另一些依附该业务而做的事情）。定时器被业务线程所持有，其创建与销毁都要通过调用业务线程提供的 `CreateTimer` 和 `DestroyTimer` 。且定时任务不阻塞主线程，不使用 `std::thread` 中提供的 [`detach`](https://en.cppreference.com/w/cpp/thread/thread/detach) 方法的情况下，定时任务应异步执行。

同时，有时在主线程给业务线程发送一个指令后，须确保该指令对应的业务逻辑被执行后，主线程才可继续执行。

即须确保包含业务逻辑的槽函数是能同步执行的。

使用 C++ 提供的 `std::mutex` 互斥量和 `std::condition_variable` 条件变量来实现同步。

`SiganlMsg` 结构体中增加一个 `bool` 类型的 `_wait` 成员变量，用来标识该消息是否需要同步执行，即是否需要等待槽函数执行完毕后再继续执行。

反之，如果 `_wait` 为 `false` ，则表示该消息不需要同步执行，即不需要等待槽函数执行完毕后再继续执行，即槽函数异步执行。

更新后头文件代码如下：

```cpp
struct SignalMsg {
 public:
  SignalMsg(int signal, std::shared_ptr<void> msg)
      : _wait(false), _signal(signal), _msg(msg) {}

  bool GetWait() const { return _wait; }
  void SetWait(bool wait) { _wait = wait; }
  int GetSignal() const { return _signal; }
  std::shared_ptr<void> GetMsg() const { return _msg; }

 private:
  bool _wait = false;          // async: false, sync: true (default: false)
  int _signal = -1;            // -1: destroy thread
  std::shared_ptr<void> _msg;  // data required by the slot function
};

class ThreadBase {
  ......
  ......
  ......

 public:
  ......

  /// Send a message to the message queue (async)
  /// @param[in] data - message (signal, data required for slot function)
  void SendSlotFuncAsyncRunMsg(std::shared_ptr<SignalMsg> signalMsg);

  /// Send a message to the message queue (sync)
  /// @param[in] data - message (signal, data required for slot function)
  void SendSlotFuncSyncRunMsg(std::shared_ptr<SignalMsg> signalMsg);

 protected:
  /// Build the relationship between the signal and the slot function
  virtual void UserCustomFunction(std::shared_ptr<SignalMsg> signalMsg) = 0;

 private:
  /// Send a message to the thread queue (async or sync)
  void SendMsg(bool wait, std::shared_ptr<SignalMsg> signalMsg);

  /// Process the message queue
  void Process();

 private:
  const int DestroyThread_Signal = -1;

 private:
  std::unique_ptr<std::thread> _thread;
  std::mutex _mutex;
  std::condition_variable _cv;
  std::queue<std::shared_ptr<SignalMsg>> _signalMsgQueue;
  bool _syncProcessed = false;
};
```

对应的 CPP 文件代码如下：

```cpp
void ThreadBase::SendSlotFuncAsyncRunMsg(std::shared_ptr<SignalMsg> signalMsg) {
  SendMsg(false, std::move(signalMsg));
}

void ThreadBase::SendSlotFuncSyncRunMsg(std::shared_ptr<SignalMsg> signalMsg) {
  SendMsg(true, std::move(signalMsg));
  std::unique_lock<std::mutex> lock(_mutex);
  try {
    _cv.wait(lock, [this] { return _syncProcessed; });
  } catch (...) {
    // Ensure _syncProcessed is set to true even if an exception is thrown
  }
}

void ThreadBase::SendMsg(bool wait, std::shared_ptr<SignalMsg> signalMsg) {
  if (!_thread) return;

  signalMsg->SetWait(wait);

  // Add the message to the queue
  std::unique_lock<std::mutex> lock(_mutex);
  _signalMsgQueue.emplace(std::move(signalMsg));
  _cv.notify_one();

  if (wait) {
    _syncProcessed = false;
    // Wait for the message to be processed by the worker thread synchronously
    _cv.wait(lock, [this] { return _syncProcessed; });
  }
}

void ThreadBase::Process() {
  std::shared_ptr<SignalMsg> signalMsg;

  while (1) {
    {
      // Wait for a message to be added to the queue
      std::unique_lock<std::mutex> lock(_mutex);
      _cv.wait(lock, [this] { return !_signalMsgQueue.empty(); });
      if (_signalMsgQueue.empty()) continue;
      signalMsg = std::move(_signalMsgQueue.front());
      _signalMsgQueue.pop();
    }

    if (signalMsg->GetSignal() == DestroyThread_Signal) break;

    UserCustomFunction(signalMsg);

    if (signalMsg->GetWait()) {
      std::lock_guard<std::mutex> lock(_mutex);
      _syncProcessed = true;
      _cv.notify_one();
    }
  }
}
```

## `ThreadBase` 基类的公有成员函数

```cpp
ThreadBase::ThreadBase() : _thread(nullptr) {}

ThreadBase::~ThreadBase() { DestroyThread(); }

bool ThreadBase::CreateThread() {
  if (!_thread) {
    _thread = std::make_unique<std::thread>(&ThreadBase::Process, this);
  }
  return true;
}

void ThreadBase::DestroyThread() {
  if (!_thread) return;

  // Send a message to the thread queue to destroy the thread
  {
    std::lock_guard<std::mutex> lock(_mutex);
    _signalMsgQueue.emplace(std::make_shared<SignalMsg>(
        DestroyThread_Signal, std::shared_ptr<void>(nullptr)));
    _cv.notify_one();
  }

  // Wait for the thread to be destroyed
  _thread->join();
  _thread = nullptr;
}

std::thread::id ThreadBase::GetThreadId() {
  return _thread ? _thread->get_id() : std::thread::id();
}

std::thread::id ThreadBase::GetCurrentThreadId() {
  return std::this_thread::get_id();
}
```

`CreateThread` 在派生类的构造函数中被调用，用来创建线程。

当派生类创建的对象被销毁时，会调用基类的析构函数，从而调用 `DestroyThread` 来销毁线程。`DestroyThread` 会向消息队列中发送一个销毁线程的消息，中止 `Process` 函数的执行，避免线程被销毁后继续执行，从而导致程序崩溃。同时，`DestroyThread` 会调用 `std::thread::join` 函数，等待线程执行完毕，再销毁线程。

提供了 `GetThreadId` 和 `GetCurrentThreadId` 两个函数，用来获取线程 ID 或当前线程 ID。

> `std::thread` 是 C++11 中引入的一个多线程库，用于创建和管理线程。在使用 `std::thread` 时，可以使用 `get_id()` 函数获取线程的 ID 值。
>
> 线程 ID 值是一个唯一的标识符，用于识别不同的线程。在多线程程序中，可以使用线程 ID 值来跟踪和调试线程的执行过程。例如，可以使用线程 ID 值来输出线程的执行顺序，或者在发生死锁或其他错误时跟踪线程的状态。

## End

其实这类 `ThreadBase` 的实现网上一大把，但其实都是根据自己需要解决的业务场景而去设计的，没有一个是万能的 /doge，还是需要根据自己的需求来设计。

自己这样造一个轮子，其实感觉思路并不难。前期就能快速有个雏形。

> 我用 GoogleTest 做单元测试，TDD 开发，写测试，只有测试是通过的才能说明编写的代码能达到我的设计期望。

有了雏形，之后就是不断重构，改命名，改写法，改数据结构等等，中间花费了大量时间去修改，试错。其间过程很混乱，好在有 GoogleTest 能够快速的让我知道我改的对不对，TDD 很方便。

总的来说，重构的过程还是很有意思的，也是学习的过程。

对于 C++11 提供的 `Concurrency support library` 以及类型转换 `cast` 这两个知识点也是熟练了些。
