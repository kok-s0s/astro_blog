---
title: '类的访问权限'
---

在C++中，类的访问权限控制了类的成员（数据成员和成员函数）可以被哪些代码访问。C++中有三种主要的访问权限：`private`、`protected`和`public`。下面是它们的简要说明：

1. **private**：
- **定义**：`private`成员只能被同一个类的其他成员函数访问。
- **作用**：用于封装内部实现细节，确保类的内部数据不被外部直接修改。
- **示例**：
```cpp
class MyClass {
private:
    int privateData; // 只能被 MyClass 的成员函数访问

public:
    void setPrivateData(int value) { privateData = value; }
    int getPrivateData() const { return privateData; }
};
```

2. **protected**：
- **定义**：`protected`成员可以被同一个类和派生类的成员函数访问，但不能被类外部的代码访问。
- **作用**：允许子类访问基类的成员，而外部代码不能直接访问。
- **示例**：
```cpp
class BaseClass {
protected:
    int protectedData; // 可以被 BaseClass 和派生类访问

public:
    void setProtectedData(int value) { protectedData = value; }
    int getProtectedData() const { return protectedData; }
};

class DerivedClass : public BaseClass {
public:
    void useProtectedData() {
        protectedData = 10; // 派生类可以访问 protectedData
    }
};
```

3. **public**：
- **定义**：`public`成员可以被任何代码访问，包括类外部的代码。
- **作用**：提供接口供外部代码与类交互。
- **示例**：
```cpp
class MyClass {
public:
    int publicData; // 任何代码都可以访问

    void setPublicData(int value) { publicData = value; }
    int getPublicData() const { return publicData; }
};
```

通过合理使用这三种访问权限，你可以控制类的封装性和接口的暴露程度，从而实现更好的设计和代码维护。
