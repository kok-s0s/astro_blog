---
title: 'Advanced Concepts in Modern C++'
description: 'Notes on resource management, move semantics, compile-time support, type-rich programming, libraries, and error handling in modern C++.'
---

## Resource Management

For software developers, resource management is basic work.

Many different resources must be allocated, used, and returned properly after use. Common resources include:

- memory, whether stack memory or heap memory;
- file handles needed to access files on disk or other media such as the network;
- network connections, for example connections to servers or databases;
- threads, locks, timers, and transactions;
- other operating-system resources, such as GDI handles on Windows.

> Resource leaks are a serious problem, especially in long-running processes or processes that allocate many resources quickly without releasing them soon. If the operating system runs short of resources, it can lead directly to critical system states. Resource leaks can also become security issues because attackers may use them for denial-of-service attacks.

How can we guarantee that allocated resources are always released?

### Resource Acquisition Is Initialization

RAII means acquiring resources in the constructor and releasing them in the destructor. It is scope-based resource management.

RAII uses the symmetry between a class constructor and destructor: allocate the resource in the constructor, then release it in the destructor.

### Smart Pointers

Smart pointers are defined in the `<memory>` header.

1. `std::unique_ptr<T>` with exclusive ownership

`std::unique_ptr<T>` manages a pointer to an object of type `T`.

As the name suggests, this smart pointer provides exclusive ownership: one object can be owned by only one `std::unique_ptr<T>` instance at a time.

Move semantics are important here.

2. `std::shared_ptr<T>` with shared ownership

`std::shared_ptr<T>` can point to an object of type `T` and share ownership with other `std::shared_ptr<T>` instances. In other words, ownership of an object and responsibility for deleting it can be shared by many owners.

`std::shared_ptr<T>` provides a simple and effective garbage-collection-like mechanism. Internally it maintains a reference count that tracks how many `std::shared_ptr<T>` instances currently share the object. When the last instance is destroyed, the managed resource is released.

3. `std::weak_ptr<T>` for safe non-owning access

Use case: a pointer that does not own a resource, but observes a resource owned by one or more `std::shared_ptr<T>` instances.

`std::weak_ptr<T>` has no ownership and does not affect the resource lifetime. It only observes the resource and checks whether the resource is still valid.

With `std::shared_ptr<T>` and `std::weak_ptr<T>`, software design can distinguish resource owners from resource users. Not every unit wants to own a resource; many only need to use it for a specific, time-limited task.

This is also useful for cyclic dependency problems.

### Avoid Explicit `new` and `delete`

Explicit `new` and `delete` can often be avoided with these practices:

- **Use stack memory whenever possible.** Stack allocation is simple and safe. It does not cause memory leaks, because resources are destroyed when they leave scope.
- **Use make functions for heap resources.** Create resources with `std::make_unique<T>` or `std::make_shared<T>`, then let the resulting resource-management object handle the lifetime.
- **Prefer containers from the standard library, Boost, or other libraries.** Containers manage storage for their elements. If you write your own data structures or sequential containers, you must implement all memory-management details yourself, which is complex and error-prone.
- **For special memory management, wrap resources with suitable third-party libraries.**

### Managing Special Resources

Examples include opened files in the file system and dynamically linked modules.

These resources are managed through handles. A handle is an abstraction and unique reference for an operating-system resource.

The RAII principle applies here as well.

> Note: C++ does not allow `std::unique_ptr<void>`. `std::shared_ptr<T>` implements type erasure, but `std::unique_ptr<T>` does not. If a class supports type erasure, it can store objects of arbitrary types and still release their memory correctly.

## Move Semantics

Old C++ often forced programmers to use copy constructors even when they did not really want a deep copy. Instead, they only wanted to move the object's payload: its data, members, or other owned objects.

Move semantics let an object move its internal data.

### Lvalues and Rvalues

Historically, an lvalue usually appeared on the left side of an assignment operator, while an rvalue usually appeared on the right side.

Another interpretation is that an lvalue is a locator value: an object with a location in memory, meaning it has an accessible and identifiable address.

Compared with lvalues, rvalues are expressions that are not lvalues. They are temporary objects or subobjects.

After C++11, more value categories such as xvalue, glvalue, and prvalue were introduced to support move semantics.

### Rvalue References

Rvalue references make it possible to bind to the memory location of an rvalue.

