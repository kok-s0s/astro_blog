---
title: '四种智能指针及底层实现'
---

C++ 中的智能指针主要用于自动管理内存，防止内存泄漏。这里分别介绍 `auto_ptr`、`unique_ptr`、`shared_ptr` 和 `weak_ptr` 的功能及其底层实现。

### 1. `auto_ptr` （已废弃）
- **功能**: `auto_ptr` 是 C++98 中最早引入的智能指针，用于自动管理动态内存。在作用域结束时自动释放所指向的对象。
- **特点**:
  - **单一所有权**：只有一个 `auto_ptr` 对象可以拥有某个资源。
  - **转移所有权**：当 `auto_ptr` 进行赋值操作或拷贝构造时，所有权会从一个 `auto_ptr` 转移到另一个。
  - **已废弃**：由于它的赋值和拷贝语义容易导致问题，在 C++11 中被 `unique_ptr` 取代。

- **底层实现**:
  - 拷贝构造或赋值会导致所有权的转移，原指针会被设为 `nullptr`。
```cpp
template<typename T>
class auto_ptr {
    T* ptr;
public:
    auto_ptr(T* p = nullptr) : ptr(p) {}
    auto_ptr(auto_ptr& a) : ptr(a.ptr) { a.ptr = nullptr; }
    auto_ptr& operator=(auto_ptr& a) {
        if (this != &a) {
            delete ptr;
            ptr = a.ptr;
            a.ptr = nullptr;
        }
        return *this;
    }
    ~auto_ptr() { delete ptr; }
};
```

### 2. `unique_ptr`
- **功能**: `unique_ptr` 是 C++11 引入的智能指针，提供了独占所有权，即在任何时间只能有一个 `unique_ptr` 拥有某个资源。
- **特点**:
  - **独占所有权**：不允许拷贝构造或赋值，但可以通过 `std::move` 进行所有权转移。
  - **轻量高效**：相比于 `shared_ptr`，`unique_ptr` 更轻量，因为它不涉及引用计数。

- **底层实现**:
  - 禁用拷贝构造和拷贝赋值，只允许移动语义。
```cpp
template<typename T>
class unique_ptr {
    T* ptr;
public:
    unique_ptr(T* p = nullptr) : ptr(p) {}
    unique_ptr(unique_ptr&& u) : ptr(u.ptr) { u.ptr = nullptr; }
    unique_ptr& operator=(unique_ptr&& u) {
        if (this != &u) {
            delete ptr;
            ptr = u.ptr;
            u.ptr = nullptr;
        }
        return *this;
    }
    ~unique_ptr() { delete ptr; }
};
```

### 3. `shared_ptr`
- **功能**: `shared_ptr` 是一种引用计数智能指针，可以实现多个智能指针共享同一块资源，只有最后一个 `shared_ptr` 被销毁时资源才会释放。
- **特点**:
  - **共享所有权**：多个 `shared_ptr` 可以共享一个对象，底层会维护一个引用计数来跟踪有多少个 `shared_ptr` 指向同一个对象。
  - **线程安全**：引用计数的增加和减少是线程安全的，但对象本身的访问则不保证线程安全。

- **底层实现**:
  - 使用一个独立的控制块来保存引用计数，当引用计数为 0 时销毁对象。
```cpp
template<typename T>
class shared_ptr {
    T* ptr;
    std::size_t* ref_count;
public:
    shared_ptr(T* p = nullptr) : ptr(p), ref_count(new std::size_t(1)) {}
    shared_ptr(const shared_ptr& s) : ptr(s.ptr), ref_count(s.ref_count) { ++(*ref_count); }
    shared_ptr& operator=(const shared_ptr& s) {
        if (this != &s) {
            release();
            ptr = s.ptr;
            ref_count = s.ref_count;
            ++(*ref_count);
        }
        return *this;
    }
    ~shared_ptr() { release(); }
private:
    void release() {
        if (--(*ref_count) == 0) {
            delete ptr;
            delete ref_count;
        }
    }
};
```

### 4. `weak_ptr`
- **功能**: `weak_ptr` 是与 `shared_ptr` 配合使用的智能指针，它提供了一种不参与引用计数的弱引用方式，不会影响对象的生命周期。
- **特点**:
  - **避免循环引用**：`weak_ptr` 主要用于解决 `shared_ptr` 循环引用问题，例如在双向关联的对象结构中，两个对象分别持有对方的 `shared_ptr`，会导致内存泄漏，而使用 `weak_ptr` 可以避免这种情况。
  - **弱引用**：通过 `weak_ptr.lock()` 可以获取一个有效的 `shared_ptr`，但对象可能已被销毁，因此需要判断。

- **底层实现**:
  - `weak_ptr` 不直接持有对象，只持有一个指向控制块的弱引用。
```cpp
template<typename T>
class weak_ptr {
    T* ptr;
    std::size_t* ref_count;
public:
    weak_ptr() : ptr(nullptr), ref_count(nullptr) {}
    weak_ptr(const shared_ptr<T>& s) : ptr(s.ptr), ref_count(s.ref_count) {}
    shared_ptr<T> lock() const {
        if (*ref_count > 0) {
            return shared_ptr<T>(*this);
        } else {
            return shared_ptr<T>();
        }
    }
};
```

### 总结
- `auto_ptr` 已被废弃，`unique_ptr` 是独占所有权智能指针，`shared_ptr` 是共享所有权的引用计数智能指针，`weak_ptr` 是为解决循环引用问题的弱引用智能指针。
