---
title: 'Building a Weather Query TUI Program'
description: 'A goal-driven record of gradually building a terminal UI weather query program.'
---

## Why I Started

A few days ago, I was browsing the [0xFFFF](https://0xffff.one/d/1595-wei-shen-me-wo-zhe-teng-zhei-xie/7) community and saw a post titled [Why do I tinker with these niche technologies?](https://0xffff.one/d/1595-wei-shen-me-wo-zhe-teng-zhei-xie/7). One reply gave me an idea: "There are now so many active TUI projects on GitHub, such as terminals that support full-color full-resolution images or even video playback, IDEs, beautiful TUI file managers, music players, and so on. It feels like a renaissance in computing."

Anyone familiar with my development habits knows that I like doing work in the `Terminal`. So I thought: why not build a tiny TUI program for myself?

> When I wrote this article, `Vim` creator `Bram Moolenaar` had passed away. RIP. I have used `Vim` since my sophomore year, and it has been very convenient for my development work. Thank you for the contribution, Bram Moolenaar.

I decided to build a simple TUI program for checking the weather.

My current office seat is far from the window. It is also hot now, the sun is strong, and the curtains are usually closed, so I cannot see the weather outside.

One noon I went out for lunch and unexpectedly ran into a sun shower. I got completely soaked.

I do not want that to happen again. Now before leaving my seat and going out of the office building, I must check the weather forecast and decide whether to bring an umbrella.

Normally, checking the weather goes like this:

1. Pick up the phone and unlock it.
2. Swipe to the weather screen on the far left.

But I wanted to be even lazier. During a day, I spend more time facing the computer than the phone, and I never close the terminal on any of my computers. It stays in the background.

So why not make a TUI program? Then checking the weather becomes:

1. Use a shortcut to open the terminal.
2. Type a command, press Enter, and see the weather information.

This also lets me pick up my phone less often. Sometimes I pick up the phone just to check the weather, but then I accidentally scroll for "a little while". When I put the phone down and return to the computer, my brain may freeze for a moment and I forget what I was doing. If I was coding, I might even forget how a certain piece of logic was supposed to work and need time to recall it.

This is not a huge problem, but I think if I can finish work earlier, I can slack off with a clearer conscience. That sounds pretty good.

**OK, the goal is clear. Let us start.**

## Think First

### Understand the Business

The form of this thing is a program that can run directly in the `Terminal`.

When I run it, it should display the weather where I am.

So the question is: what weather information do I want to see?

The information to display is:

1. Current weather: what the weather is like at the moment I run the program.
2. Future weather: what the weather will be like in the next few hours or days.

### Decide the Tech Stack

As a developer, I need to decide what technology stack I know and what is suitable for this project.

If the program runs in the `Terminal`, many languages can do the job. Recently, however, I have been using a language called `Rust` quite often.

Below is ChatGPT's answer when I asked about the advantages of using `Rust` to build command-line programs. Whether you agree depends on your own view.

```markdown
Rust is a modern systems programming language with many advantages that make it an ideal choice for command-line programs:

1. Performance: Rust has excellent performance, with execution speed close to C and C++, so command-line programs can handle large data and complex computation well.

2. Safety: Rust's ownership and borrowing system checks memory safety and data races at compile time, avoiding many common runtime errors and security issues.

3. Concurrency support: Rust has built-in support for concurrent programming and can make it easier to write multi-threaded command-line programs.

4. Lightweight: Rust's standard library is relatively lean, and generated binaries can be relatively small.

5. Cross-platform support: Rust supports many platforms, making it convenient to build cross-platform tools.

6. Dependency management: Cargo provides simple dependency management and speeds up development.

7. Community and ecosystem: The Rust community is active and has many libraries, tools, documents, and tutorials.

In summary, Rust's performance, safety, concurrency support, and cross-platform capability make it a strong choice for command-line programs.
```

Now comes the **key step**.

### Translate Business Requirements into Technical Requirements

![meme](/images/weather_cli/funny.jpg)

**Prepare the required resources before development.**

The data here is weather data, so I need a weather data source.

There are many options online. I used [Seniverse](https://www.seniverse.com). Its API returns data in `JSON`, which is easy to process.

---

Then I can list the technical requirements:

1. Call the Seniverse API to get weather data. Rust provides the `reqwest` crate for making network requests.
2. Process the returned `JSON` data. Rust provides the `serde` crate for handling JSON.
3. Make it a command-line program. I need to consider command-line parameters and provide a `--help` option so users know how to use it.

## Start Building

> Direct ChatGPT to help me write some code.

> I am lazy.

```cpp
do {
    input my technical requirements into ChatGPT;

    let it handle the concrete implementation;

    I code review the code it gives me;

    if (I am satisfied) {
      break;
    }
} while (I am not satisfied)
```

> I like `Code Review` the most. In my daily development work, code review is the place where I improve the most.

The final code is this repository: [weather_cli](https://github.com/kok-s0s/weather_cli)

The code is simple and very direct.

## End

This article is not long. It simply describes the process of completing a goal: building a weather query `TUI` program. I used a self-defined goal to drive myself to finish the work, and during the process I also learned some new things through conversations with ChatGPT.

Let me also talk about my current feeling about software development. What kind of person does software development require you to be?

If you receive a task, you should:

1. Understand the business. What is this thing?
2. Communicate with upstream and downstream people. This is basically always needed now. This era is not one where many things can be done by fighting alone.
3. Figure out whether completing the task requires familiarity with certain programming languages or technology stacks. If you do not know them, go learn them. Trust your learning ability.
4. On the basis of understanding the business, translate business requirements into technical requirements. It is best if the technical requirements are progressive. Then as you implement them one by one, you get feedback and know how far you are from the final goal.
5. Have some algorithm ability. Some problems require additional mathematical knowledge. For undergraduates, I recommend learning calculus, linear algebra, number theory, and even not forgetting middle-school trigonometry, especially if you do Qt drawing.

> Notice that I said **must** here. This is my personal suggestion. If you are confused, I can only say reality is harsh. At the moment, I feel that much of the difference between programmers lies in these parts. If you disagree, just treat it as nonsense from me. For me, outside of mathematics, new frameworks and new technologies can often be learned from YouTube explanations, or by reading official technical documentation directly.

![](/images/weather_cli/indian.jpg)

6. **Drink more water. Keep a good mindset. Stand up and move after sitting for too long.** Try to dig out the fun in what you are doing. It is hard to describe, but sometimes development enters a "flow state". I am not sure whether that wording is appropriate. My writing is not great.

---

In short, have fun.

Just for fun.

