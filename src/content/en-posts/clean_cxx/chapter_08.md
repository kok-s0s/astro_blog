---
title: 'Test-Driven Development'
description: 'Notes on TDD, its workflow, advantages, and when it may not be appropriate.'
---

> The Mercury project used very short, strictly timeboxed iterations. The team performed technical reviews for all changes and, interestingly, followed the idea of test-first development from Extreme Programming by planning and writing unit tests before each small change.

## Disadvantages of Plain Old Unit Tests

A suite of unit tests is much better than having no tests. However, in many projects unit tests are written in parallel with implementation code, or even after the module is completed. This is plain old unit testing, or POUT. In practice, POUT means the software is code-first rather than test-first.

Its disadvantages include:

- Unit tests may never be written afterward. Once a feature works, or appears to work, there is little motivation to improve the code with tests. It is not much fun, and many developers feel tempted to move on to the next task.
- The resulting code is hard to test. Improving existing code with unit tests is often difficult because testability was not considered in the original code. This can lead to tightly coupled code.
- Achieving high test coverage after the fact is not easy. Writing tests after implementation can miss problems or bugs.

## TDD as a Disruptor

Test-driven development turns traditional development upside down. For developers who have not used TDD before, it requires a shift in thinking.

In TDD, test code must be written before the related production code. The process is strict: after each test is written, write only enough production code to pass that test, and continue until all module requirements are implemented.

### The TDD Flow

TDD usually includes these steps:

1. Write a test case.
2. Run the test case.
3. Write the code.
4. Run the test case again.
5. Refactor the code.
6. Repeat until all tests pass.

TDD is an iterative development method. It uses test cases to guide implementation and refactoring, improving reliability and quality. The key is to write clear, specific, executable tests, run them continuously, and fix problems promptly.

When tests pass completely, that fact gives developers great strength. With a solid unit-test safety net, developers can refactor without fear. Code smells such as duplication, or design problems, can now be fixed. There is less fear of breaking functionality because regularly executed unit tests provide immediate feedback. Even better: if one or more tests fail during refactoring, the responsible code change is usually very small.

Uncle Bob's three rules of TDD:

- Do not write production code unless it is to make a failing unit test pass.
- Write only enough of a unit test to fail. Compilation failure counts as failure.
- Write only enough production code to make the failing unit test pass.

### Advantages of TDD

TDD is mainly a tool and technique for incremental software-component design and development.

Advantages:

- Following TDD gradually completes requirements during development.
- TDD creates a very fast feedback loop.
- Writing unit tests first helps developers think about what should happen next.
- With TDD, gapless specifications appear as executable code.
- Developers handle dependencies more consciously and responsibly.
- New production code developed with TDD often has 100% unit-test coverage.

## When TDD May Not Be Appropriate

TDD is not recommended for quick prototyping.

It is also less useful for basic decisions about frameworks, libraries, technologies, or architecture patterns.
