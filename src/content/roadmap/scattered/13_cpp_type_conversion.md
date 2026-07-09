---
title: 'C++ 中的类型转换'
---

在 C++ 中，有四种类型转换操作符，每种都有特定的用途：

1. **`static_cast`**：
- **用途**：用于执行编译时类型检查的类型转换。
- **特点**：可以进行一些显式的转换，如基本数据类型之间的转换、指针或引用的转换（在继承体系中进行向上或向下转换）。
- **示例**：
```cpp
int i = 10;
double d = static_cast<double>(i); // int 转换为 double

class Base {};
class Derived : public Base {};

Base* base = new Derived();
Derived* derived = static_cast<Derived*>(base); // 向下转换
```

2. **`dynamic_cast`**：
- **用途**：用于运行时类型检查的类型转换，通常用于处理继承关系中的指针或引用转换。
- **特点**：主要用于安全地进行多态类型转换（如向下转换），如果转换失败，返回 `nullptr`（对于指针）或抛出 `std::bad_cast` 异常（对于引用）。
- **示例**：
  ```cpp
  class Base {
      virtual void foo() {}
  };
  class Derived : public Base {};

  Base* base = new Derived();
  Derived* derived = dynamic_cast<Derived*>(base); // 向下转换

  if (derived) {
      // 转换成功
  } else {
      // 转换失败
  }
  ```

3. **`const_cast`**：
- **用途**：用于修改对象的 `const` 或 `volatile` 限定符。
- **特点**：可以用来添加或移除 `const` 或 `volatile` 属性。通常用于将 `const` 对象的指针转换为非 `const` 类型，但应小心使用，避免未定义行为。
- **示例**：
```cpp
const int i = 10;
int* p = const_cast<int*>(&i); // 移除 const 限定符
*p = 20; // 注意：修改 const 对象的值是未定义行为
```

4. **`reinterpret_cast`**：
- **用途**：用于执行低级别的位级转换。
- **特点**：可以将任何指针类型转换为任何其他指针类型，或者将整数转换为指针，但通常应小心使用，因为它可能导致未定义行为。
- **示例**：
```cpp
int i = 10;
char* p = reinterpret_cast<char*>(&i); // 整数指针转换为字符指针
```

每种转换方式都有其特定的使用场景和安全考虑，选择适当的转换方式可以提高代码的可读性和安全性。
