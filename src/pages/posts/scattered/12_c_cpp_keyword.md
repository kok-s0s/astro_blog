---
title: 'static, const, extern, volatile'
---

1. **`static`**
   - **在函数内部**：用于声明静态局部变量，变量的生命周期会延续到程序结束，而不仅仅是函数调用期间。
   - **在全局变量或函数前**：限制其作用域，仅在声明所在的文件中可见（文件内链接）。
   - **在类成员变量/函数前（C++）**：用于声明静态类成员，它属于类而不是对象，可以在类的所有对象之间共享。

2. **`const`**
   - **常量指针/引用**：用于定义常量，表示数据不能被修改。例如 `const int a = 10;`。
   - **函数参数（C++）**：在函数形参中使用 `const`，可以防止函数对传入的参数进行修改。
   - **类成员函数（C++）**：用于标记成员函数不会修改对象的状态，例如 `void func() const;`。

3. **`extern`**
   - 用于声明变量或函数是外部定义的，在其他文件中定义但可以在当前文件中使用。一般在多个文件中共享全局变量或函数时使用。

4. **`volatile`**
   - 告诉编译器该变量可能会被外部事件（如硬件或多线程）修改，防止编译器对它进行优化（如寄存器缓存）。常用于嵌入式编程中与硬件交互的变量。

这些关键字在控制程序的内存、作用域、以及编译时优化行为方面起着重要作用。
