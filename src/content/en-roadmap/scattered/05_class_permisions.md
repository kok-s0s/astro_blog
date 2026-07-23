---
title: 'Class Access Control'
---

C++ provides three main access levels for class members: `private`, `protected`, and `public`.

# `private`

`private` members can only be accessed by member functions and friends of the same class. They are used to hide implementation details.

```cpp
class MyClass {
private:
    int value;
public:
    void setValue(int v) { value = v; }
    int getValue() const { return value; }
};
```

# `protected`

`protected` members can be accessed by the class itself, friends, and derived classes. They are useful when inheritance needs controlled access to base-class internals.

# `public`

`public` members are part of the external interface. They can be accessed by any code that can see the object.

# Summary

- Keep data members private by default.
- Expose behavior through a small public interface.
- Use `protected` only when inheritance really needs it.
