---
title: 'Object-Oriented Programming'
description: 'Notes on object-oriented thinking, abstraction, class design, SOLID principles, dependency rules, and avoiding weak object models.'
---

## Object-Oriented Thinking

> I thought of objects being like biological cells and/or individual computers on a network, only able to communicate with messages. For me, OOP means messaging, local retention and protection and hiding of state-process, and extreme late-binding. -- Alan Kay

## Abstraction: The Key to Solving Complexity

Object orientation is about dealing with complexity.

The basic idea behind OO is to model things and concepts from the domain that matter to us in software design. We should model only the things that must be represented in the software system to satisfy stakeholder needs, also known as requirements.

Abstraction is the most important tool for modeling these things and concepts properly. We do not need to model the entire real world. We only need an excerpt of it and simplify that excerpt to the details relevant to the system's use cases.

## Class Design Principles

Classes can be viewed as encapsulated software modules. They combine structural features, such as attributes, data members, and fields, with behavioral features, such as member functions, methods, and operations, into one cohesive unit.

> A class is a blueprint for objects.

### Keep Classes as Small as Possible

Classes with thousands of lines of code are hard to understand. Their maintainability, testability, and reusability are usually poor.

Avoid God classes: unusually large classes with many attributes and hundreds of methods.

A practical suggestion is to keep a single class below about 50 lines when possible.

The number of lines of code is not the only signal. A better criterion is how many responsibilities the class has.

### Single Responsibility Principle

Every software unit, including components, classes, and functions, should have one single, clearly defined responsibility.

If a class has a well-defined responsibility, it usually has strong cohesion.

Classes that follow SRP are often small, have few dependencies, are easy to understand, and are easy to test.

### Open-Closed Principle

> All systems change during their lifetime. This must be kept in mind when developing systems expected to last longer than their first version. -- Ivar Jacobson

For any kind of software unit, especially class design, the Open-Closed Principle is an important guideline. Software entities should be open for extension but closed for modification.

In object-oriented programming, inheritance is one way to support this principle. It allows new behavior to be added without modifying the original class. Many object-oriented design patterns also support OCP, such as Strategy and Decorator.

### Liskov Substitution Principle

Inheritance is a taxonomy concept used to build specialized type hierarchies, where a subtype derives from a more general type.

Polymorphism usually means a single interface can access objects of different types.

The Liskov Substitution Principle gives these rules for class hierarchies:

- A derived class must not strengthen the preconditions of the base class.
- A derived class must not weaken the postconditions of the base class.
- All invariants of the base class, including data members and member functions, must not be changed or violated by derived classes.
- Historical constraint: an object's internal state should change only through methods in its public interface.

Use composition instead of inheritance when it better represents the design.

### Interface Segregation Principle

Interfaces are a way to achieve loose coupling between implementation classes.

An interface is like a contract: a class can request services through the contract, and other classes that implement the contract provide those services.

The Interface Segregation Principle states that interfaces should not contain member functions unrelated to the implementing class, or functions that the class cannot implement meaningfully.

Wide interfaces should be split into smaller, highly cohesive interfaces. These smaller interfaces are also called role interfaces.

### Acyclic Dependencies Principle

Avoid cycles.

The Acyclic Dependencies Principle says the dependency graph between components or classes should not contain cycles. Cyclic dependencies are a symptom of tight coupling and should be avoided.

### Dependency Inversion Principle

The Dependency Inversion Principle is an object-oriented design principle used to decouple software modules. It says object-oriented design should not be based on the special properties of concrete modules. Instead, shared characteristics should be merged into shared abstractions, such as interfaces.

Robert C. Martin formulated it as:

- High-level modules should not depend on low-level modules. Both should depend on abstractions.
- Abstractions should not depend on details. Details should depend on abstractions.

### Do Not Talk to Strangers

The Law of Demeter allows:

- a member function to call other member functions in its own class scope;
- a member function to call member functions of data members in its own class scope;
- a member function to call member functions of its parameters;
- a member function to call member functions of local objects it creates.

If calls from those functions return objects structurally farther away than the class's direct neighbors, calling methods on those returned objects should be avoided.

### Avoid Anemic Classes

Classes that only contain data structures are called anemic classes. The problem is that they contain data but no behavior. They usually have only data members and no meaningful member functions.

### Tell, Do Not Ask

The Tell, Don't Ask principle says an object should expose as little of its internal state as possible, and should instead provide public methods that change or use that state.

### Avoid Static Class Members

Avoid God classes.

Avoid static member variables and static member functions when they create hidden global state or hidden dependencies.
