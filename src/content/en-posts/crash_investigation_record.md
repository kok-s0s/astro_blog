---
title: 'Crash Investigation Notes'
description: 'A practical record of recent Qt and C++ crash investigations, including event-loop reentrancy, null pointers, QObject lifetime issues, cross-thread UI access, and thread/timer lifecycle mistakes.'
---

## Event Loop Abnormality

> A crash caused by abusing `QCoreApplication::processEvents()` in Qt.

`QCoreApplication::processEvents()` immediately processes all pending events in the current event queue, such as GUI updates, signal-slot calls, and timer events. It is often used to prevent the UI from appearing frozen.

### Code Context

In a path validation function, I called this inside a validation loop on the main thread:

```cpp
QCoreApplication::processEvents();  // process events to avoid UI freezing
```

The intention was simple: while the user waited for a synchronous and time-consuming validation step, the UI should not freeze. It should still display logs and respond to buttons.

In practice, the program started to crash randomly. The crash point was not the `processEvents()` line, but a stack similar to this:

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

This kind of stack is misleading. It makes the crash look like a UI or model bug. After digging deeper, the root cause turned out to be that single `processEvents()` call.

### Reconstructing the Crash

The path validation function looked roughly like this:

```cpp
bool ProgrammingPage::checkPointPath() {
    ...
    foreach (auto point, m_teaching_points) {
        ...
        QCoreApplication::processEvents();  // avoid UI freezing
    }
    ...
}
```

If some UI object or model, such as `QTableView` or `QStandardItemModel`, is modified or closed during this period, the Qt main event loop may emit signals such as `dataChanged()`. If the corresponding widget or model has already been destroyed, Qt can crash.

This is the classic problem of event reentrancy plus premature object destruction.

### Root Cause

Calling `QCoreApplication::processEvents()` forces Qt to process another round of the main event loop early, while:

- the main thread is still executing path validation logic;
- the main event loop may still contain UI-close events, widget deletion events, model changes, or signal emissions.

Once something like `QAbstractItemView::dataChanged()` is triggered while the view or model is already invalid, the program may access a null pointer or dangling pointer and crash directly.

### Correct Approach

Avoid `processEvents()`, especially inside loops or business logic.

If the goal is only to keep the UI responsive, prefer asynchronous scheduling:

```cpp
// Use QTimer to validate points one by one.
QTimer::singleShot(0, this, &ProgrammingPage::checkNextPoint);
```

If events must be processed, limit the time window:

```cpp
QEventLoop loop;
QTimer::singleShot(10, &loop, &QEventLoop::quit);  // process events for only 10 ms
loop.exec();
```

This avoids running the main event loop without bounds and reduces the chance of triggering UI events too early.

For all UI calls, make sure that:

- the involved widgets and data models are still valid;
- the call is thread-safe and not made from outside the UI thread;
- custom models or widgets use suitable connection types, such as `Qt::QueuedConnection`, when reentrancy is a risk.

### Lessons

| Mistake | Consequence |
| --- | --- |
| Calling `QCoreApplication::processEvents()` directly on the main thread | The Qt event loop may unexpectedly emit signals, mutate models, or destroy UI objects, eventually causing a crash. |
| Not checking whether models or widgets are still valid | Can trigger crashes around `QAbstractItemView::dataChanged()` and similar paths. |
| Not splitting time-consuming work into asynchronous tasks | Leads to thread stalls, frozen UI, or crashes. |

`processEvents()` is not a universal lubricant. It is more like a dangerous switch: used carefully, the UI may stay responsive; used poorly, the program can crash.

### Related Scenarios

| Scenario | Recommended approach |
| --- | --- |
| Preventing UI freezes | Split tasks with `QTimer`. |
| Long-running tasks | Move work to `QThread`; let the UI thread only update the interface. |
| Must wait but do not want to freeze the UI | Use `QEventLoop + QTimer::singleShot()` to control processing time. |

## Null Pointer Access

### Background

Some pointers depend on configuration files or external conditions during initialization. If initialization fails and returns null, later code that accesses the pointer without checking it can easily crash.

