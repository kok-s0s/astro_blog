---
title: 'Deep Copy vs Shallow Copy'
---

Deep copy and shallow copy are two different ways to duplicate an object.

# Shallow Copy

A shallow copy copies the object's immediate fields. If those fields contain pointers or references, both objects may still point to the same underlying resource.

```cpp
struct Buffer {
    char* data;
};
```

A compiler-generated copy of `Buffer` copies the pointer value, not the memory it points to.

# Deep Copy

A deep copy allocates a new resource and copies the actual content.

```cpp
class Buffer {
public:
    Buffer(const Buffer& other) {
        data = new char[other.size];
        std::copy(other.data, other.data + other.size, data);
    }
private:
    char* data;
    std::size_t size;
};
```

# Risk

Shallow copying owning pointers can cause double free, dangling pointers, or unexpected shared mutation.

# Modern C++ Advice

Prefer standard library types such as `std::vector`, `std::string`, and smart pointers. They make copying and ownership clearer.
