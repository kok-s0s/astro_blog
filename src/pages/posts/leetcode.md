---
layout: ../../layouts/MarkdownPostLayout.astro
title: '每日一道 LeetCode'
pubDate: 2023-02-28
description: '开始康复训练'
author: 'kok-s0s'
image:
  url: '/images/leetcode.jpeg'
  alt: 'Rocket'
tags: ['C++', 'Algorithm', 'Data Structure']
---

## 2023-02-28 [合并相似的物品](https://leetcode.cn/problems/merge-similar-items/)

合并的问题，可以考虑使用 `map` 这种映射结构来处理。

这里使用的是 C++ 标准中 `Containers library` 中 `std::map`。

1. 创建一个 `map`，名为 `table`；

2. 如果不存在该 `key` 值，则该 `table` 添加一组数据 `{key, value}`；

3. 如果存在该 `key` 值，则更新 `table` 中该 `key` 所指向的 `value`；

4. 对这两个数组重复 2, 3 步骤，直到两个二维数组的每一组元素都被遍历过即可；

<details><summary>我滴代码</summary>

```cpp
class Solution {
public:
    vector<vector<int>> mergeSimilarItems(vector<vector<int>>& items1, vector<vector<int>>& items2) {
        map<int, int> table;

        for (auto e : items1) {
            table[e[0]] = e[1];
        }

        for (auto e : items2) {
            if (table.find(e[0]) != table.end()) {
                table[e[0]] = table.at(e[0]) + e[1];
            } else {
                table[e[0]] = e[1];
            }
        }

        vector<vector<int>> result;

        for (auto m : table) {
            cout << m.first << " " << m.second << endl;
            vector<int> temp;
            temp.push_back(m.first);
            temp.push_back(m.second);
            result.push_back(temp);
        }

        return result;
    }
};
```

</details>

这里用 `auto` 搭配 `for` 循环来取出 `map` 结构中的 `key` 和 `value`，然后再调用 `vector` 的 `push_back` 方法来存储，这个转化方式没试过，值的记录。

官方解 `auto` 全加上了 `&`，即为引用，能避免不必要的拷贝，Good。

<details><summary>官方解</summary>

```cpp
class Solution {
public:
    vector<vector<int>> mergeSimilarItems(vector<vector<int>>& items1, vector<vector<int>>& items2) {
        map<int, int> mp;
        for (auto &v : items1) {
            mp[v[0]] += v[1];
        }
        for (auto &v : items2) {
            mp[v[0]] += v[1];
        }

        vector<vector<int>> res;
        for (auto &[k, v] : mp) {
            res.push_back({k, v});
        }
        return res;
    }
};
```

</details>
