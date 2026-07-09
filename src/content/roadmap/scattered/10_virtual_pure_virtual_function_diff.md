---
title: '虚函数与纯虚函数的区别'
---

- **虚函数**（Virtual Function）：
  - 虚函数是基类中声明的函数，并通过`virtual`关键字标识。
  - 虚函数可以有默认的实现，派生类可以选择覆盖该虚函数，但也可以不覆盖，直接使用基类的实现。
  - 当通过基类指针或引用调用虚函数时，程序会在运行时根据实际对象类型调用派生类中的实现。

```cpp
class Base {
public:
    virtual void show() {
        std::cout << "Base class show function" << std::endl;
    }
};

class Derived : public Base {
public:
    void show() override {
        std::cout << "Derived class show function" << std::endl;
    }
};
```

- **纯虚函数**（Pure Virtual Function）：
  - 纯虚函数是虚函数的一种特殊形式，它在基类中声明但不提供实现，必须在派生类中实现。
  - 在基类中定义纯虚函数时，通常使用`= 0`来表明它没有实现。
  - 包含纯虚函数的类称为**抽象类**，这种类不能直接实例化，必须由派生类提供纯虚函数的实现才能实例化对象。

```cpp
class Base {
public:
    virtual void show() = 0; // 纯虚函数
};

class Derived : public Base {
public:
    void show() override {
        std::cout << "Derived class show function" << std::endl;
    }
};
```

**区别总结**：
- **虚函数**可以有实现，而**纯虚函数**没有实现，必须由派生类实现。
- 包含纯虚函数的类是抽象类，不能实例化；包含虚函数但没有纯虚函数的类是可以实例化的。
