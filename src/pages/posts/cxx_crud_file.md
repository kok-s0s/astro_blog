---
layout: ../../layouts/Post.astro
title: '记一次「 包轮子 」的经历'
pubDate: 2023-03-14
updatedDate: 2023-03-17
description: '重新拾起 C++ 开发已经有 8 个月了，自己主导做的一件事情。三个看法，一是记住 C++ 能不造轮子，就别造轮子了；二是能做单元测试的东西，就要做单元测试；三是好好利用 ChatGPT 之类的东西来优化代码 -/- doge'
author: 'kok-s0s'
image:
  url: '/images/cxx_crud_file/rocket.jpg'
  alt: 'Rocket'
tags: ['C++', 'Test', 'Cross-platform']
---

> [cxx_crud_file](https://github.com/kok-s0s/cxx_crud_file)

## 起因

被分配了一个任务，用现今的 C++ 标准改写一个原先用 Qt 编写的代码。就是要去除掉那些以 Q 开头的代码（`QString`、`QVariant`、`QSetting` 和 `QFile` 等等）。

重新用 C++ 标准改写的这份代码，扩展性就会更强，当然 Qt 的生态也不错，不过是业务需求如此罢了，不展开具体内容。

## 开始「 模仿 」

这份 Qt 编写的代码中有自己的文件读写工具类 `FileTools`（是根据实际业务产生的，即各种规定好的读写要求，怎么读取，怎么写入数据等等）。

> 用 Qt 构建的 `FileTools` 类， 其代码长度大概为*两千多行左右*

只不过这个类是基于 Qt 整个语言生态构造的，现在打算要去除 Qt 罢了。

我一开始，就是简单仿造这个 `FileTools` 类，函数名大致不变，函数内部的处理逻辑也大致不变，入参和返回值的类型由 Qt 的数据结构改成 C++ 标准下的，例如 `QString` 用 `std::string` 代替。

但其实，在修改这个 `FileTools` 类时，发现这其实算不上是个类，只是把功能函数全当作成员函数罢了，要使用这些函数时，就用这个类创建一个对象，通过这个对象来调用所需的功能函数。

大概是刚从前端转到做 C++ 的开发，我一开始也觉得没什么问题，就是 `函数式编程` 嘛。

但是 C++ 的一大精髓就是 OOP（面向对象开发），这个类弄得更像面向过程的。

且这个类里有蛮多方法其实可以继承复用的，阅读其中的代码，有点乱。

越开发，越能闻到代码传出的那股 「 坏味道 」。

该换思路来做。

## 开始「 包轮子 」

> 包包包，有现成的，优秀的，经过试验和测试的功能函数，我是**绝对不会**重复造轮子的，我是个**很懒**的开发者 /doge。

### 测试驱动开发

> Test-Driven Development (TDD)
>
> [VSCode | CMake | C++ | TDD](https://vscode-cmake-cxx-tdd.netlify.app)

整个项目使用 GoogleTest 来做单元测试，开发过程中，先编写测试用例，然后再编写代码，最后再运行测试用例，看看是否通过，不通过，则修改代码，直到通过为止。

> 记住，[测试代码](https://github.com/kok-s0s/cxx_crud_file/blob/main/main.cpp)应当与你功能代码的「 体量 」差不多大。

### UFile

重新拾起 C++ 开发，看了蛮多 C++ 的书籍（《clean C++》、《Effective C++》等），以及看 `cppreference` [官网](https://en.cppreference.com/w/)内容，感觉要做的文件读写工作。一些功能函数可以基于 C++ 标准提供的 `<filesystem>` 文件系统库来做。

<details><summary>UFile 的全部代码</summary>

```cpp
#ifndef UFILE_HPP_
#define UFILE_HPP_

#include <iostream>
#include <string>

#include "Tools.hpp"

#if defined(__clang__) || defined(__GNUC__)
#define CPP_STANDARD __cplusplus
#elif defined(_MSC_VER)
#define CPP_STANDARD _MSVC_LANG
#endif

#if CPP_STANDARD >= 201103L && CPP_STANDARD < 201703L
#include <cstring>
#include <experimental/filesystem>
namespace fs = std::experimental::filesystem;
#endif
#if CPP_STANDARD >= 201703L
#include <filesystem>
namespace fs = std::filesystem;
#endif

class UFile {
 private:
  fs::path _p;

 public:
  explicit UFile(const std::string &path) : _p(path) {}
  explicit UFile(const fs::path &path) : _p(path) {}

  std::string path() { return _p.string(); }
};

#endif  // UFILE_HPP_
```

</details>

将 `<filesystem>` 的 `path` 类作为私有变量使用；

因为要适配 Linux 和 Windows 平台以及不同的 C++ 标准，加个宏定义来做判断。

这样就是一个基类，接下来对各种类型处理的文件类都继承该基类。

### TxtFile

<details><summary>TxtFile 的全部代码</summary>

```cpp
#ifndef TXTFILE_HPP_
#define TXTFILE_HPP_

#include <fstream>

#include "UFile.hpp"

class TxtFile : public UFile {
 private:
  std::string _data;

 public:
  explicit TxtFile(const std::string& path) : UFile(path) {}
  explicit TxtFile(const fs::path& path) : UFile(path) {}

  std::string getData() const { return _data; }

  void setData(const std::string& data) { _data = data; }

  bool readData() {
    std::ifstream file(path());
    if (!file) {
      return false;
    }

    _data.assign((std::istreambuf_iterator<char>(file)),
                 std::istreambuf_iterator<char>());

    file.close();
    return true;
  }

  bool writeData() {
    std::ofstream file(path());
    if (!file) {
      return false;
    }

    file << _data;
    return true;
  }

  bool appendWriteData(const std::string& data) {
    std::ofstream file(path(), std::ios_base::app);
    if (!file) {
      return false;
    }

    file << data;
    return true;
  }
};

#endif  // TXTFILE_HPP_
```

</details>

文本文件主要是对字符串的处理，根据需求考虑读取，写入和追加写入这三个功能。

就是调用 `<fstream>` 这个库中的 `std::ifstream` 和 `std::ofstream` 类对文本文件做处理，有个数据流的概念，那三个功能就是对数据流做些处理即可。

### IniFile

<details><summary>IniFile 的全部代码</summary>

```cpp
#ifndef INIFILE_HPP_
#define INIFILE_HPP_

#include "UFile.hpp"
#include "ini/SimpleIni.h"

class IniFile : public UFile {
 private:
  CSimpleIniA _ini;

 public:
  explicit IniFile(const std::string &path) : UFile(path) {}
  explicit IniFile(const fs::path &path) : UFile(path) {}
  ~IniFile() {}

  bool setup() {
    _ini.SetUnicode();
    SI_Error rc = _ini.LoadFile(path().c_str());
    if (rc < 0) return false;
    return true;
  }

  void getFromIni(const std::string &section, const std::string &key,
                  std::string &param, const char *defaultVal) {
    param = _ini.GetValue(section.c_str(), key.c_str(), defaultVal);
  }

  template <typename T>
  void getFromIni(const std::string &section, const std::string &key, T &param,
                  const T defaultVal) {
    std::string paramType = typeid(T).name();
    std::string tempParam;
    tempParam = _ini.GetValue(section.c_str(), key.c_str(),
                              std::to_string(defaultVal).c_str());

    if (paramType[0] == 'i')
      param = static_cast<T>(stoi(tempParam));
    else if (paramType[0] == 'f')
      param = static_cast<T>(stof(tempParam));
    else if (paramType[0] == 'd')
      param = static_cast<T>(stod(tempParam));
    else if (paramType[0] == 'b')
      if (tempParam == "false" || tempParam == "0")
        param = false;
      else if (tempParam == "true" || tempParam == "1")
        param = true;
  }

  template <typename T>
  void getFromIni(const std::string &section, const std::string &key, T *param,
                  const T *defaultVal, const int &size) {
    int index = 0;

    std::string paramType = typeid(T).name();

    if (_ini.GetValue(section.c_str(), key.c_str()) == nullptr)
      while (index <= size - 1) {
        param[index] = defaultVal[index];
        index++;
      }
    else {
      std::string tempParamArrayStr =
          _ini.GetValue(section.c_str(), key.c_str());
      std::vector<std::string> tempParamArray =
          split(tempParamArrayStr, " ,\t\n");

      if (paramType[0] == 'i')
        for (int i = 0; i < tempParamArray.size(); ++i)
          param[index++] = static_cast<T>(stoi(tempParamArray[i]));
      else if (paramType[0] == 'f')
        for (int i = 0; i < tempParamArray.size(); ++i)
          param[index++] = static_cast<T>(stof(tempParamArray[i]));
      else if (paramType[0] == 'd')
        for (int i = 0; i < tempParamArray.size(); ++i)
          param[index++] = static_cast<T>(stod(tempParamArray[i]));

      while (index <= size - 1) {
        param[index] = defaultVal[index];
        index++;
      }
    }
  }

  void setToIni(const std::string &section, const std::string &key,
                const char *fromValue) {
    _ini.SetValue(section.c_str(), key.c_str(), fromValue);
  }

  template <typename T>
  void setToIni(const std::string &section, const std::string &key,
                const T fromValue) {
    std::string valueType = typeid(T).name();
    std::string toValue;

    if (valueType[0] == 'i')
      toValue = std::to_string(fromValue);
    else if (valueType[0] == 'f')
      toValue = std::to_string(fromValue);
    else if (valueType[0] == 'd')
      toValue = std::to_string(fromValue);
    else if (valueType[0] == 'b')
      if ((bool)fromValue == false)
        toValue = "false";
      else if ((bool)fromValue == true)
        toValue = "true";

    _ini.SetValue(section.c_str(), key.c_str(), toValue.c_str());
  }

  template <typename T>
  void setToIni(const std::string &section, const std::string &key,
                const T *fromValueArr, const int &size) {
    if (size <= 0) return;

    std::string valueType = typeid(T).name();
    std::string toValueArr;

    if (valueType[0] == 'i')
      for (int i = 0; i < size; ++i) {
        toValueArr += std::to_string(fromValueArr[i]);
        if (i != size - 1) toValueArr += ", ";
      }
    else if (valueType[0] == 'f')
      for (int i = 0; i < size; ++i) {
        toValueArr += std::to_string(fromValueArr[i]);
        if (i != size - 1) toValueArr += ", ";
      }
    else if (valueType[0] == 'd')
      for (int i = 0; i < size; ++i) {
        toValueArr += std::to_string(fromValueArr[i]);
        if (i != size - 1) toValueArr += ", ";
      }

    _ini.SetValue(section.c_str(), key.c_str(), toValueArr.c_str());
  }

  void save() {
    std::string output;
    _ini.Save(output);
    _ini.SaveFile(path().c_str());
  }
};

#endif  // INIFILE_HPP_
```

</details>

> `*.ini` 文件是 `Initialization file` 的缩写，即为初始化文件，是 Windows 系统配置文件所采用的存储格式，统管 Windows 的各项配置。

用的一开源库 [simpleini](https://github.com/brofield/simpleini)，再根据实际业务需求封了一层功能函数，能对 ini 文件做读取 `getFromIni` 和写入 `setToIni` 操作，用函数重载即可对不同的参数类型做处理。

### JsonFile

<details><summary>JsonFile 的全部代码</summary>

```cpp
#ifndef JSONFILE_HPP_
#define JSONFILE_HPP_

#include "UFile.hpp"
#include "json/json.hpp"

using json = nlohmann::json;

class JsonFile : public UFile {
 public:
  json _data;

  explicit JsonFile(const std::string &path) : UFile(path) {}
  explicit JsonFile(const fs::path &path) : UFile(path) {}
  ~JsonFile() {}

  bool setup() {
    std::ifstream file(path());
    if (!file) {
      return false;
    }

    file >> _data;

    file.close();
    return true;
  }

  void getFromJson(const std::string &key, std::string &param,
                   const std::string &defaultVal) {
    if (key == "") {
      param = defaultVal;
      return;
    }

    json temp = _data;
    std::vector<std::string> keyArr = split(key, ".");

    for (int i = 0; i < keyArr.size() - 1; ++i)
      if (temp.contains(keyArr[i])) temp = temp.at(keyArr[i]);

    if (temp.contains(keyArr[keyArr.size() - 1]))
      param = temp.at(keyArr[keyArr.size() - 1]);
    else
      param = defaultVal;
  }

  template <typename T>
  void getFromJson(const std::string &key, T &param, T defaultVal) {
    if (key == "") {
      param = defaultVal;
      return;
    }

    json temp = _data;
    std::vector<std::string> keyArr = split(key, ".");

    for (int i = 0; i < keyArr.size() - 1; ++i)
      if (temp.contains(keyArr[i])) temp = temp.at(keyArr[i]);

    if (temp.contains(keyArr[keyArr.size() - 1]))
      param = temp.at(keyArr[keyArr.size() - 1]);
    else
      param = defaultVal;
  }

  void getFromJson(const std::string &key, std::string *param,
                   const std::string *defaultVal, const int &size) {
    int index = 0;

    if (key == "") {
      for (int i = index; i < size; ++i) param[i] = defaultVal[i];
      return;
    }

    json temp = _data;
    std::vector<std::string> keyArr = split(key, ".");

    for (int i = 0; i < keyArr.size() - 1; ++i)
      if (temp.contains(keyArr[i])) temp = temp.at(keyArr[i]);

    if (temp.contains(keyArr[keyArr.size() - 1])) {
      const json thisKeyArrValue = temp.at(keyArr[keyArr.size() - 1]);

      for (int i = 0; i < thisKeyArrValue.size(); ++i)
        param[index++] = thisKeyArrValue[index];
    }

    if (index < size)
      for (int i = index; i < size; ++i) param[i] = defaultVal[i];
  }

  template <typename T>
  void getFromJson(const std::string &key, T *param, const T *defaultVal,
                   const int &size) {
    int index = 0;

    if (key == "") {
      for (int i = index; i < size; ++i) param[i] = defaultVal[i];
      return;
    }

    json temp = _data;
    std::vector<std::string> keyArr = split(key, ".");

    for (int i = 0; i < keyArr.size() - 1; ++i)
      if (temp.contains(keyArr[i])) temp = temp.at(keyArr[i]);

    if (temp.contains(keyArr[keyArr.size() - 1])) {
      const json thisKeyArrValue = temp.at(keyArr[keyArr.size() - 1]);

      for (int i = 0; i < thisKeyArrValue.size(); ++i)
        param[index++] = thisKeyArrValue[index];
    }

    if (index < size)
      for (int i = index; i < size; ++i) param[i] = defaultVal[i];
  }

  void save() {
    std::ofstream file(path());
    file << _data;
    file.flush();
  }
};

#endif  // JSONFILE_HPP_
```

</details>

也用的一开源库 [nlohmann/json](https://github.com/nlohmann/json)，和 IniFile 一样做法啦。

### BmpFile

<details><summary>BmpFile 的全部代码</summary>

```cpp
#ifndef BMPFILE_HPP_
#define BMPFILE_HPP_

#include "UFile.hpp"
#include "bmp/BMP.h"

class BmpFile : public UFile {
 public:
  explicit BmpFile(const std::string& path) : UFile(path) {}
  explicit BmpFile(const fs::path& path) : UFile(path) {}
  ~BmpFile() {}
};

#endif  // BMPFILE_HPP_
```

</details>

呃，也用的[开源库](https://github.com/kok-s0s/cxx_crud_file/blob/main/bmp/BMP.h)，是公司的前辈 clone 的，我没找到来源，不过还是日常感谢无私的开源贡献者。

> 百度百科 - BMP 是英文 Bitmap（位图）的简写，它是 Windows 操作系统中的标准图像文件格式，能够被多种 Windows 应用程序所支持。随着 Windows 操作系统的流行与丰富的 Windows 应用程序的开发，BMP 位图格式理所当然地被广泛应用。这种格式的特点是包含的图像信息较丰富，几乎不进行压缩，但由此导致了它与生俱来的缺点--占用磁盘空间过大。所以，BMP 在单机上比较流行。

这个开源库的接口考虑的很全面了，处理目前的业务够用了，就没做二次封装，不包了，直接用，仅仅是继承于 `UFile`，便于做路径处理。

### BinFile

主要用于二进制文件的处理（读取、写入、追加），和 `TxtFile` 一样，使用的都是 `std::ifstream` 和 `std::ofstream`，打开选项多了个 `std::ios::binary`，用于指定以二进制方式打开文件，以及需要用到 `seekg` 来定位文件指针，计算出文件的长度。

<details><summary>BinFile 的全部代码</summary>

```cpp
#ifndef BINFILE_HPP_
#define BINFILE_HPP_

#include <fstream>
#include <vector>

#include "UFile.hpp"

class BinFile : public UFile {
 private:
  std::vector<uint8_t> _data;
  int _length = 0;

 public:
  explicit BinFile(const std::string &path) : UFile(path) {}
  explicit BinFile(const fs::path &path) : UFile(path) {}

  void setData(const std::vector<uint8_t> &data) { _data = data; }

  std::vector<uint8_t> getData() const { return _data; }

  void setLength(const int &length) { _length = length; }

  int getLength() const { return _length; }

  bool readData() {
    std::ifstream file(path(), std::ios::in | std::ios::binary);
    if (!file) {
      return false;
    }

    file.seekg(0, std::ios::end);
    _length = (int)file.tellg();
    file.seekg(0, std::ios::beg);

    _data.resize(_length);
    file.read((char *)_data.data(), _length);

    file.close();
    return true;
  }

  bool writeData() {
    std::ofstream file(path(), std::ios::out | std::ios::binary);
    if (!file) {
      return false;
    }

    file.write((const char *)_data.data(), _length);

    file.close();
    return true;
  }

  bool appendWriteData(std::vector<uint8_t> data) {
    std::ofstream file(path(),
                       std::ios::out | std::ios::binary | std::ios::app);
    if (!file) {
      return false;
    }

    _data.insert(_data.end(), data.begin(), data.end());
    _length = (int)_data.size();

    file.write((const char *)_data.data(), _length);

    file.close();
    return true;
  }
};

#endif  // BINFILE_HPP_
```

</details>

用来处理以下两种数据：

1. dat

`.dat` 是二进制文件；

2. img

处理图像文件其实也是对二进制的处理；

## 小造轮子

### UString

<details><summary>UString 的全部代码</summary>

```cpp
#ifndef USTRING_HPP_
#define USTRING_HPP_

#include <regex>
#include <string>
#include <vector>

class UString {
 private:
  std::string _content;

 public:
  UString() : _content("") {}
  explicit UString(const std::string &content) : _content(content) {}
  ~UString() {}

  UString arg(const std::string &substitution) {
    std::string upToDateContent = "";
    std::string suffix = "";

    std::regex percentSign("%([1-9]{1})");

    auto content_begin =
        std::sregex_iterator(_content.begin(), _content.end(), percentSign);
    auto content_end = std::sregex_iterator();

    for (std::sregex_iterator i = content_begin; i != content_end; ++i) {
      std::smatch match = *i;
      std::string match_str = match.str();

      int index = match_str[1] - '1';

      if (index == 0)
        upToDateContent += match.prefix().str() + substitution;
      else
        upToDateContent += match.prefix().str() + "%" + std::to_string(index);

      suffix = match.suffix();
    }

    upToDateContent += suffix;

    return UString(upToDateContent);
  }

  UString arg(const char *substitution) {
    return arg(std::string(substitution));
  }

  template <typename T>
  UString arg(T substitution) {
    return arg(std::to_string(substitution));
  }

  template <class T, class... Args>
  UString arg(T head, Args... rest) {
    UString result(_content);
    result = result.arg(head);
    result = result.arg(rest...);
    return result;
  }

  std::string to_string() { return _content; }

  std::wstring to_wstring() {
    std::wstring ws(_content.begin(), _content.end());
    return ws;
  }

  operator std::string() { return _content; }

  const char *c_str() { return _content.c_str(); }

  friend std::ostream &operator<<(std::ostream &os, const UString &uString) {
    os << uString._content;
    return os;
  }
};

#endif  // USTRING_HPP_
```

</details>

其实就是 QString 有一个 `arg` 的方法（用于字符串的构建）太好用了，软件组舍不得，想保留这个方法。

不过 C++ 标准的 `std::string` 没有类似的功能函数，那我就浅浅造个小轮子。

造起来不难，小小难点就三个：

1. 正则表达式库 `<regex>` 的使用，用于字符串的替换；

2. 链式调用，那就函数重载；

3. 传递多个参数，模板接受，然后递归即可，会自动识别对应的同名函数做处理；

要重载一下 `<<` 操作符，否则 `std::ostream` 输出流识别不了 `UString` 这个类。

还有一个类型重载，这样就能用 `=` 操作符，将右值（`Ustring` 对象）重载为 `std::string`。

## 借轮子

### Variant

用于替代 Qt 中的 `QVariant`，处理不同数据类型之间的转换。

前辈在 [CSDN](https://blog.csdn.net/WU9797/article/details/96768653) 上找的，软件组的大家在实际使用中，根据业务的需求，有做一些修改和 bug 修复。

这个代码太长了，不展示出来，[看这里](https://github.com/kok-s0s/cxx_crud_file/blob/main/Variant.hpp)
