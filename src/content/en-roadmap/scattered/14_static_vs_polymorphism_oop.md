---
title: 'Static and Dynamic Polymorphism: Overriding, Overloading, Templates'
---

# Static Polymorphism

Static polymorphism is resolved at compile time. C++ commonly implements it through overloading and templates.

## Overloading

Overloading means multiple functions share the same name but have different parameter lists.

```cpp
void print(int);
void print(double);
```

The compiler selects the right overload from the argument types.

## Templates

Templates generate code for different types at compile time.

```cpp
template <typename T>
T maxValue(T a, T b) {
    return a > b ? a : b;
}
```

# Dynamic Polymorphism

Dynamic polymorphism is resolved at runtime through virtual functions.

```cpp
class Base {
public:
    virtual void run();
};
```

# Overriding

Overriding means a derived class provides a new implementation of a virtual function declared in the base class.

# Summary

- Overloading and templates are compile-time mechanisms.
- Overriding through virtual functions is runtime polymorphism.
- Static polymorphism is often faster; dynamic polymorphism is often more flexible.
