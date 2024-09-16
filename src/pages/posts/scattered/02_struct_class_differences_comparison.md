---
title: 'struct 与 class 的区别'
---

# `struct` 与 `class` 的区别

1. **默认访问控制**:
- **`struct`**: 默认公有访问（`public`）。
- **`class`**: 默认私有访问（`private`）。

2. **继承默认访问控制**:
- **`struct`**: 默认公有继承（`public`）。
- **`class`**: 默认私有继承（`private`）。

3. **使用目的**:
- **`struct`**: 通常用于数据结构，成员通常是公有的，主要用于简单的聚合数据。
- **`class`**: 通常用于面向对象编程，成员通常是私有的，提供封装和抽象。

4. **语法**:
- **`struct`**:
```cpp
struct Person {
    std::string name;
    int age;
};
```
- **`class`**:
```cpp
class Person {
private:
    std::string name;
    int age;
public:
    void setName(const std::string& n) { name = n; }
    std::string getName() const { return name; }
};
```

在实际编程中，`struct` 和 `class` 可以在很多方面互换使用，主要的选择依据是设计意图和访问控制。
