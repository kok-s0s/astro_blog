---
title: 'Constructors, Destructors, Assignment, and Copy Functions'
---

These special member functions control object lifetime, copying, moving, and resource management.

# Constructor

A constructor creates an object and initializes its members. It has the same name as the class and no return type.

```cpp
class MyClass {
public:
    MyClass();
    MyClass(int value);
};
```

# Destructor

A destructor runs when an object is destroyed. It is used to release resources.

```cpp
class File {
public:
    ~File();
};
```

# Copy Constructor

The copy constructor creates a new object from an existing object.

```cpp
MyClass(const MyClass& other);
```

# Copy Assignment Operator

The copy assignment operator replaces the state of an existing object with another object's state.

```cpp
MyClass& operator=(const MyClass& other);
```

# Move Constructor and Move Assignment

Move operations transfer resources from temporary objects instead of copying them.

```cpp
MyClass(MyClass&& other) noexcept;
MyClass& operator=(MyClass&& other) noexcept;
```

# Rule of Three/Five/Zero

- If a class manually manages resources, it may need destructor, copy constructor, and copy assignment.
- In modern C++, prefer the Rule of Zero: use standard library types and let them manage resources.
