---
layout: ../../../layouts/CleanCXXPost.astro
title: '设计模式和习惯用法'
author: 'kok-s0s'
tags: ['C++']
---

> 规范形式：描述的是最简单、最重要的，并且具有一般性的形式。

设计模式的规范形式的最基本的元素主要有：名称、上下文、问题、场景、解决方案、例子、缺点等。

> 有经验的开发人员，根据工作中反复遇到的问题，总结出解决问题的方案，并与其它人分享自己的经验，这背后的原则就是：**不要重复造轮子！**

## 设计原则与设计模式

原则是作为决策基础的基本 “真理” 或 “规律”。

设计模式是在特定的环境下，为解决具体问题而设计的解决方案。

> 决策和模式为了人们提供了解决方案；原则帮助人们设计自己的原则。

## 常见的设计模式及应用场景

> 警告：不要夸大设计模式的作用！毫无疑问的是，设计模式很酷也很令人着迷，但过度使用它们，特别是如果没有好的理由证明是合理的使用设计模式，可能会带来灾难性的后果，也可能会遇到过度设计的痛苦。永远记住 KISS 和 YAGNI 原则。

### 依赖注入模式

> 依赖注入是敏捷架构的关键元素

依赖注入（Dependency Injection，DI）

单例模式 -- 不利于良好软件设计的设计模式。

单例模式 -- 确保一个类只有唯一的实例，并提供对该实例的全局访问。

单例模式的任务是控制和管理其整个生命周期的唯一实例。

根据关注点分离的原则，对象生命周期的管理应该独立于其领域的业务逻辑之外。而在单例模式中，这两个关注点基本上没有分离。

单例模式提供了对该实例的全局访问，以便于应用程序中的所有其它对象都可以使用该实例。

```cpp
#ifndef SINGLETON_H_
#define SINGLETON_H_

class Singleton final {
public:
  static Singleton &getInstance() {
    static Singleton theInstance{};
    return theInstance;
  }

  int doSomething() { return 23; }

  // ...其它成员函数...

private:
  Singleton() = default;
  Singleton(const Singleton &) = delete;
  Singleton(Singleton &&) = delete;
  Singleton &operator=(const Singleton &) = delete;
  Singleton &operator=(Singleton &&) = delete;
  // ...
};

#endif // SINGLETON_H_
```

> C++11 之后，在 `getInstance()` 中使用一个静态变量构造实例的过程，默认是线程安全的。但并不意味着 `Singleton` 类中的其它成员函数都是线程安全的！后者必须由开发人员来保证。

单例的主要问题：由于单例的全局可见性和可访问性，其它类可以在任何地方使用单例。这就意味着在软件设计中，对单例对象的所有依赖都隐藏在代码中。通过检查类的接口（即类的属性和方法），无法看到这些依赖关系。

**面向对象中单例的使用就像面向过程中全局变量的使用一样，都是一种反模式。**

---

用什么来替代单例模式？

**只创建一个实例，并且在需要的地方注入它！**

依赖注入：将组件与其需要的服务分离，这样组件就不必知道这些服务的名称，也不必知道如何获取它们。

基本上，一个好的面向对象软件设计应该尽可能地保证所涉及的模块或组件是松耦合的，而依赖注入是实现这一目标的关键。

依赖注入 -- use 依赖倒置原则（DIP）

依赖注入技术：

- 构造函数注入
- Setter 注入

### Adapter 模式

> 把一个类的接口转换为客户端期望的另一个接口。Adapter 可以让因接口不兼容而无法一起工作的类一起工作。--- Erich Gamma et al., Design Patterns [Gamma95]

Adapter 可以为不兼容的接口提供广泛的适配和转换的可能性。它的适用范围来源于简单的适配，例如操作名称和数据类型的转换，直到支持整个不同的操作集合。

如果要适配的接口很类似，那么接口适配当然更容易。但如果接口之间相差很大，Adapter 的代码实现可能会非常复杂。

### Strategy 模式

开放-封闭（OCP）原则作为可扩展的面向对象设计的指导方针，策略（Strategy）模式是这一重要原则的体现。

> 定义一组算法，然后封装每个算法，并使它们可以相互替换。策略模式允许算法独立于使用它的客户端而变化。--- Erich Gamma et al., Design Patterns [Gamma95]

