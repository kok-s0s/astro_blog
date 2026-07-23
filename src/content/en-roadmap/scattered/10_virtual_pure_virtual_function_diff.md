---
title: 'Virtual Functions vs Pure Virtual Functions'
---

# Virtual Function

A virtual function is declared with the `virtual` keyword. It can have a default implementation in the base class, and derived classes may override it.

```cpp
class Base {
public:
    virtual void show();
};
```

When called through a base pointer or reference, the actual function is selected at runtime.

# Pure Virtual Function

A pure virtual function has no required base implementation and is declared with `= 0`.

```cpp
class Shape {
public:
    virtual double area() const = 0;
};
```

A class with at least one pure virtual function is abstract and cannot be instantiated directly.

# Difference

- Virtual functions may provide default behavior.
- Pure virtual functions define an interface that derived classes must implement.
- Pure virtual functions are commonly used to model abstract interfaces.
