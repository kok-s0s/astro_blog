---
title: 'Building a C++ Thread Base Class'
description: 'A project note about replacing Qt QThread with a modern C++ thread base class, including signal-slot style dispatch, a message queue, and synchronous or asynchronous execution.'
---

> [cxx_thread](https://github.com/kok-s0s/cxx_thread)

## Motivation

The motivation is similar to my previous experience of "wrapping a wheel" for file CRUD. This project was born to remove a dependency on Qt's `QThread`.

## Goal Breakdown

The goal was to replace `QThread`.

### Looking at `QThread`

The focus here is how `QThread` is used.

<details><summary>First example</summary>

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

The first usage keeps `QThread` as a member variable, then moves an object derived from `QObject` into that thread through `moveToThread()`. `connect()` links signals and slots, and the slot contains the logic that should run in the worker thread. Calling `start()` starts the worker thread, so the slot can run in the new thread.

<details><summary>Second example</summary>

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

The second usage derives a class from `QThread` and overrides `run()`, placing the thread logic directly inside `run()`.

The code I needed to remove `QThread` from used the first style.

Qt also provides connection options through `Qt::ConnectionType`, which control how signals and slots are connected, including whether calls are asynchronous or blocking.

### Requirement Summary

1. A signal-slot mechanism and a message queue to manage signals, with producers and consumers.
2. Slot functions can run asynchronously or synchronously.
3. The worker thread keeps running until it is destroyed.

## Implementation

### Research and Learning

I searched first with the assumption that a ready-made solution might already exist.

- [sigslot](https://github.com/palacaze/sigslot) gave me ideas about argument passing.
- `std::static_pointer_cast` provided a way to convert pointer types.
- The C++ concurrency support library and *C++ Concurrency in Action* were useful for `std::thread`, `std::mutex`, and `std::condition_variable`.

### Signal and Slot Mechanism

In the code that needed `QThread` removed, the business worker thread exists continuously after creation. It waits for the main thread to send a command, which is essentially calling a public member function on the worker thread object. After receiving a command, the worker thread processes the corresponding business logic. Internally, the public function sends a signal-like message, and the worker dispatches it to the matching slot function.

That means we need a mapping between command functions called by the main thread and the corresponding business logic. In other words, the worker thread needs a table that associates signals with slot functions.

My first idea was to maintain a `std::map<Signal, Slot>`, where `Signal` is an integer and `Slot` is the corresponding slot function. But this quickly becomes complicated: arguments need to be passed, one signal may map to multiple slots, and slot execution order may matter.

So I changed direction. If the goal is to connect a signal with a slot function, the derived business thread class must define both signals and slots.

Signals can be represented by an `enum`:

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

Then define a structure named `SignalMsg` to store the signal and its payload:

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

In the derived class, public member functions are written according to the signal and the argument type required by the matching slot. This lets the main thread send messages by calling those public functions:

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

Here `std::static_pointer_cast` converts typed smart pointers into `std::shared_ptr<void>`, which makes later argument passing easier.

Slot functions usually receive a `Slot` suffix, such as `SayHelloSlot()`.

The `UserCustomFunction` function uses `switch case` and the signal enum to connect each signal to its slot. It is a pure virtual function of `ThreadBase` and must be implemented by derived classes:

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

This function accepts a `SignalMsg`, extracts the signal value, casts the `std::shared_ptr<void>` payload back to the expected type, and passes the data to the slot.

`UserCustomFunction` is called inside `ThreadBase::Process`:

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

`Process` is a `while` loop bound to a `std::thread`, allowing the worker thread to keep running continuously.

At this point, the producer and consumer exist:

- the producer is the main thread, which sends signals and payloads by calling public member functions on the worker object;
- the consumer is the worker thread, which gets messages in `Process`, passes them to `UserCustomFunction`, and lets that function call the matching slot.

Messages are stored in a `std::queue<std::shared_ptr<SignalMsg>>`. Common variables and functions are placed in `ThreadBase`:

```cpp
class ThreadBase {
  .....
  .....
  .....

 protected:
  /// Build the relationship between the signal and the slot function
  /// @param[in] signalMsg - message (signal, data required for slot function)
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

`Process` then becomes:

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

### Asynchronous and Synchronous Slot Execution

The business worker thread may own timer threads for scheduled tasks. The timer is owned by the business worker, and creation/destruction must happen through public functions such as `CreateTimer` and `DestroyTimer`. Scheduled tasks should not block the main thread. Without using `std::thread::detach`, these tasks need to run asynchronously.

At the same time, sometimes the main thread sends a command and must wait until the corresponding business logic has completed before it continues. That means slot functions must also support synchronous execution.

This is implemented with `std::mutex` and `std::condition_variable`.

Add a boolean `_wait` member to `SignalMsg` to indicate whether a message needs synchronous execution. If `_wait` is `false`, the message does not wait for the slot to finish and is executed asynchronously.

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
  /// @param[in] signalMsg - message (signal, data required for slot function)
  void SendSlotFuncAsyncRunMsg(std::shared_ptr<SignalMsg> signalMsg);

  /// Send a message to the message queue (sync)
  /// @param[in] signalMsg - message (signal, data required for slot function)
  void SendSlotFuncSyncRunMsg(std::shared_ptr<SignalMsg> signalMsg);

 protected:
  /// Build the relationship between the signal and the slot function
  /// @param[in] signalMsg - message (signal, data required for slot function)
  virtual void UserCustomFunction(std::shared_ptr<SignalMsg> signalMsg) = 0;

 private:
  /// Send a message to the thread queue (async or sync)
  /// @param[in] wait - async: false, sync: true
  /// @param[in] signalMsg - message (signal, data required for slot function)
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

The implementation:

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

## Public Member Functions of `ThreadBase`

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

`CreateThread` is called in a derived class constructor to create the thread.

When an object created from the derived class is destroyed, the base destructor calls `DestroyThread`. `DestroyThread` sends a destroy-thread message to the queue, stops `Process`, and prevents the thread from continuing after destruction. It then calls `std::thread::join` to wait for the thread to finish before destroying it.

`GetThreadId` and `GetCurrentThreadId` are provided to obtain the worker thread ID or current thread ID.

`std::thread` was introduced in C++11 for creating and managing threads. Its `get_id()` function returns a unique identifier for a thread. In multithreaded programs, thread IDs help trace and debug execution order, deadlocks, and other thread states.

## End

There are many implementations of a `ThreadBase` like this online, but most are designed around their own business scenarios. None of them is universal. The design still needs to match the actual requirements.

Building this wheel did not feel conceptually hard. It was easy to get an initial prototype quickly.

I used GoogleTest for unit tests and practiced TDD. Only passing tests can prove that the code matches the intended design.

After the prototype, the work became continuous refactoring: renaming, rewriting style, changing data structures, and trying alternatives. The process was messy, but GoogleTest quickly told me whether a change was correct. TDD was convenient here.

Overall, the refactoring process was interesting and also a learning process.

I also became more familiar with C++11 concurrency support and pointer casts.