### Example Stack

```bash
[E|06/25 22:02:30.710]1         0x7f7a10e6c0 __kernel_rt_sigreturn + 0
[E|06/25 22:02:30.710]2         0x7f76cc94d8 raise + 176
```

### Root Cause

- The pointer was not initialized, or initialization failed, for example because reading the configuration file failed.
- The code did not check for null before using the pointer.
- Missing logs increased investigation cost.

### Correct Approach

- Require `nullptr` checks before pointer use.
- When dynamic configuration initialization fails, log immediately and return an error code.
- Use smart pointers such as `QSharedPointer`, or Qt's `QPointer`, to improve robustness.

## Slot Function Accessing a Released Object

### Background

After QObject signal-slot connections are established, if the connected object is destroyed but the signal is still emitted, the program may access released memory and crash.

### Typical Case

```cpp
connect(button, &QPushButton::clicked, this, &MyWidget::onClicked);
// If this is deleted earlier but the signal is still emitted, access is invalid.
```

### Root Cause

- Signal-slot connections were not bound to object lifetime correctly.
- The object had been deleted, but an old slot was still called when the signal fired.
- Qt's object lifetime management mechanisms were not used.

### Correct Approach

- Prefer `QObject::deleteLater()` for QObject destruction, so events are processed before release.
- Use `QPointer` to check whether a slot receiver has already been released.
- Qt's default `AutoConnection` automatically uses queued connections across threads, improving safety.

## Cross-Thread UI Operations

### Background

Qt GUI widgets must run on the main thread. Accessing UI from a worker thread causes undefined behavior and may crash immediately.

### Typical Case

```cpp
void* run() {
  ui->label->setText("thread text");  // illegal GUI access
}
```

### Root Cause

- A child thread accessed widgets created on the main thread.
- Cross-thread communication was not implemented through signals, slots, or posted events.
- Object thread affinity was not moved correctly through `moveToThread()`.

### Correct Approach

- All UI widget operations must execute on the main thread.
- Worker threads should notify the UI through signals and slots, preferably with `Qt::QueuedConnection` when needed.
- Non-UI components should be moved completely with `moveToThread()` when their thread affinity changes.

## UI Widget Not Initialized or Already Destroyed

### Background

If `setupUi()` is not called, a widget is not added to the layout successfully, or `findChild()` fails and returns `nullptr`, later access can crash the program.

### Root Cause

- The `.ui` file was not loaded correctly.
- Widget names did not match, causing `findChild()` to fail.
- A widget had already been destroyed, but external code still attempted to access it.

### Correct Approach

- Check every widget pointer before use.
- Make sure `setupUi(this)` is called correctly.
- Use `Q_ASSERT` in debug mode to validate widget availability.

## Unhandled Exceptions

### Background

Qt does not generally enable C++ exception handling as a GUI control-flow mechanism, especially on the GUI main thread. If an exception is thrown and not caught, the program terminates directly.

### Root Cause

- A third-party library threw an exception that was not caught.
- The main thread threw directly.
- There was no global exception handling mechanism.

### Correct Approach

Do not use exceptions as control flow in Qt GUI programs.

If exceptions are necessary, add global exception capture in `main`:

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

## QTimer and QThread Lifetime Mismatch

### Background

When using timers or threads, if the parent object is not bound properly or lifetimes do not match, an object may be destroyed too early. Later events then access a dangling object and crash.

### Root Cause

- `QTimer` or `QThread` was created without a parent.
- A QObject-derived class was created inside a thread but not moved with `moveToThread`.
- Events remained unprocessed after the object was destroyed.

### Correct Approach

- Always specify a `parent` when creating QObject-derived classes where ownership is clear.
- When using a timer in a thread, make sure the timer belongs to the correct thread:

```cpp
timer->moveToThread(workerThread);
```

- Use `QThread::quit()` plus `wait()` to exit threads safely.
- Call `deleteLater()` before exit for QObject-derived classes instead of direct `delete`.
