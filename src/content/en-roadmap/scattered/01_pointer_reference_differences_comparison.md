---
title: 'Differences Between Pointers and References'
---

# Differences Between Pointers and References

1. **Definition**
- A **pointer** stores the address of another object and can be reassigned.
- A **reference** is an alias for an existing object and cannot be rebound after initialization.

2. **Syntax**

```cpp
int a = 10;
int *p = &a;
int &r = a;
```

3. **Nullability**
- A pointer can be `nullptr`.
- A reference should always refer to a valid object.

4. **Reassignment**
- A pointer can point to different objects during its lifetime.
- A reference always refers to the object it was initialized with.

5. **Usage**
- Use pointers when null, ownership, or reseating is meaningful.
- Use references when a valid object is required and no ownership transfer is implied.
