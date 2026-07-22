---
title: 'Code Review Is Also a Technical Skill'
description: 'Some strongly recommended code review practices: strict self-checks during development are the cheapest investment.'
---

## Checklist for Shared Data Access in Multithreading

### 1. Is There Multithreaded Access?

| Check item | Explanation |
| --- | --- |
| Do multiple threads access the same variable/data? | For example timers, callbacks, background threads, etc. |
| Are there cross-thread signal/slot connections? | Non-default connection types, such as `QueuedConnection` in `Qt`, can trigger across threads. |
| Are global objects, singletons, or shared references involved? | These are easy to read and write from multiple threads at the same time. |

### 2. Is There Concurrent Reading and Writing?

| Check item | Explanation |
| --- | --- |
| Does one thread write while another thread reads? | Even if writes are infrequent, there is still risk. |
| Are containers being added to or removed from? | Operations such as append, remove, and insert are modifications. |
| Are non-thread-safe data structures used? | Qt containers such as QList and QVector are not thread-safe by default. |

### 3. Is Synchronization Protection in Place?

| Check item | Explanation |
| --- | --- |
| Is shared data protected by a lock? | For example QMutex or QReadWriteLock. |
| Does the lock cover the whole access/modification region? | Especially for multi-line operations, the whole operation must be covered. |
| Is automatic locking used? | Avoid forgetting to unlock, such as with QMutexLocker. |
| Are time-consuming operations avoided inside the lock? | Avoid deadlocks and UI blocking. |

### 4. Is the Structure Reasonable and Extensible?

| Check item | Explanation |
| --- | --- |
| Is the lock a member variable that protects the whole resource lifetime? | Ensure the resource and lock are strongly bound. |
| Is a thread-safe container needed? | For example ThreadSafeQueue or ThreadSafeMap. |
| Is there a thread communication mechanism? | For example condition variables, thread-safe queues, or event dispatch. |
| Should work logic be put into a separate thread? | `QThread`, task queues, and signal/slot communication can decouple thread logic more clearly. |

### 5. Are There Tests or Monitoring Mechanisms?

| Check item | Explanation |
| --- | --- |
| Are assertions or logs used to detect abnormal access? | Add consistency checks to find edge cases. |
| Are cross-thread interactions actively tested in debug mode? | Strengthen testing of different interaction orders between threads. |
| Have occasional crashes or undefined behavior appeared? | If yes, thread-safety issues are very likely. |

### Other Practical Suggestions

- In comments or PR reviews, mark places where "multithreaded access is involved and locking has been added".
- When crashes or occasional bugs appear, especially around data memory access, first review whether shared data is accessed across threads.

## Code Format and Git Commit

> I currently have a shallow opinion: if a programmer knows how to format code and writes clear Git commit messages, I feel they have already surpassed around 75% of programmers.

### Code Format Shows Basic Professionalism

Unified code formatting means:

- higher readability;
- lower communication cost in code review;
- better long-term maintainability.

In real development, too many people do not care about this, or only rely on the IDE's default formatting, which makes the team code style messy.

People who can skillfully use clang-format, `.editorconfig`, or prettier are honestly not that common.

### Clear Commit Messages Show Collaboration Ability

Clear commit messages, such as those following Conventional Commits, let team members quickly understand the purpose of each change.

They also reflect how the developer thinks: whether they have structure, summarization ability, and documentation awareness.

In large teams or CI/CD workflows, good commits can even affect release rhythm and rollback efficiency.

> These two habits are "visible fundamentals". Many advanced skills, such as low-level optimization and architecture design, are not immediately visible. Formatting and commits are visible the moment you open a repository.

### An Example

Two PRs:

- **A:**

  ```cpp
  void foo(int x){if(x>0){bar(x);}}
  ```

  Commit: `fix bug`

- **B:**

  ```cpp
  void foo(int x)
  {
      if (x > 0)
      {
          bar(x);
      }
  }
  ```

  Commit: `fix: call bar only when x > 0 to avoid crash (#134)`

Which one would you trust more? Without a doubt, B.

## OOP Code Review Checklist for C++ / Qt

### Class Design and Responsibility

- Does the class have one clear responsibility? (SRP)
- Is the class too bloated? Should it be split?
- Does the class name clearly express its role?

### Encapsulation and Access Control

- Are there unnecessary `public` members?
- Are `private` and `protected` used appropriately?
- Are data members hidden inside the class and exposed through getters/setters?

### Dependency Management and Decoupling

- Are dependencies on other classes hard-coded? Can they be injected through interfaces or constructors?
- Are there hidden dependencies, such as global singletons or static variables?
- Is the code easy to mock and unit test?

### Inheritance vs Composition

- Is the current inheritance structure reasonable? Does it follow the Liskov Substitution Principle?
- Can composition replace inheritance?
- Is QObject inheritance necessary in Qt? Does it break the QObject tree?

### Constructors and Resource Management

- Are smart pointers or Qt parent-child ownership used to manage resources?
- Does the constructor do too much initialization work?
- Is the destructor correctly implemented to release resources?

### Readability and Naming

- Are names clear and expressive?
- Are there overly broad class names such as `Helper`, `Utils`, or `Manager`?
- Are functions too long? Can they be split into smaller functions?

### Structure and Module Boundaries

- Does the class/module have clear input and output boundaries?
- Is it tightly coupled with UI, business, or IO layers?
- Is it easy to use in unit tests or integration tests?

### Qt-Specific Suggestions

- Are signal/slot responsibilities clear? Do they scatter logic?
- Are lambda slots overused, making debugging difficult?
- Is the Qt parent pointer correctly used to manage object lifetime?

---

If most of the above is done, the OOP code already has strong structure and maintainability.

