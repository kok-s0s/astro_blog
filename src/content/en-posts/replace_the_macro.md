---
title: 'Replacing #pragma once with #ifndef'
description: 'When too many files need the same repeated edit, stop copying and pasting. A small Python script is the better tool.'
---

## Code Background

Both `#pragma once` and `#ifndef` can be used to prevent a header file from being compiled twice.

However, `#pragma once` is tied to compiler support. In this codebase I wanted something more portable.

The `#ifndef` form is supported by the C++ standard and works cross-platform.

So the goal was to replace existing `#pragma once` directives with `#ifndef` guards.

## Using Python as the Tool

When I process many text files, I usually split the work into two parts:

1. Traverse many files. In this case, the reusable part is `traverse_directory`.
2. Process the text inside each file. In this case, the demand-specific part is `replace_the_marco`.

```python
import os


def replace_the_marco(cur_file_name: str) -> bool:
    flag: bool = False

    basename: str = os.path.basename(cur_file_name)
    file_name: str = basename.split(".")[0].upper()
    suffix: str = basename.split(".")[1].upper()
    macro: str = file_name + "_" + suffix + "_"
    first_sentence: str = "#ifndef " + macro
    second_sentence: str = "#define " + macro
    third_sentence: str = "#endif // " + macro

    lines: list[str] = []

    with open(cur_file_name, mode="r", encoding="utf-8") as file:
        index: int = 0  # Only check the first three lines
        for line in file:
            temp_item: str = line.strip()

            if index < 3:
                if temp_item == "#pragma once":
                    flag = True

            index = index + 1
            lines.append(line)
        file.close()
    if flag:
        print("\nModify the macro for " + basename + "!\n")
        with open(cur_file_name, mode="w", encoding="utf-8") as file:
            for line in lines:
                if "#pragma once" in line:
                    file.write("%s\n" % first_sentence)
                    file.write("%s\n" % second_sentence)
                else:
                    file.write("%s" % line)

            file.write("\n%s\n" % third_sentence)
            file.close()
    else:
        print("The " + basename + " does not need to be modified!\n")

    return flag


def traverse_directory(cur_dir: str):
    for cur_dir_item in os.listdir(cur_dir):
        cur_path_name: str = cur_dir + "/" + cur_dir_item

        if cur_dir_item[-4:] == ".hpp" or cur_dir_item[-2:] == ".h":
            replace_the_marco(cur_path_name)
        elif os.path.isdir(cur_path_name):
            traverse_directory(cur_path_name)


if __name__ == "__main__":
    folder_absolute_path: str = ""
    traverse_directory(folder_absolute_path)
```

There was one small trap. Some files created under Visual Studio used `ansi` encoding. They had to be converted to `utf-8` before the script above could process them reliably, so I used another small script for that step. Running one script and verifying one stage at a time makes the process easier to control.

```python
import chardet
import codecs
import os


def ansi_to_utf_8(cur_file_name: str):
    with open(cur_file_name, "rb") as f:
        r = f.read()
    f_charInfo = chardet.detect(r)  # Get text encoding information
    charset = f_charInfo["encoding"]
    if charset != "utf-8" and charset != "UTF-8-SIG":
        print(cur_file_name, charset)
        f = codecs.open(cur_file_name, "r", "ansi")
        ff = f.read()
        file_object = codecs.open(cur_file_name, "w", "utf-8")
        file_object.write(ff)


def traverse_directory(cur_dir: str):
    for cur_dir_item in os.listdir(cur_dir):
        cur_path_name: str = cur_dir + "/" + cur_dir_item

        if (
            cur_dir_item[-4:] == ".hpp"
            or cur_dir_item[-2:] == ".h"
            or cur_dir_item[-4:] == ".cpp"
            or cur_dir_item[-2:] == ".c"
        ):
            ansi_to_utf_8(cur_path_name)
        elif os.path.isdir(cur_path_name):
            traverse_directory(cur_path_name)


if __name__ == "__main__":
    folder_absolute_path: str = ""
    traverse_directory(folder_absolute_path)
```

