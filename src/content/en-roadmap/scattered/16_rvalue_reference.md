---
title: 'Rvalue References'
---

Rvalue references were introduced in C++11 to support move semantics and perfect forwarding.

# Lvalues and Rvalues

- **Lvalue**: has an identifiable location and can usually appear on the left side of assignment.
- **Rvalue**: is a temporary value or expression result that usually does not have a persistent identity.

# Syntax

```cpp
int&& x = 10;
```

# Move Semantics

Rvalue references allow resources to be transferred instead of copied.

```cpp
std::vector<int> a = makeVector();
std::vector<int> b = std::move(a);
```

After moving, `a` remains valid but its value is unspecified.

# Perfect Forwarding

Forwarding references preserve the value category of function arguments.

```cpp
template <typename T>
void wrapper(T&& value) {
    target(std::forward<T>(value));
}
```

# Why It Matters

Rvalue references make high-performance resource management possible without forcing manual memory handling.
