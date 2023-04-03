---
layout: ../../layouts/MarkdownPostLayout.astro
title: 'LeetCode'
pubDate: 2023-03-12
description: '记录下'
author: 'kok-s0s'
image:
  url: '/images/leetcode.png'
  alt: 'LeetCode'
tags: ['C++', 'Algorithm', 'Data Structure']
---

## [合并相似的物品](https://leetcode.cn/problems/merge-similar-items/)

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

## [矩阵中的局部最大值](https://leetcode.cn/problems/largest-local-values-in-a-matrix/)

根据题目意思，先申请 `(n-2) x (n - 2)` 的二维数组来存储结果。

然后做遍历来模拟找到最大值的过程，并将最大值存储进 `result` 数组中。

<details><summary>我滴代码</summary>

```cpp
class Solution {
public:
    vector<vector<int>> largestLocal(vector<vector<int>>& grid) {
        int n = grid.size();
        vector<vector<int>> result(n - 2, vector<int>(n - 2, 0));
        for (int i = 0; i < n - 2; ++i) {
            for (int j = 0; j < n -2; ++j) {
                for (int x = i; x < i + 3; ++x) {
                    for (int y = j; y < j + 3; y++) {
                        result[i][j] = max(result[i][j], grid[x][y]);
                    }
                }
            }
        }
        return result;
    }
};
```

</details>

## [二进制数转字符串](https://leetcode.cn/problems/bianry-number-to-string-lcci/)

| 二进制 | 十进制 |
| :----: | :----: |
|  0.1   |  0.5   |
|  0.11  |  0.75  |
| 0.101  | 0.625  |
| 0.111  | 0.875  |

与十进制转化为二进制时所用的「 除 2 求余数 」不同。

这里的规律为「 乘 2 减整 」。

例如 0.625，用一个名为 result 的字符串存储结果，其初始值为 `0.`。

1. 0.625 乘 2 为 1.25，只保留小数，即为 0.25，将整数 1 拼接到 result 后面；
2. 0.25 乘 2 为 0.5，只保留小数，即为 0.5，将整数 0 拼接到 result 后面；
3. 0.5 乘 2 为 1.0，只保留小数，即为 0.0，将整数 1 拼接到 result 后面；

结果为 0.101。

所有的数均可用上述例子的模式来处理，结束条件为字符串长度不超过 32 或者 num 等于 0。

<details><summary>我滴代码</summary>

```cpp
class Solution {
public:
    string printBin(double num) {
        string result = "0.";
        while (result.size() <= 32 && num != 0) {
            num *= 2;
            int digit = num;
            result.push_back(digit + '0');
            num -= digit;
        }
        return result.size() <= 32 ? result : "ERROR";
    }
};
```

</details>

<details><summary>ta人的推导，很帅，值得学习。</summary>

