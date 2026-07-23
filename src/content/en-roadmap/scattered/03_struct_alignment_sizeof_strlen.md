---
title: 'Struct Alignment, sizeof, and strlen'
---

In C and C++, structure layout is affected by alignment. The compiler may insert padding bytes between members so each member is placed at an address suitable for its type.

# Struct Alignment

For example, an `int` may require 4-byte alignment. If a `char` is followed by an `int`, the compiler may insert padding between them.

```cpp
struct Example {
    char a;
    int b;
    short c;
};
```

The size of this structure is often larger than the sum of its members because of padding.

# Why Alignment Exists

Aligned memory access is usually faster and may be required by some architectures. Padding trades a small amount of space for safer and faster access.

# `sizeof`

`sizeof` is evaluated by the compiler and returns the storage size of a type or object, including padding and the null terminator for character arrays.

```cpp
char s[] = "abc";
sizeof(s); // 4
```

# `strlen`

`strlen` counts characters before the first `'\0'` at runtime. It only works for null-terminated C strings.

```cpp
strlen(s); // 3
```

# Summary

- `sizeof` measures storage size.
- `strlen` measures string length before `'\0'`.
- `struct` size may include padding.
