---
title: '静态与多态：重写、重载、模板'
---

静态与多态是面向对象编程中的两个重要概念，特别是在C++中，涉及到重写、重载和模板的使用。下面分别解释这些概念：

### 1. 静态（编译时）多态
静态多态在编译时决定函数或方法的行为。它通过**函数重载**和**模板**实现。

#### - 重载（Overloading）
重载指的是在同一个作用域内定义多个函数，它们有相同的名称，但参数类型或参数个数不同。编译器会根据传入的参数类型和个数来决定调用哪个函数。重载是在编译时进行解析的，因此属于静态多态。

**示例：**

```cpp
class Example {
public:
    void func(int a) {
        std::cout << "Integer version: " << a << std::endl;
    }

    void func(double a) {
        std::cout << "Double version: " << a << std::endl;
    }

    void func(int a, double b) {
        std::cout << "Two parameters: " << a << " and " << b << std::endl;
    }
};
```

#### - 模板（Template）
模板允许在编译时生成代码，以适应不同的数据类型。C++中常见的是**函数模板**和**类模板**。模板机制使代码在静态类型检查阶段生成对应类型的函数或类，因此也是静态多态的一种。

**示例：**

```cpp
template <typename T>
T add(T a, T b) {
    return a + b;
}

int main() {
    int result_int = add(1, 2);       // 调用 int 类型的模板实例
    double result_double = add(1.5, 2.5); // 调用 double 类型的模板实例
}
```

### 2. 动态（运行时）多态
动态多态则是在运行时根据实际的对象类型来决定调用哪个方法。C++通过**虚函数（virtual function）**实现动态多态，通常和**继承**一起使用。

#### - 重写（Overriding）
重写是指在子类中重新定义父类中的虚函数，以实现不同的行为。通过基类指针或引用调用函数时，实际调用的是子类中重写的函数，基于对象的实际类型决定调用哪个版本的函数，这就是动态多态。

**示例：**

```cpp
class Base {
public:
    virtual void show() {
        std::cout << "Base class show" << std::endl;
    }
};

class Derived : public Base {
public:
    void show() override {
        std::cout << "Derived class show" << std::endl;
    }
};

int main() {
    Base* base_ptr = new Derived();
    base_ptr->show(); // 输出 "Derived class show"，因为调用了重写的函数
}
```

### 总结：
- **静态多态**（编译时）：通过**函数重载**和**模板**实现，编译时决定调用哪个函数。
- **动态多态**（运行时）：通过**虚函数**和**重写**实现，运行时根据对象的实际类型决定调用哪个函数。
