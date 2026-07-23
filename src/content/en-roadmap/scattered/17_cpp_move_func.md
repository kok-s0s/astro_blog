---
title: 'std::move'
---

`std::move` is a standard library utility that casts an object to an rvalue reference. It does not move anything by itself.

```cpp
template <typename T>
typename std::remove_reference<T>::type&& move(T&& t) noexcept;
```

# Usage

```cpp
#include <utility>
#include <vector>

std::vector<int> a{1, 2, 3};
std::vector<int> b = std::move(a);
```

The move happens because the move constructor of `std::vector` is selected after `a` is converted to an rvalue.

# Important Notes

- `std::move` is just a cast.
- The moved-from object must remain valid.
- Do not use a moved-from object except to destroy it or assign a new value, unless its type documents stronger guarantees.

# Practical Rule

Use `std::move` when you intentionally give up the current value of an object.