在软件设计中，以不同的方式做同一件事情使一个常见的需求，想想列表的排序算法。不同的排序算法，有不同的时间复杂度和空间复杂度。例如：冒泡排序、快速排序、归并排序、插入排序和堆排序。

借助策略模式，使用时可以动态地选择不同的排序算法，例如，根据要排序列表的不同特性选择不同的排序算法。

### Command 模式

在实现由命令控制的软件系统时，重要的是保证操作的请求者与实际执行操作的对象分离开来。这样，请求者就不必知道如何执行操作，也不必知道如何实现操作。这背后的指导原则是松耦合原则和关注点分离原则。

> 将请求封装为对象，从而允许你使用不同的请求、队列或日志的请求参数化客户端，或支持可撤销操作。--- Erich Gamma et al., Design Patterns [Gamma95]

eg：Client/Server 架构体系，其中 Client（即所谓的调用者）发送命令给 Server（即所谓的接收者或被调用者）接受并执行命令。

<details><summary>示例代码</summary>

```cpp
#include <chrono>
#include <iostream>
#include <memory>
#include <thread>

class Command {
public:
  virtual ~Command() = default;
  virtual void execute() = 0;
};

using CommandPtr = std::shared_ptr<Command>;

class HelloWorldOutputCommand : public Command {
public:
  virtual void execute() override { std::cout << "Hello world!" << std::endl; }
};

class WaitCommand : public Command {
public:
  explicit WaitCommand(const unsigned int durationInMilliseconds) noexcept
      : _durationInMilliseconds{durationInMilliseconds} {};

  virtual void execute() override {
    std::chrono::microseconds dur(_durationInMilliseconds);
    std::this_thread::sleep_for(dur);
  }

private:
  unsigned int _durationInMilliseconds{1000};
};

class Server {
public:
  void acceptCommand(CommandPtr command) { command->execute(); }
};

class Client {
public:
  void run() {
    Server theServer{};
    const unsigned int SERVER_DELAY_TIMESPAN{10000};

    CommandPtr waitCommand =
        std::make_shared<WaitCommand>(SERVER_DELAY_TIMESPAN);
    theServer.acceptCommand(waitCommand);

    CommandPtr helloWorldOutputCommand =
        std::make_shared<HelloWorldOutputCommand>();
    theServer.acceptCommand(helloWorldOutputCommand);
  }
};

int main() {
  Client client{};
  client.run();
  return 0;
}
```

</details>

### Command 处理器模式

<details><summary>Command 处理器模式</summary>

```cpp
#include <iostream>
#include <sstream>
#include <stack>
#include <string>

using namespace std;

class Command {
public:
  virtual ~Command() {}
  virtual void execute() = 0;
  virtual void undo() = 0;
};

class Calculator {
private:
  double m_result = 0;

public:
  Calculator() {}

  void add(double value) { m_result += value; }
  void sub(double value) { m_result -= value; }
  void mul(double value) { m_result *= value; }
  void div(double value) { m_result /= value; }

  double getResult() { return m_result; }
};

class AddCommand : public Command {
private:
  Calculator &m_calculator;
  double m_value;

public:
  AddCommand(Calculator &calculator, double value)
      : m_calculator(calculator), m_value(value) {}

  void execute() override { m_calculator.add(m_value); }

  void undo() override { m_calculator.sub(m_value); }
};

class SubCommand : public Command {
private:
  Calculator &m_calculator;
  double m_value;

public:
  SubCommand(Calculator &calculator, double value)
      : m_calculator(calculator), m_value(value) {}

  void execute() override { m_calculator.sub(m_value); }

  void undo() override { m_calculator.add(m_value); }
};

class MulCommand : public Command {
private:
  Calculator &m_calculator;
  double m_value;

public:
  MulCommand(Calculator &calculator, double value)
      : m_calculator(calculator), m_value(value) {}

  void execute() override { m_calculator.mul(m_value); }

  void undo() override { m_calculator.div(m_value); }
};

class DivCommand : public Command {
private:
  Calculator &m_calculator;
  double m_value;

public:
  DivCommand(Calculator &calculator, double value)
      : m_calculator(calculator), m_value(value) {}

  void execute() override { m_calculator.div(m_value); }

  void undo() override { m_calculator.mul(m_value); }
};

int main() {
  Calculator calculator;
  stack<Command *> commands;

  while (true) {
    cout << "Enter a command (add, sub, mul, div, undo, quit): ";
    string input;
    if (!getline(cin, input)) {
      break;
    }

    istringstream iss(input);
    string commandString;
    iss >> commandString;

    if (commandString == "add") {
      double value;
      iss >> value;
      Command *command = new AddCommand(calculator, value);
      command->execute();
      commands.push(command);
      cout << "Result: " << calculator.getResult() << endl;
    } else if (commandString == "sub") {
      double value;
      iss >> value;
      Command *command = new SubCommand(calculator, value);
      command->execute();
      commands.push(command);
      cout << "Result: " << calculator.getResult() << endl;
    } else if (commandString == "mul") {
      double value;
      iss >> value;
      Command *command = new MulCommand(calculator, value);
      command->execute();
      commands.push(command);
      cout << "Result: " << calculator.getResult() << endl;
    } else if (commandString == "div") {
      double value;
      iss >> value;
      Command *command = new DivCommand(calculator, value);
      command->execute();
      commands.push(command);
      cout << "Result: " << calculator.getResult() << endl;
    } else if (commandString == "undo") {
      if (!commands.empty()) {
        Command *command = commands.top();
        command->undo();
        commands.pop();
        delete command;
        cout << "Result: " << calculator.getResult() << endl;
      }
    } else if (commandString == "quit") {
      break;
    } else {
      cout << "Unknown command" << endl;
    }
  }

  while (!commands.empty()) {
    Command *command = commands.top();
    commands.pop();
    delete command;
  }

  return 0;
}
```