> [真棒的解法](https://leetcode.cn/problems/bianry-number-to-string-lcci/solution/zheng-ming-zhi-duo-xun-huan-6-ci-pythonj-b6sj/)

```cpp
class Solution {
public:
    string printBin(double num) {
        string bin = "0.";
        for (int i = 0; i < 6; ++i) { // 至多循环 6 次
            num *= 2;
            if (num < 1)
                bin += '0';
            else {
                bin += '1';
                if (--num == 0)
                    return bin;
            }
        }
        return "ERROR";
    }
};
```

</details>

## [保证文件名唯一](https://leetcode.cn/problems/making-file-names-unique/)

**情境题**

抽象下

丢过来一堆东西，里面有的可能相同，如果存在相同，就给它个后缀（从 1 开始），1 不行，就看 2, 2 不行，继续看 3，直到这堆东西没一个相同。

这种有相同，又要让它不同，可以想到 `map` 这种映射结构，用 `map` 来存储。

定义一个 `unordered_map<string, int> index` 来维护这堆东西。

`vector<string>` 存储结果

遍历 `names`，如果 `index` 中不存在这个东西，就直接存储进 `res` 中，同时 `index` 中存储这个东西，值为 1。

如果 `index` 中存在这个东西，就要给它个后缀，从 1 开始，直到这个东西加上后缀不存在于 `index` 中，就可以了。

> 官解的代码，看了一眼，很 OK 了。我的也就是习惯用 `std::map` 了。官方解用的是 `unordered_map`，是用哈希表实现的，对于查找问题来说，`unordered_map` 会更加高效一些。 `std::map` 是用红黑树实现的，有序但是空间占用率较高，因为每一个节点都需要额外保存父节点，孩子节点以及红/黑性质，使得每一个节点都占用大量的空间。

<details><summary>直接上官方解</summary>

```cpp
class Solution {
public:
    string addSuffix(string name, int k) {
        return name + "(" + to_string(k) + ")";
    }

    vector<string> getFolderNames(vector<string>& names) {
        unordered_map<string, int> index;
        vector<string> res;
        for (const auto &name : names) {
            if (!index.count(name)) {
                res.push_back(name);
                index[name] = 1;
            } else {
                int k = index[name];
                while (index.count(addSuffix(name, k))) {
                    k++;
                }
                res.push_back(addSuffix(name, k));
                index[name] = k + 1;
                index[addSuffix(name, k)] = 1;
            }
        }
        return res;
    }
};
```

</details>

## [花括号展开 II](https://leetcode.cn/problems/brace-expansion-ii/)

这题很帅，官方解值得[一看](https://leetcode.cn/problems/brace-expansion-ii/solution/hua-gua-hao-zhan-kai-ii-by-leetcode-solu-1s1y/)

<details><summary>官方解</summary>

```cpp
class Solution {
    string expression;
    int idx;

    // item -> letter | { expr }
    set<string> item() {
        set<string> ret;
        if (expression[idx] == '{') {
            idx++;
            ret = expr();
        } else {
            ret = {string(1, expression[idx])};
        }
        idx++;
        return move(ret);
    }

    // term -> item | item term
    set<string> term() {
        // 初始化空集合，与之后的求解结果求笛卡尔积
        set<string> ret = {""};
        // item 的开头是 { 或小写字母，只有符合时才继续匹配
        while (idx < expression.size() && (expression[idx] == '{' || isalpha(expression[idx]))) {
            auto sub = item();
            set<string> tmp;
            for (auto &left : ret) {
                for (auto &right : sub) {
                    tmp.insert(left + right);
                }
            }
            ret = move(tmp);
        }
        return move(ret);
    }

    // expr -> term | term, expr
    set<string> expr() {
        set<string> ret;
        while (true) {
            // 与 term() 求解结果求并集
            ret.merge(term());
            // 如果匹配到逗号则继续，否则结束匹配
            if (idx < expression.size() && expression[idx] == ',') {
                idx++;
                continue;
            } else {
                break;
            }
        }
        return move(ret);
    }

public:
    vector<string> braceExpansionII(string expression) {
        this->expression = expression;
        this->idx = 0;
        auto ret = expr();
        return {ret.begin(), ret.end()};
    }
};
```

</details>

## [礼物的最大价值](https://leetcode.cn/problems/li-wu-de-zui-da-jie-zhi-lcof/)

因限制条件实在给的太多了，而且给的条件很适合用 DP 动态规划解决。

<details><summary>我滴代码</summary>

```cpp
class Solution {
public:
    int maxValue(vector<vector<int>>& grid) {
        int m = grid.size(), n = grid[0].size();
        vector<vector<int>> f(m, vector<int>(n));
        for (int i = 0; i < m; ++i) {
            for (int j = 0; j < n; ++j) {
                if (i > 0) {
                    f[i][j] = max(f[i][j], f[i - 1][j]);
                }
                if (j > 0) {
                    f[i][j] = max(f[i][j], f[i][j - 1]);
                }
                f[i][j] += grid[i][j];
            }
        }
        return f[m - 1][n - 1];
    }
};
```

</details>

## [得到 K 个黑块的最少涂色次数](https://leetcode.cn/problems/minimum-recolors-to-get-k-consecutive-black-blocks/)

这种读题目意思能感觉是要在某一范围寻求一个答案，那就可以考虑下滑动窗口了。

我这里是使用一个 `queue` 来维护一个窗口，窗口的大小为 `k`，窗口中的 `W` 的个数为 `cnt`。

先将队列塞满指定元素，同时记录此时滑动窗口中 `W` 的个数，即 `cnt`。

然后开始滑动，每次滑动都要判断一下，如果当前元素是 `W`，那么 `cnt++`，如果滑出的元素是 `W`，那么 `cnt--`。

然后每次滑动都要更新一下结果，即 `result = min(result, cnt)`。

最后返回结果即可。

<details><summary>我滴代码</summary>

```cpp
class Solution {
public:
    int minimumRecolors(string blocks, int k) {
        queue<char> q;
        int result = 0;
        int cnt = 0;
        for (auto& b : blocks) {
            q.push(b);
            if (q.size() <= k && b == 'W') {
                result++;
                cnt++;
            }
            if (q.size() > k) {
                if (b == 'W') {
                    cnt++;
                }
                if (q.front() == 'W') {
                    cnt--;
                }
                result = min(result, cnt);
                q.pop();
            }
        }
        return result;
    }
};
```

</details>

官方解思路一样的，只是用的是双指针。

<details><summary>官方解</summary>

```cpp
class Solution {
public:
    int minimumRecolors(string blocks, int k) {
        int l = 0, r = 0, cnt = 0;
        while (r < k) {
            cnt += blocks[r] == 'W' ? 1 : 0;
            r++;
        }
        int res = cnt;
        while (r < blocks.size()) {
            cnt += blocks[r] == 'W' ? 1 : 0;
            cnt -= blocks[l] == 'W' ? 1 : 0;
            res = min(res, cnt);
            l++;
            r++;
        }
        return res;
    }
};
```

</details>

## [使数组和能被 P 整除](https://leetcode.cn/problems/make-sum-divisible-by-p/)

先计算出前缀和，这里前缀和保存的是余数 `remainder`，再将问题转化为两数之和即可，用哈希解决。

<details><summary>我滴代码</summary>

```cpp
class Solution {
public:
    int minSubarray(vector<int>& nums, int p) {
        int remainder = 0;
        for (auto& num : nums) {
            remainder = (remainder + num) % p;
        }
        if (remainder == 0) {
            return 0;
        }
        unordered_map<int, int> pos;
        pos[0] = -1;
        int prefixSum = 0, result = nums.size(), findSum;
        for (int i = 0; i < nums.size(); ++i) {
            prefixSum = (prefixSum + nums[i]) % p;
            findSum = (prefixSum - remainder + p) % p;
            pos[prefixSum] = i;
            result = min(result, pos.find(findSum) == pos.end() ? INT_MAX : i - pos[findSum]);
        }
        return result == nums.size() ? -1 : result;
    }
};
```

</details>

官方解法思路一致。

<details><summary>官方解</summary>

```cpp
class Solution {
public:
    int minSubarray(vector<int>& nums, int p) {
        int x = 0;
        for (auto num : nums) {
            x = (x + num) % p;
        }
        if (x == 0) {
            return 0;
        }
        unordered_map<int, int> index;
        int y = 0, res = nums.size();
        for (int i = 0; i < nums.size(); i++) {
            index[y] = i; // f[i] mod p = y，因此哈希表记录 y 对应的下标为 i
            y = (y + nums[i]) % p;
            if (index.count((y - x + p) % p) > 0) {
                res = min(res, i - index[(y - x + p) % p] + 1);
            }
        }
        return res == nums.size() ? -1 : res;
    }
};
```

</details>

## [字母与数字](https://leetcode.cn/problems/find-longest-subarray-lcci/)

[转化 + 前缀和](https://leetcode.cn/problems/find-longest-subarray-lcci/solution/zi-mu-yu-shu-zi-by-leetcode-solution-ezf4/)

<details><summary>官方解</summary>

```cpp
class Solution {
public:
    vector<string> findLongestSubarray(vector<string>& array) {
        unordered_map<int, int> indices;
        indices[0] = -1;
        int sum = 0;
        int maxLength = 0;
        int startIndex = -1;
        int n = array.size();
        for (int i = 0; i < n; i++) {
            if (isalpha(array[i][0])) {
                sum++;
            } else {
                sum--;
            }
            if (indices.count(sum)) {
                int firstIndex = indices[sum];
                if (i - firstIndex > maxLength) {
                    maxLength = i - firstIndex;
                    startIndex = firstIndex + 1;
                }
            } else {
                indices[sum] = i;
            }
        }
        if (maxLength == 0) {
            return {};
        }
        return vector<string>(array.begin() + startIndex, array.begin() + startIndex + maxLength);
    }
};
```

</details>
