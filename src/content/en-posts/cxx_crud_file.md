---
title: 'A C++ Wrapper-Building Experience'
description: 'A project note about replacing Qt-based file utilities with standard C++ abstractions, using TDD, filesystem, file readers/writers, and practical wrapper design.'
---

> [cxx_crud_file](https://github.com/kok-s0s/cxx_crud_file)

## Why This Started

I was assigned a task to rewrite code originally written with Qt using modern C++ standards. The goal was to remove dependencies on Qt types and utilities such as `QString`, `QVariant`, `QSettings`, and `QFile`.

Rewriting this code with standard C++ would make it more portable and easier to reuse outside Qt. Qt's ecosystem is good, but the business requirement was to remove it from this part of the codebase.

## Starting by Imitation

The original Qt code had its own file read/write utility class named `FileTools`. It came from actual business requirements: specific formats, fixed reading and writing rules, and many utility operations.

The Qt-based `FileTools` class was roughly more than two thousand lines long.

At first, I simply imitated the existing class. Function names stayed mostly the same, internal logic stayed mostly the same, and Qt data types were replaced with standard C++ types. For example, `QString` became `std::string`.

But while modifying this class, I realized it was not really a class in the object-oriented sense. It was more like a group of functions placed inside one class. To use a function, you created an object and called the member function through that object.

At the beginning, after just moving from front-end work back to C++, I did not think this was a big problem. It looked like functional programming.

But one of the core strengths of C++ is object-oriented design. This class felt more procedural than object-oriented. Many methods could be inherited and reused, and reading the code felt messy.

The more I developed it, the stronger the code smell became.

It was time to change the approach.

## Wrapping Instead of Rebuilding

If there are existing, excellent, tested functions, I will not rebuild them. I prefer to be a lazy developer in the good sense.

### Test-Driven Development

The whole project used GoogleTest for unit testing. During development, I wrote tests first, then wrote implementation code, then ran the tests. If tests failed, I changed the code until they passed.

The testing code should be roughly comparable in size to the functional code. Otherwise, it is probably not exercising enough behavior.

### `UFile`

After returning to C++ development, I read several C++ books, including *Clean C++* and *Effective C++*, and used cppreference heavily. For file-related work, many functions can be built on top of the standard `<filesystem>` library.

The base idea was to wrap `std::filesystem::path` in a small `UFile` base class:

```cpp
class UFile {
 private:
  fs::path _p;

 public:
  explicit UFile(const std::string &path) : _p(path) {}
  explicit UFile(const fs::path &path) : _p(path) {}

  std::string path() { return _p.string(); }
};
```

Because the code needed to support Linux, Windows, and different C++ standards, macro checks were used to select either `std::filesystem` or `std::experimental::filesystem`.

This became the base class. File handlers for different formats then inherited from it.

### `TxtFile`

Text-file handling is mainly string handling. The required operations were reading, writing, and appending.

The implementation used `std::ifstream` and `std::ofstream` from `<fstream>`. Once you think in terms of streams, those three operations are mostly stream operations.

The useful methods were:

- read file content into `_data`;
- overwrite the file with `_data`;
- append text to the file.

### `IniFile`

The INI format required key-value style reading and writing.

Compared with plain text files, the important part is parsing sections and key names correctly while preserving the practical behavior needed by the business code.

The wrapper should provide operations such as:

- read an INI file;
- fetch a value by section and key;
- update a section/key pair;
- write the modified content back.

The lesson here was not to over-design a complete INI parser if the business only needs a limited subset. A small wrapper is enough if its behavior is covered by tests.

### `JsonFile`

For JSON, the better choice is to borrow an existing wheel rather than create a JSON parser manually.

The wrapper should focus on business-facing operations:

- read JSON from disk;
- parse it through a mature JSON library;
- expose convenient getters or conversion helpers;
- write structured data back to disk.

The key design point is to keep the JSON library hidden behind a small interface so that the rest of the code does not become tightly coupled to a specific third-party API.

### `BmpFile`

BMP file operations are more binary-format oriented. Compared with TXT or INI, the file content is no longer line-based text.

The wrapper should be explicit about:

- binary read/write mode;
- header structure;
- pixel-data offset;
- byte alignment and padding;
- platform-independent integer sizes.

For binary formats, tests should include known small fixture files so that read/write behavior can be compared against expected bytes.

### `BinFile`

Generic binary files are mainly about reading and writing raw bytes.

The useful abstraction is not a complicated class hierarchy, but a clear and safe interface:

- read all bytes;
- write bytes;
- append bytes if needed;
- check file existence and size;
- handle failures explicitly.

For binary data, avoid treating data as null-terminated strings. Use containers such as `std::vector<std::uint8_t>` or `std::vector<char>` depending on the context.

## A Smaller Wheel: `UString`

During the replacement work, string conversion also became necessary.

Qt's `QString` provides many convenient APIs. After moving to standard C++, some behavior had to be replaced by helper functions around `std::string`.

The point of `UString` was not to compete with `QString`, but to provide a small set of operations used by the project:

- trimming;
- splitting;
- joining;
- converting numeric values;
- simple case conversion;
- encoding-related helper points when needed.

The same rule applies: do not wrap everything just because it is possible. Wrap what the project actually uses.

## Borrowing Wheels: `Variant`

Replacing `QVariant` is different from replacing `QString` or `QFile`.

`QVariant` is powerful because it can hold values of different types and move through Qt APIs conveniently. In standard C++, the closest choices are usually `std::variant`, `std::any`, or a carefully designed custom type.

The right choice depends on the usage:

- use `std::variant` when the possible types are known;
- use `std::any` when values are truly open-ended, but accept weaker compile-time guarantees;
- design a domain-specific wrapper when the business needs controlled conversions and predictable behavior.

In this project, the important thing was not to blindly mimic every `QVariant` feature. The important thing was to identify which behaviors were actually needed by the old code and cover those behaviors with tests.

## Takeaways

First, if C++ can avoid building a wheel, avoid it. The standard library and mature third-party libraries are usually better than a custom implementation.

Second, anything that can be unit-tested should be unit-tested. This is especially important when replacing an existing implementation: tests become the safety net that proves old behavior has not been broken.

Third, tools like ChatGPT can help optimize code and explore alternatives, but the final design decision and code review still belong to the developer.

The value of this project was not only removing Qt from a file utility module. It also helped me practice modern C++ design, test-driven development, and the habit of turning messy procedural utilities into smaller, testable abstractions.
