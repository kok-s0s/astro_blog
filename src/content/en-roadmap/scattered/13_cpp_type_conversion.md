---
title: 'C++ Type Casts'
---

C++ provides four named casts. They are more explicit and safer than C-style casts.

# `static_cast`

Used for well-defined compile-time conversions.

```cpp
double d = static_cast<double>(10);
```

It can also be used for upcasts and some downcasts in inheritance hierarchies, but it does not perform runtime checking.

# `dynamic_cast`

Used for checked casts in polymorphic class hierarchies.

```cpp
Derived* d = dynamic_cast<Derived*>(base);
```

It returns `nullptr` for failed pointer casts and throws for failed reference casts.

# `const_cast`

Used to add or remove `const` or `volatile`.

```cpp
const_cast<int*>(ptr);
```

Removing `const` and then modifying an originally const object is undefined behavior.

# `reinterpret_cast`

Used for low-level bit reinterpretation. It is powerful and risky, and should be rare in ordinary application code.

# Advice

Prefer named casts because they communicate intent and make unsafe conversions easier to notice during review.
