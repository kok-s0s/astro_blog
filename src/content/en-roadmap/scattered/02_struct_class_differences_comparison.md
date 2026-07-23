---
title: 'Differences Between struct and class'
---

# Differences Between `struct` and `class`

1. **Default access**
- `struct` members are `public` by default.
- `class` members are `private` by default.

2. **Default inheritance**
- `struct` inherits publicly by default.
- `class` inherits privately by default.

3. **Typical usage**
- `struct` is often used for simple aggregate data.
- `class` is often used for objects with invariants, encapsulation, and behavior.

4. **Capability**
- In C++, `struct` and `class` can both have member functions, constructors, destructors, inheritance, and templates.
- The practical difference is convention and default access control, not capability.

```cpp
struct Point {
    int x;
    int y;
};

class Counter {
public:
    void inc() { ++value; }
private:
    int value = 0;
};
```
