---
title: 'Memory Areas: Global, Heap, Stack, Constant, Code'
---

C and C++ programs organize memory into several common areas.

# Global / Static Area

Stores global variables and static variables. Initialized data is placed in the data segment, while zero-initialized data is usually placed in BSS.

# Heap

The heap is used for dynamic allocation through `malloc`, `new`, and similar APIs. The programmer or owning abstraction must release the memory.

# Stack

The stack stores local variables, function parameters, return addresses, and call frames. It is automatically managed when functions are called and returned.

# Constant Area

Stores read-only data such as string literals and some constant objects. Modifying string literals is undefined behavior.

# Code Area

Stores executable instructions. It is usually read-only during normal program execution.

# Practical Notes

- Stack allocation is fast but limited in size.
- Heap allocation is flexible but needs ownership management.
- RAII and smart pointers reduce manual memory mistakes.
