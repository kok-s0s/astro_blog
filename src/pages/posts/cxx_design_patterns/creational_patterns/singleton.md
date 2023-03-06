---
layout: ../../../../layouts/SimpleMarkdownPostLayout.astro
title: 'Singleton'
author: 'RefactoringGuru'
tags: ['C++', 'Design Patterns', 'Creational Patterns']
---

## Intent

**Singleton** is a creational design pattern that lets you ensure that a class has only one instance, while providing a global access point to this instance.

![](/images/cxx_design_patterns/Singleton/singleton.png)

## Problem

The Singleton pattern solves two problems at the same time, violating the Single Responsibility Principle:

1. Ensure that a class has just a single instance.
2. Provide a global access point to that instance.

## Solution

All implementations of the Singleton have these two steps in common:

- Make the default constructor private, to prevent other objects from using the new operator with the Singleton class.
- Create a static creation method that acts as a constructor. Under the hood, this method calls the private constructor to create an object and saves it in a static field. All following calls to this method return the cached object.

If your code has access to the Singleton class, then it’s able to call the Singleton’s static method. So whenever that method is called, the same object is always returned.

![](/images/cxx_design_patterns/Singleton/structure-en.png)

## Applicability

1. **Use the Singleton pattern when a class in your program should have just a single instance available to all clients; for example, a single database object shared by different parts of the program.**

> The Singleton pattern disables all other means of creating objects of a class except for the special creation method. This method either creates a new object or returns an existing one if it has already been created.

2. **Use the Singleton pattern when you need stricter control over global variables.**

> Unlike global variables, the Singleton pattern guarantees that there’s just one instance of a class. Nothing, except for the Singleton class itself, can replace the cached instance.

> Note that you can always adjust this limitation and allow creating any number of Singleton instances. The only piece of code that needs changing is the body of the `getInstance` method.

## How to Implement

1. Add a private static field to the class for storing the singleton instance.

2. Declare a public static creation method for getting the singleton instance.

3. Implement “lazy initialization” inside the static method. It should create a new object on its first call and put it into the static field. The method should always return that instance on all subsequent calls.

4. Make the constructor of the class private. The static method of the class will still be able to call the constructor, but not the other objects.

5. Go over the client code and replace all direct calls to the singleton’s constructor with calls to its static creation method.

## Pros and Cons

| Nice                                                                             | Bad                                                                                                                                                                                                                                                                                                                                                                                                       |
|----------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| You can be sure that a class has only a single instance.                         | Violates the Single Responsibility Principle. The pattern solves two problems at the time.                                                                                                                                                                                                                                                                                                                |
| You gain a global access point to that instance.                                 | The Singleton pattern can mask bad design, for instance, when the components of the program know too much about each other.                                                                                                                                                                                                                                                                               |
| The singleton object is initialized only when it’s requested for the first time. | The pattern requires special treatment in a multithreaded environment so that multiple threads won’t create a singleton object several times.                                                                                                                                                                                                                                                             |
|                                                                                  | It may be difficult to unit test the client code of the Singleton because many test frameworks rely on inheritance when producing mock objects. Since the constructor of the singleton class is private and overriding static methods is impossible in most languages, you will need to think of a creative way to mock the singleton. Or just don’t write the tests. Or don’t use the Singleton pattern. |

## Relations with Other Patterns

- A Facade class can often be transformed into a Singleton since a single facade object is sufficient in most cases.

- Flyweight would resemble Singleton if you somehow managed to reduce all shared states of the objects to just one flyweight object. But there are two fundamental differences between these patterns:
  1. There should be only one Singleton instance, whereas a Flyweight class can have multiple instances with different intrinsic states.
  2. The Singleton object can be mutable. Flyweight objects are immutable.

- Abstract Factories, Builders and Prototypes can all be implemented as Singletons.

---

[Singleton in C++](https://refactoring.guru/design-patterns/singleton/cpp/example#example-1)

<details><summary>Example</summary>

```cpp
#include <iostream>
#include <mutex>
#include <string>
#include <thread>

/**
 * The Singleton class defines the `GetInstance` method that serves as an
 * alternative to constructor and lets clients access the same instance of this
 * class over and over.
 */
class Singleton {

  /**
   * The Singleton's constructor/destructor should always be private to
   * prevent direct construction/desctruction calls with the `new`/`delete`
   * operator.
   */
private:
  static Singleton *pinstance_;
  static std::mutex mutex_;

protected:
  Singleton(const std::string value) : value_(value) {}
  ~Singleton() {}
  std::string value_;

public:
  /**
   * Singletons should not be cloneable.
   */
  Singleton(Singleton &other) = delete;
  /**
   * Singletons should not be assignable.
   */
  void operator=(const Singleton &) = delete;
  /**
   * This is the static method that controls the access to the singleton
   * instance. On the first run, it creates a singleton object and places it
   * into the static field. On subsequent runs, it returns the client existing
   * object stored in the static field.
   */

  static Singleton *GetInstance(const std::string &value);
  /**
   * Finally, any singleton should define some business logic, which can be
   * executed on its instance.
   */
  void SomeBusinessLogic() {
    // ...
  }

  std::string value() const { return value_; }
};

/**
 * Static methods should be defined outside the class.
 */

Singleton *Singleton::pinstance_{nullptr};
std::mutex Singleton::mutex_;

/**
 * The first time we call GetInstance we will lock the storage location
 *      and then we make sure again that the variable is null and then we
 *      set the value. RU:
 */
Singleton *Singleton::GetInstance(const std::string &value) {
  std::lock_guard<std::mutex> lock(mutex_);
  if (pinstance_ == nullptr) {
    pinstance_ = new Singleton(value);
  }
  return pinstance_;
}

void ThreadFoo() {
  // Following code emulates slow initialization.
  std::this_thread::sleep_for(std::chrono::milliseconds(1000));
  Singleton *singleton = Singleton::GetInstance("FOO");
  std::cout << singleton->value() << "\n";
}

void ThreadBar() {
  // Following code emulates slow initialization.
  std::this_thread::sleep_for(std::chrono::milliseconds(1000));
  Singleton *singleton = Singleton::GetInstance("BAR");
  std::cout << singleton->value() << "\n";
}

int main() {
  std::cout << "If you see the same value, then singleton was reused (yay!\n"
            << "If you see different values, then 2 singletons were created "
               "(booo!!)\n\n"
            << "RESULT:\n";
  std::thread t1(ThreadFoo);
  std::thread t2(ThreadBar);
  t1.join();
  t2.join();

  return 0;
}
```

</details>
