---
title: 'C++ Iterators'
---

Iterators are objects used to traverse container elements. They behave like generalized pointers.

# Basic Idea

An iterator supports operations such as dereference and increment.

```cpp
for (auto it = v.begin(); it != v.end(); ++it) {
    std::cout << *it << '\n';
}
```

# Iterator Categories

- **Input iterator**: reads values in one pass.
- **Output iterator**: writes values in one pass.
- **Forward iterator**: moves forward and can be reused.
- **Bidirectional iterator**: moves forward and backward.
- **Random access iterator**: supports indexing and constant-time jumps.

# Iterator Invalidation

Iterators can become invalid after container modifications.

- `vector` reallocation invalidates iterators and references.
- `erase` usually invalidates the erased iterator.
- `list` has more stable iterators because nodes are separately allocated.

# Advice

Always check the container's invalidation rules when modifying it during iteration.
