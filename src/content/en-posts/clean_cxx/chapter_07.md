---
title: 'Functional Programming'
description: 'Notes on functional programming ideas in modern C++, including pure functions, lambdas, higher-order functions, and clean functional style.'
---

> Functional programming is often seen as a counterweight to object-oriented programming.

## What Is Functional Programming?

Functional programming is based on functions in the mathematical sense. It is a programming paradigm and a way of thinking about software construction.

The paradigm is often described through its positive properties, especially compared with other paradigms such as object-oriented programming:

1. **Side effects are eliminated by avoiding shared mutable state.** In pure functional programming, function calls have no side effects.
2. **Data and objects are immutable.** Once a data structure is created, it never changes. Applying a function to it creates a new data structure or a variation of the old one. Immutable data has a major advantage: thread safety.
3. **Function composition and higher-order functions.** Functions can be treated like data. They can be stored in variables, passed as parameters to other functions, and returned from other functions. Functions can be chained easily. In other words, functions are first-class citizens.
4. **Better and easier parallelization.** Concurrency is difficult. Designers must consider many things in a multithreaded environment, and debugging concurrent programs can be painful. If function calls never have side effects, there is no global state, and all data structures are immutable, parallelizing software becomes much easier. Imperative and object-oriented programs often need locks and synchronization mechanisms to protect mutable data.
5. **Easy testing.** Pure functions are easy to test because test cases do not need to account for global mutable state or other side effects.

### What Is a Function?

In functional programming, a function is a true mathematical function.

It is referentially transparent: calling it with the same input always produces the same output.

### Pure and Impure Functions

A function that always produces the same output for the same input is called a pure function.

By contrast, imperative paradigms such as procedural or object-oriented programming do not guarantee freedom from side effects.

A function that can produce different results when called with the same arguments is an impure function.

## Functional Programming in Modern C++

Template metaprogramming was one of the earliest places where functional programming appeared in C++.

### Template Functional Programming

Template metaprogramming is functional programming, and it is Turing complete.

It can perform any possible computation at compile time.

The drawback is that heavy template metaprogramming can seriously hurt readability and understandability.

### Functors

In C++, objects that behave like functions can be defined and used. They are called functors, or functionals.

A functor is basically a class that defines the call operator, `operator()`. After such a class is instantiated, the instance can be used like a function.

### Binding and Function Wrapping

`std::bind`, `std::function`, and `auto` were useful tools, but after C++11 introduced lambda expressions, these templates are used less often.

### Lambda Expressions

In imperative programming, when execution leaves the scope of a variable, that variable is no longer available. For example, after a function call finishes and returns to the caller, all local variables are removed from the call stack and their memory is released.

In functional programming, a closure can be built. A closure is a function object with a persistent local-variable scope. In other words, a closure allows some or all local variables to be bound to the function, and that scope object continues to exist as long as the function exists.

In C++, lambda capture lists make it possible to create such closures. A closure is not the same thing as a lambda expression, just as an object instance is not the same thing as its class.

Lambda expressions are often implemented inline, at the point where they are used. This can improve readability, and the compiler can optimize them effectively. Lambda functions can also be treated as data: stored in variables or passed to higher-order functions.

The basic structure is:

```cpp
[ capture list ]( parameter list ) -> return_type_declaration {
  lambda body
}
```

### Generic Lambda Expressions

Since C++14, `auto` can be used as the return type of functions or lambda expressions, allowing the compiler to infer the type. Such lambdas are called generic lambda expressions.

They are useful with standard-library algorithms because they are broadly applicable.

## Higher-Order Functions

Higher-order functions are a core concept in functional programming. They are a consequence of first-class functions. A higher-order function is a function that takes one or more other functions as arguments, or returns a function as its result.

In C++, any callable object can be passed to a higher-order function: an instance wrapped by `std::function`, a function pointer, a closure created from a lambda expression, a hand-written functor, or anything else that implements `operator()`.

- `Map`
- `Filter`
- `Reduce`

C++17 introduced fold expressions.

## Clean Functional Code

Good software design principles still apply regardless of programming style.

> Always code as if the person who ends up maintaining your code is a violent psychopath who knows where you live. -- John F. Woods
