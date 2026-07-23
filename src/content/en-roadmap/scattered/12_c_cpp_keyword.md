---
title: 'static, const, extern, volatile'
---

# `static`

- Inside a function: creates a local variable whose lifetime lasts until program exit.
- At file scope: gives a variable or function internal linkage.
- In a class: declares a member shared by all objects of that class.

# `const`

`const` expresses that a value should not be modified through this name.

- `const int x = 10;`
- `void f(const std::string& s);`
- `int size() const;`

# `extern`

`extern` declares that a variable or function is defined elsewhere. It is often used to share declarations across translation units.

# `volatile`

`volatile` tells the compiler that a value may change outside normal program flow, such as through hardware or signal handlers. It prevents some optimizations, but it is not a thread synchronization primitive.