</details>

### Composite 模式

对树状数据结构的面向对象蓝图被称为组合模式

> 将对象组合成树结构来表示 “部分 --- 整体” 的层次结构。组合允许客户端统一地处理单个对象和对象的组合。--- Erich Gamma et al., Design Patterns [Gamma95]

### Observer 模式

一种众所周知的，用于构建软件系统体系结构的模式是 “模型 - 视图 - 控制器”（Model-View-Controller，MVC）。在 MVC 中，视图和模型之间的耦合应该尽可能松散，这种松耦合通常用 Observer 模式实现的。

> 定义对象之间一对多的依赖关系，以便在一个对象更改状态时，自动通知并更新其所有的依赖关系。--- Erich Gamma et al., Design Patterns [Gamma95]

除了松耦合这一积极特性（具体的 Subject 对 Observer 一无所知），该模式还很好地支持了开闭原则。在无须调整或更改现有类的任何内容的前提下，可以非常轻松地添加新的具体的 Observer。

### Factory 模式

遵守 Soc 关注点分离原则，严格遵循信息隐藏原则，实例的创建过程被隐藏在其用户之外。

### Facade 模式

结构性设计模式，通常被用于架构级别的设计。

> 为子系统中的一组接口提供统一的接口。Facade 模式定义了一个更高级的接口，使得子系统更容易使用。--- Erich Gamma et al., Design Patterns [Gamma95]

在 C++ 及其它语言中，Facade 并不特别。它通常只是一个简单的类，在公共接口上接受请求，并将请求转发到子系统的内部结构中。有时 Facade 只是简单地转发一个调用子系统内部结构元素的请求，但偶尔它也会执行数据转换，并且它也是一个 Adapter。

### Money Class 模式

用于处理必须被准确表示的属性或度量。

### 特例模式

> 为特定情况提供特殊行为的子类。--- Martin Fowler, Patterns of Enterprise Application Architecture [Fowler02]

特例模式背后的思想是利用多态的优势，并且提供表示特殊情况的类，而不是返回 `nullptr` 或其它一些特殊的值。

`std::optional<T>` 是 C++17 中的一个新特性，它是一个模板类，用于表示一个可选的值。它的目的是用于替代 `nullptr`，以及 `boost::optional`。

## 什么是习惯用法

编程的习惯用法是在特定的编程语言或技术中解决问题的一种特殊的模式。也就是说，与一般的设计模式不同，习惯用法的适用性是有限的。通常，它们仅限于特定的编程语言或特定的技术，如框架。

如果必须在较低的抽象级别上解决编程问题，则通常在详细设计和实现阶段使用习惯用法。

### 一些有用的习惯用法

- 不可变类

- 匹配不是错误

- Copy and Swap

显示实现拷贝构造函数和赋值运算符（零原则）

- 指向实现的指针

PIMPL - Pointer to Implementation

通过将内部类的实现细节重新定位到隐藏的实现类中，消除对实现的编译依赖，从而提高编译时间。
