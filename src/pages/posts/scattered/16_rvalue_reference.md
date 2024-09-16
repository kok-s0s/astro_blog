---
title: '右值引用'
---

右值引用（rvalue reference）是 C++11 引入的一个重要特性，它用于支持移动语义（move semantics）和完美转发（perfect forwarding）。右值引用的主要目的是优化资源管理和性能，尤其是在对象的移动而不是复制时。

### 基本概念

- **左值（lvalue）**：指代内存中的一个具体位置，能够被赋值的对象。例如，变量名、数组元素等。
- **右值（rvalue）**：不指代任何持久位置的数据，通常是临时对象或字面量。例如，常量、临时对象、表达式的结果等。

### 右值引用的定义

右值引用使用 `&&` 符号定义。例如：

```cpp
int &&x = 10; // x 是一个右值引用
```

### 使用场景

1. **移动语义（Move Semantics）**

   移动语义允许通过转移资源所有权来避免不必要的资源复制。通过右值引用，我们可以高效地转移对象的资源，从而提高性能。

```cpp
class MyClass {
public:
    MyClass() : data(new int[100]) {}
    ~MyClass() { delete[] data; }

    // 移动构造函数
    MyClass(MyClass&& other) noexcept : data(other.data) {
        other.data = nullptr; // 使原对象处于有效状态
    }

    // 移动赋值运算符
    MyClass& operator=(MyClass&& other) noexcept {
        if (this != &other) {
            delete[] data;
            data = other.data;
            other.data = nullptr;
        }
        return *this;
    }

private:
    int* data;
};
```

2. **完美转发（Perfect Forwarding）**

   完美转发通过 `std::forward` 和右值引用，能够保留传入参数的值类别（lvalue 或 rvalue），以避免不必要的复制或移动。

```cpp
template <typename T>
void process(T&& arg) {
    func(std::forward<T>(arg)); // 完美转发
}
```

### 示例

```cpp
#include <iostream>
#include <utility>

class MyClass {
public:
    MyClass() : data(new int[10]) {
        std::cout << "Constructor\n";
    }

    ~MyClass() {
        delete[] data;
        std::cout << "Destructor\n";
    }

    // 移动构造函数
    MyClass(MyClass&& other) noexcept : data(other.data) {
        other.data = nullptr;
        std::cout << "Move Constructor\n";
    }

    // 移动赋值运算符
    MyClass& operator=(MyClass&& other) noexcept {
        if (this != &other) {
            delete[] data;
            data = other.data;
            other.data = nullptr;
            std::cout << "Move Assignment\n";
        }
        return *this;
    }

private:
    int* data;
};

int main() {
    MyClass obj1;
    MyClass obj2 = std::move(obj1); // 调用移动构造函数
    MyClass obj3;
    obj3 = std::move(obj2); // 调用移动赋值运算符

    return 0;
}
```

在这个示例中，`obj1` 的资源被移动到 `obj2`，而 `obj2` 的资源被移动到 `obj3`，从而避免了不必要的资源复制。
