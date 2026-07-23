---
title: 'Copy Constructor vs Move Constructor'
---

Both copy constructors and move constructors initialize a new object from another object. The difference is how resources are handled.

# Copy Constructor

A copy constructor duplicates the source object's state.

```cpp
MyClass(const MyClass& other);
```

It is used when:

- an object is initialized from another lvalue;
- an object is passed by value;
- an object is returned and copy elision does not apply.

Copying can be expensive when the object owns large memory buffers or handles.

# Move Constructor

A move constructor transfers resources from a temporary or explicitly moved object.

```cpp
MyClass(MyClass&& other) noexcept;
```

It is used with rvalues and `std::move`. Moving is usually cheaper because it can steal pointers or handles instead of duplicating data.

# Key Difference

- Copying preserves the source object's value.
- Moving leaves the source object valid but unspecified.
- Move constructors should usually be marked `noexcept`, especially for standard containers.
