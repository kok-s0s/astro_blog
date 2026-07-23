---
title: 'How Virtual Functions Implement Dynamic Polymorphism'
---

In C++, virtual functions implement dynamic polymorphism through a virtual table and a virtual pointer.

- **vtable**: a table of function pointers generated for a class with virtual functions.
- **vptr**: a hidden pointer stored in each polymorphic object, pointing to the object's class vtable.

When a virtual function is called through a base pointer or reference, the program uses the object's `vptr` to find the correct function implementation at runtime.

This is why a base-class interface can call derived-class behavior without knowing the concrete type at compile time.