After temporary storage is bound to an rvalue reference, that storage can be treated as if it were more permanent for the lifetime of the reference.

### Do Not Overuse Move

`std::move<T>()` does not actually move anything by itself. It is more or less a cast to an rvalue reference of type `T`.

Using `std::move<T>()` as a return value is usually unnecessary.

Be careful with optimization. Excessive `std::move<T>()` hurts readability and may prevent the compiler from applying its own optimizations correctly.

### The Rule of Zero

When implementing classes, you should usually not need to declare or define a destructor, copy/move constructor, or copy/move assignment operator. Use C++ smart pointers and standard-library types to manage resources.

The idea behind this principle is simple: write less code and accomplish more.

## The Compiler as a Partner

Three guidelines when working with the compiler:

- Things that can be solved at compile time should be solved at compile time.
- Things that can be checked at compile time should be checked at compile time.
- Everything the compiler can know about the program should be decided by the compiler.

### Automatic Type Deduction

`auto` can be used for automatic type deduction.

When it does not create ambiguity, prefer `auto`.

### Compile-Time Computation

C++11 introduced `constexpr` to declare constant expressions.

Functions declared with `constexpr` can be evaluated at compile time.

### Variable Templates

Templates can also use `constexpr` to declare variable templates.

```cpp
template <typename T>
constexpr T pi = T(3.1415926535897932385L);
```

Classes can also support compile-time computation by declaring member functions as `constexpr`.

A `constexpr` class can be used both at runtime and compile time. Unlike ordinary classes, however, a `constexpr` class cannot define virtual member functions, because there is no polymorphism at compile time, and its destructor cannot be explicitly defined.

## Undefined Behavior Is Not Allowed

Avoid undefined behavior. Undefined behavior is a serious bug and can eventually make a program fail silently.

## Type-Rich Programming

> Do not trust names.
>
> Trust types instead.
>
> Types do not lie.
>
> Types are your good friends.

Type safety is guaranteed at compile time.

SI units are standard international units. Template-based libraries can provide types for physical quantities.

## Know the Libraries You Use

Not Invented Here (NIH) is an organizational antipattern.

The NIH syndrome describes ignoring existing knowledge or proven solutions. It is a form of reinventing the wheel: reimplementing high-quality libraries or frameworks that already exist elsewhere. Developers should avoid this symptom.

In the past decades, many excellent libraries and frameworks have appeared around C++. These solutions have matured over time and have been applied successfully in many projects. There is no need to reinvent the wheel. A qualified software developer should know these libraries. It is not necessary to know every implementation detail of every API, but it is valuable to know that proven solutions already exist for certain domains.

### Use the Algorithm Library Well

> If you want to improve team code quality, replace all coding guidelines with one goal: no raw loops. -- Sean Parent, CppCon 2013

The C++ standard library provides more than 100 useful algorithms for searching, counting, and manipulating elements in containers or sequences. They are available in the `<algorithm>` header.

### Use Boost Well

Boost can solve many practical problems that C++ developers face in daily work.

### Libraries Worth Knowing

- `<chrono>` for date and time
- `<regex>` for regular expressions
- `<filesystem>` for file-system operations
- Range-v3 for range and iterator-oriented code
- `libcds`, a C++ template library for lock-free algorithms and concurrent data structures

## Proper Exception and Error Handling

> Cross-cutting concerns are problems that are difficult to solve with simple modularization and usually require architecture or design-level treatment.

### Prevent Problems First

The basic strategy for handling errors and exceptions is often to avoid them. If the problem never happens, there is nothing to handle.

### Exceptions Should Be Exceptional

Throw exceptions only in truly exceptional situations. Do not abuse exceptions to control normal program flow.

### Fail Fast If Recovery Is Impossible

If an exception leaves the program unable to recover, the usual approach is to log the exception or generate a crash dump for later analysis, then terminate immediately.

> Dead programs tell no lies.

Nothing is worse than continuing as if nothing happened after a severe error, such as generating tens of thousands of wrong orders or sending an elevator from the basement to the top floor and back hundreds of times. It is wiser to stop the program before larger consequences happen.

### User-Defined Exceptions

Inherit from `std::exception`, which is defined in `<stdexcept>`.

Override the virtual `what()` member inherited from `std::exception` to provide error information to callers.

### Throw by Value, Catch by Const Reference

### Pay Attention to the Correct `catch` Order
