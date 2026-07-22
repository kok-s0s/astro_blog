---
title: 'ChatGPT'
description: 'I have been using ChatGPT for a while, so I wrote down some notes and impressions.'
---

> A casual blog post.

First, a tutorial link:

- [Learning Prompt](https://learningprompt.wiki/)

And several video links:

- [Some examples of using ChatGPT](https://exchange.scale.com/public/videos/llm-prompt-engineering-and-rlhf-history-and-techniques-2023-03-09)
- [超级小華](https://www.bilibili.com/video/BV1nM411M7LQ/?spm_id_from=333.1007.tianma.2-1-4.click&vd_source=185b9722c87eb76ed0f36d4e932d1a6a)
- [不高兴就喝水](https://www.bilibili.com/video/BV19M4y1d77m/?spm_id_from=333.1007.tianma.1-2-2.click&vd_source=185b9722c87eb76ed0f36d4e932d1a6a)

---

My personal feeling is this: if the internet turned knowledge from a physical form into a digital form and made all kinds of knowledge easier to reach, then conversational AI such as ChatGPT makes it easier to integrate knowledge and send the integrated result back to the person asking the question.

> [Web Searching Skills](https://www.graniteschools.org/edtech/tip/information-and-media-literacy-skills/web-search-skills/)

In the past, when I wanted to build a small toy project in the computer field, such as a desktop timer, I would combine several keywords, search on Google, and then look through the results to find the answer I wanted. The whole process took time. The search results were often not exactly what I needed, so I also had to spend time filtering out irrelevant content. In the end, I still had to integrate the useful information myself.

Now I can directly describe what I want to build. ChatGPT gives me an answer that is as close as possible, and I can keep asking follow-up questions. The answers usually move closer and closer to what I actually need. Compared with searching everything by myself, this process is faster.

But I still need to repeatedly verify whether ChatGPT's answers and the knowledge it describes are accurate. The final judgment is still made by humans. AI only assists our decisions.

---

![](/images/chatgpt/use_chatgpt.jpg)

There are already many videos and articles online about applications of ChatGPT-like AI. Most major information channels probably have plenty of content about it. Here I only introduce what I have personally used and share some impressions.

## Easy

### Generating Environment Setup Tutorials

This is really comfortable. Clearly state your operating system, preferably with the version number, what you want to do, and roughly what needs to be installed. Then act like a client and give ChatGPT the requirement. ChatGPT can search through its trained knowledge, which includes countless environment setup pitfalls people have run into before, and produce a setup guide that fits your situation. When learning new technologies, it is much harder to get stuck at the environment setup stage.

> A beginner's first step into a new technology: print "Hello World!".

### Generating Target Scripts

At the beginning of the year, I originally planned to improve myself by learning some [Linux shell scripting](https://github.com/kok-s0s/_script). Once ChatGPT appeared, I lost much of the desire to continue learning it deeply. I can simply program by talking to ChatGPT. Many parts of shell scripting are modular by nature. Combining shell commands according to described requirements is not difficult for ChatGPT. This is not limited to shell. For Python, ChatGPT can also generate target scripts to process text data or automate operations.

### Generating Functions

> In functional programming, a function is like a real mathematical function. It is referentially transparent: if called with the same input, it always returns the same output.

This kind of function is very easy for ChatGPT to generate. As long as the requirement is described clearly, ChatGPT can usually generate the function you want.

Here is a string splitting function I wrote five months after returning to C++ development. I found a Linux C implementation online, added a Windows version, tested that it ran, and then left it there.

```cpp
std::vector<std::string> split(const std::string &data,
                               const std::string &separator) {
  std::vector<std::string> result;
  if (data == "") return result;

#if defined(_MSC_VER)
  char *next_token = NULL;
  char *token =
      strtok_s((char *)data.c_str(), separator.c_str(), &next_token);
  while (token) {
    result.push_back(token);
    token = strtok_s(NULL, separator.c_str(), &next_token);
  }
#elif defined(__GNUC__)
  char *token = strtok((char *)data.c_str(), separator.c_str());
  while (token) {
    result.push_back(token);
    token = strtok(NULL, separator.c_str());
  }
#endif

  return result;
}
```

Here is the function ChatGPT generated. I simply gave it the function above and asked it to optimize it. It returned a much cleaner version. By comparison, it is quite good. ChatGPT is very suitable for writing this kind of function that is unrelated to business logic. After all, implementations of such utility functions have accumulated online for many years.

```cpp
std::vector<std::string> split(const std::string &data,
                               const std::string &separator) {
  std::vector<std::string> result;
  std::stringstream ss(data);
  std::string item;
  while (std::getline(ss, item, separator[0])) {
    result.push_back(item);
  }
  return result;
}
```

### Mathematical Calculation, As Long as the Question Is Not Too Wild

For the mathematics I learned in college, such as calculus, linear algebra, and probability, ChatGPT can give me pretty good answers. Of course, this may also be because the math problems I need to solve are fairly ordinary. When asking, it is better not to ask only for a final result. Ask it to explain the whole derivation process, then judge the reliability based on your own mathematical knowledge.

### Unit Tests and TDD

> TDD, or Test-Driven Development, is a software development process proposed by Kent Beck in 1999. In TDD, developers first write a failing unit test, then write code to make the test pass, and finally refactor the code.

Following the functional programming example above, because referentially transparent functions have clear input and output, ChatGPT can easily generate corresponding unit tests to check whether the function behaves as expected.

## Still Hard

### Slightly More Complex Business Logic

In this area, ChatGPT is still weak. Even if you think you have described the business requirement clearly, ChatGPT may not give a satisfying answer. Business logic itself is subjective. ChatGPT is trained from a large amount of data, and its objectivity is relatively strong. So even when it can generate some code, you still need to adjust it according to the real business situation.

Here is a link to a file read/write tool I am working on: [cxx_crud_file](https://github.com/kok-s0s/cxx_crud_file). ChatGPT can help me write decent file reading and writing code, because there is a lot of such code online. But it does not understand the interfaces I designed above file reading and writing based on the business requirements. This tool was created to replace Qt code, while keeping interfaces such as return values and parameters unchanged. Otherwise, the overall code changes would become large and tiring. Even if I give ChatGPT the interface specification, it still cannot produce a satisfying answer. That part still needs my own adjustment.

## End

The appearance of ChatGPT feels to me like a new Apple moment, similar to the arrival of the iPhone touchscreen smartphone. In the future, using AI like ChatGPT will become more and more common, and these systems will become more intelligent. I am quite looking forward to seeing where this goes.

> This article may keep being updated as I find more things ChatGPT can do.
