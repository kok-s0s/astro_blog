---
title: 'Design Patterns and Idioms'
description: 'Notes on design principles, common design patterns, dependency injection, and C++ idioms.'
---

> Canonical form describes the simplest, most important, and most general form.

The basic elements of a design pattern's canonical form include name, context, problem, scenario, solution, example, disadvantages, and so on.

Experienced developers summarize solutions to recurring problems at work and share those experiences with others. The principle behind this is: do not reinvent the wheel.

## Design Principles and Design Patterns

Principles are fundamental truths or rules used as a basis for decisions.

Design patterns are solutions designed to solve specific problems in specific contexts.

Patterns provide solutions. Principles help people design their own solutions.

## Common Design Patterns and Use Cases

Warning: do not exaggerate the value of design patterns. Design patterns are interesting and powerful, but overusing them, especially without a good reason, can create disastrous overengineering. Always remember KISS and YAGNI.

### Dependency Injection

Dependency Injection is a key element of agile architecture.

The Singleton pattern is often unfavorable to good software design.

Singleton ensures that a class has only one instance and provides global access to that instance. Its task is to control and manage the entire lifecycle of that unique instance.

According to separation of concerns, managing an object's lifecycle should be separate from its domain business logic. In Singleton, these two concerns are basically not separated.

Singleton also provides global access so every other object in the application can use the instance.

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

  // ...other member functions...

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

After C++11, constructing a static variable inside `getInstance()` is thread-safe by default. That does not mean the other member functions of `Singleton` are thread-safe. Developers must still guarantee that separately.

The main problem with Singleton is its global visibility and accessibility. Other classes can use it from anywhere. This means all dependencies on the Singleton are hidden in the code. By inspecting a class interface, such as its attributes and methods, you cannot see those dependencies.

Using Singleton in object-oriented programming is like using global variables in procedural programming. It is an antipattern.

What should replace Singleton?

Create only one instance, then inject it where it is needed.

Dependency Injection separates a component from the services it needs, so the component does not need to know the names of those services or how to obtain them.

A good object-oriented design should keep modules and components as loosely coupled as possible. Dependency Injection is a key technique for that.

Dependency Injection uses the Dependency Inversion Principle.

Common techniques:

- constructor injection
- setter injection

### Adapter Pattern

Adapter converts the interface of one class into another interface expected by clients. It lets classes work together that otherwise could not because of incompatible interfaces.

Adapter can provide broad adaptation and conversion possibilities for incompatible interfaces. Its scope ranges from simple adaptation, such as converting operation names and data types, to supporting a completely different set of operations.

If the interfaces are similar, adaptation is easier. If they differ greatly, the Adapter implementation can become complex.

### Strategy Pattern

The Open-Closed Principle is a guideline for extensible object-oriented design. Strategy embodies this principle.

Strategy defines a family of algorithms, encapsulates each one, and makes them interchangeable. It lets algorithms vary independently from clients that use them.

Doing the same thing in different ways is a common need in software design. Sorting a list is an obvious example. Different sorting algorithms have different time and space complexity, such as bubble sort, quicksort, merge sort, insertion sort, and heap sort.

With Strategy, the program can dynamically choose a sorting algorithm, for example based on the characteristics of the list being sorted.

### Command Pattern

When building command-controlled systems, it is important to separate the requester of an operation from the object that actually performs it. The requester should not need to know how the operation is performed or implemented. The guiding principles are loose coupling and separation of concerns.

Command encapsulates a request as an object, allowing clients to be parameterized with different requests, queued or logged requests, or undoable operations.

Example: in a client/server architecture, the client, or invoker, sends commands to the server, or receiver, which accepts and executes them.

<details><summary>Example code</summary>

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

### Command Processor Pattern

<details><summary>Command processor pattern</summary>

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

### Composite Pattern

The object-oriented blueprint for tree-like data structures is called Composite.

Composite composes objects into tree structures to represent part-whole hierarchies. It lets clients treat individual objects and compositions uniformly.

### Observer Pattern

A well-known architectural pattern is Model-View-Controller. In MVC, the view and model should be as loosely coupled as possible. This loose coupling is often implemented with Observer.

Observer defines a one-to-many dependency between objects so that when one object changes state, all of its dependents are notified and updated automatically.

Besides loose coupling, because the concrete Subject knows nothing about concrete Observers, this pattern also supports the Open-Closed Principle well. New concrete Observers can be added easily without changing existing classes.

### Factory Pattern

Factory follows separation of concerns and information hiding. Instance creation is hidden from users of the instance.

### Facade Pattern

Facade is a structural design pattern often used at the architecture level.

Facade provides a unified interface to a set of interfaces in a subsystem. It defines a higher-level interface that makes the subsystem easier to use.

In C++ and other languages, Facade is not special. It is usually a simple class whose public interface accepts requests and forwards them to the internal structure of the subsystem. Sometimes it only forwards calls, while at other times it performs data conversion and also behaves like an Adapter.

### Money Class Pattern

This pattern is used for values or measurements that must be represented accurately.

### Special Case Pattern

Special Case provides a subclass with special behavior for a specific case.

The idea is to use polymorphism and provide a class representing a special case instead of returning `nullptr` or another special value.

`std::optional<T>` is a C++17 template type for representing an optional value. It can replace `nullptr` and `boost::optional` in many cases.

## What Are Idioms?

A programming idiom is a special pattern for solving a problem in a specific programming language or technology. Unlike general design patterns, its applicability is limited. Idioms are usually restricted to a language or technology, such as a framework.

When a programming problem must be solved at a lower abstraction level, idioms are often used during detailed design and implementation.

### Useful Idioms

- Immutable classes
- Match is not an error
- Copy and Swap

Explicitly implementing copy constructors and assignment operators relates to the Rule of Zero.

- Pointer to Implementation

PIMPL relocates internal implementation details to a hidden implementation class, removing compile-time dependencies on implementation details and improving compilation time.
