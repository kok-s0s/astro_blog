---
layout: ../../layouts/MarkdownPostLayout.astro
title: '记一次「 包轮子 」的经历'
pubDate: 2023-03-02
description: '重新拾起 C++ 开发已经有 8 个月了，自己主导做的一件事情。两个感受，一是记住 C++ 能不造轮子，就别造轮子了，二是能做单元测试的东西，就要做单元测试。'
author: 'kok-s0s'
image:
  url: '/images/rocket.jpg'
  alt: 'Rocket'
tags: ['C++', 'Test', 'Cross-platform']
---

> [cxx_crud_file](https://github.com/kok-s0s/cxx_crud_file)

## 起因

被分配一个任务，用现今的 C++ 标准改写一个原先用 Qt 编写的代码。就是要去除掉那些 Q 开头的代码（`QString`、`QVariant`、`QSetting` 和 `QFile` 等等）。

重新用 C++ 标准改写的这份代码，扩展性就会更强，当然 Qt 的生态也不错，不过业务需求如此罢了，不展开具体内容。

## 开始「 模仿 」

这份 Qt 编写的代码中有自己的文件读写工具类 `FileTools`（是根据实际业务产生的，即各种规定好的读写要求，怎么读取，怎么写入数据等等）。

> 用 Qt 构建的 `FileTools` 类， 其代码长度大概为**两千行多左右**

只不过这个类是基于 Qt 整个语言生态构造的，现在打算要去除 Qt 罢了。

我一开始，就是简单仿造这个 `FileTools` 类，函数名大致不变，函数内部的处理逻辑也大致不变，入参和返回值的类型由 Qt 的数据结构改成 C++ 标准下的，例如 `QString` 用 `std::string` 代替。

但其实，在修改这个 `FileTools` 类时，发现这其实算不上是个类，只是把功能函数全当作成员函数罢了，要使用这些函数时，就用这个类创建一个对象，通过这个对象来调用所需的功能函数。

大概是刚从前端转到做 C++ 的开发，我一开始也觉得没什么问题，就是 `函数式编程` 嘛。

但是 C++ 的一大精髓就是 OOP（面向对象开发），这个类弄得更像面向过程的。

且这个类里有蛮多方法其实可以继承复用的，阅读其中的代码，有点乱。

我越开发，越能闻到那股代码的 「 坏味道 」。

该换思路来做。

## 开始「 包轮子 」

> 包包包，有现成的，优秀的，经过试验和测试的功能函数，我是绝对不会重复造轮子的，我是个**很懒**的开发者 /doge。

### 测试驱动开发

> Test-Driven Development (TDD)
>
> [VSCode | CMake | C++ | TDD](https://vscode-cmake-cxx-tdd.netlify.app)

整个项目使用 GoogleTest 来做单元测试，开发过程中，先编写测试用例，然后再编写代码，最后再运行测试用例，看看是否通过，不通过，则修改代码，直到通过为止。

> 记住，测试代码应当与你功能代码的「 体量 」差不多大。

<details><summary>所有测试代码</summary>

```cpp
#include <gtest/gtest.h>

#include <fstream>
#include <iostream>
#include <string>
#include <vector>

#include "BmpFile.hpp"
#include "DatFile.hpp"
#include "ImgFile.hpp"
#include "IniFile.hpp"
#include "JsonFile.hpp"
#include "TxtFile.hpp"
#include "UString.hpp"
#include "Variant.hpp"

using std::cout;
using std::endl;
using std::fstream;
using std::ifstream;
using std::ios;
using std::ofstream;
using std::string;
using std::to_string;
using std::vector;

#pragma region TxtFile

TEST(txt, read_data) {
  TxtFile test_01(fs::current_path() / "test_files/test_01.txt");

  EXPECT_TRUE(test_01.readData());
  EXPECT_EQ(test_01.getData(), "name\ni like code.\n");
}

TEST(txt, write_data) {
  TxtFile test_02(fs::current_path() / "test_files/test_02.txt");

  test_02.setData("hei\nare you ok?\n");

  EXPECT_TRUE(test_02.writeData());
  EXPECT_TRUE(test_02.readData());
  EXPECT_EQ(test_02.getData(), "hei\nare you ok?\n");
}

TEST(txt, append_write_data) {
  TxtFile test_03(fs::current_path() / "test_files/test_03.txt");

  test_03.setData("hello!\n");

  EXPECT_TRUE(test_03.writeData());
  EXPECT_TRUE(test_03.appendWriteData("hello!\n"));
  EXPECT_TRUE(test_03.readData());
  EXPECT_EQ(test_03.getData(), "hello!\nhello!\n");
}

#pragma endregion

#pragma region IniFile

TEST(ini, ini_setup) {
  IniFile test_01(fs::current_path() / "test_files/test_01.ini");

  EXPECT_TRUE(test_01.iniSetup());
}

TEST(ini, get_string) {
  IniFile test_01(fs::current_path() / "test_files/test_01.ini");

  EXPECT_TRUE(test_01.iniSetup());

  string value_01;
  string value_02;
  string value_03;

  test_01.getFromIni("string", "str1", value_01, "qi");
  test_01.getFromIni("string", "str2", value_02, "qi");
  test_01.getFromIni("string", "str3", value_03, "qi");

  EXPECT_EQ(value_01, "name");
  EXPECT_EQ(value_02, "hello");
  EXPECT_EQ(value_03, "qi");
}

TEST(ini, get_int) {
  IniFile test_01(fs::current_path() / "test_files/test_01.ini");

  EXPECT_TRUE(test_01.iniSetup());

  int value_01;
  int value_02;
  int value_03;

  test_01.getFromIni("int", "int1", value_01, 19);
  test_01.getFromIni("int", "int2", value_02, 19);
  test_01.getFromIni("int", "int3", value_03, 19);

  EXPECT_EQ(value_01, 11);
  EXPECT_EQ(value_02, 8);
  EXPECT_EQ(value_03, 19);
}

TEST(ini, get_float) {
  IniFile test_01(fs::current_path() / "test_files/test_01.ini");

  EXPECT_TRUE(test_01.iniSetup());

  float value_01;
  float value_02;
  float value_03;

  test_01.getFromIni("float", "float1", value_01, 22.09f);
  test_01.getFromIni("float", "float2", value_02, 22.09f);
  test_01.getFromIni("float", "float3", value_03, 22.09f);

  EXPECT_FLOAT_EQ(value_01, 33.33f);
  EXPECT_FLOAT_EQ(value_02, 22.22f);
  EXPECT_FLOAT_EQ(value_03, 22.09f);
}

TEST(ini, get_double) {
  IniFile test_01(fs::current_path() / "test_files/test_01.ini");

  EXPECT_TRUE(test_01.iniSetup());

  double value_01;
  double value_02;
  double value_03;

  test_01.getFromIni("double", "double1", value_01, 19.09);
  test_01.getFromIni("double", "double2", value_02, 19.09);
  test_01.getFromIni("double", "double3", value_03, 19.09);

  EXPECT_DOUBLE_EQ(value_01, 3.14);
  EXPECT_DOUBLE_EQ(value_02, 1.01);
  EXPECT_DOUBLE_EQ(value_03, 19.09);
}

TEST(ini, get_bool) {
  IniFile test_01(fs::current_path() / "test_files/test_01.ini");

  EXPECT_TRUE(test_01.iniSetup());

  bool value_01;
  bool value_02;
  bool value_03;

  test_01.getFromIni("bool", "bool1", value_01, false);
  test_01.getFromIni("bool", "bool2", value_02, true);
  test_01.getFromIni("bool", "bool3", value_03, true);

  EXPECT_EQ(value_01, true);
  EXPECT_EQ(value_02, false);
  EXPECT_EQ(value_03, true);
}

TEST(ini, get_array_int) {
  IniFile test_01(fs::current_path() / "test_files/test_01.ini");

  EXPECT_TRUE(test_01.iniSetup());

  int array[8];
  int test_array[] = {81, 71, 61, 51, 41, 31, 21, 11};
  int test_default_array[8];
  int default_array[] = {1, 2, 3, 4, 5, 6, 7, 8};
  int size = 8;

  test_01.getFromIni("array", "arrayInt", array, default_array, size);
  for (int i = 0; i < size; ++i) {
    EXPECT_EQ(array[i], test_array[i]);
  }

  test_01.getFromIni("array", "arrayInt_testD", test_default_array,
                     default_array, size);
  for (int i = 0; i < size; ++i) {
    EXPECT_EQ(test_default_array[i], default_array[i]);
  }
}

TEST(ini, get_array_float) {
  IniFile test_01(fs::current_path() / "test_files/test_01.ini");

  EXPECT_TRUE(test_01.iniSetup());

  float array[5];
  float test_array[] = {1.1f, 2.1f, 3.1f, 4.1f, 5.1f};
  float test_default_array[5];
  float default_array[] = {1.11f, 2.11f, 3.11f, 4.11f, 5.11f};
  int size = 5;

  test_01.getFromIni("array", "arrayFloat", array, default_array, size);
  for (int i = 0; i < size; ++i) {
    EXPECT_FLOAT_EQ(array[i], test_array[i]);
  }

  test_01.getFromIni("array", "arrayFloat_testD", test_default_array,
                     default_array, size);

  for (int i = 0; i < size; ++i) {
    EXPECT_FLOAT_EQ(test_default_array[i], default_array[i]);
  }
}

TEST(ini, get_array_double) {
  IniFile test_01(fs::current_path() / "test_files/test_01.ini");

  EXPECT_TRUE(test_01.iniSetup());

  double array[5];
  double test_array[] = {1.01, 2.01, 3.01, 4.01, 5.01};
  double test_default_array[5];
  double default_array[] = {1.11, 2.11, 3.11, 4.11, 5.11};
  int size = 5;

  test_01.getFromIni("array", "arrayDouble", array, default_array, size);
  for (int i = 0; i < size; ++i) {
    EXPECT_DOUBLE_EQ(array[i], test_array[i]);
  }

  test_01.getFromIni("array", "arrayDouble_testD", test_default_array,
                     default_array, size);
  for (int i = 0; i < size; ++i) {
    EXPECT_DOUBLE_EQ(test_default_array[i], default_array[i]);
  }
}

TEST(ini, get_false_case) {
  IniFile test_03(fs::current_path() / "test_files/no_find.ini");

  EXPECT_FALSE(test_03.iniSetup());

  int value_01;
  int value_02;

  test_03.getFromIni("int", "int1", value_01, 22);
  test_03.getFromIni("int", "int2", value_02, 22);

  EXPECT_EQ(value_01, 22);
  EXPECT_EQ(value_02, 22);
}

TEST(ini, set_data) {
  IniFile test_02(fs::current_path() / "test_files/test_02.ini");

  if (test_02.iniSetup()) {
    test_02.setToIni("string", "str1", "name");
    test_02.setToIni("int", "int1", 22);
    test_02.setToIni("float", "float1", 22.09f);
    test_02.setToIni("double", "double1", 22.09);
    test_02.setToIni("bool", "bool1", true);

    test_02.save();
  }
}

TEST(ini, set_array_data) {
  IniFile test_02(fs::current_path() / "test_files/test_02.ini");

  if (test_02.iniSetup()) {
    int arr_int[] = {2, 3, 4, 5, 6, 1};
    float arr_float[] = {1.01f, 2.01f, 3.01f};
    double arr_double[] = {2.11, 3.11, 1.11};

    test_02.setToIni("intArr", "iArr", arr_int, 6);
    test_02.setToIni("floatArr", "fArr", arr_float, 3);
    test_02.setToIni("doubleArr", "dArr", arr_double, 3);

    test_02.save();
  }
}

#pragma endregion

#pragma region JsonFile

TEST(json, json_setup) {
  JsonFile test(fs::current_path() / "test_files/test.json");

  EXPECT_TRUE(test.jsonSetup());
}

TEST(json, get_data) {
  JsonFile test(fs::current_path() / "test_files/test.json");

  string json_value_string;
  int json_value_int;
  double json_value_double;
  bool json_value_bool;
  int depth_json_value_int;
  bool depth_json_value_bool;
  string depth_json_value_string;

  EXPECT_TRUE(test.jsonSetup());

  test.getFromJson("encoding", json_value_string, "kkkkk");
  test.getFromJson("int", json_value_int, 19);
  test.getFromJson("double", json_value_double, 19.22);
  test.getFromJson("bool", json_value_bool, true);
  test.getFromJson("indent.length", depth_json_value_int, 19);
  test.getFromJson("indent.use_space", depth_json_value_bool, false);
  test.getFromJson("indent.g", depth_json_value_string, "bbbbb");

  EXPECT_EQ(json_value_string, "UTF-8");
  EXPECT_EQ(json_value_int, 22);
  EXPECT_EQ(json_value_double, 22.22);
  EXPECT_EQ(json_value_bool, false);
  EXPECT_EQ(depth_json_value_int, 3);
  EXPECT_EQ(depth_json_value_bool, true);
  EXPECT_EQ(depth_json_value_string, "ekoko");
}

TEST(json, get_array_string_data) {
  JsonFile test(fs::current_path() / "test_files/test.json");

  string json_value[3];
  string json_target_value[] = {"python", "c++", "ruby"};
  string json_default_value[] = {"java", "c#", "php"};
  int size = 3;

  EXPECT_TRUE(test.jsonSetup());
  test.getFromJson("plug-ins", json_value, json_default_value, size);

  for (int i = 0; i < size; ++i) {
    EXPECT_EQ(json_value[i], json_target_value[i]);
  }
}

TEST(json, get_array_int_data) {
  JsonFile test(fs::current_path() / "test_files/test.json");

  int json_value[3];
  int json_target_value[] = {1, 2, 3};
  int json_default_value[] = {3, 2, 1};
  int size = 3;

  EXPECT_TRUE(test.jsonSetup());
  test.getFromJson("indent.int_arr", json_value, json_default_value, size);

  for (int i = 0; i < size; ++i) {
    EXPECT_EQ(json_value[i], json_target_value[i]);
  }
}

TEST(json, get_array_double_data) {
  JsonFile test(fs::current_path() / "test_files/test.json");

  double json_value[3];
  double json_target_value[] = {1.11, 2.11, 3.11};
  double json_default_value[] = {3.11, 2.11, 1.11};
  int size = 3;

  EXPECT_TRUE(test.jsonSetup());
  test.getFromJson("indent.double_arr", json_value, json_default_value, size);

  for (int i = 0; i < size; ++i) {
    EXPECT_EQ(json_value[i], json_target_value[i]);
  }
}

TEST(json, get_data_from_Json_false_case) {
  JsonFile test(fs::current_path() / "test_files/json_false.json");

  string json_value_string;
  int json_value_int;
  double json_value_double;
  bool json_value_bool;
  int depth_json_value_int;
  bool depth_json_value_bool;
  string depth_json_value_string;
  string json_value[3];
  string json_target_value[] = {"python", "c++", "ruby"};
  string json_default_value[] = {"java", "c#", "php"};
  int size = 3;

  EXPECT_FALSE(test.jsonSetup());

  test.getFromJson("encoding", json_value_string, "kkkkk");
  test.getFromJson("int", json_value_int, 19);
  test.getFromJson("double", json_value_double, 19.22);
  test.getFromJson("bool", json_value_bool, true);
  test.getFromJson("indent.length", depth_json_value_int, 19);
  test.getFromJson("indent.use_space", depth_json_value_bool, false);
  test.getFromJson("indent.g", depth_json_value_string, "bbbbb");
  test.getFromJson("plug-ins", json_value, json_default_value, size);

  EXPECT_EQ(json_value_string, "kkkkk");
  EXPECT_EQ(json_value_int, 19);
  EXPECT_EQ(json_value_double, 19.22);
  EXPECT_EQ(json_value_bool, true);
  EXPECT_EQ(depth_json_value_int, 19);
  EXPECT_EQ(depth_json_value_bool, false);
  EXPECT_EQ(depth_json_value_string, "bbbbb");

  for (int i = 0; i < size; ++i) {
    EXPECT_EQ(json_value[i], json_default_value[i]);
  }
}

TEST(json, set_data) {
  JsonFile store_json(fs::current_path() / "test_files/store_json.json");

  int a[10] = {0};

  store_json._data["nickname"] = "name";
  store_json._data["birthday"] = "0219";
  store_json._data["array"] = a;

  json sub;

  sub["work"] = "C++ Dev";

  store_json._data["subJson"] = sub;

  store_json.save();
}

#pragma endregion

#pragma region DatFile

TEST(dat, read_data) {
  DatFile test(fs::current_path() / "test_files/test.dat");

  EXPECT_TRUE(test.readData());
}

TEST(dat, write_data) {
  DatFile test(fs::current_path() / "test_files/test.dat");

  if (test.readData()) {
    DatFile dat_test_copy = test;
    fs::path copy_p = fs::current_path() / "test_files/dat_test_copy.dat";
    dat_test_copy.setPath(copy_p);

    EXPECT_TRUE(dat_test_copy.writeData());
  }
}

TEST(dat, read_data_and_set_to_pointer_variable) {
  fs::path path = fs::current_path() / "test_files/test.dat";
  string datFilePath = path.string();

  long dataSize = 8192;
  int num = dataSize / sizeof(char);
  unsigned char *variable =
      (unsigned char *)malloc(sizeof(unsigned char) * num);

  if (DatFile::readDatFile(datFilePath, variable, num)) {
    EXPECT_EQ((unsigned int)variable[0], 169);
  }
}

TEST(dat, append_write_data) {
  DatFile test(fs::current_path() / "test_files/test.dat");

  if (test.readData()) {
    DatFile test_twice = test;
    test_twice.setPath(fs::current_path() / "test_files/dat_test_twice.dat");

    EXPECT_EQ(test_twice.getData()[0], 169);

    EXPECT_TRUE(test_twice.writeData());
    EXPECT_TRUE(DatFile::appendWriteDataToDatFile(test_twice.getPath(),
                                                  &test_twice.getData()[0],
                                                  test_twice.getData().size()));
  }
}

TEST(dat, save_output_data) {
  string datFilePath = (fs::current_path() / "test_files/test.dat").string();

  long dataSize = 8192;
  int num = dataSize / sizeof(char);
  unsigned char *variable = (unsigned char *)malloc(sizeof(char) * num);

  if (DatFile::readDatFile(datFilePath, variable, num)) {
    string dat_test_appendAdd =
        (fs::current_path() / "test_files/dat_test_appendAdd.dat").string();

    unsigned char *data = variable;

    int extData[] = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};

    EXPECT_EQ(
        DatFile::saveOutputData(extData, 10, dat_test_appendAdd, data, 8192),
        true);
  }
}

#pragma endregion

#pragma region BmpFile

TEST(bmp, read_data) {
  BmpFile test_01(fs::current_path() / "test_files/test_01.bmp");
  BmpFile test_02(fs::current_path() / "test_files/test_02.bmp");

  BMP bmpObject_01(test_01.getPath().c_str());
  BMP bmpObject_02(test_02.getPath().c_str());

  EXPECT_EQ(bmpObject_01.bmp_info_header.height, 256);
  EXPECT_EQ(bmpObject_01.bmp_info_header.width, 128);
  EXPECT_EQ(bmpObject_02.bmp_info_header.height, 256);
  EXPECT_EQ(bmpObject_02.bmp_info_header.width, 16);
}

TEST(bmp, copy_bmp) {
  BmpFile test_01(fs::current_path() / "test_files/test_01.bmp");

  string copy_bmp_file =
      (fs::current_path() / "test_files/copy_bmp.bmp").string();

  BMP bmpObject(test_01.getPath().c_str());
  bmpObject.write(copy_bmp_file.c_str());

  BMP bmpObject_copy(copy_bmp_file.c_str());
  EXPECT_EQ(bmpObject_copy.bmp_info_header.height, 256);
  EXPECT_EQ(bmpObject_copy.bmp_info_header.width, 128);
}

#pragma endregion

#pragma region ImgFile

TEST(img, read_data) {
  string img_p = (fs::current_path() / "test_files/rocket.jpg").string();

  ImgFile file(img_p);

  EXPECT_TRUE(file.readData());
}

TEST(img, write_data) {
  ImgFile file(fs::current_path() / "test_files/rocket.jpg");

  if (file.readData()) {
    ImgFile copy_f = file;

    copy_f.setPath(fs::current_path() / "test_files/rocket_copy.jpg");
    EXPECT_TRUE(copy_f.writeData());
  }
}

TEST(img, write_data_2) {
  ImgFile file(fs::current_path() / "test_files/rocket.jpg");

  if (file.readData()) {
    ImgFile copy_f(fs::current_path() / "test_files/rocket_copy2.jpg");

    copy_f.setData(file.getData());
    copy_f.setLength(file.getLength());

    EXPECT_TRUE(copy_f.writeData());
  }
}

#pragma endregion

#pragma region UString

TEST(UString, use_string_as_params) {
  string arg_01 = "test";
  string arg_02 = "folder";
  string arg_03 = "cpp";

  string path = UString("C:/home/%1/%2/%3/hello.c")
                    .args(arg_01)
                    .args(arg_02)
                    .args(arg_03);

  EXPECT_EQ(path, "C:/home/test/folder/cpp/hello.c");
}

TEST(UString, use_int_as_params) {
  string arg_01 = "test";
  int arg_02 = 1;
  string arg_03 = "text";

  string path =
      UString("C:/home/%1/%2/%3.txt").args(arg_01).args(arg_02).args(arg_03);

  EXPECT_EQ(path, "C:/home/test/1/text.txt");
}

TEST(UString, use_define_variable_as_params) {
  string arg_01 = "test";
  int arg_02 = 1;
#define HOME "home"

  string path = UString("C:/%1/%2/%3/%4/%5.txt")
                    .args(HOME, arg_01, arg_02, "default", "text");

  EXPECT_EQ(path, "C:/home/test/1/default/text.txt");
}

TEST(UString, loop_params) {
  string arg_01 = "test";
  int arg_02 = 1;

  string path = UString("C:/home/%1/%2/%3.txt").args(arg_01, arg_02, "text");

  EXPECT_EQ(path, "C:/home/test/1/text.txt");
}

TEST(UString, left_value) {
  string arg_01 = "test";
  int arg_02 = 1;

  cout << UString("C:/home/%1/%2/%3.txt").args(arg_01, arg_02, "text") << endl;
}

#pragma endregion

#pragma region Variant

TEST(variant, type) {
  vector<Variant> vec;
  vec = {true, 'c', 1, 1.2, "hello"};

  EXPECT_EQ(vec[0].toString(), "true");
  EXPECT_EQ(vec[1].toString(), "c");
  EXPECT_EQ(vec[2].toString(), "1");
  EXPECT_EQ(vec[3].toString(), "1.2");
  EXPECT_EQ(vec[4].toString(), "hello");
}
#pragma endregion

#pragma region file

TEST(file, exist) {
  fs::path path_01 = fs::current_path() / "test_files/test_01.txt";
  fs::path path_02 = fs::current_path() / "test_files/test_10.txt";

  EXPECT_TRUE(fs::exists(UFile(path_01).handle()));
  EXPECT_FALSE(fs::exists(UFile(path_02).handle()));
}

TEST(file, get_file_size) {
  fs::path p = fs::current_path() / "example.bin";
  UFile file = UFile(p);

  ofstream(p) << "hello world";  // create file of size 1

  EXPECT_EQ(fs::file_size(file.handle()), 11);

  // fs::remove(p);
}

TEST(file, get_absolute_path) {
  fs::path p = fs::current_path() / "test.txt";
  UFile file = UFile(p);

  ofstream(p) << "hello world";  // create file of size 11

  EXPECT_EQ(fs::absolute(file.handle()), p);
}

TEST(file, delete_file) {
  fs::path p = fs::current_path() / "hello.cpp";
  UFile file = UFile(p);

  ofstream(p) << "world";

  EXPECT_EQ(fs::file_size(file.handle()), 5);

  EXPECT_TRUE(fs::remove(p));
}

TEST(file, delete_directory) {
  fs::path d = (fs::current_path() / "test_files/hello_d");

  EXPECT_NE(fs::remove_all(d), 0);
}

TEST(file, if_file_exist_then_find_its_father_directory) {
  string path = (fs::current_path() / "test_files/test_01.txt").string();
  if (fs::exists(path)) {
    EXPECT_EQ(fs::path(path).parent_path(),
              (fs::current_path() / "test_files").string());
  }
}

TEST(file, find_its_father_directory) {
  string txt = (fs::current_path() / "files_txt/test_01.txt").string();
  if (!fs::exists(fs::path(txt).parent_path()))
    fs::create_directory(fs::path(txt).parent_path());
}

TEST(file, copy) {
  const auto copyOptions =
      fs::copy_options::update_existing | fs::copy_options::recursive;

  string txt_path = (fs::current_path() / "test_files/test_01.txt").string();
  string copy_txt_path =
      (fs::current_path() / "test_files/copy_test_01.txt").string();

  fs::copy(txt_path, copy_txt_path, copyOptions);

  string ini_path = (fs::current_path() / "test_files/test_01.ini").string();
  string copy_ini_path =
      (fs::current_path() / "test_files/copy_test_01.ini").string();

  fs::copy(ini_path, copy_ini_path, copyOptions);

  string json_path = (fs::current_path() / "test_files/test.json").string();
  string copy_json_path =
      (fs::current_path() / "test_files/copy_test.json").string();

  fs::copy(json_path, copy_json_path, copyOptions);

  string dat_path = (fs::current_path() / "test_files/test.dat").string();
  string copy_dat_path =
      (fs::current_path() / "test_files/copy_test.dat").string();

  fs::copy(dat_path, copy_dat_path, copyOptions);

  string bmp_path = (fs::current_path() / "test_files/test_01.bmp").string();
  string copy_bmp_path =
      (fs::current_path() / "test_files/copy_test_01.bmp").string();

  fs::copy(bmp_path, copy_bmp_path, copyOptions);
}

TEST(file, deleteTargetFile_recursive) {
  string dir = (fs::current_path() / "sandbox").string();
  fs::create_directories(dir);
  fs::create_directories(dir + "/a/b");
  ofstream(dir + "/file1.txt");
  ofstream(dir + "/a/file1.txt");
  ofstream(dir + "/a/b/file1.txt");

  UFile::deleteTargetFile(dir, "file1.txt");
}

TEST(file, deleteTargetFile) {
  string dir = (fs::current_path() / "sandbox2").string();
  fs::create_directories(dir);
  fs::create_directories(dir + "/a/b");
  ofstream(dir + "/file1.txt");
  ofstream(dir + "/a/file1.txt");
  ofstream(dir + "/a/b/file1.txt");

  UFile::deleteTargetFile(dir, "file1.txt", false);
}

TEST(file, copyFile_cover) {
  string dir = (fs::current_path() / "sandbox3").string();
  fs::create_directories(dir);
  fs::create_directories(dir + "/a/b");
  ofstream(dir + "/file1.txt") << "file1.txt";
  ofstream(dir + "/a/file2.txt") << "file2.txt";
  ofstream(dir + "/a/b/file3.txt") << "file3.txt";

  UFile::copyFile(dir + "/file1.txt", dir + "/a/b/file3.txt", true);
}

TEST(file, copyFile) {
  string dir = (fs::current_path() / "sandbox6").string();
  fs::create_directories(dir);
  fs::create_directories(dir + "/a/b");
  ofstream(dir + "/file1.txt") << "file1.txt";
  ofstream(dir + "/a/file2.txt") << "file2.txt";
  ofstream(dir + "/a/b/file3.txt") << "file3.txt";

  UFile::copyFile(dir + "/file1.txt", dir + "/a/b/file3.txt", false);
}

TEST(file, copyDirectoryFiles) {
  string dir = (fs::current_path() / "sandbox7").string();
  fs::create_directories(dir);
  fs::create_directories(dir + "/a/b");
  ofstream(dir + "/file1.txt") << "file1.txt";
  ofstream(dir + "/a/file2.txt") << "file2.txt";
  ofstream(dir + "/a/b/file3.txt") << "file3.txt";

  string targetDir = (fs::current_path() / "sandbox9").string();

  UFile::copyDirectoryFiles(dir, targetDir, false);
}

TEST(file, copyDirectoryFiles_cover) {
  string dir = (fs::current_path() / "sandbox12").string();
  fs::create_directories(dir);
  fs::create_directories(dir + "/a/b");
  ofstream(dir + "/file1.txt") << "file11.txt";
  ofstream(dir + "/a/file2.txt") << "file22.txt";
  ofstream(dir + "/a/b/file3.txt") << "file33.txt";

  string targetDir = (fs::current_path() / "sandbox13").string();
  fs::create_directories(targetDir);
  fs::create_directories(targetDir + "/a/b");
  ofstream(targetDir + "/file1.txt") << "file100.txt";
  ofstream(targetDir + "/a/file2.txt") << "file200.txt";
  ofstream(targetDir + "/a/b/file3.txt") << "file300.txt";

  UFile::copyDirectoryFiles(dir, targetDir, true);
}

#pragma endregion

#pragma region fstream

TEST(fstream, append_write) {
  int _1MB = 1024;
  char arr[1024];
  for (int i = 0; i < _1MB; ++i) {
    arr[i] = '0';
  }
  char *_1MBBuff = arr;
  ofstream file;
  file.open((fs::current_path() / "file1.dat").string(),
            ios::out | ios::binary);
  if (file.is_open()) {
    file.write((const char *)_1MBBuff, _1MB * sizeof(char));
  }
  file.close();
}

TEST(fstream, constructor) {
  fstream txt((fs::current_path() / "test_files/test_01.txt"));

  if (txt.is_open()) {
    std::istreambuf_iterator<char> beg(txt), end;
    string str(beg, end);
    EXPECT_EQ(str, "name\ni like code.\n");
  }
}

TEST(fstream, binary) {
  fstream file((fs::current_path() / "test_files/test.dat"));

  if (file.is_open()) {
    file.seekg(0, ios::end);
    int length = (int)file.tellg();
    file.seekg(0, ios::beg);

    uint8_t *data = new uint8_t[length];
    file.read((char *)data, length * sizeof(char));
    EXPECT_EQ((int)data[0], 169);
  }
}

#pragma endregion
```

</details>

### UFile

看了蛮多 C++ 的书籍，以及看 `cppreference` 官网内容，感觉我要做的文件读写的工作。可以基于 `<filesystem>` 文件系统库来做。

<details><summary>UFile 的全部代码</summary>

```cpp
#ifndef UFILE_HPP_
#define UFILE_HPP_

#include <filesystem>
#include <fstream>
#include <iostream>
#include <string>
#include <vector>

#if defined(__clang__) || defined(__GNUC__)
#define CPP_STANDARD __cplusplus
#elif defined(_MSC_VER)
#define CPP_STANDARD _MSVC_LANG
#endif

#if CPP_STANDARD >= 201103L && CPP_STANDARD < 201703L
namespace fs = std::tr2::sys;
#endif
#if CPP_STANDARD >= 201703L
namespace fs = std::filesystem;
#endif

class UFile {
 private:
  fs::path _p;

 public:
  UFile() {}
  UFile(const char *path) { _p = path; }
  UFile(const std::string &path) { _p = path; }
  UFile(const fs::path &path) { _p = path; }
  ~UFile() {}

  fs::path handle() { return _p; }

  void setPath(const std::string &path) { _p = path; }

  void setPath(const fs::path &path) { _p = path; }

  std::string getPath() { return _p.string(); }

  std::vector<std::string> split(const std::string &data,
                                 const std::string &separator) {
    std::vector<std::string> result;
    if (data == "") return result;

    char *thisStr = new char[data.length() + 1];
    char *thisSeparator = new char[separator.length() + 1];

#if defined(_MSC_VER)
    strcpy_s(thisStr, data.length() + 1, data.c_str());
    strcpy_s(thisSeparator, separator.length() + 1, separator.c_str());

    char *next_token = NULL;
    char *token = strtok_s(thisStr, thisSeparator, &next_token);
    while (token) {
      std::string tempStr = token;
      result.push_back(tempStr);
      token = strtok_s(NULL, thisSeparator, &next_token);
    }
#elif defined(__GNUC__)
    strcpy(thisStr, data.c_str());
    strcpy(thisSeparator, separator.c_str());

    char *token = strtok(thisStr, thisSeparator);
    while (token) {
      std::string tempStr = token;
      result.push_back(tempStr);
      token = strtok(NULL, thisSeparator);
    }
#endif

    return result;
  }

  static void deleteTargetFile(std::string directoryPath, std::string fileName,
                               bool recursiveTraversal = true) {
    if (recursiveTraversal) {
      for (auto const &dir_entry :
           fs::recursive_directory_iterator(directoryPath)) {
        if (dir_entry.path().filename() == fileName) {
          remove(dir_entry.path());
        }
      }
    } else {
      for (auto const &dir_entry : fs::directory_iterator(directoryPath)) {
        if (dir_entry.path().filename() == fileName) {
          remove(dir_entry.path());
        }
      }
    }
  }

  static void copyFile(const std::string &sourceFile,
                       const std::string &targetFile,
                       const bool &overwriteFile) {
    fs::path file(targetFile);
    fs::create_directories(file.parent_path());

    if (overwriteFile && fs::exists(targetFile)) {
      fs::remove(targetFile);
    }

    const auto copyOptions =
        fs::copy_options::update_existing | fs::copy_options::recursive;

    fs::copy(sourceFile, targetFile, copyOptions);
  }

  static bool copyDirectoryFiles(const std::string &sourceDirectory,
                                 const std::string &targetDirectory,
                                 const bool &overwriteFile) {
    if (!fs::exists(sourceDirectory)) return false;

    fs::create_directories(targetDirectory);

    for (auto const &dir_entry : fs::directory_iterator(sourceDirectory)) {
      if (dir_entry.path().filename() == "." ||
          dir_entry.path().filename() == "..")
        continue;

      if (fs::is_directory(dir_entry.symlink_status())) {
        if (!copyDirectoryFiles(
                dir_entry.path().string(),
                (fs::path(targetDirectory) / dir_entry.path().filename())
                    .string(),
                overwriteFile)) {
          return false;
        }
      } else {
        if (overwriteFile &&
            fs::exists((fs::path(targetDirectory) / dir_entry.path().filename())
                           .string())) {
          fs::remove((fs::path(targetDirectory) / dir_entry.path().filename())
                         .string());
        }

        const auto copyOptions =
            fs::copy_options::update_existing | fs::copy_options::recursive;

        fs::copy(
            dir_entry.path().string(),
            (fs::path(targetDirectory) / dir_entry.path().filename()).string(),
            copyOptions);
      }
    }

    return true;
  }
};

#endif  // UFILE_HPP_
```

</details>

将 `<filesystem>` 的 `path` 类作为私有变量使用，然后根据一些实际业务写几个功能函数。

文件系统库有很多现成的方法可供调用，基本满足处理各种情况，如：

1. **路径处理**：找出当前文件所在的目录、绝对路径、相对路径和判断该路径是否存在等等；

2. **对文件的处理**：文件复制、删除文件、查找文件和获取文件大小等等；

3. **对文件夹的处理**：单层目录的遍历，递归遍历目录和是否清空文件夹内容等等;

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
  std::string _data = "";
  std::fstream file;

 public:
  TxtFile() {}
  TxtFile(const char* path) : UFile(path) {}
  TxtFile(const std::string& path) : UFile(path) {}
  TxtFile(const fs::path& path) : UFile(path) {}
  ~TxtFile() {}

  bool readData() {
    file.open(getPath(), std::ios::in);

    if (file.is_open()) {
      std::istreambuf_iterator<char> beg(file), end;
      std::string str(beg, end);
      _data = str;

      file.close();
      return true;
    } else {
      file.close();
      return false;
    }
  }

  bool writeData() {
    file.open(getPath(), std::ios::out);

    if (file.is_open()) {
      file << _data;

      file.close();
      return true;
    } else {
      file.close();
      return false;
    }
  }

  bool appendWriteData(const std::string data) {
    file.open(getPath(), std::ios_base::app);

    if (file.is_open()) {
      file << data;

      file.close();
      return true;
    } else {
      file.close();
      return false;
    }
  }

  std::string getData() { return _data; }

  void setData(std::string data) { _data = data; }
};

#endif  // TXTFILE_HPP_
```

</details>

文本文件主要是对字符串的处理，根据需求考虑读取，写入和追加写入这三个功能。

就是调用 `<fstream>` 这个库中的 `sdt::fstream` 类对文本文件做处理，有个数据流的概念，那三个功能就是对数据流做些处理即可。

### IniFile

<details><summary>IniFile 的全部代码</summary>

```cpp
#ifndef INIFILE_HPP_
#define INIFILE_HPP_

#include <fstream>

#include "UFile.hpp"
#include "ini/SimpleIni.h"

class IniFile : public UFile {
 private:
  CSimpleIniA _ini;

 public:
  IniFile() {}
  IniFile(const char *path) : UFile(path) {}
  IniFile(const std::string &path) : UFile(path) {}
  IniFile(const fs::path &path) : UFile(path) {}
  ~IniFile() {}

  bool iniSetup() {
    _ini.SetUnicode();

    std::string path = getPath();

    SI_Error rc = _ini.LoadFile(path.c_str());
    if (rc < 0) return false;

    return true;
  }

  void getFromIni(const char *section, const char *key, std::string &param,
                  const char *defaultVal) {
    param = _ini.GetValue(section, key, defaultVal);
  }

  template <typename T>
  void getFromIni(const char *section, const char *key, T &param,
                  T defaultVal) {
    const char *name = typeid(T).name();
    std::string paramType = name;
    std::string tempParam;
    tempParam = _ini.GetValue(section, key, std::to_string(defaultVal).c_str());

    if (paramType[0] == 'i')
      param = stoi(tempParam);
    else if (paramType[0] == 'f')
      param = stof(tempParam);
    else if (paramType[0] == 'd')
      param = stod(tempParam);
    else if (paramType[0] == 'b')
      if (tempParam == "false" || tempParam == "0")
        param = false;
      else if (tempParam == "true" || tempParam == "1")
        param = true;
  }

  template <typename T>
  void getFromIni(const char *section, const char *key, T *param, T *defaultVal,
                  const int &size) {
    int index = 0;

    const char *name = typeid(T).name();
    std::string paramType = name;

    if (_ini.GetValue(section, key) == nullptr)
      while (index <= size - 1) {
        param[index] = defaultVal[index];
        index++;
      }
    else {
      std::string tempParamArrayStr = _ini.GetValue(section, key);
      std::vector<std::string> tempParamArray =
          split(tempParamArrayStr, " ,\t\n");

      if (paramType[0] == 'i')
        for (int i = 0; i < tempParamArray.size(); ++i)
          param[index++] = stoi(tempParamArray[i]);
      else if (paramType[0] == 'f')
        for (int i = 0; i < tempParamArray.size(); ++i)
          param[index++] = stof(tempParamArray[i]);
      else if (paramType[0] == 'd')
        for (int i = 0; i < tempParamArray.size(); ++i)
          param[index++] = stod(tempParamArray[i]);

      while (index <= size - 1) {
        param[index] = defaultVal[index];
        index++;
      }
    }
  }

  void setToIni(const char *section, const char *key, const char *fromValue) {
    std::string toValue = fromValue;
    const char *toValueC = (char *)toValue.c_str();
    _ini.SetValue(section, key, toValueC);
  }

  template <typename T>
  void setToIni(const char *section, const char *key, T fromValue) {
    const char *name = typeid(T).name();
    std::string valueType = name;
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

    const char *toValueC = (char *)toValue.c_str();

    _ini.SetValue(section, key, toValueC);
  }

  template <typename T>
  void setToIni(const char *section, const char *key, T *fromValueArr,
                const int &size) {
    if (size <= 0) return;

    const char *name = typeid(T).name();
    std::string valueType = name;
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

    const char *toValueC = (char *)toValueArr.c_str();

    _ini.SetValue(section, key, toValueC);
  }

  void save() {
    std::string output;
    _ini.Save(output);
    const char *path = (char *)getPath().c_str();
    _ini.SaveFile(path);
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

  JsonFile() {}
  JsonFile(const char *path) : UFile(path) {}
  JsonFile(const std::string &path) : UFile(path) {}
  JsonFile(const fs::path &path) : UFile(path) {}
  ~JsonFile() {}

  bool jsonSetup() {
    std::fstream file;

    file.open(getPath(), std::ios::in);

    if (file.is_open()) {
      file >> _data;

      file.close();

      return true;
    } else
      return false;
  }

  void getFromJson(const std::string &key, std::string &param,
                   std::string defaultVal) {
    if (key == "") param = defaultVal;

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
    if (key == "") param = defaultVal;

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
                   std::string *defaultVal, const int &size) {
    if (key == "") param = defaultVal;

    json temp = _data;
    std::vector<std::string> keyArr = split(key, ".");

    for (int i = 0; i < keyArr.size() - 1; ++i)
      if (temp.contains(keyArr[i])) temp = temp.at(keyArr[i]);

    int index = 0;

    if (temp.contains(keyArr[keyArr.size() - 1])) {
      const json thisKeyArrValue = temp.at(keyArr[keyArr.size() - 1]);

      for (int i = 0; i < thisKeyArrValue.size(); ++i)
        param[index++] = thisKeyArrValue[index];
    }

    if (index < size)
      for (int i = index; i < size; ++i) param[i] = defaultVal[i];
  }

  template <typename T>
  void getFromJson(const std::string &key, T *param, T *defaultVal,
                   const int &size) {
    json temp = _data;
    std::vector<std::string> keyArr = split(key, ".");

    for (int i = 0; i < keyArr.size() - 1; ++i)
      if (temp.contains(keyArr[i])) temp = temp.at(keyArr[i]);

    int index = 0;

    if (temp.contains(keyArr[keyArr.size() - 1])) {
      const json thisKeyArrValue = temp.at(keyArr[keyArr.size() - 1]);

      for (int i = 0; i < thisKeyArrValue.size(); ++i)
        param[index++] = thisKeyArrValue[index];
    }

    if (index < size)
      for (int i = index; i < size; ++i) param[i] = defaultVal[i];
  }

  void save() {
    std::ofstream file(getPath());
    file << _data;
    file.flush();
  }
};

#endif  // JSONFILE_HPP_
```

</details>

也用的一开源库 [nlohmann/json](https://github.com/nlohmann/json)，和 IniFile 一样做法啦。

### DatFile

<details><summary>DatFile 的全部代码</summary>

```cpp
#ifndef DATFILE_HPP_
#define DATFILE_HPP_

#include "UFile.hpp"

#if defined(_WIN32)
#pragma warning(disable : 4996)
#endif

class DatFile : public UFile {
 private:
  std::vector<uint8_t> _data;

 public:
  DatFile() {}
  DatFile(const char *path) : UFile(path) {}
  DatFile(const std::string &path) : UFile(path) {}
  DatFile(const fs::path &path) : UFile(path) {}
  ~DatFile() {}

  std::vector<uint8_t> getData() { return _data; }

  bool readData() {
    FILE *fid = fopen(getPath().c_str(), "rb");

    if (fid == NULL) return false;

    fseek(fid, 0, SEEK_END);
    long lSize = ftell(fid);
    rewind(fid);

    int num = lSize / sizeof(uint8_t);
    char *pos = (char *)malloc(sizeof(uint8_t) * num);

    if (pos == NULL) return false;

    size_t temp = fread(pos, sizeof(uint8_t), num, fid);

    for (int i = 0; i < num; ++i) _data.push_back(pos[i]);

    free(pos);

    fclose(fid);

    return true;
  }

  bool writeData() {
    FILE *fid = fopen(getPath().c_str(), "wb");

    if (fid == NULL) return false;

    fwrite(&_data[0], sizeof(uint8_t), _data.size(), fid);

    fclose(fid);

    return true;
  }

  static bool readDatFile(const std::string &datFilePath, uint8_t *varibale,
                          const int &num) {
    FILE *fid = fopen(datFilePath.c_str(), "rb");

    if (fid == NULL) return false;

    fseek(fid, 0, SEEK_END);
    long lSize = ftell(fid);
    rewind(fid);

    if (lSize / sizeof(uint8_t) < num) return false;

    size_t temp = fread(varibale, sizeof(uint8_t), num, fid);

    fclose(fid);

    return true;
  }

  static bool writeDataToDatFile(const std::string &datFilePath, uint8_t *data,
                                 const int &size) {
    FILE *fid = fopen(datFilePath.c_str(), "wb");

    if (fid == NULL) return false;

    fwrite(data, sizeof(uint8_t), size, fid);

    fclose(fid);

    return true;
  }

  static bool appendWriteDataToDatFile(const std::string &datFilePath,
                                       uint8_t *data, const size_t &size) {
    FILE *fid = fopen(datFilePath.c_str(), "ab");

    if (fid == NULL) return false;

    fwrite(data, sizeof(uint8_t), size, fid);

    fclose(fid);

    return true;
  }

  static bool saveDatFileExt(const std::string &fileName, uint8_t *extData,
                             const int &extDataSize, uint8_t *data,
                             const int &dataSize) {
    if (!fs::exists(fs::path(fileName).parent_path()))
      fs::create_directory(fs::path(fileName).parent_path());

    FILE *fid = fopen(fileName.c_str(), "wb");

    if (fid == NULL) return false;

    if (extData != nullptr && extDataSize != 0) {
      fwrite(extData, sizeof(uint8_t), extDataSize, fid);
    }

    fwrite(data, sizeof(uint8_t), dataSize, fid);

    fclose(fid);

    return true;
  }

  static bool saveOutputData(int *extData, const int &extDataCount,
                             const std::string &absoluteFilePath, uint8_t *data,
                             const int &dataSize) {
    const int extDataSize = extDataCount * sizeof(int);
    return saveDatFileExt(absoluteFilePath, (uint8_t *)extData, extDataSize,
                          data, dataSize);
  }
};

#endif  // DATFILE_HPP_
```

</details>

`.dat` 是二进制文件，我这里用的是 C 语言的 `File` 来处理二进制数据，为什么呢？

因为原先的 `FileTools` 类中，前辈们都用的它。

有句话是这样的：

> 代码能够正常运行，且多年未曾出现错误，那就还是对这些代码保持谨慎的态度

即不轻易修改。

我也就小改了下里面的存储代码，因为用 `std::vector` 替代 `QVector` 了。

其实有点想用 C++ 的 `std::fstream` 来处理，这样整体的代码全是 C++ 写的，貌似会好点。

后续有空再看，又一个技术债务 /doge。

### BmpFile

<details><summary>BmpFile 的全部代码</summary>

```cpp
#ifndef BMPFILE_HPP_
#define BMPFILE_HPP_

#include "UFile.hpp"
#include "bmp/BMP.h"

class BmpFile : public UFile {
 public:
  BmpFile() {}
  BmpFile(const char* path) : UFile(path) {}
  BmpFile(const std::string& path) : UFile(path) {}
  BmpFile(const fs::path& path) : UFile(path) {}
  ~BmpFile() {}
};

#endif  // BMPFILE_HPP_
```

</details>

呃，也用的[开源库](https://github.com/kok-s0s/cxx_crud_file/blob/main/bmp/BMP.h)，是公司的前辈 clone 的，我没找到来源，不过还是日常感谢无私的开源贡献者。

> 百度百科 - BMP是英文Bitmap（位图）的简写，它是Windows操作系统中的标准图像文件格式，能够被多种Windows应用程序所支持。随着Windows操作系统的流行与丰富的Windows应用程序的开发，BMP位图格式理所当然地被广泛应用。这种格式的特点是包含的图像信息较丰富，几乎不进行压缩，但由此导致了它与生俱来的缺点--占用磁盘空间过大。所以，BMP在单机上比较流行。

这个开源库的接口考虑的很全面了，处理目前的业务够用了，就没做二次封装，不包了，直接用。

### ImgFile

<details><summary>ImgFile 的全部代码</summary>

```cpp
#ifndef IMGFILE_HPP_
#define IMGFILE_HPP_

#include <fstream>

#include "UFile.hpp"

class ImgFile : public UFile {
 private:
  uint8_t* _data;
  int _length;

 public:
  ImgFile() {}
  ImgFile(const char* path) : UFile(path) {}
  ImgFile(const std::string& path) : UFile(path) {}
  ImgFile(const fs::path& path) : UFile(path) {}
  ~ImgFile() {}

  void setData(uint8_t* data) { _data = data; }

  uint8_t* getData() { return _data; }

  void setLength(const int& length) { _length = length; }

  int getLength() { return _length; }

  bool readData() {
    std::ifstream file;

    file.open(getPath(), std::ios::in | std::ios::binary);

    if (!file.is_open()) return false;

    file.seekg(0, std::ios::end);
    _length = (int)file.tellg();
    file.seekg(0, std::ios::beg);

    _data = new uint8_t[_length];
    file.read((char*)_data, _length * sizeof(char));

    file.close();

    return true;
  }

  bool writeData() {
    std::ofstream out;
    out.open(getPath(), std::ios::out | std::ios::binary);

    if (!out.is_open()) return false;

    out.write((const char*)_data, _length * sizeof(char));

    out.close();
    delete[] _data;
    return true;
  }
};

#endif  // IMGFILE_HPP_
```

</details>

ImgFile 其实也是对二进制的处理，这里用的就是 C++ 的 `std::fstream`。

那都是处理二进制，图像为什么还单独弄一个，是因为 leader 说这样，我就这样 /doge。

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
  UString(std::string content) { _content = content; }
  ~UString() {}

  UString args(std::string substitution) {
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

  UString args(const char *substitution) {
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

  template <typename T>
  UString args(T substitution) {
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
        upToDateContent += match.prefix().str() + std::to_string(substitution);
      else
        upToDateContent += match.prefix().str() + "%" + std::to_string(index);

      suffix = match.suffix();
    }

    upToDateContent += suffix;

    return UString(upToDateContent);
  }

  template <class T, class... Args>
  UString args(T head, Args... rest) {
    UString result(_content);
    result = result.args(head);
    result = result.args(rest...);
    return result;
  }

  friend std::ostream &operator<<(std::ostream &os, const UString &uString) {
    os << uString._content;
    return os;
  }

  operator std::string() { return _content; }

  const char *c_str() { return _content.c_str(); }
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

哦，记住，重载一下 `<<` 操作符，否则 `std::ostream` 输出流识别不了 `UString` 这个类。

还有一个类型重载，这样就能用 `=` 操作符，将右值（`Ustring` 对象）重载为 `std::string`。

## 借轮子

### Variant

原先前辈在 Github 找的，软件组的大家在实际使用中，根据业务的需求，有做一些修改和 bug 修复，加了个 `wchar` 的处理。

算是直接借用，找不到其原本来源。

<details><summary>其全部代码</summary>

```cpp
#ifndef VARIANT_HPP_
#define VARIANT_HPP_

#include <cstring>
#include <sstream>
#include <string>

#if defined(_WIN32)
#pragma warning(disable : 4244)
#endif

class Variant {
 public:
  using uchar = unsigned char;
  using ushort = unsigned short;
  using uint = unsigned int;
  using ulong = unsigned long;
  using ulonglong = unsigned long long;
  using wchar = wchar_t;

 public:
  enum Type {
    Invalid,
    Bool,
    Char,
    UChar,
    Short,
    UShort,
    Int,
    UInt,
    Long,
    ULong,
    LongLong,
    ULongLong,
    Float,
    Double,
    LongDouble,
    WChar,

    String,   // std::string
    WString,  // std::wstring
  };

  template <typename T>
  static Type typeID() {
    if (std::is_same_v<T, bool>) return Bool;
    if (std::is_same_v<T, char>) return Char;
    if (std::is_same_v<T, uchar>) return UChar;
    if (std::is_same_v<T, wchar_t>) return WChar;
    if (std::is_same_v<T, short>) return Short;
    if (std::is_same_v<T, ushort>) return UShort;
    if (std::is_same_v<T, int>) return Int;
    if (std::is_same_v<T, uint>) return UInt;
    if (std::is_same_v<T, long>) return Long;
    if (std::is_same_v<T, ulong>) return ULong;
    if (std::is_same_v<T, long long>) return LongLong;
    if (std::is_same_v<T, ulonglong>) return ULongLong;
    if (std::is_same_v<T, float>) return Float;
    if (std::is_same_v<T, double>) return Double;
    if (std::is_same_v<T, long double>) return LongDouble;
    if (std::is_same_v<T, std::string>) return String;
    if (std::is_same_v<T, std::wstring>) return WString;

    return Invalid;
  }

 public:
  Variant() : _d(Invalid) {}

  ~Variant() {
    if (String == _d.type) {
      if (_d.data.ptr) safe_delete_void_ptr<char *>(_d.data.ptr);
    } else if (WString == _d.type) {
      if (_d.data.ptr) safe_delete_void_ptr<wchar_t *>(_d.data.ptr);
    }
  }

  Variant(bool b) : _d(Bool) { _d.data.b = b; }

  Variant(char c) : _d(Char) { _d.data.c = c; }

  Variant(uchar uc) : _d(UChar) { _d.data.uc = uc; }

  Variant(wchar_t wc) : _d(WChar) { _d.data.wc = wc; }

  Variant(short s) : _d(Short) { _d.data.s = s; }
  Variant(ushort us) : _d(UShort) { _d.data.us = us; }
  Variant(int i) : _d(Int) { _d.data.i = i; }
  Variant(uint ui) : _d(UInt) { _d.data.ui = ui; }
  Variant(long l) : _d(Long) { _d.data.l = l; }
  Variant(ulong ul) : _d(ULong) { _d.data.ul = ul; }
  Variant(long long ll) : _d(LongLong) { _d.data.ll = ll; }
  Variant(ulonglong ull) : _d(ULongLong) { _d.data.ull = ull; }
  Variant(float f) : _d(Float) { _d.data.f = f; }
  Variant(double d) : _d(Double) { _d.data.d = d; }
  Variant(long double ld) : _d(LongDouble) { _d.data.ld = ld; }

  Variant(const char *str) : _d(String) {
    if (!str) {
      make_invalid();
    } else {
      size_t len = strlen(str);
      _d.data.ptr = new char[strlen(str) + 1];
#if defined(_MSC_VER)
      strcpy_s(static_cast<char *>(_d.data.ptr), strlen(str) + 1, str);
#elif defined(__GNUC__)
      strcpy(static_cast<char *>(_d.data.ptr), str);
#endif
    }
  }

  Variant(const wchar_t *wstr) {
    if (!wstr) {
      make_invalid();
    } else {
      _d.data.ptr = new char[wcslen(wstr) + 1];
#if defined(_MSC_VER)
      wcscpy_s((wchar_t *)_d.data.ptr, wcslen(wstr) + 1, wstr);
#elif defined(__GNUC__)
      wcscpy((wchar_t *)_d.data.ptr, wstr);
#endif
    }
  }

  Variant(const std::string &str) : _d(String) {
    if (str.empty()) {
      make_invalid();
    } else {
      _d.data.ptr = new char[str.size() + 1];
#if defined(_MSC_VER)
      strcpy_s((char *)_d.data.ptr, str.size() + 1, str.c_str());
#elif defined(__GNUC__)
      strcpy((char *)_d.data.ptr, str.c_str());
#endif
    }
  }

  Variant(const std::wstring &wstr) : _d(WString) {
    if (wstr.empty()) {
      make_invalid();
    } else {
      _d.data.ptr = new wchar_t[wstr.size() + 1];
#if defined(_MSC_VER)
      wcscpy_s((wchar_t *)_d.data.ptr, wstr.size() + 1, wstr.c_str());
#elif defined(__GNUC__)
      wcscpy((wchar_t *)_d.data.ptr, wstr.c_str());
#endif
    }
  }

  Variant(const Variant &other) : _d(other._d) {
    if (String == _d.type) {
      _d.data.ptr =
          new char[strlen(static_cast<char *>(other._d.data.ptr)) + 1];
#if defined(_MSC_VER)
      strcpy_s(static_cast<char *>(_d.data.ptr),
               strlen(static_cast<char *>(other._d.data.ptr)) + 1,
               static_cast<char *>(other._d.data.ptr));
#elif defined(__GNUC__)
      strcpy(static_cast<char *>(_d.data.ptr),
             static_cast<char *>(other._d.data.ptr));
#endif
    } else if (WString == _d.type) {
      _d.data.ptr =
          new char[wcslen(static_cast<wchar_t *>(other._d.data.ptr)) + 1];
#if defined(_MSC_VER)
      wcscpy_s(static_cast<wchar_t *>(_d.data.ptr),
               wcslen(static_cast<wchar_t *>(other._d.data.ptr)) + 1,
               static_cast<wchar_t *>(other._d.data.ptr));
#elif defined(__GNUC__)
      wcscpy(static_cast<wchar_t *>(_d.data.ptr),
             static_cast<wchar_t *>(other._d.data.ptr));
#endif
    }
  }
  Variant(Variant &&other) : _d(other._d) {
    if (String == other._d.type || WString == other._d.type) {
      this->_d.data.ptr = other._d.data.ptr;
      other.make_invalid();
    }
  }

  Variant &operator=(const Variant &other) {
    if (this == &other) return *this;
    if (String == _d.type || WString == _d.type) {
      if (_d.data.ptr) {
        delete[](char *) _d.data.ptr;
        _d.data.ptr = nullptr;
      }
    }
    if (Invalid == other._d.type) {
      make_invalid();
      return *this;
    } else if (String == other._d.type) {
      _d.data.ptr =
          new char[strlen(static_cast<char *>(other._d.data.ptr)) + 1];
#if defined(_MSC_VER)
      strcpy_s(static_cast<char *>(_d.data.ptr),
               strlen(static_cast<char *>(other._d.data.ptr)) + 1,
               static_cast<char *>(other._d.data.ptr));
#elif defined(__GNUC__)
      strcpy(static_cast<char *>(_d.data.ptr),
             static_cast<char *>(other._d.data.ptr));
#endif
    } else if (WString == other._d.type) {
      _d.data.ptr =
          new char[wcslen(static_cast<wchar_t *>(other._d.data.ptr)) + 1];
#if defined(_MSC_VER)
      wcscpy_s(static_cast<wchar_t *>(_d.data.ptr),
               wcslen(static_cast<wchar_t *>(other._d.data.ptr)) + 1,
               static_cast<wchar_t *>(other._d.data.ptr));
#elif defined(__GNUC__)
      wcscpy(static_cast<wchar_t *>(_d.data.ptr),
             static_cast<wchar_t *>(other._d.data.ptr));
#endif
    } else
      _d.data = other._d.data;
    this->_d.type = other._d.type;
    this->_d.is_null = other._d.is_null;
    this->_d.is_shared = other._d.is_shared;
    return *this;
  }
  Variant &operator=(Variant &&other) {
    if (this == &other) return *this;
    this->_d = other._d;
    if (String == _d.type || WString == _d.type) {
      this->_d.data.ptr = other._d.data.ptr;
      other.make_invalid();
    }
    return *this;
  }

  Type type() const { return _d.type; }

  bool canConvert(Type type) const {
    if (Invalid == type) return false;
    switch (_d.type) {
      case Invalid:
        return false;
      case Char:
        return WChar != type && WString != type;
      case UChar:
        return WChar != type && WString != type;
      case WChar:
        return Char != type && String != type;
      case Short:
        return true;
      case UShort:
        return true;
      case Int:
        return true;
      case UInt:
        return true;
      case Long:
        return true;
      case ULong:
        return true;
      case LongLong:
        return true;
      case ULongLong:
        return true;
      case Float:
        return Char != type && UChar != type && WChar != type;
      case Double:
        return Char != type && UChar != type && WChar != type;
      case LongDouble:
        return Char != type && UChar != type && WChar != type;
      case String:
        return WString != type;
      case WString:
        return String != type;
      default:
        break;
    }
    return false;
  }

  bool isValid() const { return _d.type != Invalid; }

  std::string toString() const {
    if (!isValid() || WString == _d.type) return "";
    if (String == _d.type) return static_cast<char *>(_d.data.ptr);

    std::stringstream ss;
    try {
      switch (_d.type) {
        case Bool:
          if (_d.data.b)
            ss << "true";
          else
            ss << "false";
          break;
        case Char:
          ss << _d.data.c;
          break;
        case UChar:
          ss << _d.data.uc;
          break;
        case WChar:
          break;
        case Short:
          ss << _d.data.s;
          break;
        case UShort:
          ss << _d.data.us;
          break;
        case Int:
          ss << _d.data.i;
          break;
        case UInt:
          ss << _d.data.ui;
          break;
        case Long:
          ss << _d.data.l;
          break;
        case ULong:
          ss << _d.data.ul;
          break;
        case LongLong:
          ss << _d.data.ll;
          break;
        case ULongLong:
          ss << _d.data.ull;
          break;
        case Float:
          ss << _d.data.f;
          break;
        case Double:
          ss << _d.data.d;
          break;
        case LongDouble:
          ss << _d.data.ld;
          break;
        default:
          break;
      }
    } catch (...) {
      return ss.str();
    }

    return ss.str();
  }

  std::wstring toWString() const {
    if (!isValid() || String == _d.type) return L"";
    if (WString == _d.type) return static_cast<wchar_t *>(_d.data.ptr);

    std::wstringstream wss;
    try {
      switch (_d.type) {
        case Bool:
          if (_d.data.b)
            wss << L"true";
          else
            wss << L"false";
          break;
        case Char:
          wss << _d.data.c;
          break;
        case UChar:
          wss << _d.data.uc;
          break;
        case WChar:
          wss << _d.data.wc;
          break;
        case Short:
          wss << _d.data.s;
          break;
        case UShort:
          wss << _d.data.us;
          break;
        case Int:
          wss << _d.data.i;
          break;
        case UInt:
          wss << _d.data.ui;
          break;
        case Long:
          wss << _d.data.l;
          break;
        case ULong:
          wss << _d.data.ul;
          break;
        case LongLong:
          wss << _d.data.ll;
          break;
        case ULongLong:
          wss << _d.data.ull;
          break;
        case Float:
          wss << _d.data.f;
          break;
        case Double:
          wss << _d.data.d;
          break;
        case LongDouble:
          wss << _d.data.ld;
          break;
        default:
          break;
      }
    } catch (...) {
      return wss.str();
    }

    return wss.str();
  }
  bool toBool() const {
    switch (_d.type) {
      case Bool:
        return _d.data.b;
      case String:
        return (strcmp((char *)_d.data.ptr, "true") == 0);
      case WString:
        return (wcscmp((wchar_t *)_d.data.ptr, L"true") == 0);
      default:
        return numVariantToHelper<bool>(_d.data.b);
    }
  }
  char toChar() const { return numVariantToHelper<char>(_d.data.c); }
  uchar toUchar() const { return numVariantToHelper<uchar>(_d.data.uc); }
  wchar_t toWChar() const { return numVariantToHelper<wchar_t>(_d.data.wc); }
  short toShort() const { return numVariantToHelper<short>(_d.data.s); }
  ushort toUShort() const { return numVariantToHelper<ushort>(_d.data.us); }
  int toInt() const { return numVariantToHelper<int>(_d.data.i); }
  uint toUInt() const { return numVariantToHelper<uint>(_d.data.ui); }
  long toLong() const { return numVariantToHelper<long>(_d.data.l); }
  ulong toULong() const { return numVariantToHelper<ulong>(_d.data.ul); }
  long long toLongLong() const {
    return numVariantToHelper<long long>(_d.data.ll);
  }
  ulonglong toULongLong() const {
    return numVariantToHelper<ulonglong>(_d.data.ull);
  }
  float toFloat() const { return numVariantToHelper<float>(_d.data.f); }
  double toDouble() const { return numVariantToHelper<double>(_d.data.d); }
  long double toLongDouble() const {
    return numVariantToHelper<long double>(_d.data.ld);
  }

 private:
  void make_invalid() {
    _d.type = Invalid;
    _d.is_null = true;
    _d.is_shared = false;
    _d.data.ptr = nullptr;
  }

  template <typename T>
  static T strToNumber(const std::string &str) {
    try {
      switch (typeID<T>()) {
        case Bool:
          return stoi(str);
          break;
        case Char:
          return stoi(str);
          break;
        case UChar:
          return stoul(str);
          break;
        case WChar:
          return stoi(str);
          break;
        case Short:
          return stoi(str);
          break;
        case UShort:
          return stoul(str);
          break;
        case Int:
          return stoi(str);
          break;
        case UInt:
          return stoul(str);
          break;
        case Long:
          return stol(str);
          break;
        case ULong:
          return stoul(str);
          break;
        case LongLong:
          return stoll(str);
          break;
        case ULongLong:
          return stoull(str);
          ;
          break;
        case Float:
          return stof(str);
          break;
        case Double:
          return stod(str);
          break;
        case LongDouble:
          return stold(str);
          break;
        default:
          break;
      }
    } catch (...) {
      return T();
    }

    return T();
  }

  template <typename T>
  static T strToNumber(const std::wstring &wstr) {
    try {
      switch (typeID<T>()) {
        case Bool:
          return stoi(wstr);
          break;
        case Char:
          return stoi(wstr);
          break;
        case UChar:
          return stoul(wstr);
          break;
        case WChar:
          return stoi(wstr);
          break;
        case Short:
          return stoi(wstr);
          break;
        case UShort:
          return stoul(wstr);
          break;
        case Int:
          return stoi(wstr);
          break;
        case UInt:
          return stoul(wstr);
          break;
        case Long:
          return stol(wstr);
          break;
        case ULong:
          return stoul(wstr);
          break;
        case LongLong:
          return stoll(wstr);
          break;
        case ULongLong:
          return stoull(wstr);
          ;
          break;
        case Float:
          return stof(wstr);
          break;
        case Double:
          return stod(wstr);
          break;
        case LongDouble:
          return stold(wstr);
          break;
        default:
          break;
      }
    } catch (const std::exception &) {
      return T();
    }

    return T();
  }

  template <typename T>
  T numVariantToHelper(const T &val) const {
    if (typeID<T>() == _d.type) return val;

    switch (_d.type) {
      case Bool:
        return T(_d.data.b);
        break;
      case Char:
        return T(_d.data.c);
        break;
      case UChar:
        return T(_d.data.uc);
        break;
      case WChar:
        return T(_d.data.wc);
        break;
      case Short:
        return T(_d.data.s);
        break;
      case UShort:
        return T(_d.data.us);
        break;
      case Int:
        return T(_d.data.i);
        break;
      case UInt:
        return T(_d.data.ui);
        break;
      case Long:
        return T(_d.data.l);
        break;
      case ULong:
        return T(_d.data.ui);
        break;
      case LongLong:
        return T(_d.data.ll);
        break;
      case ULongLong:
        return T(_d.data.ull);
        ;
        break;
      case Float:
        return T(_d.data.f);
        break;
      case Double:
        return T(_d.data.d);
        break;
      case LongDouble:
        return T(_d.data.ld);
        break;
      case String:
        return strToNumber<T>(static_cast<char *>(_d.data.ptr));
      case WString:
        return strToNumber<T>(static_cast<wchar_t *>(_d.data.ptr));
      default:
        break;
    }
    return T();
  }

  template <typename T>
  static inline void safe_delete_void_ptr(void *&target) {
    if (target) {
      T temp = static_cast<T>(target);
      delete[] temp;
      temp = nullptr;
      target = nullptr;
    }
  }

 private:
  struct Private {
    inline Private() noexcept : type(Invalid), is_shared(false), is_null(true) {
      data.ptr = nullptr;
    }

    // Internal constructor for initializing variant.
    explicit inline Private(Type variantType) noexcept
        : type(variantType), is_shared(false), is_null(false) {}

    inline Private(const Private &other) noexcept
        : data(other.data),
          type(other.type),
          is_shared(other.is_shared),
          is_null(other.is_null) {}

    union Data {
      bool b;
      char c;
      uchar uc;
      wchar_t wc;
      short s;
      ushort us;
      int i;
      uint ui;
      long l;
      ulong ul;
      long long ll;
      ulonglong ull;
      float f;
      double d;
      long double ld;
      void *ptr;
    } data;

    Type type;
    bool is_shared;
    bool is_null;
  };
  Private _d;
};

#endif  // VARIANT_HPP_
```

</details>

## End

可复用的：

1. GoogleTest 做单元测试

2. 一些对字符串的处理，以后遇到，重新翻翻这 project 即可。
