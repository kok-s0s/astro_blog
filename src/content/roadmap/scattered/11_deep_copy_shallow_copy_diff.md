---
title: '深拷贝与浅拷贝的别'
---

深拷贝和浅拷贝是对象复制的两种不同方式。它们的主要区别在于复制的深度及其对原始对象中引用数据的处理方式。

### 浅拷贝（Shallow Copy）

浅拷贝创建一个新的对象，但这个对象内部的属性或成员是对原始对象属性或成员的引用。换句话说，浅拷贝只复制对象本身的结构，而不复制结构内部的引用对象。

**特点**:
- 复制的是对象的引用，而不是对象本身。
- 修改浅拷贝对象中的引用属性也会影响原始对象中的引用属性。

**示例**（以 Python 为例）:

```python
import copy

original_list = [1, 2, [3, 4]]
shallow_copied_list = copy.copy(original_list)

# 修改浅拷贝中的子列表
shallow_copied_list[2][0] = 'changed'

print(original_list)         # 输出: [1, 2, ['changed', 4]]
print(shallow_copied_list)   # 输出: [1, 2, ['changed', 4]]
```

在这个示例中，浅拷贝复制了 `original_list` 的引用，而子列表 `[3, 4]` 是被共享的，因此修改子列表会影响到原始列表。

### 深拷贝（Deep Copy）

深拷贝创建一个新的对象，并且递归地复制原始对象中所有的属性和子属性，直到所有层级都被复制。这意味着深拷贝会创建一个完全独立于原始对象的新对象。

**特点**:
- 复制对象及其所有子对象，确保所有层级都被复制。
- 修改深拷贝对象中的属性不会影响原始对象。

**示例**（以 Python 为例）:

```python
import copy

original_list = [1, 2, [3, 4]]
deep_copied_list = copy.deepcopy(original_list)

# 修改深拷贝中的子列表
deep_copied_list[2][0] = 'changed'

print(original_list)         # 输出: [1, 2, [3, 4]]
print(deep_copied_list)      # 输出: [1, 2, ['changed', 4]]
```

在这个示例中，深拷贝创建了 `original_list` 的一个完全独立的副本，包括其中的子列表。修改深拷贝中的子列表不会影响原始列表。

### 总结

- **浅拷贝**：只复制对象的引用，内部的子对象仍然是共享的。
- **深拷贝**：复制对象及其所有嵌套的子对象，完全独立于原始对象。

选择使用浅拷贝还是深拷贝取决于具体的需求和应用场景。
