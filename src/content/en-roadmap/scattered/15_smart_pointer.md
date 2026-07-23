---
title: 'Four Smart Pointers and Their Implementations'
---

C++ smart pointers help manage dynamic memory automatically and reduce leaks.

# `auto_ptr`

`auto_ptr` was introduced in C++98 and is now deprecated. Copying it transfers ownership, which made ordinary value semantics dangerous.

# `unique_ptr`

`unique_ptr` represents exclusive ownership.

```cpp
std::unique_ptr<int> p = std::make_unique<int>(42);
```

It cannot be copied, but it can be moved. Internally, it usually stores a raw pointer and a deleter.

# `shared_ptr`

`shared_ptr` represents shared ownership. It uses a control block that stores:

- the reference count;
- the weak reference count;
- the deleter and allocator information.

When the strong count reaches zero, the managed object is destroyed.

# `weak_ptr`

`weak_ptr` observes an object managed by `shared_ptr` without increasing the strong reference count. It is used to break cycles.

```cpp
std::weak_ptr<Node> parent;
```

Use `lock()` to obtain a temporary `shared_ptr` if the object still exists.

# Advice

- Use `unique_ptr` for clear ownership.
- Use `shared_ptr` only when shared lifetime is actually needed.
- Use `weak_ptr` to avoid ownership cycles.
